/**
 * UI元素详细检查测试
 * 检查左上角是否有多余的图标或UI元素
 */

import { test } from '@playwright/test'

test.describe('UI元素详细检查', () => {
    
    test('检查左上角UI元素', async ({ page }) => {
        await page.goto('http://localhost:3004/heavy-machine-gun/')
        
        // 等待游戏加载
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(3000)
        
        console.log('🔍 开始检查左上角UI元素...')
        
        // 获取游戏场景中的所有UI元素
        const uiElements = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene) return { error: '无法获取游戏场景' }
            
            const elements = []
            
            // 检查UIManager中的元素
            if (scene.uiManager) {
                console.log('🎯 UIManager元素检查:')
                
                if (scene.uiManager.scoreText) {
                    elements.push({
                        type: 'scoreText',
                        x: scene.uiManager.scoreText.x,
                        y: scene.uiManager.scoreText.y,
                        text: scene.uiManager.scoreText.text,
                        visible: scene.uiManager.scoreText.visible
                    })
                }
                
                if (scene.uiManager.livesText) {
                    elements.push({
                        type: 'livesText',
                        x: scene.uiManager.livesText.x,
                        y: scene.uiManager.livesText.y,
                        text: scene.uiManager.livesText.text,
                        visible: scene.uiManager.livesText.visible
                    })
                }
                
                if (scene.uiManager.levelText) {
                    elements.push({
                        type: 'levelText',
                        x: scene.uiManager.levelText.x,
                        y: scene.uiManager.levelText.y,
                        text: scene.uiManager.levelText.text,
                        visible: scene.uiManager.levelText.visible
                    })
                }
                
                if (scene.uiManager.debugText) {
                    elements.push({
                        type: 'debugText',
                        x: scene.uiManager.debugText.x,
                        y: scene.uiManager.debugText.y,
                        text: scene.uiManager.debugText.text,
                        visible: scene.uiManager.debugText.visible
                    })
                }
            }
            
            // 检查场景中是否有其他显示对象
            console.log('🔍 检查场景中的所有显示对象:')
            const allChildren = scene.children.list
            console.log('场景子对象总数:', allChildren.length)
            
            // 查找可能的图标或图像对象
            const potentialIcons = []
            allChildren.forEach((child, index) => {
                if (child.x !== undefined && child.y !== undefined) {
                    // 检查是否是在左上角区域的对象
                    if (child.x <= 200 && child.y <= 200) {
                        const childInfo = {
                            index: index,
                            type: child.constructor.name,
                            x: child.x,
                            y: child.y,
                            visible: child.visible,
                            texture: child.texture ? child.texture.key : 'none',
                            text: child.text || null,
                            alpha: child.alpha
                        }
                        
                        // 如果不是已知的UI文本元素，可能是多余的图标
                        if (child.constructor.name !== 'Text' || 
                            (child.text && !child.text.includes('分数') && 
                             !child.text.includes('生命') && 
                             !child.text.includes('等级'))) {
                            potentialIcons.push(childInfo)
                        }
                    }
                }
            })
            
            return {
                uiManagerElements: elements,
                potentialIcons: potentialIcons,
                totalChildren: allChildren.length
            }
        })
        
        console.log('📊 UI元素检查结果:')
        console.log('UIManager元素:', JSON.stringify(uiElements.uiManagerElements, null, 2))
        console.log('潜在的多余图标:', JSON.stringify(uiElements.potentialIcons, null, 2))
        console.log('场景总子对象数:', uiElements.totalChildren)
        
        // 检查是否有多余的图标
        if (uiElements.potentialIcons && uiElements.potentialIcons.length > 0) {
            console.log('⚠️ 发现可能的多余UI元素:')
            uiElements.potentialIcons.forEach(icon => {
                console.log(`- ${icon.type} 位置:(${icon.x}, ${icon.y}) 纹理:${icon.texture} 可见:${icon.visible}`)
            })
        } else {
            console.log('✅ 未发现多余的UI元素')
        }
        
        // 截图以便视觉检查
        await page.screenshot({ 
            path: 'test-results/ui-check-screenshot.png',
            clip: { x: 0, y: 0, width: 250, height: 150 } // 只截取左上角区域
        })
        
        console.log('📸 已保存左上角截图: test-results/ui-check-screenshot.png')
    })
    
    test('检查是否有隐藏或透明的UI元素', async ({ page }) => {
        await page.goto('http://localhost:3004/heavy-machine-gun/')
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(2000)
        
        const hiddenElements = await page.evaluate(() => {
            const scene = window.game?.scene?.getScene('GameScene')
            if (!scene) return []
            
            const allChildren = scene.children.list
            const hiddenOrTransparent = []
            
            allChildren.forEach((child, index) => {
                if (child.x !== undefined && child.y !== undefined && 
                    child.x <= 200 && child.y <= 200) {
                    
                    // 检查隐藏或透明的元素
                    if (!child.visible || child.alpha < 0.1) {
                        hiddenOrTransparent.push({
                            index: index,
                            type: child.constructor.name,
                            x: child.x,
                            y: child.y,
                            visible: child.visible,
                            alpha: child.alpha,
                            texture: child.texture ? child.texture.key : 'none'
                        })
                    }
                }
            })
            
            return hiddenOrTransparent
        })
        
        console.log('👻 隐藏或透明的UI元素:', JSON.stringify(hiddenElements, null, 2))
        
        if (hiddenElements.length > 0) {
            console.log('⚠️ 发现隐藏或透明的元素，可能是多余的图标')
        }
    })
})
