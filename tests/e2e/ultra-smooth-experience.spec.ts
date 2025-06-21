/**
 * 极其柔和的用户体验测试
 * 验证击败敌人时的震动效果几乎无法感知，确保连续击败多个敌人时体验极其舒适
 */

import { test, expect } from '@playwright/test'

test('极其柔和的震动体验测试', async ({ page }) => {
    console.log('开始极其柔和的震动体验测试...')
    
    // 导航到游戏页面
    await page.goto('http://localhost:5173')
    
    // 等待游戏加载
    await page.waitForTimeout(2000)
    
    // 点击开始游戏
    await page.click('canvas')
    await page.waitForTimeout(500)
    
    console.log('游戏已启动，开始测试连续击败敌人的震动效果...')
    
    // 记录初始状态
    const initialScore = await page.evaluate(() => {
        const game = (window as any).game
        if (game && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0]
            return gameScene.score || 0
        }
        return 0
    })
    
    console.log(`初始分数: ${initialScore}`)
    
    // 连续击败多个敌人，测试震动效果
    for (let i = 0; i < 10; i++) {
        console.log(`第 ${i + 1} 轮敌人击败测试...`)
        
        // 等待敌人生成并击败
        await page.evaluate(() => {
            const game = (window as any).game
            if (game && game.scene && game.scene.scenes[0]) {
                const gameScene = game.scene.scenes[0]
                
                // 生成敌人
                if (gameScene.enemySpawnManager) {
                    gameScene.enemySpawnManager.spawnEnemy()
                }
                
                // 立即击败敌人来测试震动效果
                if (gameScene.enemies && gameScene.enemies.children.entries.length > 0) {
                    const enemy = gameScene.enemies.children.entries[0]
                    if (enemy && gameScene.collisionManager) {
                        // 模拟敌人受到致命伤害
                        enemy.currentHp = 0
                        enemy.health = 0
                        gameScene.collisionManager.handleEnemyDeath(enemy)
                    }
                }
            }
        })
        
        // 短暂等待，观察震动效果
        await page.waitForTimeout(200)
        
        // 检查摄像机状态，确保震动极其轻微
        const cameraState = await page.evaluate(() => {
            const game = (window as any).game
            if (game && game.scene && game.scene.scenes[0]) {
                const gameScene = game.scene.scenes[0]
                const camera = gameScene.cameras.main
                
                return {
                    x: camera.x,
                    y: camera.y,
                    scrollX: camera.scrollX,
                    scrollY: camera.scrollY,
                    isShaking: camera._shakeIntensity > 0
                }
            }
            return null
        })
        
        if (cameraState) {
            console.log(`摄像机状态 - X: ${cameraState.x.toFixed(2)}, Y: ${cameraState.y.toFixed(2)}, 震动中: ${cameraState.isShaking}`)
            
            // 验证震动强度极低
            if (cameraState.isShaking) {
                const displacement = Math.sqrt(cameraState.x * cameraState.x + cameraState.y * cameraState.y)
                console.log(`震动位移: ${displacement.toFixed(4)} 像素`)
                
                // 震动位移应该极小（小于0.5像素）
                expect(displacement).toBeLessThan(0.5)
            }
        }
    }
    
    // 检查最终分数，确保敌人确实被击败了
    const finalScore = await page.evaluate(() => {
        const game = (window as any).game
        if (game && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0]
            return gameScene.score || 0
        }
        return 0
    })
    
    console.log(`最终分数: ${finalScore}`)
    
    // 验证分数有增加（说明敌人被击败了）
    expect(finalScore).toBeGreaterThan(initialScore)
    
    console.log('极其柔和的震动体验测试完成 ✓')
})

test('验证震动参数设置', async ({ page }) => {
    console.log('验证震动参数设置...')
    
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(1000)
    
    // 检查震动配置参数
    const shakeConfig = await page.evaluate(() => {
        // 尝试获取配置信息
        if ((window as any).EFFECTS_CONFIG) {
            return {
                intensity: (window as any).EFFECTS_CONFIG.SHAKE_INTENSITY,
                particleCount: (window as any).EFFECTS_CONFIG.PARTICLE_COUNT
            }
        }
        
        // 如果无法直接获取，通过游戏实例检查
        const game = (window as any).game
        if (game && game.scene && game.scene.scenes[0]) {
            const gameScene = game.scene.scenes[0]
            if (gameScene.effectsManager) {
                return {
                    shakeInterval: gameScene.effectsManager.shakeInterval,
                    flashInterval: gameScene.effectsManager.flashInterval
                }
            }
        }
        
        return null
    })
    
    if (shakeConfig) {
        console.log('震动配置:', shakeConfig)
        
        // 验证震动强度极低
        if ('intensity' in shakeConfig) {
            expect(shakeConfig.intensity).toBeLessThanOrEqual(0.1) // 应该小于等于0.1
        }
        
        // 验证震动间隔足够大
        if ('shakeInterval' in shakeConfig) {
            expect(shakeConfig.shakeInterval).toBeGreaterThanOrEqual(1000) // 应该大于等于1000ms
        }
    }
    
    console.log('震动参数验证完成 ✓')
})
