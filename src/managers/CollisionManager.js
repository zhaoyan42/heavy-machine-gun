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
    }

    /**
     * 检查玩家与敌人的碰撞
     */
    checkPlayerEnemyCollisions() {
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
        this.scene.player.activatePowerUp(powerUp.type, powerUp.value)
        
        // 显示道具提示
        this.scene.uiManager.showPowerUpNotification(powerUp.type, 2000)
        
        // 创建收集效果
        this.scene.createCollectEffect(powerUp.x, powerUp.y)
        powerUp.destroy()
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
