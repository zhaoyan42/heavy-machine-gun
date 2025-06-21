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
    }

    /**
     * 启动游戏循环
     */
    startGameLoop() {
        // 玩家自动射击
        this.time.addEvent({
            delay: PLAYER_CONFIG.FIRE_RATE,
            callback: this.playerFire,
            callbackScope: this,
            loop: true
        })
    }    /**
     * 创建简单图形作为临时资源
     */
    createColorGraphics() {
        // 玩家 - 蓝色三角形
        const playerGraphics = this.add.graphics()
            .fillStyle(0x0088ff)
            .fillTriangle(15, 0, 0, 30, 30, 30)
            .generateTexture('player', 30, 30)
        playerGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 敌人 - 红色矩形
        const enemyGraphics = this.add.graphics()
            .fillStyle(0xff4444)
            .fillRect(0, 0, 25, 25)
            .generateTexture('enemy', 25, 25)
        enemyGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 子弹 - 黄色圆形
        const bulletGraphics = this.add.graphics()
            .fillStyle(0xffff44)
            .fillCircle(3, 3, 3)
            .generateTexture('bullet', 6, 6)
        bulletGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 道具纹理
        this.createPowerUpTextures()
    }    /**
     * 创建道具纹理
     */
    createPowerUpTextures() {
        // 多重射击道具 - 橙色菱形
        const multiShotGraphics = this.add.graphics()
            .fillStyle(0xff8800)
            .fillRect(10, 10, 10, 10)
            .fillTriangle(15, 5, 25, 15, 15, 25)
            .fillTriangle(15, 25, 5, 15, 15, 5)
            .generateTexture('powerup-multiShot', 30, 30)
        multiShotGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 护盾道具 - 青色圆形
        const shieldGraphics = this.add.graphics()
            .fillStyle(0x00ffff)
            .fillCircle(15, 15, 15)
            .generateTexture('powerup-shield', 30, 30)
        shieldGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 加分道具 - 金色钻石
        const extraPointsGraphics = this.add.graphics()
            .fillStyle(0xffdd00)
            .fillRect(5, 5, 20, 20)
            .generateTexture('powerup-extraPoints', 30, 30)
        extraPointsGraphics.destroy() // 生成纹理后销毁Graphics对象

        // 生命道具 - 红色心形
        const extraLifeGraphics = this.add.graphics()
            .fillStyle(0xff0066)
            .fillEllipse(15, 15, 20, 15)
            .generateTexture('powerup-extraLife', 30, 30)
        extraLifeGraphics.destroy() // 生成纹理后销毁Graphics对象
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
    }

    /**
     * 玩家射击
     */
    playerFire() {
        if (this.isGameOver || !this.player) return

        const bullets = this.player.fire()
        if (bullets) {
            if (Array.isArray(bullets)) {
                bullets.forEach(bullet => this.bullets.add(bullet))
            } else {
                this.bullets.add(bullets)
            }
        }
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
    }

    /**
     * 更新管理器
     */
    updateManagers() {
        // 这里可以添加需要每帧更新的管理器逻辑
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        this.debugFrameCount++
        
        if (this.debugFrameCount % 60 === 0) { // 每秒更新一次
            const debugInfo = [
                `等级: ${this.level}`,
                `击败敌人: ${this.enemiesKilled}`
            ]
            this.uiManager.updateDebugInfo(debugInfo)
        }
    }

    /**
     * 增加分数
     */
    addScore(points) {
        this.score += points
        this.uiManager.updateScore(this.score)
        
        // 检查是否升级
        const newLevel = Math.floor(this.score / SCORING_CONFIG.LEVEL_UP_THRESHOLD) + 1
        if (newLevel > this.level) {
            this.levelUp(newLevel)
        }
    }

    /**
     * 升级
     */
    levelUp(newLevel) {
        this.level = newLevel
        this.uiManager.updateLevel(this.level)
        this.effectsManager.createLevelUpEffect()
        
        // 调整难度
        this.enemySpawnManager.updateSpawnRate()
        this.powerUpSpawnManager.adjustSpawnRate()
        
        console.log(`🎉 升级到等级 ${this.level}!`)
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
