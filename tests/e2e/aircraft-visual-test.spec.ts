/**
 * 飞机视觉效果测试
 * 验证新的自定义绘制飞机纹理是否正确显示
 */

import { test, expect } from '@playwright/test'

test.describe('飞机视觉效果测试', () => {
    test('验证自定义飞机纹理显示', async ({ page }) => {
        await page.goto('http://localhost:3010/heavy-machine-gun/')
        
        // 等待游戏初始化
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 验证飞机纹理是否创建成功
        const textureTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene) return { error: 'Game scene not found' }
            
            // 检查player纹理是否存在
            const playerTexture = scene.textures.exists('player')
            
            // 检查玩家对象是否存在并使用了正确的纹理
            const player = scene.player
            const playerExists = !!player
            const playerTextureKey = player ? player.texture.key : null
            
            return {
                playerTextureExists: playerTexture,
                playerExists: playerExists,
                playerTextureKey: playerTextureKey,
                playerPosition: player ? { x: player.x, y: player.y } : null
            }
        })
        
        console.log('🚁 飞机纹理测试结果:', textureTest)
        
        if ('error' in textureTest) {
            throw new Error(textureTest.error)
        }
        
        // 验证纹理和玩家状态
        expect(textureTest.playerTextureExists).toBe(true)
        expect(textureTest.playerExists).toBe(true)
        expect(textureTest.playerTextureKey).toBe('player')
        expect(textureTest.playerPosition).toBeTruthy()
        
        console.log('✅ 自定义飞机纹理创建成功')
        console.log(`✅ 玩家位置: (${textureTest.playerPosition?.x}, ${textureTest.playerPosition?.y})`)
    })
    
    test('验证飞机移动和控制', async ({ page }) => {
        await page.goto('http://localhost:3010/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // 获取初始位置
        const initialPosition = await page.evaluate(() => {
            const scene = (window as any).gameScene
            return scene?.player ? { x: scene.player.x, y: scene.player.y } : null
        })
        
        // 模拟点击移动
        await page.click('canvas', { position: { x: 200, y: 300 } })
        await page.waitForTimeout(500)
        
        // 获取移动后位置
        const newPosition = await page.evaluate(() => {
            const scene = (window as any).gameScene
            return scene?.player ? { x: scene.player.x, y: scene.player.y } : null
        })
        
        console.log('🎮 飞机移动测试:')
        console.log(`初始位置: (${initialPosition?.x}, ${initialPosition?.y})`)
        console.log(`移动后位置: (${newPosition?.x}, ${newPosition?.y})`)
        
        // 验证飞机确实移动了
        expect(newPosition).toBeTruthy()
        expect(initialPosition).toBeTruthy()
        
        // 验证位置有变化（至少在X轴上）
        const hasMoved = Math.abs((newPosition?.x || 0) - (initialPosition?.x || 0)) > 10
        expect(hasMoved).toBe(true)
        
        console.log('✅ 飞机移动控制正常')
    })
    
    test('截图验证飞机外观', async ({ page }) => {
        await page.goto('http://localhost:3010/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        // 截图保存飞机外观
        await page.screenshot({ 
            path: 'tests/screenshots/aircraft-visual.png',
            fullPage: false 
        })
        
        console.log('📸 飞机外观截图已保存到: tests/screenshots/aircraft-visual.png')
        
        // 验证游戏正在运行
        const gameRunning = await page.evaluate(() => {
            const scene = (window as any).gameScene
            return !!(scene && scene.player && !scene.isGameOver)
        })
        
        expect(gameRunning).toBe(true)
        console.log('✅ 飞机外观截图完成')
    })
})
