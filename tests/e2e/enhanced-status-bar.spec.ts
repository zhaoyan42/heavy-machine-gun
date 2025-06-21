/**
 * 增强状态栏功能测试
 */

import { test } from '@playwright/test'

test.describe('增强状态栏测试', () => {
    
    test('验证新的Player属性显示', async ({ page }) => {
        await page.goto('http://localhost:3004/heavy-machine-gun/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(3000)
        
        console.log('🔍 检查增强后的状态栏...')
        
        // 检查所有UI元素
        const uiStatus = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene || !scene.uiManager) return { error: '无法获取UI管理器' }
            
            const uiManager = scene.uiManager
            
            return {
                // 基础状态栏
                scoreText: uiManager.scoreText ? {
                    text: uiManager.scoreText.text,
                    visible: uiManager.scoreText.visible,
                    x: uiManager.scoreText.x,
                    y: uiManager.scoreText.y
                } : null,
                livesText: uiManager.livesText ? {
                    text: uiManager.livesText.text,
                    visible: uiManager.livesText.visible,
                    x: uiManager.livesText.x,
                    y: uiManager.livesText.y
                } : null,
                levelText: uiManager.levelText ? {
                    text: uiManager.levelText.text,
                    visible: uiManager.levelText.visible,
                    x: uiManager.levelText.x,
                    y: uiManager.levelText.y
                } : null,
                
                // 新增的Player属性显示
                speedText: uiManager.speedText ? {
                    text: uiManager.speedText.text,
                    visible: uiManager.speedText.visible,
                    x: uiManager.speedText.x,
                    y: uiManager.speedText.y
                } : null,
                fireRateText: uiManager.fireRateText ? {
                    text: uiManager.fireRateText.text,
                    visible: uiManager.fireRateText.visible,
                    x: uiManager.fireRateText.x,
                    y: uiManager.fireRateText.y
                } : null,
                multiShotText: uiManager.multiShotText ? {
                    text: uiManager.multiShotText.text,
                    visible: uiManager.multiShotText.visible,
                    x: uiManager.multiShotText.x,
                    y: uiManager.multiShotText.y
                } : null,
                shieldText: uiManager.shieldText ? {
                    text: uiManager.shieldText.text,
                    visible: uiManager.shieldText.visible,
                    x: uiManager.shieldText.x,
                    y: uiManager.shieldText.y
                } : null,
                
                // 调试文本状态
                debugText: uiManager.debugText ? {
                    text: uiManager.debugText.text,
                    visible: uiManager.debugText.visible,
                    x: uiManager.debugText.x,
                    y: uiManager.debugText.y
                } : null
            }
        })
        
        console.log('📊 增强状态栏检查结果:')
        console.log('基础状态栏:')
        console.log('- 分数:', uiStatus.scoreText)
        console.log('- 生命:', uiStatus.livesText)
        console.log('- 等级:', uiStatus.levelText)
        
        console.log('新增Player属性:')
        console.log('- 移动速度:', uiStatus.speedText)
        console.log('- 射击速度:', uiStatus.fireRateText)
        console.log('- 多重射击:', uiStatus.multiShotText)
        console.log('- 护盾状态:', uiStatus.shieldText)
        
        console.log('调试信息状态:')
        console.log('- 调试文本可见性:', uiStatus.debugText?.visible)
        
        if (uiStatus.debugText?.visible === false) {
            console.log('✅ 成功隐藏了第二个状态栏（调试信息）')
        }
        
        // 测试道具效果
        console.log('🎮 测试道具效果对状态栏的影响...')
        
        await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (scene && scene.player) {
                // 激活多重射击道具
                scene.player.activatePowerUp('multiShot')
                console.log('🎯 激活多重射击道具')
                
                // 激活护盾道具
                scene.player.activatePowerUp('shield')
                console.log('🛡️ 激活护盾道具')
            }
        })
        
        // 等待状态更新
        await page.waitForTimeout(2000)
        
        // 再次检查状态
        const updatedStatus = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene || !scene.uiManager) return { error: '无法获取UI管理器' }
            
            const uiManager = scene.uiManager
            
            return {
                multiShotText: uiManager.multiShotText ? {
                    text: uiManager.multiShotText.text,
                    visible: uiManager.multiShotText.visible
                } : null,
                shieldText: uiManager.shieldText ? {
                    text: uiManager.shieldText.text,
                    visible: uiManager.shieldText.visible
                } : null
            }
        })
        
        console.log('🔄 道具激活后的状态:')
        console.log('- 多重射击状态:', updatedStatus.multiShotText)
        console.log('- 护盾状态:', updatedStatus.shieldText)
        
        if (updatedStatus.multiShotText?.visible && updatedStatus.shieldText?.visible) {
            console.log('✅ 道具状态显示正常工作！')
        }
        
        console.log('✅ 增强状态栏功能测试完成')
    })
})
