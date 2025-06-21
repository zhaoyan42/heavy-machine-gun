import { test, expect } from '@playwright/test'

// 扩展Window类型
declare global {
    interface Window {
        gameScene: any
    }
}

test.describe('Player Death and Respawn System', () => {    test('player should respawn after death with reset enhancements', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForTimeout(2000)
        
        // 获取初始生命数
        const initialLives = await page.evaluate(() => {
            return window.gameScene?.lives || 0
        })
        
        console.log(`Initial lives: ${initialLives}`)
        
        // 模拟玩家获得增强效果
        await page.evaluate(() => {
            const player = window.gameScene?.player
            if (player) {
                // 激活多重射击
                player.activatePowerUp('multiShot')
                // 激活护盾
                player.activatePowerUp('shield')
                // 永久增强射速
                player.activatePowerUp('permanentFireRate', 50)
                // 永久增强速度
                player.activatePowerUp('permanentSpeed', 100)
                
                console.log('增强效果已激活:')
                console.log('- 多重射击:', player.multiShot)
                console.log('- 护盾:', player.shieldActive)
                console.log('- 射击间隔:', player.fireRate)
                console.log('- 移动速度:', player.speed)
            }
        })
        
        // 验证增强效果已激活
        const enhancementsActive = await page.evaluate(() => {
            const player = window.gameScene?.player
            return {
                multiShot: player?.multiShot || false,
                shield: player?.shieldActive || false,
                fireRate: player?.fireRate || 200,
                speed: player?.speed || 300
            }
        })
        
        console.log('增强效果状态:', enhancementsActive)
        expect(enhancementsActive.multiShot).toBe(true)
        expect(enhancementsActive.shield).toBe(true)
        expect(enhancementsActive.fireRate).toBeLessThan(200)
        expect(enhancementsActive.speed).toBeGreaterThan(300)
        
        // 模拟玩家死亡
        await page.evaluate(() => {
            window.gameScene?.loseLife()
        })
        
        // 验证生命数减少
        const livesAfterDeath = await page.evaluate(() => {
            return window.gameScene?.lives || 0
        })
        
        console.log(`Lives after death: ${livesAfterDeath}`)
        expect(livesAfterDeath).toBe(initialLives - 1)
        
        // 验证玩家进入重生状态
        const playerState = await page.evaluate(() => {
            const player = window.gameScene?.player
            return {
                isRespawning: player?.isRespawning || false,
                visible: player?.visible || false,
                active: player?.active || false
            }
        })
        
        console.log('玩家重生状态:', playerState)
        expect(playerState.isRespawning).toBe(true)
        expect(playerState.visible).toBe(false)
        expect(playerState.active).toBe(false)
        
        // 验证增强效果已重置
        const enhancementsAfterDeath = await page.evaluate(() => {
            const player = window.gameScene?.player
            return {
                multiShot: player?.multiShot || false,
                shield: player?.shieldActive || false,
                fireRate: player?.fireRate || 200,
                speed: player?.speed || 300
            }
        })
        
        console.log('死亡后增强效果状态:', enhancementsAfterDeath)
        expect(enhancementsAfterDeath.multiShot).toBe(false)
        expect(enhancementsAfterDeath.shield).toBe(false)
        expect(enhancementsAfterDeath.fireRate).toBe(200)
        expect(enhancementsAfterDeath.speed).toBe(300)
        
        // 等待重生倒计时（3秒 + 一点缓冲时间）
        console.log('等待玩家重生...')
        await page.waitForTimeout(3500)
        
        // 验证玩家已重生
        const playerStateAfterRespawn = await page.evaluate(() => {
            const player = window.gameScene?.player
            return {
                isRespawning: player?.isRespawning || false,
                visible: player?.visible || false,
                active: player?.active || false,
                isInvincible: player?.isInvincible || false,
                x: player?.x || 0,
                y: player?.y || 0
            }
        })
        
        console.log('重生后玩家状态:', playerStateAfterRespawn)
        expect(playerStateAfterRespawn.isRespawning).toBe(false)
        expect(playerStateAfterRespawn.visible).toBe(true)
        expect(playerStateAfterRespawn.active).toBe(true)
        expect(playerStateAfterRespawn.isInvincible).toBe(true)
        
        // 验证玩家位置重置到屏幕底部中央
        expect(playerStateAfterRespawn.x).toBeCloseTo(207, 20) // 414/2 = 207
        expect(playerStateAfterRespawn.y).toBeCloseTo(636, 20) // 736-100 = 636
        
        // 等待无敌时间结束（2秒 + 缓冲时间）
        console.log('等待无敌时间结束...')
        await page.waitForTimeout(2500)
        
        // 验证无敌时间结束
        const isInvincibleAfterWait = await page.evaluate(() => {
            return window.gameScene?.player?.isInvincible || false
        })
        
        console.log('无敌时间结束后状态:', isInvincibleAfterWait)
        expect(isInvincibleAfterWait).toBe(false)
          console.log('✅ 死亡重生测试通过!')
    })
    
    test('player should die and show game over when no lives left', async ({ page }) => {
        await page.goto('/')
        
        // 等待游戏加载
        await page.waitForTimeout(2000)
        
        // 将生命值设置为1
        await page.evaluate(() => {
            if (window.gameScene) {
                window.gameScene.lives = 1
                window.gameScene.uiManager.updateLives(1)
            }
        })
        
        // 模拟玩家死亡
        await page.evaluate(() => {
            window.gameScene?.loseLife()
        })
        
        // 验证游戏结束
        const isGameOver = await page.evaluate(() => {
            return window.gameScene?.isGameOver || false
        })
        
        console.log('游戏结束状态:', isGameOver)
        expect(isGameOver).toBe(true)
        
        console.log('✅ 游戏结束测试通过!')
    })
})
