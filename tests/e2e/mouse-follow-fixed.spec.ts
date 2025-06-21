import { test, expect } from '@playwright/test';

test.describe('鼠标跟随测试', () => {

  test('玩家应该跟随鼠标移动', async ({ page }) => {
    console.log('🧪 开始测试鼠标跟随功能...')
    
    // 导航到游戏页面
    await page.goto('/')
    
    // 等待游戏加载
    await page.waitForTimeout(2000)
    
    // 获取初始玩家位置
    const initialPlayerState = await page.evaluate(() => {
      const gameScene = (window as any).game?.scene?.getScene('GameScene')
      if (!gameScene || !gameScene.player) return null
      
      const player = gameScene.player
      return {
        x: player.x,
        y: player.y,
        targetX: player.targetX
      }
    })
    
    console.log('🎮 初始玩家状态:', initialPlayerState)
    expect(initialPlayerState).not.toBeNull()
    
    // 移动鼠标到新位置
    const newX = 300
    const newY = 400
    console.log(`🖱️ 移动鼠标到位置: (${newX}, ${newY})`)
    
    await page.mouse.move(newX, newY)
    
    // 等待玩家移动
    await page.waitForTimeout(2000)
    
    // 获取最终玩家位置
    const finalPlayerState = await page.evaluate(() => {
      const gameScene = (window as any).game?.scene?.getScene('GameScene')
      if (!gameScene || !gameScene.player) return null
      
      const player = gameScene.player
      return {
        x: player.x,
        y: player.y,
        targetX: player.targetX
      }
    })
    
    console.log('🏁 最终玩家状态:', finalPlayerState)
    
    // 验证玩家确实移动了
    if (initialPlayerState && finalPlayerState) {
      const movement = Math.abs(finalPlayerState.x - initialPlayerState.x)
      expect(movement).toBeGreaterThan(10)
      console.log(`✅ 玩家移动距离: ${movement.toFixed(1)} 像素`)
    }
  })

  test('玩家应该跟随点击位置移动', async ({ page }) => {
    console.log('🧪 开始测试点击移动功能...')
    
    // 导航到游戏页面
    await page.goto('/')
    
    // 等待游戏加载
    await page.waitForTimeout(2000)
    
    // 获取初始玩家位置
    const initialPlayerState = await page.evaluate(() => {
      const gameScene = (window as any).game?.scene?.getScene('GameScene')
      if (!gameScene || !gameScene.player) return null
      
      const player = gameScene.player
      return {
        x: player.x,
        y: player.y
      }
    })
    
    console.log('🎮 初始玩家状态:', initialPlayerState)
    
    // 点击新位置
    const clickX = 100
    const clickY = 500
    console.log(`👆 点击位置: (${clickX}, ${clickY})`)
    
    await page.click('canvas', { position: { x: clickX, y: clickY } })
    
    // 等待玩家移动
    await page.waitForTimeout(3000)
    
    // 获取最终玩家位置
    const finalPlayerState = await page.evaluate(() => {
      const gameScene = (window as any).game?.scene?.getScene('GameScene')
      if (!gameScene || !gameScene.player) return null
      
      const player = gameScene.player
      return {
        x: player.x,
        y: player.y
      }
    })
    
    console.log('🏁 最终玩家状态:', finalPlayerState)
    
    // 验证玩家移动到了点击位置附近
    if (initialPlayerState && finalPlayerState) {
      const distanceToTarget = Math.abs(finalPlayerState.x - clickX)
      expect(distanceToTarget).toBeLessThan(50) // 允许一定误差
      console.log(`✅ 玩家距离目标位置: ${distanceToTarget.toFixed(1)} 像素`)
    }
  })

})
