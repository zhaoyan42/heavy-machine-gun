import { test, expect } from '@playwright/test'

// 扩展 Window 接口以支持游戏调试对象
declare global {
    interface Window {
        gameScene: any
        gameDebugLogs: string[]
    }
}

test.describe('事件系统修复测试', () => {
    test('应该能正常加载游戏而不出现事件错误', async ({ page }) => {
        // 监听控制台错误
        const consoleErrors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        // 监听页面错误
        const pageErrors: string[] = []
        page.on('pageerror', error => {
            pageErrors.push(error.message)
        })

        // 访问游戏页面
        await page.goto('/')
        
        // 等待游戏初始化
        await page.waitForTimeout(2000)
        
        // 检查是否有关于 'this.on is not a function' 的错误
        const hasEventError = [...consoleErrors, ...pageErrors].some(error => 
            error.includes('this.on is not a function') || 
            error.includes('TypeError') && error.includes('.on')
        )
        
        expect(hasEventError).toBe(false)
        
        // 验证游戏正常加载
        const canvas = page.locator('canvas')
        await expect(canvas).toBeVisible()
        
        // 验证游戏场景对象可访问
        const gameSceneExists = await page.evaluate(() => {
            return typeof (window as any).gameScene !== 'undefined'
        })
        expect(gameSceneExists).toBe(true)
        
        console.log('✅ 事件系统修复测试通过')
        console.log(`控制台错误: ${consoleErrors.length}`)
        console.log(`页面错误: ${pageErrors.length}`)
    })
    
    test('应该能正常监听道具生成事件', async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(1000)
        
        // 检查事件监听器是否正确设置
        const eventListenerSetup = await page.evaluate(() => {
            const win = window as any
            // 检查 gameScene 是否有 events 属性
            return win.gameScene && 
                   win.gameScene.events && 
                   typeof win.gameScene.events.on === 'function'
        })
        
        expect(eventListenerSetup).toBe(true)
        
        // 手动触发道具生成事件测试
        const eventTriggered = await page.evaluate(() => {
            const win = window as any
            if (!win.gameScene || !win.gameScene.events) return false
            
            // 触发一个测试事件
            win.gameScene.events.emit('powerUpSpawned', 'multiShot', 100, 100, 5000, 1)
            
            // 检查调试日志是否记录
            return win.gameDebugLogs && win.gameDebugLogs.length > 0
        })
        
        expect(eventTriggered).toBe(true)
        console.log('✅ 道具生成事件监听测试通过')
    })
})
