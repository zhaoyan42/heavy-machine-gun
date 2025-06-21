/**
 * 敌人生成管理器
 * 负责管理敌人的生成逻辑和生成模式
 */

import Enemy from '../entities/Enemy.js'
import { ENEMY_CONFIG } from '../config/GameConfig.js'

export default class EnemySpawnManager {
    constructor(scene) {
        this.scene = scene
        this.spawnTimer = null
        this.currentSpawnDelay = ENEMY_CONFIG.BASE_SPAWN_DELAY
        
        this.startSpawning()
    }

    /**
     * 开始生成敌人
     */
    startSpawning() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.currentSpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })
    }

    /**
     * 停止生成敌人
     */
    stopSpawning() {
        if (this.spawnTimer) {
            this.spawnTimer.remove()
            this.spawnTimer = null
        }
    }

    /**
     * 生成单个敌人
     */
    spawnEnemy() {
        if (this.scene.isGameOver) return

        const x = Phaser.Math.Between(50, this.scene.cameras.main.width - 50)
        const y = -50

        // 根据等级调整敌人属性
        const enemySpeed = this.calculateEnemySpeed()
        const enemyHp = this.calculateEnemyHp()
        
        const enemy = new Enemy(this.scene, x, y, enemySpeed, enemyHp)
        this.scene.enemies.add(enemy)

        // 添加血量条（如果血量大于1）
        if (enemyHp > 1) {
            this.addHealthBar(enemy)
        }

        console.log(`👾 生成敌人 位置:(${x}, ${y}) 速度:${enemySpeed} 血量:${enemyHp}`)
    }

    /**
     * 根据等级计算敌人速度
     */
    calculateEnemySpeed() {
        return ENEMY_CONFIG.BASE_SPEED + (this.scene.level - 1) * ENEMY_CONFIG.SPEED_INCREASE
    }

    /**
     * 根据等级计算敌人血量
     */
    calculateEnemyHp() {
        const hpLevel = Math.floor((this.scene.level - 1) / ENEMY_CONFIG.HP_INCREASE_LEVEL)
        return ENEMY_CONFIG.BASE_HP + hpLevel
    }

    /**
     * 为敌人添加血量条
     */
    addHealthBar(enemy) {
        const barWidth = 40
        const barHeight = 4
        
        // 血量条背景
        enemy.hpBarBg = this.scene.add.rectangle(
            enemy.x, 
            enemy.y - 30, 
            barWidth, 
            barHeight, 
            0x666666
        )
        
        // 血量条前景
        enemy.hpBar = this.scene.add.rectangle(
            enemy.x, 
            enemy.y - 30, 
            barWidth, 
            barHeight, 
            0xff0000
        )
        
        enemy.hasHealthBar = true
    }

    /**
     * 更新敌人血量条
     */
    updateEnemyHealthBar(enemy) {
        if (!enemy.hasHealthBar || !enemy.hpBar || !enemy.hpBarBg) return

        // 更新血量条位置
        enemy.hpBarBg.x = enemy.x
        enemy.hpBarBg.y = enemy.y - 30
        enemy.hpBar.x = enemy.x
        enemy.hpBar.y = enemy.y - 30

        // 更新血量条宽度
        const healthPercentage = enemy.currentHp / enemy.maxHp
        const barWidth = 40 * healthPercentage
        enemy.hpBar.scaleX = healthPercentage

        // 根据血量调整颜色
        if (healthPercentage > 0.6) {
            enemy.hpBar.fillColor = 0x00ff00 // 绿色
        } else if (healthPercentage > 0.3) {
            enemy.hpBar.fillColor = 0xffff00 // 黄色
        } else {
            enemy.hpBar.fillColor = 0xff0000 // 红色
        }
    }

    /**
     * 更新生成间隔（根据等级调整难度）
     */
    updateSpawnRate() {
        const newDelay = Math.max(
            ENEMY_CONFIG.MIN_SPAWN_DELAY,
            ENEMY_CONFIG.BASE_SPAWN_DELAY - (this.scene.level - 1) * ENEMY_CONFIG.SPAWN_DELAY_DECREASE
        )

        if (newDelay !== this.currentSpawnDelay) {
            this.currentSpawnDelay = newDelay
            
            // 重新设置定时器
            if (this.spawnTimer) {
                this.spawnTimer.remove()
                this.startSpawning()
            }
            
            console.log(`⚡ 更新敌人生成间隔: ${this.currentSpawnDelay}ms`)
        }
    }

    /**
     * 生成特殊敌人（Boss等）
     */
    spawnBoss() {
        const x = this.scene.cameras.main.width / 2
        const y = -100

        const bossHp = 10 + this.scene.level * 2
        const bossSpeed = this.calculateEnemySpeed() * 0.5 // Boss移动较慢
        
        const boss = new Enemy(this.scene, x, y, bossSpeed, bossHp)
        boss.setScale(2) // Boss更大
        boss.scoreValue = 100 // Boss更高分数
        boss.isBoss = true
        
        this.scene.enemies.add(boss)
        this.addHealthBar(boss)
        
        console.log(`👑 生成Boss！血量: ${bossHp}`)
    }

    /**
     * 清理生成器
     */
    destroy() {
        this.stopSpawning()
    }
}
