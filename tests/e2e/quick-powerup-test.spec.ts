// @ts-nocheck
import { test, expect } from '@playwright/test'

test.describe('道具频率快速验证', () => {
    test('基本道具生成测试', async ({ page }) => {
        await page.goto('http://localhost:3007/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🎮 开始基本道具生成测试...')
        
        // 等待游戏初始化
        await page.waitForTimeout(1000)
        
        // 强制生成道具测试
        const powerUpGenerated = await page.evaluate(() => {
            try {
                if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                    // 手动生成几个道具
                    window.gameScene.powerUpSpawnManager.spawnRandomPowerUp()
                    window.gameScene.powerUpSpawnManager.spawnRandomPowerUp()
                    window.gameScene.powerUpSpawnManager.spawnRandomPowerUp()
                    
                    // 检查道具数量
                    const count = window.gameScene.powerUps.children.entries.length
                    console.log(`手动生成道具数量: ${count}`)
                    return count
                }
                return 0
            } catch (error) {
                console.error('生成道具时出错:', error)
                return 0
            }
        })
        
        console.log(`📦 成功生成道具数量: ${powerUpGenerated}`)
        expect(powerUpGenerated).toBeGreaterThan(0)
        
        // 检查道具配置
        const config = await page.evaluate(() => {
            try {
                if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                    const manager = window.gameScene.powerUpSpawnManager
                    return {
                        spawnChance: manager.calculateSpawnChance(),
                        spawnDelay: manager.calculateSpawnDelay(),
                        level: window.gameScene.level
                    }
                }
                return null
            } catch (error) {
                console.error('获取配置时出错:', error)
                return null
            }
        })
        
        console.log('⚙️ 道具配置:', config)
        
        if (config) {
            expect(config.spawnChance).toBeGreaterThan(0.35) // 新的基础概率应该是40%
            expect(config.spawnDelay).toBeLessThan(6000) // 新的基础间隔应该是5秒
        }
        
        console.log('✅ 基本道具生成测试通过！')
    })
    
    test('验证道具生成频率提升', async ({ page }) => {
        await page.goto('http://localhost:3007/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('📈 验证道具生成频率提升...')
        
        // 检查当前配置参数
        const currentConfig = await page.evaluate(() => {
            try {
                // 检查POWERUP_CONFIG是否已更新
                const configCheck = {
                    hasGameScene: !!window.gameScene,
                    hasManager: !!(window.gameScene && window.gameScene.powerUpSpawnManager)
                }
                
                if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                    const manager = window.gameScene.powerUpSpawnManager
                    configCheck.baseChance = manager.calculateSpawnChance()
                    configCheck.baseDelay = manager.calculateSpawnDelay()
                    configCheck.level = window.gameScene.level
                }
                
                return configCheck
            } catch (error) {
                console.error('配置检查出错:', error)
                return { error: error.message }
            }
        })
        
        console.log('🔍 当前配置检查结果:', currentConfig)
        
        expect(currentConfig.hasGameScene).toBe(true)
        expect(currentConfig.hasManager).toBe(true)
        
        if (currentConfig.baseChance && currentConfig.baseDelay) {
            // 验证新的配置值
            expect(currentConfig.baseChance).toBeGreaterThanOrEqual(0.4) // 新基础概率40%
            expect(currentConfig.baseDelay).toBeLessThanOrEqual(5000) // 新基础间隔5秒
            
            console.log(`✨ 道具生成概率: ${(currentConfig.baseChance * 100).toFixed(1)}%`)
            console.log(`⏱️ 道具生成间隔: ${currentConfig.baseDelay}ms`)
        }
        
        // 模拟高等级测试
        const highLevelResult = await page.evaluate(() => {
            try {
                if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                    // 设置高等级
                    window.gameScene.level = 6
                    
                    const manager = window.gameScene.powerUpSpawnManager
                    const highLevelChance = manager.calculateSpawnChance()
                    const highLevelDelay = manager.calculateSpawnDelay()
                    
                    console.log(`等级6 - 概率: ${(highLevelChance * 100).toFixed(1)}%, 间隔: ${highLevelDelay}ms`)
                    
                    return {
                        level: 6,
                        chance: highLevelChance,
                        delay: highLevelDelay
                    }
                }
                return null
            } catch (error) {
                console.error('高等级测试出错:', error)
                return null
            }
        })
        
        console.log('🚀 高等级测试结果:', highLevelResult)
        
        if (highLevelResult) {
            // 等级6时应该有更高的概率和更短的间隔
            expect(highLevelResult.chance).toBeGreaterThan(0.6) // 等级6应该有>60%概率
            expect(highLevelResult.delay).toBeLessThan(3000) // 等级6应该有<3秒间隔
        }
        
        console.log('✅ 道具生成频率提升验证通过！')
    })
})
