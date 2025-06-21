/**
 * 主游戏场景
 * 重构后的版本，使用管理器模式分离关注点
 */

import Phaser from 'phaser'
import Player from '../entities/Player.js'
import Bullet from '../entities/Bullet.js'
import { GAME_CONFIG, PLAYER_CONFIG, SCORING_CONFIG } from '../config/GameConfig.js'
import UIManager from '../managers/UIManager.js'
import CollisionManager from '../managers/CollisionManager.js'
import EnemySpawnManager from '../managers/EnemySpawnManager.js'
import PowerUpSpawnManager from '../managers/PowerUpSpawnManager.js'
import EffectsManager from '../managers/EffectsManager.js'
import GameUtils from '../utils/GameUtils.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
        
        // 游戏状态
        this.score = 0
        this.lives = PLAYER_CONFIG.INITIAL_LIVES
        this.level = 1
        this.enemiesKilled = 0
        this.isGameOver = false
        
        // 游戏对象组
        this.player = null
        this.bullets = null
        this.enemies = null
        this.powerUps = null
        
        // 管理器
        this.uiManager = null
        this.collisionManager = null
        this.enemySpawnManager = null
        this.powerUpSpawnManager = null
        this.effectsManager = null
        
        // 输入控制
        this.cursors = null
        this.pointer = null
        
        // 调试
        this.debugFrameCount = 0
    }
    
    preload() {
        console.log('🎮 加载游戏资源...')
        this.createColorGraphics()
    }
    
    create() {
        console.log('🎮 创建游戏场景...')
        
        // 重置游戏状态
        this.resetGameState()
        
        // 创建游戏对象组
        this.createGameObjects()
        
        // 初始化管理器
        this.initializeManagers()
        
        // 设置输入
        this.setupInput()
        
        // 启动游戏循环
        this.startGameLoop()
        
        console.log('✅ 游戏场景创建完成')
          // 暴露到全局作为调试接口
        window.gameScene = this
        window.gameDebugLogs = window.gameDebugLogs || []
        
        // 监控道具生成（使用Phaser的事件系统）
        this.events.on('powerUpSpawned', (type, x, y, value, level) => {
            const logMessage = `✨ 生成道具: ${type} 位置:(${x}, ${y}) 值:${value} 等级:${level}`
            console.log(logMessage)
            window.gameDebugLogs.push(logMessage)
        })
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.score = 0
        this.lives = PLAYER_CONFIG.INITIAL_LIVES
        this.level = 1
        this.enemiesKilled = 0
        this.isGameOver = false
    }

    /**
     * 创建游戏对象组
     */
    createGameObjects() {
        // 创建玩家
        this.player = new Player(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT - 100
        )
        
        // 创建对象组
        this.bullets = this.add.group()
        this.enemies = this.add.group()
        this.powerUps = this.add.group()
    }

    /**
     * 初始化所有管理器
     */
    initializeManagers() {
        this.uiManager = new UIManager(this)
        this.collisionManager = new CollisionManager(this)
        this.enemySpawnManager = new EnemySpawnManager(this)
        this.powerUpSpawnManager = new PowerUpSpawnManager(this)
        this.effectsManager = new EffectsManager(this)
    }    /**
     * 设置输入控制
     */
    setupInput() {
        // 键盘输入
        this.cursors = this.input.keyboard.createCursorKeys()
        
        // 触屏/鼠标点击输入（保持兼容移动设备）
        this.input.on('pointerdown', this.handlePointerInput, this)
        
        // 鼠标移动输入（桌面设备体验优化）
        this.input.on('pointermove', this.handlePointerMove, this)
        
        // 禁用右键菜单
        this.input.mouse.disableContextMenu()
    }    /**
     * 启动游戏循环
     */
    startGameLoop() {
        // 注释：玩家射击现在由Player.js的handleShooting()方法处理
        // 移除了重复的定时器射击逻辑，避免双重射击问题
    }    /**
     * 创建游戏图标纹理
     */
    createColorGraphics() {
        // 玩家 - 自定义绘制的飞机
        this.createPlayerTexture()
        
        // 敌人 - 外星人emoji  
        this.createEmojiTexture('👾', 'enemy', 25, 25)
        
        // 子弹 - 闪电emoji
        this.createEmojiTexture('⚡', 'bullet', 12, 12)

        // 道具纹理
        this.createPowerUpTextures()
    }

    /**
     * 创建emoji纹理的通用方法
     */
    createEmojiTexture(emoji, key, width, height) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        // 设置字体大小（根据尺寸调整）
        const fontSize = Math.min(width, height) * 0.8
        ctx.font = `${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // 绘制emoji
        ctx.fillText(emoji, width / 2, height / 2)
        
        // 将canvas转换为Phaser纹理
        this.textures.addCanvas(key, canvas)
    }    /**
     * 创建道具emoji纹理
     */
    createPowerUpTextures() {
        // 多重射击道具 - 枪emoji
        this.createEmojiTexture('🔫', 'powerup-multiShot', 30, 30)

        // 护盾道具 - 盾牌emoji
        this.createEmojiTexture('🛡️', 'powerup-shield', 30, 30)

        // 加分道具 - 钻石emoji
        this.createEmojiTexture('💎', 'powerup-extraPoints', 30, 30)

        // 生命道具 - 红心emoji
        this.createEmojiTexture('❤️', 'powerup-extraLife', 30, 30)

        // 永久射速增强道具 - 火箭emoji
        this.createEmojiTexture('🚀', 'powerup-permanentFireRate', 30, 30)
        
        // 永久移动速度增强道具 - 风emoji
        this.createEmojiTexture('💨', 'powerup-permanentSpeed', 30, 30)
          
        // 炸弹道具 - 炸弹emoji
        this.createEmojiTexture('💣', 'powerup-bomb', 30, 30)
    }/**
     * 处理触屏/鼠标输入
     */
    handlePointerInput(pointer) {
        if (this.isGameOver) {
            this.restartGame()
            return
        }

        if (this.player) {
            this.player.moveTo(pointer.x, pointer.y)
        }
    }    /**
     * 处理鼠标移动输入（桌面设备优化）
     */
    handlePointerMove(pointer) {
        // 只在非游戏结束状态下响应鼠标移动
        if (this.isGameOver || !this.player) {
            return
        }

        // 响应鼠标移动，让玩家跟随鼠标位置
        this.player.moveTo(pointer.x, pointer.y)
    }    /**
     * 玩家射击（备用方法，当前由Player.js处理射击逻辑）
     */
    playerFire() {
        // 此方法已停用，射击逻辑已移至Player.js的handleShooting()
        // 保留此方法以防将来需要手动射击功能
        if (this.isGameOver || !this.player) return

        console.log('⚠️ playerFire被调用，但射击逻辑已在Player.js中处理')
    }

    /**
     * 发射子弹
     */
    fireBullet(x, y, angle = -Math.PI / 2) {
        const bullet = new Bullet(this, x, y, angle)
        this.bullets.add(bullet)
    }

    /**
     * 主更新循环
     */
    update() {
        if (this.isGameOver) return

        this.updateGameObjects()
        this.collisionManager.checkAllCollisions()
        this.cleanupOutOfBoundsObjects()
        this.updateManagers()
        this.updateDebugInfo()
    }    /**
     * 更新游戏对象
     */
    updateGameObjects() {
        // 更新玩家
        if (this.player) {
            this.player.update()
        }

        // 更新子弹
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < -50) {
                bullet.destroy()
            }
        })

        // 更新敌人血量条
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.hasHealthBar) {
                this.enemySpawnManager.updateEnemyHealthBar(enemy)
            }
        })

        // 更新道具
        this.powerUps.children.entries.forEach(powerUp => {
            if (powerUp.y > this.cameras.main.height + 50) {
                powerUp.destroy()
            }
        })
    }

    /**
     * 清理超出边界的对象
     */
    cleanupOutOfBoundsObjects() {
        const screenHeight = this.cameras.main.height

        // 清理敌人
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.y > screenHeight + 100) {
                if (enemy.hpBarBg) enemy.hpBarBg.destroy()
                if (enemy.hpBar) enemy.hpBar.destroy()
                enemy.destroy()
            }
        })
    }    /**
     * 更新管理器
     */
    updateManagers() {
        // 更新Player状态显示
        if (this.uiManager && this.player) {
            this.uiManager.updatePlayerStatus(this.player, this)
        }
    }    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        this.debugFrameCount++
        
        if (this.debugFrameCount % 60 === 0) { // 每秒更新一次
            const nextLevelEnemies = this.calculateRequiredEnemies(this.level + 1) - this.enemiesKilled
            const debugInfo = [
                `等级: ${this.level}`,
                `击败敌人: ${this.enemiesKilled}`,
                `升级还需: ${nextLevelEnemies}个敌人`
            ]
            this.uiManager.updateDebugInfo(debugInfo)
        }
    }/**
     * 增加分数
     */
    addScore(points) {
        this.score += points
        this.uiManager.updateScore(this.score)
        
        // 记录击败敌人数量
        if (points === SCORING_CONFIG.ENEMY_KILL_POINTS) {
            this.enemiesKilled++
            this.checkLevelUp()
        }
    }

    /**
     * 检查是否应该升级（基于敌人击败数量）
     */
    checkLevelUp() {
        // 计算当前等级需要击败的敌人总数
        const requiredEnemiesForCurrentLevel = this.calculateRequiredEnemies(this.level)
        
        if (this.enemiesKilled >= requiredEnemiesForCurrentLevel) {
            this.levelUp(this.level + 1)
        }
    }

    /**
     * 计算指定等级需要击败的敌人总数
     */
    calculateRequiredEnemies(level) {
        let totalRequired = 0
        for (let i = 1; i < level; i++) {
            const baseEnemies = SCORING_CONFIG.ENEMIES_PER_LEVEL
            const additionalEnemies = (i - 1) * SCORING_CONFIG.LEVEL_DIFFICULTY_INCREASE
            totalRequired += baseEnemies + additionalEnemies
        }
        return totalRequired
    }    /**
     * 升级
     */
    levelUp(newLevel) {
        this.level = newLevel
        this.uiManager.updateLevel(this.level)
        this.effectsManager.createLevelUpEffect()
        
        // 调整难度
        this.enemySpawnManager.updateSpawnRate()
        this.powerUpSpawnManager.adjustSpawnRate()
        
        // 计算下一等级需要击败的敌人数
        const nextLevelEnemies = this.calculateRequiredEnemies(this.level + 1) - this.enemiesKilled
        
        console.log(`🎉 升级到等级 ${this.level}! 下一级还需击败 ${nextLevelEnemies} 个敌人`)
    }    /**
     * 失去生命
     */
    loseLife() {
        this.lives--
        this.uiManager.updateLives(this.lives)
        
        if (this.lives <= 0) {
            this.gameOver()
        } else {
            // 如果还有生命，进行死亡重生流程
            this.playerDeath()
        }
    }

    /**
     * 玩家死亡重生流程
     */
    playerDeath() {
        if (!this.player || this.player.isRespawning) return
        
        console.log('💀 玩家死亡，准备重生...')
        
        // 标记玩家正在重生过程中
        this.player.isRespawning = true
        
        // 重置所有增强效果
        this.resetPlayerEnhancements()
        
        // 播放死亡动画效果
        this.playDeathAnimation()
        
        // 隐藏玩家
        this.player.setVisible(false)
        this.player.setActive(false)
        
        // 3秒后重生
        this.time.delayedCall(3000, () => {
            this.respawnPlayer()
        })
    }    /**
     * 重置玩家所有增强效果
     */
    resetPlayerEnhancements() {
        if (!this.player) return
        
        console.log('🔄 重置所有玩家增强效果')
        
        // 使用Player类的重置方法
        this.player.resetAllEnhancements()
        
        console.log('✅ 玩家增强效果已重置')
    }

    /**
     * 播放死亡动画效果
     */
    playDeathAnimation() {
        if (!this.player) return
        
        // 创建爆炸效果
        this.createDeathEffect(this.player.x, this.player.y)
        
        // 屏幕震动效果
        this.cameras.main.shake(500, 0.05)
        
        // 创建死亡文字提示
        const deathText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            '💀 3秒后重生...', 
            {
                fontSize: '24px',
                fill: '#ff0000',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5)
        
        // 倒计时动画
        let countdown = 3
        const countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                countdown--
                if (countdown > 0) {
                    deathText.setText(`💀 ${countdown}秒后重生...`)
                } else {
                    deathText.setText('🌟 重生!')
                    this.time.delayedCall(500, () => {
                        deathText.destroy()
                    })
                }
            },
            repeat: 2
        })
        
        // 文字闪烁效果
        this.tweens.add({
            targets: deathText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: 5
        })
    }

    /**
     * 重生玩家
     */
    respawnPlayer() {
        if (!this.player) return
        
        console.log('🌟 玩家重生!')
        
        // 重置玩家位置到屏幕底部中央
        this.player.x = this.cameras.main.width / 2
        this.player.y = this.cameras.main.height - 100
        this.player.targetX = this.player.x
        
        // 显示玩家
        this.player.setVisible(true)
        this.player.setActive(true)
        this.player.isRespawning = false
        
        // 重生闪烁效果（短暂无敌时间）
        this.player.setAlpha(0.5)
        this.tweens.add({
            targets: this.player,
            alpha: 1,
            duration: 200,
            yoyo: true,
            repeat: 10,  // 2秒钟闪烁效果
            onComplete: () => {
                this.player.setAlpha(1)
            }
        })
        
        // 重生特效
        this.createRespawnEffect(this.player.x, this.player.y)
        
        // 2秒无敌时间
        this.player.isInvincible = true
        this.time.delayedCall(2000, () => {
            if (this.player) {
                this.player.isInvincible = false
                console.log('⚔️ 无敌时间结束')
            }
        })
    }

    /**
     * 创建重生特效
     */
    createRespawnEffect(x, y) {
        // 创建光环效果
        const ring = this.add.circle(x, y, 5, 0x00ffff, 0.8)
        
        this.tweens.add({
            targets: ring,
            radius: 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                ring.destroy()
            }
        })
        
        // 创建星光粒子效果
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const star = this.add.text(x, y, '⭐', {
                fontSize: '16px'
            }).setOrigin(0.5)
            
            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * 60,
                y: y + Math.sin(angle) * 60,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    star.destroy()
                }
            })
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.isGameOver = true
        console.log('💀 游戏结束！')
        
        // 停止生成器
        this.enemySpawnManager.stopSpawning()
        this.powerUpSpawnManager.stopSpawning()
        
        // 保存最高分
        GameUtils.saveHighScore(this.score)
        
        // 显示游戏结束界面
        this.uiManager.showGameOver(this.score)
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        console.log('🔄 重新开始游戏')
        this.scene.restart()
    }

    /**
     * 创建视觉效果的便捷方法
     */
    createHitEffect(x, y) {
        this.effectsManager.createHitEffect(x, y)
    }

    createDeathEffect(x, y) {
        this.effectsManager.createDeathEffect(x, y)
    }

    createCollectEffect(x, y) {
        this.effectsManager.createCollectEffect(x, y)
    }

    /**
     * 计算两个对象之间的距离
     */
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x
        const dy = obj1.y - obj2.y
        return Math.sqrt(dx * dx + dy * dy)
    }

    /**
     * 场景销毁时清理资源
     */
    destroy() {
        if (this.uiManager) this.uiManager.destroy()
        if (this.collisionManager) this.collisionManager.destroy()
        if (this.enemySpawnManager) this.enemySpawnManager.destroy()
        if (this.powerUpSpawnManager) this.powerUpSpawnManager.destroy()
        if (this.effectsManager) this.effectsManager.destroy()
        
        super.destroy()
    }

    /**
     * 创建玩家飞机纹理
     */
    createPlayerTexture() {
        const width = 30
        const height = 30
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        // 清除画布
        ctx.clearRect(0, 0, width, height)
        
        // 绘制飞机主体 - 蓝色
        ctx.fillStyle = '#4A90E2'
        ctx.beginPath()
        // 机身（中央垂直部分）
        ctx.fillRect(13, 8, 4, 16)
        
        // 绘制机翼 - 浅蓝色
        ctx.fillStyle = '#7BB3F0'
        // 上机翼
        ctx.fillRect(8, 12, 14, 3)
        // 下机翼（较小）
        ctx.fillRect(10, 18, 10, 2)
        
        // 绘制机头 - 深蓝色
        ctx.fillStyle = '#2E5C8A'
        ctx.beginPath()
        ctx.moveTo(15, 8)  // 机头顶点
        ctx.lineTo(12, 12) // 左侧
        ctx.lineTo(18, 12) // 右侧
        ctx.closePath()
        ctx.fill()
        
        // 绘制机尾 - 深蓝色
        ctx.fillStyle = '#2E5C8A'
        // 尾翼
        ctx.fillRect(11, 24, 8, 2)
        // 垂直尾翼
        ctx.fillRect(14, 22, 2, 4)
        
        // 绘制驾驶舱 - 白色高光
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(14, 10, 2, 3)
        
        // 绘制引擎喷射效果 - 橙红色
        ctx.fillStyle = '#FF6B35'
        ctx.fillRect(13, 26, 4, 2)
        ctx.fillStyle = '#FF8C69'
        ctx.fillRect(14, 28, 2, 1)
        
        // 添加边框效果
        ctx.strokeStyle = '#1F4788'
        ctx.lineWidth = 1
        ctx.strokeRect(13, 8, 4, 16) // 机身边框
        
        // 将canvas转换为Phaser纹理
        this.textures.addCanvas('player', canvas)
    }
}
