import { test, expect } from '@playwright/test'

test.describe('鼠标跟随测试', () => {  test('鼠标移动跟随功能', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    const canvas = await page.$('canvas')
    expect(canvas).not.toBeNull()

    if (canvas) {
      const canvasBox = await canvas.boundingBox()
      console.log(`🎨 Canvas 尺寸: ${canvasBox?.width}x${canvasBox?.height}`)

      // 获取初始玩家位置
      const initialPlayerState = await page.evaluate(() => {
        const game = (window as any).game
        const scene = game.scene.getScene('GameScene')
        const player = scene.player
        return {
          x: player.x,
          y: player.y,
          targetX: player.targetX
        }
      })

      console.log('🎮 初始玩家状态:', initialPlayerState)

      if (canvasBox) {
        // 测试鼠标移动到不同位置
        console.log('🖱️ 移动鼠标到位置: (100, 300)')
        
        // 移动鼠标（不点击）
        await page.mouse.move(canvasBox.x + 100, canvasBox.y + 300)
        await page.waitForTimeout(1000) // 等待玩家移动

        // 检查玩家是否跟随
        const playerState = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          const player = scene.player
          return {
            x: player.x,
            y: player.y,
            targetX: player.targetX,
            isMoving: Math.abs(player.targetX - player.x) > 5
          }
        })

        console.log('📍 移动后玩家状态:', playerState)
        
        // 验证targetX已更新（表示鼠标移动被检测到）
        const targetChanged = Math.abs(playerState.targetX - initialPlayerState.targetX) > 10
        console.log('🎯 目标位置是否改变:', targetChanged)
        expect(targetChanged).toBe(true)

        // 测试最终移动效果
        await page.waitForTimeout(2000) // 等待移动完成

        const finalPlayerState = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          const player = scene.player
          return {
            x: player.x,
            y: player.y,
            targetX: player.targetX
          }
        })

        console.log('🏁 最终玩家状态:', finalPlayerState)
        
        // 验证玩家确实移动了
        const totalMovement = Math.abs(finalPlayerState.x - initialPlayerState.x)
        console.log('📏 总移动距离:', totalMovement)
        expect(totalMovement).toBeGreaterThan(30)
      }
    }
  })
  
  test('触屏和鼠标兼容性测试', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    const canvas = await page.$('canvas')
    if (canvas) {
      const canvasBox = await canvas.boundingBox()

      if (canvasBox) {
        // 模拟触屏点击
        console.log('📱 测试触屏点击...')
        await page.mouse.click(canvasBox.x + 150, canvasBox.y + 300)
        await page.waitForTimeout(500)

        const afterClick = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          return { targetX: scene.player.targetX }
        })

        // 然后测试鼠标移动
        console.log('🖱️ 测试鼠标移动...')
        await page.mouse.move(canvasBox.x + 250, canvasBox.y + 400)
        await page.waitForTimeout(500)

        const afterMove = await page.evaluate(() => {
          const game = (window as any).game
          const scene = game.scene.getScene('GameScene')
          return { targetX: scene.player.targetX }
        })

        console.log('结果对比:', { afterClick: afterClick.targetX, afterMove: afterMove.targetX })
        
        // 验证两种输入方式都有效
        expect(Math.abs(afterMove.targetX - afterClick.targetX)).toBeGreaterThan(10)
      }
    }
  })
})
