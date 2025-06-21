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
     * 创建emoji图标纹理
     */
    createColorGraphics() {
        // 玩家 - 飞机emoji
        this.createEmojiTexture('🚁', 'player', 30, 30)
        
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
    }

    /**
     * 失去生命
     */
    loseLife() {
        this.lives--
        this.uiManager.updateLives(this.lives)
        
        if (this.lives <= 0) {
            this.gameOver()
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
}
