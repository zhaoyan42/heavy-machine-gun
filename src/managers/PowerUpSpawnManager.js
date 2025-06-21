/**
 * 道具生成管理器
 * 负责管理道具的生成逻辑和生成模式
 */

import PowerUp from '../entities/PowerUp.js'
import { POWERUP_CONFIG } from '../config/GameConfig.js'

export default class PowerUpSpawnManager {
    constructor(scene) {
        this.scene = scene
        this.spawnTimer = null
        this.powerUpTypes = ['multiShot', 'shield', 'extraPoints', 'extraLife']
        
        this.startSpawning()
    }    /**
     * 开始生成道具
     */
    startSpawning() {
        this.updateSpawnParameters()
    }
    
    /**
     * 更新道具生成参数（基于当前等级）
     */
    updateSpawnParameters() {
        const currentDelay = this.calculateSpawnDelay()
        
        if (this.spawnTimer) {
            this.spawnTimer.remove()
        }
        
        this.spawnTimer = this.scene.time.addEvent({
            delay: currentDelay,
            callback: this.trySpawnPowerUp,
            callbackScope: this,
            loop: true
        })
        
        console.log(`🎯 道具生成参数更新 - 等级:${this.scene.level} 间隔:${currentDelay}ms 概率:${(this.calculateSpawnChance() * 100).toFixed(1)}%`)
    }
    
    /**
     * 计算当前等级的道具生成间隔
     */
    calculateSpawnDelay() {
        const level = this.scene.level || 1
        const delay = POWERUP_CONFIG.BASE_SPAWN_DELAY - (level - 1) * POWERUP_CONFIG.SPAWN_DELAY_DECREASE
        return Math.max(POWERUP_CONFIG.MIN_SPAWN_DELAY, delay)
    }
    
    /**
     * 计算当前等级的道具生成概率
     */
    calculateSpawnChance() {
        const level = this.scene.level || 1
        const chance = POWERUP_CONFIG.BASE_SPAWN_CHANCE + (level - 1) * POWERUP_CONFIG.SPAWN_CHANCE_INCREASE
        return Math.min(POWERUP_CONFIG.MAX_SPAWN_CHANCE, chance)
    }

    /**
     * 停止生成道具
     */
    stopSpawning() {
        if (this.spawnTimer) {
            this.spawnTimer.remove()
            this.spawnTimer = null
        }
    }    /**
     * 尝试生成道具（基于动态概率）
     */
    trySpawnPowerUp() {
        if (this.scene.isGameOver) return

        const currentChance = this.calculateSpawnChance()
        const activeBonus = this.calculateActivePowerUpBonus()
        const emergencyBonus = this.calculateEmergencyBonus()
        
        // 综合计算最终生成概率
        const finalChance = Math.min(0.95, currentChance + activeBonus + emergencyBonus)
        const shouldSpawn = Math.random() < finalChance
        
        if (shouldSpawn) {
            this.spawnRandomPowerUp()
        }
        
        // 高等级时增加额外生成机会
        if (this.scene.level >= 4 && Math.random() < 0.2) {
            this.scene.time.delayedCall(800, () => {
                if (Math.random() < finalChance * 0.6) {
                    this.spawnRandomPowerUp()
                    console.log('🌟 等级4+额外道具生成！')
                }
            })
        }
        
        // 更高等级时的第二次额外生成
        if (this.scene.level >= 7 && Math.random() < 0.15) {
            this.scene.time.delayedCall(1600, () => {
                if (Math.random() < finalChance * 0.4) {
                    this.spawnRandomPowerUp()
                    console.log('✨ 等级7+双重额外道具生成！')
                }
            })
        }
        
        // 极高等级时的紧急支援
        if (this.scene.level >= 10 && this.scene.lives <= 2 && Math.random() < 0.3) {
            this.scene.time.delayedCall(500, () => {
                this.spawnSpecificPowerUp('extraLife')
                console.log('🚨 极高等级紧急生命支援！')
            })
        }
    }
    
    /**
     * 计算基于当前活跃道具的生成加成
     */
    calculateActivePowerUpBonus() {
        const activePowerUpsCount = this.scene.powerUps.children.entries.length
        
        // 如果屏幕上道具太少，增加生成概率
        if (activePowerUpsCount === 0) {
            return 0.2  // 没有道具时增加20%概率
        } else if (activePowerUpsCount === 1) {
            return 0.1  // 只有1个道具时增加10%概率
        }
        
        return 0  // 已有足够道具时不加成
    }
    
    /**
     * 计算紧急情况下的生成加成
     */
    calculateEmergencyBonus() {
        let bonus = 0
        
        // 生命值紧急时增加生成概率
        if (this.scene.lives <= 1) {
            bonus += 0.25  // 最后一条命时+25%
        } else if (this.scene.lives <= 2) {
            bonus += 0.15  // 2条命时+15%
        }
        
        // 如果玩家没有活跃的防御道具，增加概率
        if (!this.scene.player.isShieldActive()) {
            bonus += 0.1   // 没有护盾时+10%
        }
        
        return bonus
    }

    /**
     * 生成随机道具
     */
    spawnRandomPowerUp() {
        const x = Phaser.Math.Between(50, this.scene.cameras.main.width - 50)
        const y = -50
        
        const type = this.selectPowerUpType()
        const value = this.getPowerUpValue(type)
          const powerUp = new PowerUp(this.scene, x, y, type, value)
        this.scene.powerUps.add(powerUp)
          // 发出道具生成事件供调试（使用Phaser的事件系统）
        this.scene.events.emit('powerUpSpawned', type, x, y, value, this.scene.level)
        
        console.log(`✨ 生成道具: ${type} 位置:(${x}, ${y}) 值:${value} 等级:${this.scene.level}`)
    }

