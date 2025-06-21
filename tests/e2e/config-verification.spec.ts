// @ts-nocheck
import { test, expect } from '@playwright/test'

test('配置验证和简单游戏测试', async ({ page }) => {
    console.log('🔍 开始配置验证测试...')
    
    await page.goto('http://localhost:3007/heavy-machine-gun/')
    await page.waitForSelector('canvas', { timeout: 10000 })
    await page.waitForTimeout(2000)
    
    const canvas = page.locator('canvas')
    await canvas.click()
    
    await page.waitForTimeout(1000)
    
    // 检查配置值
    const detailedInfo = await page.evaluate(() => {
        try {
            const info = {
                gameScene: !!window.gameScene,
                manager: !!(window.gameScene && window.gameScene.powerUpSpawnManager),
                powerUps: !!(window.gameScene && window.gameScene.powerUps)
            }
            
            if (window.gameScene && window.gameScene.powerUpSpawnManager) {
                const manager = window.gameScene.powerUpSpawnManager
                info.config = {
                    baseChance: manager.calculateSpawnChance(),
                    baseDelay: manager.calculateSpawnDelay(),
                    level: window.gameScene.level
                }
                
                // 检查道具类型列表
                info.powerUpTypes = manager.powerUpTypes
                
                // 尝试选择一个道具类型
                try {
                    info.selectedType = manager.selectPowerUpType()
                } catch (error) {
                    info.selectError = error.message
                }
                
                // 尝试获取道具值
                try {
                    info.multiShotValue = manager.getPowerUpValue('multiShot')
                    info.shieldValue = manager.getPowerUpValue('shield')
                } catch (error) {
                    info.valueError = error.message
                }
            }
            
            return info
        } catch (error) {
            return { error: error.message }
        }
    })
    
    console.log('📊 详细配置信息:', JSON.stringify(detailedInfo, null, 2))
    
    expect(detailedInfo.gameScene).toBe(true)
    expect(detailedInfo.manager).toBe(true)
    expect(detailedInfo.powerUps).toBe(true)
    
    if (detailedInfo.config) {
        console.log(`✅ 配置验证通过:`)
        console.log(`   - 基础概率: ${(detailedInfo.config.baseChance * 100).toFixed(1)}%`)
        console.log(`   - 基础间隔: ${detailedInfo.config.baseDelay}ms`)
        console.log(`   - 当前等级: ${detailedInfo.config.level}`)
        
        expect(detailedInfo.config.baseChance).toBeCloseTo(0.4, 2)
        expect(detailedInfo.config.baseDelay).toBe(5000)
    }
    
    if (detailedInfo.powerUpTypes) {
        console.log(`🎁 道具类型列表:`, detailedInfo.powerUpTypes)
    }
    
    if (detailedInfo.selectedType) {
        console.log(`🎯 选择的道具类型:`, detailedInfo.selectedType)
    }
      if (detailedInfo.multiShotValue) {
        console.log(`⚡ 多重射击值:`, detailedInfo.multiShotValue)
        expect(detailedInfo.multiShotValue).toBeGreaterThanOrEqual(5000) // 等级1时应该是基础值5000
    }
    
    console.log('✅ 基础配置验证完成!')
    
    // 现在尝试实际在游戏中等待自然道具生成
    console.log('⏳ 等待自然道具生成...')
    
    let naturalPowerUps = 0
    let attempts = 0
    const maxAttempts = 15 // 15秒
    
    while (attempts < maxAttempts && naturalPowerUps === 0) {
        await page.waitForTimeout(1000)
        attempts++
        
        naturalPowerUps = await page.evaluate(() => {
            return window.gameScene ? window.gameScene.powerUps.children.entries.length : 0
        })
        
        if (attempts % 5 === 0) {
            console.log(`⏱️ 已等待 ${attempts}秒，道具数量: ${naturalPowerUps}`)
        }
    }
    
    console.log(`📈 最终结果: ${attempts}秒内生成了 ${naturalPowerUps} 个道具`)
    
    if (naturalPowerUps > 0) {
        console.log('🎉 自然道具生成成功！')
        
        // 获取道具详情
        const powerUpDetails = await page.evaluate(() => {
            return window.gameScene.powerUps.children.entries.map(p => ({
                type: p.type,
                x: Math.round(p.x),
                y: Math.round(p.y),
                value: p.value
            }))
        })
        
        console.log('🎁 生成的道具详情:', powerUpDetails)
    } else {
        console.log('⚠️ 在15秒内没有自然生成道具，但配置是正确的')
        console.log('💡 这可能是正常的，因为即使40%概率每5秒生成一次，也可能15秒内都没生成')
    }
})
