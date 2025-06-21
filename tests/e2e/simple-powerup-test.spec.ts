import { test, expect } from '@playwright/test'

test.describe('道具频率简单测试', () => {
    test('验证道具生成系统基本功能', async ({ page }) => {
        // 访问游戏页面
        await page.goto('http://localhost:3007/heavy-machine-gun/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 开始游戏
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🎮 游戏开始，验证道具生成系统...')
          // 检查GameScene是否正确创建
        const gameSceneExists = await page.evaluate(() => {
            return (window as any).gameScene !== undefined
        })
        
        expect(gameSceneExists).toBe(true)
        console.log('✅ GameScene创建成功')
        
        // 检查PowerUpSpawnManager是否存在
        const powerUpManagerExists = await page.evaluate(() => {
            return window.gameScene && window.gameScene.powerUpSpawnManager !== undefined
        })
        
        expect(powerUpManagerExists).toBe(true)
        console.log('✅ PowerUpSpawnManager创建成功')
        
        // 检查道具生成配置
        const config = await page.evaluate(() => {
            if (!window.gameScene || !window.gameScene.powerUpSpawnManager) return null
            
            const manager = window.gameScene.powerUpSpawnManager
            return {
                baseChance: manager.calculateSpawnChance(),
                currentDelay: manager.calculateSpawnDelay(),
                level: window.gameScene.level
            }
        })
        
        console.log('📊 当前道具配置:', config)
        expect(config).not.toBeNull()
        expect(config.baseChance).toBeGreaterThan(0.3) // 应该至少有30%概率
        expect(config.currentDelay).toBeLessThan(6000) // 间隔应该少于6秒
        
        // 手动触发道具生成测试
        await page.evaluate(() => {
            if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                console.log('🧪 手动触发道具生成测试')
                window.gameScene.powerUpSpawnManager.spawnRandomPowerUp()
            }
        })
        
        await page.waitForTimeout(1000)
        
        // 检查是否有道具生成
        const powerUpCount = await page.evaluate(() => {
            if (!window.gameScene || !window.gameScene.powerUps) return 0
            return window.gameScene.powerUps.children.entries.length
        })
        
        console.log(`📦 当前屏幕上道具数量: ${powerUpCount}`)
        expect(powerUpCount).toBeGreaterThanOrEqual(1)
        
        // 验证道具类型
        const powerUpTypes = await page.evaluate(() => {
            if (!window.gameScene || !window.gameScene.powerUps) return []
            return window.gameScene.powerUps.children.entries.map(powerUp => powerUp.type)
        })
        
        console.log('🎁 生成的道具类型:', powerUpTypes)
        expect(powerUpTypes.length).toBeGreaterThan(0)
        
        console.log('✅ 道具生成系统基本功能验证通过！')
    })
    
    test('验证高等级时的道具配置变化', async ({ page }) => {
        await page.goto('http://localhost:3007/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🎮 测试高等级道具配置...')
        
        // 模拟升级到高等级
        const highLevelConfig = await page.evaluate(() => {
            if (!window.gameScene) return null
            
            const scene = window.gameScene
            scene.level = 8  // 设置高等级
            scene.score = 8000
            scene.enemiesKilled = 80
            
            // 更新道具生成器
            if (scene.powerUpSpawnManager) {
                scene.powerUpSpawnManager.adjustSpawnRate()
            }
            
            // 更新UI
            if (scene.uiManager) {
                scene.uiManager.updateLevel(scene.level)
                scene.uiManager.updateScore(scene.score)
            }
            
            return {
                level: scene.level,
                chance: scene.powerUpSpawnManager.calculateSpawnChance(),
                delay: scene.powerUpSpawnManager.calculateSpawnDelay()
            }
        })
        
        console.log('📈 高等级配置:', highLevelConfig)
        
        expect(highLevelConfig.level).toBe(8)
        expect(highLevelConfig.chance).toBeGreaterThan(0.65) // 高等级应该有更高概率
        expect(highLevelConfig.delay).toBeLessThan(3000) // 高等级应该有更短间隔
        
        // 连续生成几个道具测试高等级效果
        await page.evaluate(() => {
            const scene = window.gameScene
            if (scene && scene.powerUpSpawnManager) {
                for (let i = 0; i < 3; i++) {
                    scene.powerUpSpawnManager.spawnRandomPowerUp()
                }
                console.log('🔥 高等级连续生成3个道具')
            }
        })
        
        await page.waitForTimeout(1000)
        
        const finalPowerUpCount = await page.evaluate(() => {
            return window.gameScene ? window.gameScene.powerUps.children.entries.length : 0
        })
        
        console.log(`🌟 高等级测试结果 - 道具数量: ${finalPowerUpCount}`)
        expect(finalPowerUpCount).toBeGreaterThanOrEqual(3)
        
        console.log('✅ 高等级道具配置验证通过！')
    })
    
    test('验证紧急状态道具增强', async ({ page }) => {
        await page.goto('http://localhost:3007/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🆘 测试紧急状态道具增强...')
        
        // 模拟紧急状态
        const emergencyConfig = await page.evaluate(() => {
            if (!window.gameScene) return null
            
            const scene = window.gameScene
            scene.lives = 1  // 最后一条命
            scene.level = 5  // 中等级别
            
            // 更新UI
            if (scene.uiManager) {
                scene.uiManager.updateLives(scene.lives)
            }
            
            return {
                lives: scene.lives,
                level: scene.level,
                emergencyBonus: scene.powerUpSpawnManager.calculateEmergencyBonus(),
                activeBonus: scene.powerUpSpawnManager.calculateActivePowerUpBonus()
            }
        })
        
        console.log('💀 紧急状态配置:', emergencyConfig)
        
        expect(emergencyConfig.lives).toBe(1)
        expect(emergencyConfig.emergencyBonus).toBeGreaterThan(0.15) // 应该有紧急加成
        
        // 测试紧急生成
        await page.evaluate(() => {
            const scene = window.gameScene
            if (scene && scene.powerUpSpawnManager) {
                // 多次尝试触发紧急生成
                for (let i = 0; i < 5; i++) {
                    scene.powerUpSpawnManager.trySpawnPowerUp()
                }
                console.log('🚨 紧急状态多次尝试生成道具')
            }
        })
        
        await page.waitForTimeout(2000)
        
        const emergencyPowerUps = await page.evaluate(() => {
            return window.gameScene ? window.gameScene.powerUps.children.entries.length : 0
        })
        
        console.log(`🚑 紧急状态道具数量: ${emergencyPowerUps}`)
        expect(emergencyPowerUps).toBeGreaterThanOrEqual(1)
        
        console.log('✅ 紧急状态道具增强验证通过！')
    })
})
