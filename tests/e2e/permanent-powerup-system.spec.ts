/**
 * 永久增强道具和动态权重系统测试
 * 测试新增的射速和移动速度永久增强道具，以及权重系统
 */

import { test, expect } from '@playwright/test'

test.describe('永久增强道具系统测试', () => {    test('验证新道具类型配置和权重系统', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏初始化
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 获取配置验证
        const configCheck = await page.evaluate(() => {
            // 通过gameScene访问配置
            const scene = (window as any).gameScene
            if (!scene) return { error: 'Game scene not found' }
            
            // 检查PowerUpSpawnManager是否有新道具类型
            const manager = scene.powerUpSpawnManager
            if (!manager) return { error: 'PowerUpSpawnManager not found' }
            
            const powerUpTypes = manager.powerUpTypes || []
            
            return {
                hasPermanentFireRate: powerUpTypes.includes('permanentFireRate'),
                hasPermanentSpeed: powerUpTypes.includes('permanentSpeed'),
                hasBomb: powerUpTypes.includes('bomb'),
                totalTypes: powerUpTypes.length,
                powerUpTypes: powerUpTypes
            }
        })
        
        console.log('🔧 配置检查结果:', configCheck)
        
        if ('error' in configCheck) {
            throw new Error(configCheck.error)
        }
        
        expect(configCheck.hasPermanentFireRate).toBe(true)
        expect(configCheck.hasPermanentSpeed).toBe(true)
        expect(configCheck.hasBomb).toBe(true)
        expect(configCheck.totalTypes).toBeGreaterThanOrEqual(6)
    })
    
    test('测试动态权重计算', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 获取PowerUpSpawnManager实例并测试权重计算
        const weightTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.powerUpSpawnManager) {
                return { error: 'Scene or PowerUpSpawnManager not found' }
            }
            
            // 测试不同等级下的权重计算
            const originalLevel = scene.level
            const originalLives = scene.lives
            
            const results: any[] = []
            
            try {
                // 测试等级1
                scene.level = 1
                scene.lives = 3
                const weights1 = scene.powerUpSpawnManager.calculateDynamicWeights()
                results.push({ level: 1, lives: 3, weights: weights1 })
                
                // 测试等级5
                scene.level = 5
                scene.lives = 3
                const weights5 = scene.powerUpSpawnManager.calculateDynamicWeights()
                results.push({ level: 5, lives: 3, weights: weights5 })
                
                // 测试等级10 + 低生命
                scene.level = 10
                scene.lives = 1
                const weights10 = scene.powerUpSpawnManager.calculateDynamicWeights()
                results.push({ level: 10, lives: 1, weights: weights10 })
                
                // 恢复原始值
                scene.level = originalLevel
                scene.lives = originalLives
                
                return { results }
            } catch (error) {
                return { error: `权重计算错误: ${error}` }
            }
        })
        
        console.log('🎲 权重测试结果:', weightTest)
        
        if ('error' in weightTest) {
            throw new Error(weightTest.error)
        }
        
        const results = weightTest.results
        expect(results.length).toBe(3)
        
        // 验证权重变化
        const level1Weights = results[0].weights
        const level10Weights = results[2].weights
        
        console.log('等级1权重:', level1Weights)
        console.log('等级10权重:', level10Weights)
        
        // 基本验证权重存在
        expect(typeof level1Weights).toBe('object')
        expect(typeof level10Weights).toBe('object')
    })
      test('测试永久增强道具生成', async ({ page }) => {        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 强制生成永久增强道具并测试
        const powerUpTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.powerUpSpawnManager) {
                return { error: 'Scene or PowerUpSpawnManager not found' }
            }
            
            const results: any[] = []
            
            try {
                // 测试永久射速增强道具
                scene.powerUpSpawnManager.spawnSpecificPowerUp('permanentFireRate', 100, 100)
                const fireRatePowerUp = scene.powerUps.children.entries.find((p: any) => p.type === 'permanentFireRate')
                
                if (fireRatePowerUp) {
                    results.push({
                        type: 'permanentFireRate',
                        generated: true,
                        value: fireRatePowerUp.value,
                        texture: fireRatePowerUp.texture.key
                    })
                }
                
                // 测试永久移动速度增强道具
                scene.powerUpSpawnManager.spawnSpecificPowerUp('permanentSpeed', 200, 100)
                const speedPowerUp = scene.powerUps.children.entries.find((p: any) => p.type === 'permanentSpeed')
                
                if (speedPowerUp) {
                    results.push({
                        type: 'permanentSpeed',
                        generated: true,
                        value: speedPowerUp.value,
                        texture: speedPowerUp.texture.key
                    })
                }
                
                return { results }
            } catch (error) {
                return { error: `道具生成错误: ${error}` }
            }
        })
        
        console.log('🎁 道具生成测试结果:', powerUpTest)
        
        if ('error' in powerUpTest) {
            throw new Error(powerUpTest.error)
        }
        
        const results = powerUpTest.results
        expect(results.length).toBeGreaterThanOrEqual(1)
        
        // 验证道具属性
        results.forEach((result: any) => {
            expect(result.generated).toBe(true)
            expect(result.value).toBeGreaterThan(0)
            expect(result.texture).toContain('powerup-')
            console.log(`✅ ${result.type} 道具生成成功: 值=${result.value}, 纹理=${result.texture}`)
        })
    })
      test('测试玩家永久增强效果', async ({ page }) => {        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 测试玩家属性永久增强
        const enhancementTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.player) {
                return { error: 'Scene or Player not found' }
            }
            
            const player = scene.player
            const originalFireRate = player.fireRate
            const originalSpeed = player.speed
            
            const results: any[] = []
            
            try {
                // 测试永久射速增强
                if (typeof player.permanentFireRateBoost === 'function') {
                    player.permanentFireRateBoost(20)
                    results.push({
                        type: 'fireRate',
                        original: originalFireRate,
                        enhanced: player.fireRate,
                        improvement: originalFireRate - player.fireRate
                    })
                }
                
                // 测试永久速度增强
                if (typeof player.permanentSpeedBoost === 'function') {
                    player.permanentSpeedBoost(30)
                    results.push({
                        type: 'speed',
                        original: originalSpeed,
                        enhanced: player.speed,
                        improvement: player.speed - originalSpeed
                    })
                }
                
                return { results }
            } catch (error) {
                return { error: `增强测试错误: ${error}` }
            }
        })
        
        console.log('⚡ 永久增强测试结果:', enhancementTest)
        
        if ('error' in enhancementTest) {
            throw new Error(enhancementTest.error)
        }
        
        const results = enhancementTest.results
        expect(results.length).toBeGreaterThanOrEqual(1)
        
        // 验证增强效果
        results.forEach((result: any) => {
            expect(result.improvement).toBeGreaterThan(0)
            expect(result.enhanced).not.toBe(result.original)
            console.log(`✅ ${result.type} 永久增强成功: ${result.original} → ${result.enhanced} (提升${result.improvement})`)
        })
    })
      test('验证道具类型多样性', async ({ page }) => {        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 验证新道具类型的存在性
        const diversityTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.powerUpSpawnManager) {
                return { error: 'Scene or PowerUpSpawnManager not found' }
            }
            
            const manager = scene.powerUpSpawnManager
            const supportedTypes = manager.powerUpTypes || []
            
            // 测试生成各种道具类型
            const generatedTypes: string[] = []
            
            try {
                supportedTypes.forEach((type: string, index: number) => {
                    manager.spawnSpecificPowerUp(type, 50 + index * 40, 50)
                    generatedTypes.push(type)
                })
                
                // 检查实际生成的道具
                const actualPowerUps = scene.powerUps.children.entries.map((p: any) => ({
                    type: p.type,
                    value: p.value,
                    x: p.x,
                    y: p.y
                }))
                
                return {
                    supportedTypes,
                    generatedTypes,
                    actualPowerUps,
                    totalGenerated: actualPowerUps.length
                }
            } catch (error) {
                return { error: `多样性测试错误: ${error}` }
            }
        })
        
        console.log('🎯 道具多样性测试结果:', diversityTest)
        
        if ('error' in diversityTest) {
            throw new Error(diversityTest.error)
        }
        
        // 验证道具类型多样性
        expect(diversityTest.supportedTypes.length).toBeGreaterThanOrEqual(6)
        expect(diversityTest.totalGenerated).toBeGreaterThanOrEqual(6)
        expect(diversityTest.supportedTypes).toContain('permanentFireRate')
        expect(diversityTest.supportedTypes).toContain('permanentSpeed')
        expect(diversityTest.supportedTypes).toContain('bomb')
        
        console.log(`✅ 支持${diversityTest.supportedTypes.length}种道具类型，成功生成${diversityTest.totalGenerated}个道具`)
    })
})
