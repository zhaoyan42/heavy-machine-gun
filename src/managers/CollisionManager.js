/**
 * 碰撞检测管理器
 * 负责处理游戏中所有的碰撞检测逻辑
 */

export default class CollisionManager {
    constructor(scene) {
        this.scene = scene
    }

    /**
     * 检查所有碰撞
     */
    checkAllCollisions() {
        this.checkBulletEnemyCollisions()
        this.checkPlayerEnemyCollisions()
        this.checkPlayerPowerUpCollisions()
    }

    /**
     * 检查子弹与敌人的碰撞
     */
    checkBulletEnemyCollisions() {
        this.scene.bullets.children.entries.forEach(bullet => {
            this.scene.enemies.children.entries.forEach(enemy => {
                const distance = this.getDistance(bullet, enemy)
                
                if (distance < 30) {
                    this.handleBulletEnemyHit(bullet, enemy)
                }
            })
        })
    }    /**
     * 检查玩家与敌人的碰撞
     */
    checkPlayerEnemyCollisions() {
        // 如果玩家正在重生或处于无敌状态，跳过碰撞检测
        if (this.scene.player.isRespawning || this.scene.player.isInvincible) {
            return
        }
        
        this.scene.enemies.children.entries.forEach(enemy => {
            const distance = this.getDistance(this.scene.player, enemy)
            
            if (distance < 40) {
                this.handlePlayerEnemyCollision(enemy)
            }
        })
    }

    /**
     * 检查玩家与道具的碰撞
     */
    checkPlayerPowerUpCollisions() {
        this.scene.powerUps.children.entries.forEach(powerUp => {
            const distance = this.getDistance(this.scene.player, powerUp)
            
            if (distance < 35) {
                this.handlePlayerPowerUpCollision(powerUp)
            }
        })
    }

    /**
     * 处理子弹击中敌人
     */
    handleBulletEnemyHit(bullet, enemy) {
        bullet.destroy()
        
        // 敌人受到伤害
        enemy.currentHp--
        console.log(`💥 子弹击中敌人！剩余血量: ${enemy.currentHp}/${enemy.maxHp}`)
        
        // 创建击中效果
        this.scene.createHitEffect(enemy.x, enemy.y)
        
        // 受伤闪烁效果
        enemy.setTint(0xffffff)
        this.scene.time.delayedCall(100, () => {
            if (enemy && enemy.active) {
                enemy.clearTint()
            }
        })
        
        // 检查敌人是否死亡
        if (enemy.currentHp <= 0) {
            this.destroyEnemy(enemy)
        }
    }

    /**
     * 处理玩家与敌人碰撞
     */
    handlePlayerEnemyCollision(enemy) {
        // 检查护盾状态
        if (this.scene.player.isShieldActive()) {
            this.handleShieldCollision(enemy)
        } else {
            this.handlePlayerDamage(enemy)
        }
    }

    /**
     * 处理护盾碰撞
     */
    handleShieldCollision(enemy) {
        this.destroyEnemy(enemy)
        this.scene.addScore(enemy.scoreValue || 10)
        console.log('🛡️ 护盾抵挡攻击！')
        
        // 护盾闪光效果
        this.scene.player.setTint(0xffffff)
        this.scene.time.delayedCall(100, () => {
            if (this.scene.player && this.scene.player.isShieldActive()) {
                this.scene.player.setTint(0x00ffff)
            }
        })
    }

