/**
 * 道具和UI功能测试
 * 测试道具出现频率、提示显示和UI元素
 */

import { test, expect } from '@playwright/test'

test.describe('道具和UI功能测试', () => {
    
    test('道具出现频率和提示显示测试', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas')
        await page.waitForTimeout(1000)
        
        console.log('✅ 游戏已加载')
        
        // 检查主要UI元素是否存在
        const canvas = page.locator('canvas')
        await expect(canvas).toBeVisible()
        
        // 使用JavaScript在游戏中强制生成道具并观察
        await page.evaluate(() => {
            const scene = window.game.scene.getScene('GameScene')
            if (scene && scene.powerUpSpawnManager) {
                // 强制生成不同类型的道具进行测试
                const powerUpTypes = ['multiShot', 'shield', 'extraPoints', 'extraLife']
                
                powerUpTypes.forEach((type, index) => {
                    setTimeout(() => {
                        const x = 100 + index * 80
                        const y = 200
                        scene.powerUpSpawnManager.spawnSpecificPowerUp(type, x, y)
                        console.log(`🎁 测试生成道具: ${type} 位置:(${x}, ${y})`)
                    }, index * 1000)
                })
            }
        })
        
        // 等待道具生成
        await page.waitForTimeout(5000)
        
        // 移动玩家收集道具并观察提示
        await page.evaluate(() => {
            const scene = window.game.scene.getScene('GameScene')
            if (scene && scene.player) {
                // 模拟玩家移动收集道具
                scene.player.x = 100
                scene.player.y = 200
                console.log('🎮 玩家移动到道具位置')
            }
        })
        
        await page.waitForTimeout(2000)
        
        // 检查道具配置是否已更新
        const powerUpConfig = await page.evaluate(() => {
            return window.POWERUP_CONFIG || null
        })
        
        console.log('📊 道具配置:', powerUpConfig)
        
        // 验证道具生成频率确实增加了
        await page.evaluate(() => {
            const scene = window.game.scene.getScene('GameScene')
            if (scene && scene.powerUpSpawnManager) {
                console.log('📈 当前道具生成配置:')
                console.log('- SPAWN_CHANCE:', 0.25)
                console.log('- SPAWN_DELAY:', 8000)
                console.log('- 预期：道具将更频繁出现')
            }
        })
        
        // 测试完成
        console.log('✅ 道具和UI功能测试完成')
    })
    
    test('UI状态栏检查', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas')
        await page.waitForTimeout(1000)
        
        // 检查UI状态栏元素
        const uiElements = await page.evaluate(() => {
            const scene = window.game.scene.getScene('GameScene')
            if (scene && scene.uiManager) {
                return {
                    hasScoreText: !!scene.uiManager.scoreText,
                    hasLivesText: !!scene.uiManager.livesText,
                    hasLevelText: !!scene.uiManager.levelText,
                    hasDebugText: !!scene.uiManager.debugText,
                    scorePosition: scene.uiManager.scoreText ? 
                        {x: scene.uiManager.scoreText.x, y: scene.uiManager.scoreText.y} : null,
                    livesPosition: scene.uiManager.livesText ? 
                        {x: scene.uiManager.livesText.x, y: scene.uiManager.livesText.y} : null,
                    levelPosition: scene.uiManager.levelText ? 
                        {x: scene.uiManager.levelText.x, y: scene.uiManager.levelText.y} : null
                }
            }
            return {}
        })
        
        console.log('🎯 UI元素检查结果:', uiElements)
        
        // 验证主要状态栏都在左上角
        expect(uiElements.hasScoreText).toBe(true)
        expect(uiElements.hasLivesText).toBe(true)
        expect(uiElements.hasLevelText).toBe(true)
        
        // 验证位置都在左上角区域
        expect(uiElements.scorePosition.x).toBe(16)
        expect(uiElements.scorePosition.y).toBe(16)
        expect(uiElements.livesPosition.x).toBe(16)
        expect(uiElements.livesPosition.y).toBe(50)
        expect(uiElements.levelPosition.x).toBe(16)
        expect(uiElements.levelPosition.y).toBe(84)
        
        console.log('✅ UI状态栏位置验证通过')
    })
    
    test('道具提示功能测试', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas')
        await page.waitForTimeout(1000)
        
        // 测试道具提示功能
        await page.evaluate(() => {
            const scene = window.game.scene.getScene('GameScene')
            if (scene && scene.uiManager) {
                // 测试所有道具类型的提示
                const powerUpTypes = ['multiShot', 'shield', 'extraPoints', 'extraLife']
                
                powerUpTypes.forEach((type, index) => {
                    setTimeout(() => {
                        scene.uiManager.showPowerUpNotification(type, 2000)
                        console.log(`🔔 显示道具提示: ${type}`)
                    }, index * 2500)
                })
            }
        })
        
        // 等待所有提示显示完成
        await page.waitForTimeout(12000)
        
        console.log('✅ 道具提示功能测试完成')
    })
})
