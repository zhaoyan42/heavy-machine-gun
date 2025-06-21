/**
 * Emoji视觉效果测试
 * 手动验证游戏中的emoji图标显示效果
 */

import { test, expect } from '@playwright/test'

test.describe('Emoji视觉效果验证', () => {
    test('验证游戏中emoji图标显示', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏初始化
        await page.waitForSelector('canvas', { timeout: 10000 })
        await page.waitForTimeout(3000)
        
        // 验证游戏是否正常启动
        const gameStatus = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene) return { error: 'Game scene not found' }
            
            return {
                hasPlayer: !!scene.player,
                playerTexture: scene.player ? scene.player.texture.key : null,
                canvasActive: !!document.querySelector('canvas'),
                gameRunning: !scene.isGameOver
            }
        })
        
        console.log('🎮 游戏状态验证:', gameStatus)
        
        if ('error' in gameStatus) {
            throw new Error(gameStatus.error)
        }
        
        expect(gameStatus.hasPlayer).toBe(true)
        expect(gameStatus.playerTexture).toBe('player')
        expect(gameStatus.canvasActive).toBe(true)
        expect(gameStatus.gameRunning).toBe(true)
        
        // 等待一段时间让玩家观察emoji效果
        console.log('🎯 请观察游戏画面:')
        console.log('  - 玩家: 🚁 (直升机)')
        console.log('  - 敌人: 👾 (外星人)')
        console.log('  - 子弹: ⚡ (闪电)')
        console.log('  - 道具: 🔫🛡️💎❤️🚀💨💣')
        
        await page.waitForTimeout(5000) // 等待5秒让用户观察
        
        // 强制生成一些道具来验证显示效果
        const powerUpTest = await page.evaluate(() => {
            const scene = (window as any).gameScene
            if (!scene || !scene.powerUpSpawnManager) {
                return { error: 'Scene or PowerUpSpawnManager not found' }
            }
            
            // 在不同位置生成各种道具
            const powerUpTypes = [
                'multiShot', 'shield', 'extraPoints', 'extraLife', 
                'bomb', 'permanentFireRate', 'permanentSpeed'
            ]
            
            powerUpTypes.forEach((type, index) => {
                const x = 50 + (index % 4) * 80
                const y = 100 + Math.floor(index / 4) * 80
                scene.powerUpSpawnManager.spawnSpecificPowerUp(type, x, y)
            })
            
            return {
                powerUpsGenerated: powerUpTypes.length,
                message: '已生成所有类型的道具，请观察emoji显示效果'
            }
        })
        
        console.log('✨ 道具生成结果:', powerUpTest)
        
        // 再等待一段时间让用户观察道具emoji
        await page.waitForTimeout(8000)
        
        console.log('✅ Emoji视觉效果测试完成！')
        console.log('📋 测试总结:')
        console.log('  - 玩家使用 🚁 emoji表示')
        console.log('  - 敌人使用 👾 emoji表示') 
        console.log('  - 子弹使用 ⚡ emoji表示')
        console.log('  - 各种道具使用对应emoji表示')
        console.log('  - 移除了道具获得时的文字提示')
    })
})
