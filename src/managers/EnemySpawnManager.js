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
        
        // 随机生成系统参数
        this.lastSpawnTime = 0
        this.nextSpawnTime = 0
        this.isActive = true
        
        this.startRandomSpawning()
    }

    /**
     * 开始随机生成敌人系统
     */
    startRandomSpawning() {
        this.isActive = true
        this.scheduleNextSpawn()
        
        // 使用update循环而不是固定定时器
        this.spawnTimer = this.scene.time.addEvent({
            delay: 100, // 每100ms检查一次
            callback: this.checkSpawnTiming,
            callbackScope: this,
            loop: true
        })
    }

    /**
     * 检查是否到了生成时机
     */
    checkSpawnTiming() {
        if (!this.isActive || this.scene.isGameOver) return
        
        const currentTime = this.scene.time.now
        
        if (currentTime >= this.nextSpawnTime) {
            this.performRandomSpawn()
            this.scheduleNextSpawn()
        }
    }

    /**
     * 执行随机生成
     */
    performRandomSpawn() {
        // 随机决定生成数量 (1-3个，权重偏向单个)
        const spawnWeights = [70, 25, 5] // 70%单个, 25%两个, 5%三个
        const rand = Math.random() * 100
        let spawnCount = 1
        
        if (rand > spawnWeights[0]) {
            spawnCount = rand > spawnWeights[0] + spawnWeights[1] ? 3 : 2
        }
        
        // 高等级时增加多敌人概率
        if (this.scene.level >= 5) {
            const extraChance = Math.min((this.scene.level - 5) * 5, 20) // 最多+20%
            if (Math.random() * 100 < extraChance) {
                spawnCount = Math.min(spawnCount + 1, 4)
            }
        }
        
        // 生成敌人，添加随机间隔避免同时出现
        for (let i = 0; i < spawnCount; i++) {
            const delay = i * Phaser.Math.Between(100, 500) // 随机间隔100-500ms
            this.scene.time.delayedCall(delay, () => {
                if (!this.scene.isGameOver) {
                    this.spawnSingleEnemy()
                }
            })
        }
        
        console.log(`🎲 随机生成 ${spawnCount} 个敌人`)
    }

    /**
     * 计划下次生成时间
     */
    scheduleNextSpawn() {
        const baseDelay = this.calculateBaseSpawnDelay()
        
        // 添加随机变化 (±30%的随机变化)
        const randomFactor = 0.7 + Math.random() * 0.6 // 0.7 到 1.3
        const randomDelay = Math.floor(baseDelay * randomFactor)
        
        // 偶尔添加额外的随机延迟或提前
        const extraRandomChance = 15 // 15%概率
        if (Math.random() * 100 < extraRandomChance) {
            const extraFactor = Math.random() < 0.5 ? 0.5 : 1.8 // 要么很快，要么很慢
            this.nextSpawnTime = this.scene.time.now + Math.floor(randomDelay * extraFactor)
        } else {
            this.nextSpawnTime = this.scene.time.now + randomDelay
        }
        
        console.log(`⏰ 下次生成时间: ${Math.floor((this.nextSpawnTime - this.scene.time.now) / 1000)}秒后`)
    }

    /**
     * 计算基础生成延迟
     */
    calculateBaseSpawnDelay() {
        return Math.max(
            ENEMY_CONFIG.MIN_SPAWN_DELAY,
            ENEMY_CONFIG.BASE_SPAWN_DELAY - (this.scene.level - 1) * ENEMY_CONFIG.SPAWN_DELAY_DECREASE
        )
    }    /**
     * 停止生成敌人
     */
    stopSpawning() {
        this.isActive = false
        if (this.spawnTimer) {
            this.spawnTimer.remove()
            this.spawnTimer = null
        }
    }

    /**
     * 生成单个敌人（带随机位置变化）
     */
    spawnSingleEnemy() {
        // 更多样化的生成位置
        const screenWidth = this.scene.cameras.main.width
        const spawnMargin = 50
        
        // 偶尔从侧边生成敌人 (10%概率)
        let x, y
        if (Math.random() < 0.1) {
            // 侧边生成
            if (Math.random() < 0.5) {
                x = -30 // 左侧
                y = Phaser.Math.Between(50, 200)
            } else {
                x = screenWidth + 30 // 右侧  
                y = Phaser.Math.Between(50, 200)
            }
        } else {
            // 顶部生成（添加更多随机性）
            x = Phaser.Math.Between(spawnMargin, screenWidth - spawnMargin)
            y = Phaser.Math.Between(-80, -20) // 更大的Y轴变化范围
        }
        
        const enemySpeed = this.calculateEnemySpeed()
        const enemyHp = this.calculateEnemyHp()
        const enemy = new Enemy(this.scene, x, y, enemySpeed, enemyHp)
        
        // 为侧边生成的敌人添加特殊移动模式
        if (x < 0 || x > screenWidth) {
            enemy.isFromSide = true
            enemy.sideSpawnTargetX = Phaser.Math.Between(spawnMargin, screenWidth - spawnMargin)
        }
        
        this.scene.enemies.add(enemy)
        if (enemyHp > 1) {
            this.addHealthBar(enemy)
        }
        
        console.log(`👾 生成敌人 位置:(${Math.floor(x)}, ${Math.floor(y)}) 速度:${enemySpeed} 血量:${enemyHp}`)
    }    /**
     * 根据等级计算敌人速度（添加随机变化）
     */
    calculateEnemySpeed() {
        const baseSpeed = ENEMY_CONFIG.BASE_SPEED + 40 + (this.scene.level - 1) * 10
        
        // 添加±20%的随机变化
        const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 到 1.2
        return Math.floor(baseSpeed * randomFactor)
    }

    /**
     * 根据等级计算敌人血量（添加随机变化）
     */
    calculateEnemyHp() {
        const baseHp = ENEMY_CONFIG.BASE_HP + 1 + Math.floor((this.scene.level - 1) * 0.5)
        
        // 偶尔生成精英敌人（更高血量）
        const eliteChance = Math.min(5 + this.scene.level * 2, 25) // 最多25%概率
        if (Math.random() * 100 < eliteChance) {
            return baseHp + Phaser.Math.Between(1, 3) // 精英敌人+1到3血
        }
        
        // 普通敌人有小幅随机血量变化
        const randomBonus = Math.random() < 0.3 ? 1 : 0 // 30%概率+1血
        return baseHp + randomBonus
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
    }    /**
     * 更新生成难度（适应随机生成系统）
     */
    updateSpawnRate() {
        // 随机系统会自动根据calculateBaseSpawnDelay调整难度
        // 这里可以添加其他难度调整逻辑
        
        // 高等级时偶尔触发"危险时刻"- 短时间内更频繁生成
        if (this.scene.level >= 7 && Math.random() < 0.1) { // 10%概率
            console.log('⚠️ 危险时刻！敌人生成频率暂时提升')
            const dangerDuration = 5000 // 5秒危险期
            const originalActive = this.isActive
            
            // 临时提升生成频率
            this.nextSpawnTime = this.scene.time.now + 500 // 很快生成下一个
            
            // 5秒后恢复正常
            this.scene.time.delayedCall(dangerDuration, () => {
                if (originalActive && this.isActive) {
                    this.scheduleNextSpawn() // 重新调度正常时间
                }
            })
        }
        
        console.log(`⚡ 等级 ${this.scene.level} - 随机生成系统已更新`)
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