    /**
     * 智能选择道具类型（基于当前游戏状态）
     */
    selectPowerUpType() {
        const weights = this.calculatePowerUpWeights()
        return this.weightedRandomSelect(weights)
    }    /**
     * 计算不同道具的权重（基于游戏状态和难度）
     */
    calculatePowerUpWeights() {
        const level = this.scene.level || 1
        const activePowerUpsCount = this.scene.powerUps.children.entries.length
        
        const weights = {
            'multiShot': 4,    // 提升基础权重
            'shield': 3,       // 提升基础权重
            'extraPoints': 2,  // 保持基础权重
            'extraLife': 2     // 提升基础权重
        }

        // 根据玩家生命值调整权重
        if (this.scene.lives <= 1) {
            weights.extraLife *= 5  // 生命值低时大幅提升生命道具
            weights.shield *= 4     // 大幅提升护盾道具
        } else if (this.scene.lives <= 2) {
            weights.extraLife *= 3
            weights.shield *= 2
        }

        // 根据等级调整权重（高等级更需要防御道具）
        if (level >= 3) {
            weights.shield *= 1.8
            weights.multiShot *= 1.5
            weights.extraLife *= 1.4
        }
        
        if (level >= 5) {
            weights.extraLife *= 2    // 高等级时生命道具更重要
            weights.shield *= 1.5
            weights.extraPoints *= 0.7  // 减少纯分数道具
        }
        
        // 超高等级时进一步调整
        if (level >= 8) {
            weights.extraLife *= 1.5
            weights.multiShot *= 1.3
            weights.extraPoints *= 0.5  // 进一步减少分数道具
        }

        // 根据玩家是否有护盾调整权重
        if (this.scene.player.isShieldActive()) {
            weights.shield *= 0.3   // 已有护盾时大幅减少权重
            weights.multiShot *= 2.5 // 大幅增加多重射击权重
            weights.extraLife *= 1.8 // 增加生命道具权重
        }

        // 根据玩家是否有多重射击调整权重
        if (this.scene.player.isMultiShotActive()) {
            weights.multiShot *= 0.2 // 已有多重射击时大幅减少权重
            weights.shield *= 2.2    // 大幅增加护盾权重
            weights.extraLife *= 1.5
        }
        
        // 如果屏幕上已有很多道具，调整权重偏向实用道具
        if (activePowerUpsCount >= 2) {
            weights.extraLife *= 1.5
            weights.shield *= 1.3
            weights.extraPoints *= 0.5
        }

        return weights
    }

    /**
     * 基于权重的随机选择
     */
    weightedRandomSelect(weights) {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
        let random = Math.random() * totalWeight
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight
            if (random <= 0) {
                return type
            }
        }
        
        // fallback
        return this.powerUpTypes[0]
    }    /**
     * 获取道具值（根据等级动态调整）
     */
    getPowerUpValue(type) {
        const level = this.scene.level || 1
        const durationBonus = Math.min(
            POWERUP_CONFIG.MAX_DURATION_BONUS, 
            (level - 1) * POWERUP_CONFIG.LEVEL_DURATION_BONUS
        )
        
        switch (type) {
            case 'multiShot':
                return POWERUP_CONFIG.MULTI_SHOT_DURATION + durationBonus
            case 'shield':
                return POWERUP_CONFIG.SHIELD_DURATION + durationBonus
            case 'extraPoints':
                // 高等级时分数奖励更多
                const pointsBonus = Math.max(0, (level - 1) * POWERUP_CONFIG.HIGH_LEVEL_POINTS_BONUS)
                return POWERUP_CONFIG.EXTRA_POINTS_VALUE + pointsBonus
            case 'extraLife':
                return POWERUP_CONFIG.EXTRA_LIFE_VALUE
            default:
                return 0
        }
    }

    /**
     * 强制生成特定道具
     */
    spawnSpecificPowerUp(type, x = null, y = null) {
        const spawnX = x || Phaser.Math.Between(50, this.scene.cameras.main.width - 50)
        const spawnY = y || -50
        const value = this.getPowerUpValue(type)
        
        const powerUp = new PowerUp(this.scene, spawnX, spawnY, type, value)
        this.scene.powerUps.add(powerUp)
        
        console.log(`🎁 强制生成道具: ${type} 位置:(${spawnX}, ${spawnY})`)
    }

    /**
     * 在Boss战时生成特殊道具
     */
    spawnBossReward() {
        // Boss战胜利后生成多个道具
        const rewardTypes = ['extraLife', 'multiShot', 'shield', 'extraPoints']
        
        rewardTypes.forEach((type, index) => {
            const x = (this.scene.cameras.main.width / 5) * (index + 1)
            const y = -50 - (index * 20) // 错开生成时间
            
            this.scene.time.delayedCall(index * 200, () => {
                this.spawnSpecificPowerUp(type, x, y)
            })
        })
        
        console.log('🏆 Boss奖励道具生成！')
    }    /**
     * 根据等级调整道具生成频率
     */
    adjustSpawnRate() {
        console.log(`📈 调整道具生成频率 - 当前等级: ${this.scene.level}`)
        this.updateSpawnParameters()
        
        // 高等级时增加道具持续时间奖励
        if (this.scene.level >= 3) {
            this.enhancePowerUpDuration()
        }
    }
    
    /**
     * 增强道具持续时间（高等级奖励）
     */
    enhancePowerUpDuration() {
        // 这个方法将在道具激活时被调用，增加持续时间
        console.log('⭐ 高等级道具效果增强！')
    }

    /**
     * 清理生成器
     */
    destroy() {
        this.stopSpawning()
    }
}