    /**
     * 处理玩家受伤
     */
    handlePlayerDamage(enemy) {
        this.destroyEnemy(enemy)
        this.scene.loseLife()
        console.log('💀 玩家碰到敌人！')
        
        // 添加无敌时间
        this.scene.player.setTint(0xff0000)
        this.scene.time.delayedCall(500, () => {
            if (this.scene.player) {
                this.scene.player.clearTint()
            }
        })
    }    /**
     * 处理玩家收集道具
     */
    handlePlayerPowerUpCollision(powerUp) {
        console.log(`✨ 收集道具: ${powerUp.type}`)
        
        // 根据道具类型进行特殊处理
        let extraPoints = 0
        let effectText = ''
        let effectIcon = ''
        
        switch (powerUp.type) {
            case 'extraPoints':
                extraPoints = powerUp.value || 50
                this.scene.addScore(extraPoints)
                effectText = `+${extraPoints}分`
                effectIcon = '💎'
                break
                
            case 'extraLife':
                this.scene.lives = Math.min(this.scene.lives + 1, 5) // 最多5条命
                this.scene.uiManager.updateLives(this.scene.lives)
                console.log(`❤️ 获得额外生命！当前生命: ${this.scene.lives}`)
                effectText = '+1生命'
                effectIcon = '❤️'
                break
                  case 'bomb':
                // 清除所有敌人
                let bombScore = 0
                this.scene.enemies.children.entries.forEach(enemy => {
                    bombScore += enemy.scoreValue || 10
                    this.scene.addScore(enemy.scoreValue || 10)
                    this.scene.createDeathEffect(enemy.x, enemy.y)
                    this.destroyEnemy(enemy)
                })
                console.log('💣 炸弹激活！清除所有敌人')
                effectText = bombScore > 0 ? `炸弹清屏 +${bombScore}分` : '炸弹激活'
                effectIcon = '💣'
                extraPoints = bombScore
                break
                
            default:
                // 其他道具由Player处理，包含无法增强时转分数的逻辑
                const result = this.scene.player.activatePowerUp(powerUp.type, powerUp.value)
                
                if (result && result.type === 'points') {
                    // 道具无法增强，转为分数奖励
                    extraPoints = result.value
                    this.scene.addScore(extraPoints)
                    effectText = `${result.reason || '已达上限'} +${extraPoints}分`
                    effectIcon = this.getPowerUpIcon(powerUp.type)
                } else if (result && result.type === 'heal') {
                    // 处理生命恢复
                    this.scene.lives = Math.min(this.scene.lives + 1, 5)
                    this.scene.uiManager.updateLives(this.scene.lives)
                    effectText = '+1生命'
                    effectIcon = '❤️'
                } else if (result && result.type === 'bomb') {
                    // 处理炸弹效果（重复处理，但保持一致性）
                    let bombScore = 0
                    this.scene.enemies.children.entries.forEach(enemy => {
                        bombScore += enemy.scoreValue || 10
                        this.scene.addScore(enemy.scoreValue || 10)
                        this.scene.createDeathEffect(enemy.x, enemy.y)
                        this.destroyEnemy(enemy)
                    })
                    effectText = bombScore > 0 ? `炸弹清屏 +${bombScore}分` : '炸弹激活'
                    effectIcon = '💣'
                    extraPoints = bombScore
                } else if (result && result.enhanced) {
                    // 道具成功增强
                    effectText = this.getEnhancementText(powerUp.type, result)
                    effectIcon = this.getPowerUpIcon(powerUp.type)
                } else {
                    // 默认情况
                    effectText = this.getDefaultEffectText(powerUp.type)
                    effectIcon = this.getPowerUpIcon(powerUp.type)
                }
                break
        }
        
        // 创建增强的收集效果，显示实际效果
        this.scene.createEnhancedCollectEffect(powerUp.x, powerUp.y, effectText, effectIcon)
        powerUp.destroy()
    }
    
    /**
     * 获取道具图标
     */
    getPowerUpIcon(type) {
        const icons = {
            'speed': '⚡',
            'firerate': '🔥',
            'multiShot': '🎯',
            'multishot': '🎯',
            'shield': '🛡️',
            'permanentFireRate': '🚀',
            'permanentSpeed': '💨',
            'bomb': '💣',
            'extraLife': '❤️',
            'extraPoints': '💎'
        }
        return icons[type] || '⭐'
    }
    
    /**
     * 获取增强效果文本
     */
    getEnhancementText(type, result) {
        switch (type) {
            case 'speed':
                return `速度+${result.actualValue}`
            case 'firerate':
                return `射速+${result.actualValue}ms`
            case 'multiShot':
            case 'multishot':
                return result.extensionTime ? `多重射击+${result.extensionTime/1000}秒` : '多重射击激活'
            case 'shield':
                return result.extensionTime ? `护盾+${result.extensionTime/1000}秒` : '护盾激活'
            case 'permanentFireRate':
                return `永久射速+${result.actualValue}ms`
            case 'permanentSpeed':
                return `永久速度+${result.actualValue}`
            default:
                return this.getDefaultEffectText(type)
        }
    }
    
    /**
     * 获取默认效果文本
     */
    getDefaultEffectText(type) {
        const texts = {
            'speed': '速度提升',
            'firerate': '射速提升',
            'multiShot': '多重射击',
            'multishot': '多重射击',
            'shield': '护盾激活',
            'permanentFireRate': '永久射速',
            'permanentSpeed': '永久速度',
            'bomb': '炸弹',
            'extraLife': '额外生命',
            'extraPoints': '额外分数'
        }
        return texts[type] || '道具效果'
    }
      /**
     * 销毁敌人及其相关资源
     */
    destroyEnemy(enemy) {
        // 停止敌人的动画
        if (enemy.moveTween) {
            enemy.moveTween.stop()
            enemy.moveTween = null
        }
        if (enemy.rotateTween) {
            enemy.rotateTween.stop()
            enemy.rotateTween = null
        }
        
        // 销毁血量条
        if (enemy.hpBarBg) {
            enemy.hpBarBg.destroy()
        }
        if (enemy.hpBar) {
            enemy.hpBar.destroy()
        }
        
        // 创建死亡效果
        this.scene.createDeathEffect(enemy.x, enemy.y)
        
        // 销毁敌人
        enemy.destroy()
        
        // 增加击败计数和分数
        this.scene.enemiesKilled++
        this.scene.addScore(enemy.scoreValue || 10)
    }

    /**
     * 计算两个对象之间的距离
     */
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x
        const dy = obj1.y - obj2.y
        return Math.sqrt(dx * dx + dy * dy)
    }
}
