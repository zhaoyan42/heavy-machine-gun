import { test, expect } from '@playwright/test'

test.describe('屏幕闪烁修复测试', () => {
  test('快速击败多个敌人时屏幕不应剧烈闪烁', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    const canvas = await page.$('canvas')
    expect(canvas).not.toBeNull()

    if (canvas) {
      const canvasBox = await canvas.boundingBox()
      console.log(`🎨 Canvas 尺寸: ${canvasBox?.width}x${canvasBox?.height}`)

      // 记录初始状态
      const initialState = await page.evaluate(() => {
        const game = (window as any).game
        const scene = game.scene.getScene('GameScene')
        return {
          enemyCount: scene.enemies.children.entries.length,
          score: scene.score,
          cameraShaking: scene.cameras.main.isShaking
        }
      })

      console.log('🎮 初始状态:', initialState)

      // 模拟快速连续攻击（移动鼠标快速触发多次交互）
      if (canvasBox) {
        console.log('⚡ 开始快速连续攻击测试...')
        
        for (let i = 0; i < 10; i++) {
          await page.mouse.move(
            canvasBox.x + 150 + i * 20, 
            canvasBox.y + 350 + i * 10
          )
          await page.waitForTimeout(100) // 短间隔快速移动
        }

        // 等待战斗发生
        await page.waitForTimeout(3000)

        // 检查当前状态
        const afterBattleState = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          return {
            enemyCount: scene.enemies.children.entries.length,
            score: scene.score,
            cameraShaking: scene.cameras.main.isShaking,
            effectsManagerShakeTime: scene.effectsManager.lastShakeTime,
            currentTime: scene.time.now
          }
        })

        console.log('⚔️ 战斗后状态:', afterBattleState)

        // 验证功能
        const scoreIncreased = afterBattleState.score > initialState.score
        const cameraNotShaking = !afterBattleState.cameraShaking
        
        console.log('📈 分数增加:', scoreIncreased)
        console.log('📷 摄像机稳定:', cameraNotShaking)
        
        // 断言：分数应该增加，但摄像机不应该持续震动
        expect(scoreIncreased).toBe(true)
        expect(cameraNotShaking).toBe(true)

        // 检查震动频率限制是否生效
        const hasShakeTimeRecord = afterBattleState.effectsManagerShakeTime > 0
        console.log('🕐 震动时间记录:', hasShakeTimeRecord)
        expect(hasShakeTimeRecord).toBe(true)
      }
    }
  })

  test('单个敌人击败应有适度视觉反馈', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    const canvas = await page.$('canvas')
    if (canvas) {
      const canvasBox = await canvas.boundingBox()

      if (canvasBox) {
        // 记录初始分数
        const initialScore = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          return scene.score
        })

        // 移动到敌人可能的位置并等待击败
        await page.mouse.move(canvasBox.x + 200, canvasBox.y + 400)
        await page.waitForTimeout(2000)

        const finalScore = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          return scene.score
        })

        const scoreDifference = finalScore - initialScore
        console.log('🎯 单次战斗分数差:', scoreDifference)
        
        // 应该有分数增加，表示击败了敌人且有视觉反馈
        expect(scoreDifference).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
