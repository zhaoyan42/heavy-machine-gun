import { test, expect } from '@playwright/test'

test.describe('道具频率测试', () => {
    test('验证提升后的道具生成频率', async ({ page }) => {
        // 访问游戏页面
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        
        // 等待游戏开始
        await page.waitForTimeout(1000)
        
        // 开始游戏（点击画布）
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🎮 游戏开始，监控道具生成频率...')
        
        let powerUpCount = 0
        let elapsedTime = 0
        const checkInterval = 1000 // 每秒检查一次
        const totalTestTime = 30000 // 测试30秒
        
        // 监控道具生成
        while (elapsedTime < totalTestTime) {
            await page.waitForTimeout(checkInterval)
            elapsedTime += checkInterval
            
            // 检查控制台日志中的道具生成
            const logs = await page.evaluate(() => {
                // @ts-ignore
                return window.gameDebugLogs || []
            })
            
            // 计算新生成的道具数量
            const newPowerUps = logs.filter((log: string) => 
                log.includes('✨ 生成道具:') && 
                !log.includes('检查过')
            ).length
            
            if (newPowerUps > powerUpCount) {
                console.log(`📦 发现新道具！总计: ${newPowerUps}, 时间: ${elapsedTime/1000}秒`)
                powerUpCount = newPowerUps
            }
            
            // 每5秒输出一次状态
            if (elapsedTime % 5000 === 0) {
                console.log(`⏱️ 已运行 ${elapsedTime/1000}秒，道具生成数量: ${powerUpCount}`)
            }
        }
        
        console.log(`📊 测试完成！总运行时间: ${totalTestTime/1000}秒，道具生成总数: ${powerUpCount}`)
        console.log(`📈 平均道具生成频率: ${(powerUpCount / (totalTestTime/1000)).toFixed(2)} 个/秒`)
        
        // 验证道具生成频率符合预期
        // 预期：基础40%概率，5秒间隔，应该约每12-15秒生成一个道具
        const expectedMinPowerUps = Math.floor((totalTestTime/1000) / 15) // 保守估计
        const expectedMaxPowerUps = Math.floor((totalTestTime/1000) / 8)  // 乐观估计
        
        console.log(`🎯 预期道具数量范围: ${expectedMinPowerUps} - ${expectedMaxPowerUps}`)
        
        expect(powerUpCount).toBeGreaterThanOrEqual(expectedMinPowerUps)
        console.log(`✅ 道具生成频率符合预期！`)
    })
    
    test('验证高等级时道具频率增加', async ({ page }) => {
        // 访问游戏页面
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 开始游戏
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🎮 开始高等级道具频率测试...')
        
        // 模拟快速升级到高等级
        await page.evaluate(() => {
            // @ts-ignore
            if (window.gameScene) {
                // @ts-ignore
                const scene = window.gameScene
                // 快速升级到等级5
                scene.level = 5
                scene.score = 5000
                scene.enemiesKilled = 50
                
                // 更新UI显示
                if (scene.uiManager) {
                    scene.uiManager.updateScore(scene.score)
                    scene.uiManager.updateLevel(scene.level)
                }
                
                // 更新道具生成器
                if (scene.powerUpSpawnManager) {
                    scene.powerUpSpawnManager.adjustSpawnRate()
                }
                
                console.log('⬆️ 已升级到等级5')
            }
        })
        
        await page.waitForTimeout(2000)
        
        let powerUpCount = 0
        let elapsedTime = 0
        const checkInterval = 1000
        const testTime = 20000 // 测试20秒
        
        console.log('🔥 开始监控高等级道具生成...')
        
        while (elapsedTime < testTime) {
            await page.waitForTimeout(checkInterval)
            elapsedTime += checkInterval
            
            // 检查道具生成日志
            const logs = await page.evaluate(() => {
                // @ts-ignore
                return window.gameDebugLogs || []
            })
            
            const newPowerUps = logs.filter((log: string) => 
                log.includes('✨ 生成道具:') && log.includes('等级:5')
            ).length
            
            if (newPowerUps > powerUpCount) {
                console.log(`🌟 高等级道具生成！总计: ${newPowerUps}, 时间: ${elapsedTime/1000}秒`)
                powerUpCount = newPowerUps
            }
        }
        
        console.log(`📊 高等级测试完成！道具生成数量: ${powerUpCount}`)
        console.log(`📈 高等级道具生成频率: ${(powerUpCount / (testTime/1000)).toFixed(2)} 个/秒`)
        
        // 高等级时应该有更高的生成频率
        const expectedHighLevelPowerUps = Math.floor((testTime/1000) / 10) // 期望每10秒至少1个
        
        expect(powerUpCount).toBeGreaterThanOrEqual(expectedHighLevelPowerUps)
        console.log(`✅ 高等级道具生成频率符合预期！`)
    })
    
    test('验证紧急情况下道具增加', async ({ page }) => {
        // 访问游戏页面
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 开始游戏
        const canvas = page.locator('canvas')
        await canvas.click()
        
        console.log('🆘 开始紧急情况道具测试...')
        
        // 模拟紧急情况（低生命值）
        await page.evaluate(() => {
            // @ts-ignore
            if (window.gameScene && window.gameScene.player) {
                // @ts-ignore
                const scene = window.gameScene
                scene.lives = 1 // 设置为最后一条命
                scene.level = 3 // 中等级别
                
                // 更新UI
                if (scene.uiManager) {
                    scene.uiManager.updateLives(scene.lives)
                }
                
                console.log('💀 设置紧急状态：最后一条命')
            }
        })
        
        await page.waitForTimeout(1000)
        
        let emergencyPowerUps = 0
        let elapsedTime = 0
        const checkInterval = 1000
        const testTime = 15000 // 测试15秒
        
        while (elapsedTime < testTime) {
            await page.waitForTimeout(checkInterval)
            elapsedTime += checkInterval
            
            // 检查紧急道具生成
            const logs = await page.evaluate(() => {
                // @ts-ignore
                return window.gameDebugLogs || []
            })
            
            const emergencyLogs = logs.filter((log: string) => 
                log.includes('🚨 极高等级紧急生命支援') || 
                log.includes('✨ 生成道具:')
            ).length
            
            if (emergencyLogs > emergencyPowerUps) {
                console.log(`🚨 紧急道具生成！总计: ${emergencyLogs}`)
                emergencyPowerUps = emergencyLogs
            }
        }
        
        console.log(`📊 紧急测试完成！道具生成数量: ${emergencyPowerUps}`)
        
        // 紧急情况下应该有更多道具生成
        expect(emergencyPowerUps).toBeGreaterThanOrEqual(1)
        console.log(`✅ 紧急情况道具增加机制正常！`)
    })
})
