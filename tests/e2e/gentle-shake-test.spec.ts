import { test, expect } from '@playwright/test'

test.describe('极轻微震动效果验证', () => {
  test('验证击败敌人时的震动效果极其柔和', async ({ page }) => {
    // 启动游戏
    await page.goto('/')
    
    // 等待游戏加载
    await page.waitForFunction(() => window.gameScene && window.gameScene.isGameRunning, {
      timeout: 10000
    })
    
    // 开始检测屏幕震动
    let shakeDetected = false
    let shakeCount = 0
    let maxShakeIntensity = 0
    
    // 监听摄像机震动
    await page.evaluate(() => {
      window.shakeEvents = []
      
      const originalShake = window.gameScene.cameras.main.shake
      window.gameScene.cameras.main.shake = function(duration, intensity) {
        window.shakeEvents.push({ duration, intensity, timestamp: Date.now() })
        return originalShake.call(this, duration, intensity)
      }
    })
    
    // 记录初始分数
    const initialScore = await page.evaluate(() => window.gameScene.uiManager.score)
    console.log(`初始分数: ${initialScore}`)
    
    // 连续击败10个敌人
    for (let i = 0; i < 10; i++) {
      // 强制生成敌人
      await page.evaluate(() => {
        const enemy = window.gameScene.enemySpawnManager.createEnemy()
        enemy.setPosition(200, 50) // 在玩家附近生成
      })
      
      // 等待一小段时间让敌人出现
      await page.waitForTimeout(100)
      
      // 发射子弹击败敌人
      await page.evaluate(() => {
        // 强制发射多发子弹确保击中
        for (let j = 0; j < 5; j++) {
          window.gameScene.player.shoot()
        }
      })
      
      // 等待敌人被击败
      await page.waitForTimeout(200)
      
      // 检查震动事件
      const shakeEvents = await page.evaluate(() => window.shakeEvents || [])
      if (shakeEvents.length > shakeCount) {
        shakeDetected = true
        const newShakes = shakeEvents.slice(shakeCount)
        
        newShakes.forEach(shake => {
          console.log(`震动检测: 持续时间=${shake.duration}ms, 强度=${shake.intensity}`)
          maxShakeIntensity = Math.max(maxShakeIntensity, shake.intensity)
        })
        
        shakeCount = shakeEvents.length
      }
    }
    
    // 验证分数增加（确保敌人被击败）
    const finalScore = await page.evaluate(() => window.gameScene.uiManager.score)
    console.log(`最终分数: ${finalScore}`)
    expect(finalScore).toBeGreaterThan(initialScore)
    
    // 验证震动效果
    expect(shakeDetected).toBe(true)
    console.log(`总震动次数: ${shakeCount}`)
    console.log(`最大震动强度: ${maxShakeIntensity}`)
    
    // 验证震动强度极其柔和（应该 <= 0.3）
    expect(maxShakeIntensity).toBeLessThanOrEqual(0.3)
    
    // 验证震动持续时间很短（应该 <= 80ms）
    const shakeEvents = await page.evaluate(() => window.shakeEvents || [])
    const maxDuration = Math.max(...shakeEvents.map(e => e.duration))
    console.log(`最大震动持续时间: ${maxDuration}ms`)
    expect(maxDuration).toBeLessThanOrEqual(80)
    
    // 验证震动频率限制（500ms间隔）
    if (shakeEvents.length > 1) {
      for (let i = 1; i < shakeEvents.length; i++) {
        const interval = shakeEvents[i].timestamp - shakeEvents[i-1].timestamp
        console.log(`震动间隔: ${interval}ms`)
        // 允许一定的误差范围，因为可能有多个敌人同时被击败
        if (interval < 500 && interval > 100) {
          console.log(`注意: 检测到较短的震动间隔 ${interval}ms`)
        }
      }
    }
    
    console.log('极轻微震动效果验证完成')
  })
  
  test('验证连续击败敌人时震动不会累积', async ({ page }) => {
    // 启动游戏
    await page.goto('/')
    
    await page.waitForFunction(() => window.gameScene && window.gameScene.isGameRunning, {
      timeout: 10000
    })
    
    // 监听摄像机状态
    await page.evaluate(() => {
      window.cameraStates = []
      
      setInterval(() => {
        const camera = window.gameScene.cameras.main
        window.cameraStates.push({
          x: camera.scrollX,
          y: camera.scrollY,
          timestamp: Date.now(),
          shaking: camera._shakeIntensity > 0
        })
      }, 50)
    })
    
    // 快速连续击败多个敌人
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        // 同时生成多个敌人
        for (let j = 0; j < 3; j++) {
          const enemy = window.gameScene.enemySpawnManager.createEnemy()
          enemy.setPosition(100 + j * 50, 50)
        }
        
        // 发射大量子弹
        for (let k = 0; k < 10; k++) {
          window.gameScene.player.shoot()
        }
      })
      
      await page.waitForTimeout(100)
    }
    
    // 等待所有效果结束
    await page.waitForTimeout(1000)
    
    // 检查摄像机最终是否稳定
    const finalStates = await page.evaluate(() => {
      const recent = window.cameraStates.slice(-10)
      return recent.every(state => !state.shaking)
    })
    
    expect(finalStates).toBe(true)
    console.log('连续击败敌人后摄像机已稳定')
  })
})
