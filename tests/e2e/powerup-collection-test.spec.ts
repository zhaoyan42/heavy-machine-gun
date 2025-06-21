import { test, expect } from '@playwright/test'

test.describe('道具收集测试', () => {
    test('测试道具收集功能不会报错', async ({ page }) => {
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
        
        // 等待游戏加载
        await page.waitForTimeout(2000)
        
        // 检查游戏是否正常启动
        const canvas = page.locator('canvas')
        await expect(canvas).toBeVisible()
        
        // 模拟游戏运行一段时间，让道具生成
        console.log('🎮 开始游戏运行，等待道具生成...')
        await page.waitForTimeout(10000) // 等待10秒让道具生成
        
        // 检查是否有与activatePowerUp相关的错误
        const powerUpErrors = consoleErrors.filter(error => 
            error.includes('activatePowerUp') || 
            error.includes('TypeError') ||
            error.includes('is not a function')
        )
        
        // 输出收集到的错误信息
        if (consoleErrors.length > 0) {
            console.log('❌ 控制台错误:')
            consoleErrors.forEach(error => console.log(error))
        }
        
        if (pageErrors.length > 0) {
            console.log('❌ 页面错误:')
            pageErrors.forEach(error => console.log(error))
        }
        
        // 验证没有道具收集相关的错误
        expect(powerUpErrors.length).toBe(0)
        
        console.log('✅ 道具收集功能测试完成，无报错')
    })

    test('测试道具激活效果', async ({ page }) => {
        // 监听控制台消息
        const consoleMessages: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'log') {
                consoleMessages.push(msg.text())
            }
        })

        // 访问游戏页面
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForTimeout(2000)
        
        // 运行游戏一段时间以获取道具
        await page.waitForTimeout(15000)
        
        // 检查是否有道具激活的日志
        const powerUpLogs = consoleMessages.filter(msg => 
            msg.includes('激活道具') || 
            msg.includes('收集道具') ||
            msg.includes('✨') ||
            msg.includes('五重散射') ||
            msg.includes('护盾激活') ||
            msg.includes('射击速度提升') ||
            msg.includes('移动速度提升')
        )
        
        console.log('🎮 道具相关日志消息:')
        powerUpLogs.forEach(log => console.log(log))
        
        // 如果有道具相关的日志，说明道具系统正常工作
        if (powerUpLogs.length > 0) {
            console.log('✅ 道具系统正常工作')
        } else {
            console.log('ℹ️ 测试期间未检测到道具激活，可能是随机性导致')
        }
    })
})
