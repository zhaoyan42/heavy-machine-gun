/**
 * 检查状态栏重复问题
 */

import { test } from '@playwright/test'

test.describe('状态栏检查', () => {
    
    test('检查是否有重复的状态栏', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(3000)
        
        console.log('🔍 检查状态栏情况...')
        
        // 获取所有Text元素的信息
        const textElements = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene) return { error: '无法获取游戏场景' }
            
            const allChildren = scene.children.list
            const textElements = []
            
            allChildren.forEach((child, index) => {
                if (child.constructor.name === 'Text' && child.text) {
                    textElements.push({
                        index: index,
                        x: child.x,
                        y: child.y,
                        text: child.text,
                        visible: child.visible,
                        alpha: child.alpha
                    })
                }
            })
            
            return {
                textElements: textElements,
                uiManager: scene.uiManager ? {
                    scoreText: scene.uiManager.scoreText ? {
                        x: scene.uiManager.scoreText.x,
                        y: scene.uiManager.scoreText.y,
                        text: scene.uiManager.scoreText.text
                    } : null,
                    livesText: scene.uiManager.livesText ? {
                        x: scene.uiManager.livesText.x,
                        y: scene.uiManager.livesText.y,
                        text: scene.uiManager.livesText.text
                    } : null,
                    levelText: scene.uiManager.levelText ? {
                        x: scene.uiManager.levelText.x,
                        y: scene.uiManager.levelText.y,
                        text: scene.uiManager.levelText.text
                    } : null,
                    debugText: scene.uiManager.debugText ? {
                        x: scene.uiManager.debugText.x,
                        y: scene.uiManager.debugText.y,
                        text: scene.uiManager.debugText.text
                    } : null
                } : null
            }
        })
        
        console.log('📊 状态栏检查结果:')
        console.log('UIManager管理的文本元素:', JSON.stringify(textElements.uiManager, null, 2))
        console.log('场景中所有文本元素:', JSON.stringify(textElements.textElements, null, 2))
        
        // 检查是否有重复的状态栏文本
        const statusTexts = textElements.textElements.filter(el => 
            el.text.includes('分数') || 
            el.text.includes('生命') || 
            el.text.includes('等级')
        )
        
        console.log('🔍 状态栏相关文本元素数量:', statusTexts.length)
        statusTexts.forEach((text, index) => {
            console.log(`${index + 1}. 位置:(${text.x}, ${text.y}) 内容:"${text.text}" 可见:${text.visible}`)
        })
        
        if (statusTexts.length > 3) {
            console.log('⚠️ 发现重复的状态栏元素！')
        }
    })
    
    test('检查Player的所有属性', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        console.log('🎮 检查Player属性...')
        
        const playerInfo = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene || !scene.player) return { error: '无法获取玩家对象' }
            
            const player = scene.player
            return {
                // 基础属性
                x: player.x,
                y: player.y,
                lives: scene.lives,
                score: scene.score,
                level: scene.level,
                
                // 可能的Player属性
                speed: player.speed || player.moveSpeed || null,
                fireRate: player.fireRate || null,
                isInvincible: player.isInvincible || null,
                invincibilityTime: player.invincibilityTime || null,
                
                // 道具状态
                multiShotActive: typeof player.isMultiShotActive === 'function' ? player.isMultiShotActive() : null,
                shieldActive: typeof player.isShieldActive === 'function' ? player.isShieldActive() : null,
                multiShotEndTime: player.multiShotEndTime || null,
                shieldEndTime: player.shieldEndTime || null,
                
                // 其他可能的属性
                health: player.health || null,
                maxHealth: player.maxHealth || null,
                energy: player.energy || null,
                experience: player.experience || player.exp || null,
                
                // 检查所有属性
                allProperties: Object.getOwnPropertyNames(player).filter(prop => 
                    typeof player[prop] !== 'function' && 
                    !prop.startsWith('_') &&
                    prop !== 'scene'
                )
            }
        })
        
        console.log('🎯 Player属性详情:', JSON.stringify(playerInfo, null, 2))
    })
})
