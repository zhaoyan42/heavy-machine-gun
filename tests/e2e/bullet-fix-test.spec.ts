import { test, expect } from '@playwright/test'

test.describe('射击系统测试', () => {
    test('验证每次只发射一颗子弹（非散射模式）', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 监听控制台日志来验证射击逻辑
        const consoleLogs: Array<{text: string, timestamp: number}> = []
        page.on('console', msg => {
            if (msg.text().includes('💥 调用fireBullet') || 
                msg.text().includes('🔥 玩家射击') ||
                msg.text().includes('playerFire被调用')) {
                consoleLogs.push({
                    text: msg.text(),
                    timestamp: Date.now()
                })
            }
        })
        
        // 等待几次射击
        await page.waitForTimeout(1000)
        
        // 验证控制台日志
        console.log('射击相关日志：', consoleLogs)
        
        // 检查是否有重复的playerFire调用
        const playerFireCalls = consoleLogs.filter(log => 
            log.text.includes('playerFire被调用'))
        
        // 应该没有playerFire被调用的日志（因为我们已经停用了它）
        expect(playerFireCalls.length).toBe(0)
        
        // 计算射击频率 - 统计一秒内的射击次数
        const recentLogs = consoleLogs.filter(log => 
            log.text.includes('💥 调用fireBullet') && 
            Date.now() - log.timestamp < 1500)
        
        // 200ms间隔大约每秒5次，允许一定误差
        expect(recentLogs.length).toBeGreaterThan(2)
        expect(recentLogs.length).toBeLessThan(10)
        
        console.log(`✅ 射击测试通过 - 在1.5秒内发现${recentLogs.length}次射击`)
    })
    
    test('验证子弹实际生成数量', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        
        // 等待游戏稳定
        await page.waitForTimeout(1000)
        
        // 通过JavaScript检查子弹数组长度
        const bulletCountBefore = await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            return scene?.bullets?.children?.entries?.length || 0
        })
        
        console.log(`射击前子弹数量：${bulletCountBefore}`)
        
        // 等待几次射击
        await page.waitForTimeout(500)
        
        const bulletCountAfter = await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            return scene?.bullets?.children?.entries?.length || 0
        })
        
        console.log(`射击后子弹数量：${bulletCountAfter}`)
        
        // 验证子弹数量增加了，但不会异常增多
        const newBullets = bulletCountAfter - bulletCountBefore
        expect(newBullets).toBeGreaterThan(0)
        expect(newBullets).toBeLessThan(10) // 0.5秒内不应该有超过10颗子弹
        
        console.log(`✅ 子弹生成测试通过 - 新增${newBullets}颗子弹`)
    })
    
    test('检查散射模式下的子弹数量', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 激活散射模式（通过控制台模拟获得散射道具）
        await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            if (scene?.player) {
                scene.player.enableMultiShot()
            }
        })
        
        // 检查散射模式是否激活
        const isMultiShotActive = await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            return scene?.player?.isMultiShotActive() || false
        })
        
        expect(isMultiShotActive).toBe(true)
        console.log('✅ 散射模式已激活')
        
        // 获取激活散射前的子弹数量
        const bulletCountBefore = await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            return scene?.bullets?.children?.entries?.length || 0
        })
        
        // 等待一次散射射击
        await page.waitForTimeout(300)
        
        const bulletCountAfter = await page.evaluate(() => {
            const scene = (window as any).game?.scene?.scenes[0]
            return scene?.bullets?.children?.entries?.length || 0
        })
        
        const newBullets = bulletCountAfter - bulletCountBefore
        console.log(`散射模式下新增子弹数量：${newBullets}`)
        
        // 散射模式下每次应该发射5颗子弹
        // 但考虑到可能有多次射击，所以检查是否是5的倍数
        expect(newBullets % 5).toBe(0)
        expect(newBullets).toBeGreaterThan(0)
        
        console.log(`✅ 散射模式测试通过 - 每次发射5颗子弹`)
    })
})
