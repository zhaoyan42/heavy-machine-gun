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
    }

    /**
     * 开始生成道具
     */
    startSpawning() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: POWERUP_CONFIG.SPAWN_DELAY,
            callback: this.trySpawnPowerUp,
            callbackScope: this,
            loop: true
        })
    }

    /**
     * 停止生成道具
     */
    stopSpawning() {
        if (this.spawnTimer) {
            this.spawnTimer.remove()
            this.spawnTimer = null
        }
    }

    /**
     * 尝试生成道具（基于概率）
     */
    trySpawnPowerUp() {
        if (this.scene.isGameOver) return

        if (Math.random() < POWERUP_CONFIG.SPAWN_CHANCE) {
            this.spawnRandomPowerUp()
        }
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
        
        console.log(`✨ 生成道具: ${type} 位置:(${x}, ${y})`)
    }

    /**
     * 智能选择道具类型（基于当前游戏状态）
     */
    selectPowerUpType() {
        const weights = this.calculatePowerUpWeights()
        return this.weightedRandomSelect(weights)
    }

    /**
     * 计算不同道具的权重（基于游戏状态）
     */
    calculatePowerUpWeights() {
        const weights = {
            'multiShot': 3,    // 基础权重
            'shield': 2,       // 基础权重
            'extraPoints': 2,  // 基础权重
            'extraLife': 1     // 基础权重
        }

        // 根据玩家生命值调整权重
        if (this.scene.lives <= 1) {
            weights.extraLife *= 3  // 生命值低时更容易生成生命道具
            weights.shield *= 2     // 更容易生成护盾
        }

        // 根据玩家是否有护盾调整权重
        if (this.scene.player.isShieldActive()) {
            weights.shield *= 0.2   // 已有护盾时减少护盾道具权重
            weights.multiShot *= 1.5 // 增加多重射击权重
        }

        // 根据玩家是否有多重射击调整权重
        if (this.scene.player.isMultiShotActive()) {
            weights.multiShot *= 0.3 // 已有多重射击时减少权重
        }

        // 根据等级调整权重
        if (this.scene.level >= 5) {
            weights.extraLife *= 1.5 // 高等级时更容易生成生命道具
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
    }

    /**
     * 获取道具值
     */
    getPowerUpValue(type) {
        switch (type) {
            case 'multiShot':
                return POWERUP_CONFIG.MULTI_SHOT_DURATION
            case 'shield':
                return POWERUP_CONFIG.SHIELD_DURATION
            case 'extraPoints':
                return POWERUP_CONFIG.EXTRA_POINTS_VALUE
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
    }

    /**
     * 根据等级调整道具生成频率
     */
    adjustSpawnRate() {
        // 高等级时稍微增加道具生成频率
        const newDelay = Math.max(
            10000, // 最小间隔10秒
            POWERUP_CONFIG.SPAWN_DELAY - (this.scene.level - 1) * 1000
        )

        if (this.spawnTimer) {
            this.spawnTimer.remove()
            this.spawnTimer = this.scene.time.addEvent({
                delay: newDelay,
                callback: this.trySpawnPowerUp,
                callbackScope: this,
                loop: true
            })
        }
    }

    /**
     * 清理生成器
     */
    destroy() {
        this.stopSpawning()
    }
}
