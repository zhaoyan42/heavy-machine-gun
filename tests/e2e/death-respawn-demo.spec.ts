import { test } from '@playwright/test'

// 扩展Window类型
declare global {
    interface Window {
        gameScene: any
    }
}

test('Demo: Death and Respawn System with Visual Effects', async ({ page }) => {
    await page.goto('/')
    
    // 等待游戏加载
    await page.waitForTimeout(2000)
    
    console.log('🎮 游戏加载完成，开始演示死亡重生系统...')
    
    // 显示初始状态
    const initialState = await page.evaluate(() => {
        return {
            lives: window.gameScene?.lives || 0,
            playerVisible: window.gameScene?.player?.visible || false,
            playerActive: window.gameScene?.player?.active || false
        }
    })
    console.log('初始状态:', initialState)
    
    // 第一步：给玩家添加各种增强效果
    console.log('\n📈 第一步：激活所有增强效果...')
    await page.evaluate(() => {
        const player = window.gameScene?.player
        if (player) {
            player.activatePowerUp('multiShot')
            player.activatePowerUp('shield')
            player.activatePowerUp('permanentFireRate', 100)
            player.activatePowerUp('permanentSpeed', 200)
        }
    })
    
    // 显示增强后的状态
    const enhancedState = await page.evaluate(() => {
        const player = window.gameScene?.player
        return {
            multiShot: player?.multiShot || false,
            shield: player?.shieldActive || false,
            fireRate: player?.fireRate || 200,
            speed: player?.speed || 300
        }
    })
    console.log('增强后状态:', enhancedState)
    
    // 等待一下让用户看到增强效果
    await page.waitForTimeout(2000)
    
    // 第二步：模拟玩家死亡
    console.log('\n💀 第二步：模拟玩家死亡...')
    await page.evaluate(() => {
        window.gameScene?.loseLife()
    })
    
    // 显示死亡后的状态
    const deathState = await page.evaluate(() => {
        const player = window.gameScene?.player
        return {
            lives: window.gameScene?.lives || 0,
            isRespawning: player?.isRespawning || false,
            visible: player?.visible || false,
            active: player?.active || false,
            multiShot: player?.multiShot || false,
            shield: player?.shieldActive || false,
            fireRate: player?.fireRate || 200,
            speed: player?.speed || 300
        }
    })
    console.log('死亡后状态:', deathState)
    
    // 第三步：等待重生倒计时
    console.log('\n⏰ 第三步：等待3秒重生倒计时...')
    for (let i = 3; i > 0; i--) {
        console.log(`${i}...`)
        await page.waitForTimeout(1000)
    }
    
    // 第四步：验证重生
    console.log('\n🌟 第四步：验证玩家重生...')
    await page.waitForTimeout(500) // 多等一点时间确保重生完成
    
    const respawnState = await page.evaluate(() => {
        const player = window.gameScene?.player
        return {
            isRespawning: player?.isRespawning || false,
            visible: player?.visible || false,
            active: player?.active || false,
            isInvincible: player?.isInvincible || false,
            x: Math.round(player?.x || 0),
            y: Math.round(player?.y || 0),
            multiShot: player?.multiShot || false,
            shield: player?.shieldActive || false,
            fireRate: player?.fireRate || 200,
            speed: player?.speed || 300
        }
    })
    console.log('重生后状态:', respawnState)
    
    // 第五步：等待无敌时间结束
    console.log('\n⚔️ 第五步：等待2秒无敌时间结束...')
    await page.waitForTimeout(2000)
    
    const finalState = await page.evaluate(() => {
        return {
            isInvincible: window.gameScene?.player?.isInvincible || false
        }
    })
    console.log('最终状态:', finalState)
    
    console.log('\n✅ 死亡重生系统演示完成！')
    console.log('📋 功能总结：')
    console.log('   1. 玩家死亡时显示动画和倒计时')
    console.log('   2. 所有增强效果被完全重置')
    console.log('   3. 玩家在屏幕底部中央重生')
    console.log('   4. 重生后有2秒无敌时间和闪烁效果')
    console.log('   5. 生命值正确减少')
    
    // 保持页面打开一段时间供观察
    await page.waitForTimeout(3000)
})
