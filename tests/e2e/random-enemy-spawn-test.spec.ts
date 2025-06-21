/**
 * 随机敌人生成系统测试
 * 验证新的敌人生成机制是否更加随机和自然
 */

import { test, expect } from '@playwright/test'

test.describe('随机敌人生成系统测试', () => {    test('验证敌人生成的随机性', async ({ page }) => {
        await page.goto('http://localhost:3011/heavy-machine-gun/')
        
        // 等待游戏初始化
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 记录敌人生成时间和位置
        const spawnData = await page.evaluate(() => {
            return new Promise((resolve) => {
                const scene = (window as any).gameScene
                if (!scene) {
                    resolve({ error: 'Game scene not found' })
                    return
                }
                
                const spawnEvents = []
                let recordingStart = Date.now()
                
                // 监听敌人生成
                const checkEnemies = () => {
                    const currentEnemies = scene.enemies.children.entries.length
                    if (currentEnemies > spawnEvents.length) {
                        const newEnemies = scene.enemies.children.entries.slice(spawnEvents.length)
                        newEnemies.forEach(enemy => {
                            spawnEvents.push({
                                time: Date.now() - recordingStart,
                                x: Math.floor(enemy.x),
                                y: Math.floor(enemy.y),
                                speed: enemy.speed,
                                hp: enemy.currentHp,
                                isFromSide: enemy.isFromSide || false
                            })
                        })
                    }
                }
                
                // 每200ms检查一次
                const interval = setInterval(checkEnemies, 200)
                
                // 记录10秒钟
                setTimeout(() => {
                    clearInterval(interval)
                    resolve({ spawnEvents })
                }, 10000)
            })
        })
        
        console.log('🎲 敌人生成数据:', spawnData)
        
        if ('error' in spawnData) {
            throw new Error(spawnData.error)
        }
        
        const events = spawnData.spawnEvents
        expect(events.length).toBeGreaterThan(2) // 至少生成了一些敌人
        
        // 验证随机性
        if (events.length >= 3) {
            // 检查生成时间间隔的变化
            const intervals = []
            for (let i = 1; i < events.length; i++) {
                intervals.push(events[i].time - events[i-1].time)
            }
            
            // 间隔应该有变化（不是固定的）
            const uniqueIntervals = [...new Set(intervals)]
            expect(uniqueIntervals.length).toBeGreaterThan(1)
            
            // 检查位置随机性
            const xPositions = events.map(e => e.x)
            const uniqueX = [...new Set(xPositions)]
            expect(uniqueX.length).toBeGreaterThan(1) // 不同的X位置
            
            console.log('✅ 生成间隔变化:', intervals)
            console.log('✅ X位置分布:', xPositions)
        }
    })
      test('验证敌人属性的随机变化', async ({ page }) => {
        await page.goto('http://localhost:3011/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 强制生成多个敌人来测试属性随机性
        const attributeTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.enemySpawnManager) {
                return { error: 'Scene or EnemySpawnManager not found' }
            }
            
            const enemyData = []
            
            // 生成10个敌人并记录属性
            for (let i = 0; i < 10; i++) {
                scene.enemySpawnManager.spawnSingleEnemy()
                const enemies = scene.enemies.children.entries
                const latestEnemy = enemies[enemies.length - 1]
                
                if (latestEnemy) {
                    enemyData.push({
                        speed: latestEnemy.speed,
                        hp: latestEnemy.currentHp,
                        maxHp: latestEnemy.maxHp,
                        x: Math.floor(latestEnemy.x),
                        y: Math.floor(latestEnemy.y),
                        isFromSide: latestEnemy.isFromSide || false
                    })
                }
            }
            
            return { enemyData }
        })
        
        console.log('⚡ 敌人属性测试:', attributeTest)
        
        if ('error' in attributeTest) {
            throw new Error(attributeTest.error)
        }
        
        const enemies = attributeTest.enemyData
        expect(enemies.length).toBe(10)
        
        // 验证速度随机性
        const speeds = enemies.map(e => e.speed)
        const uniqueSpeeds = [...new Set(speeds)]
        expect(uniqueSpeeds.length).toBeGreaterThan(1) // 应该有不同的速度
        
        // 验证位置随机性
        const xPositions = enemies.map(e => e.x)
        const uniqueX = [...new Set(xPositions)]
        expect(uniqueX.length).toBeGreaterThan(3) // 应该有多个不同位置
        
        // 验证是否有侧边生成的敌人
        const sideSpawnCount = enemies.filter(e => e.isFromSide).length
        console.log(`🔄 侧边生成敌人数量: ${sideSpawnCount}/10`)
        
        console.log('✅ 速度分布:', speeds)
        console.log('✅ 血量分布:', enemies.map(e => e.hp))
        console.log('✅ X位置分布:', xPositions)
    })
      test('验证等级提升对随机系统的影响', async ({ page }) => {
        await page.goto('http://localhost:3011/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 测试不同等级的敌人生成
        const levelTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.enemySpawnManager) {
                return { error: 'Scene or EnemySpawnManager not found' }
            }
            
            const levelData = []
            
            // 测试等级1, 5, 10
            const testLevels = [1, 5, 10]
            
            testLevels.forEach(level => {
                scene.level = level
                
                const enemies = []
                for (let i = 0; i < 5; i++) {
                    scene.enemySpawnManager.spawnSingleEnemy()
                    const allEnemies = scene.enemies.children.entries
                    const latestEnemy = allEnemies[allEnemies.length - 1]
                    
                    if (latestEnemy) {
                        enemies.push({
                            speed: latestEnemy.speed,
                            hp: latestEnemy.currentHp,
                            maxHp: latestEnemy.maxHp
                        })
                    }
                }
                
                // 计算该等级的基础生成延迟
                const baseDelay = scene.enemySpawnManager.calculateBaseSpawnDelay()
                
                levelData.push({
                    level,
                    enemies,
                    baseSpawnDelay: baseDelay,
                    avgSpeed: enemies.reduce((sum, e) => sum + e.speed, 0) / enemies.length,
                    avgHp: enemies.reduce((sum, e) => sum + e.hp, 0) / enemies.length
                })
            })
            
            return { levelData }
        })
        
        console.log('📊 等级测试结果:', levelTest)
        
        if ('error' in levelTest) {
            throw new Error(levelTest.error)
        }
        
        const data = levelTest.levelData
        expect(data.length).toBe(3)
        
        // 验证随等级递增的趋势
        expect(data[1].avgSpeed).toBeGreaterThan(data[0].avgSpeed) // 等级5 > 等级1
        expect(data[2].avgSpeed).toBeGreaterThan(data[1].avgSpeed) // 等级10 > 等级5
        
        expect(data[1].baseSpawnDelay).toBeLessThan(data[0].baseSpawnDelay) // 更快生成
        expect(data[2].baseSpawnDelay).toBeLessThan(data[1].baseSpawnDelay)
        
        data.forEach((level, index) => {
            console.log(`等级${level.level}: 平均速度=${Math.floor(level.avgSpeed)}, 平均血量=${level.avgHp.toFixed(1)}, 生成间隔=${level.baseSpawnDelay}ms`)
        })
        
        console.log('✅ 等级递增系统验证通过')
    })
})
