import Phaser from 'phaser'
import Player from '../entities/Player.js'
import Enemy from '../entities/Enemy.js'
import Bullet from '../entities/Bullet.js'
import PowerUp from '../entities/PowerUp.js'
import GameUtils from '../utils/GameUtils.js'

export default class GameScene extends Phaser.Scene {    constructor() {
        super({ key: 'GameScene' })
          // 游戏状态
        this.score = 0
        this.lives = 3
        this.level = 1
        this.enemiesKilled = 0 // 击败敌人计数
        this.isGameOver = false // 游戏结束标志
        
        // 游戏对象组
        this.player = null
        this.bullets = null
        this.enemies = null
        this.powerUps = null
        
        // 定时器
        this.enemySpawnTimer = null
        this.powerUpSpawnTimer = null
        
        // UI元素
        this.scoreText = null
        this.livesText = null
        this.levelText = null
        
        // 输入控制
        this.cursors = null
        this.pointer = null
        
        // 调试计数器
        this.debugFrameCount = 0
    }
    
    preload() {
        console.log('🎮 加载游戏资源...')
        
        // 创建简单的彩色矩形作为精灵（临时使用，后续可替换为图片）
        this.createColorGraphics()
    }
    
    create() {
        console.log('🎮 创建游戏场景...')        // 重置游戏状态（重要：scene.restart()不会重新调用构造函数）
        this.score = 0
        this.lives = 3
        this.level = 1
        this.enemiesKilled = 0 // 击败敌人计数
        this.isGameOver = false // 重置游戏结束标志
        
        // 重置调试计数器
        this.debugFrameCount = 0
        
        // 创建游戏对象组（改为普通组，不使用物理组）
        this.bullets = this.add.group()
        this.enemies = this.add.group()
        this.powerUps = this.add.group()
        
        // 创建玩家
        this.player = new Player(this, this.cameras.main.width / 2, this.cameras.main.height - 80)
        
        // 设置输入控制
        this.setupInput()
        
        // 设置碰撞检测
        this.setupCollisions()
        
        // 创建UI
        this.createUI()
        
        // 开始敌人生成
        this.startEnemySpawning()
        
        // 开始道具生成
        this.startPowerUpSpawning()
        
        console.log('✅ 游戏场景创建完成！')
    }    update(time, delta) {
        // 如果游戏结束，停止所有更新逻辑
        if (this.isGameOver) {
            return
        }
        
        // 更新玩家
        if (this.player) {
            this.player.update()
            
            // 更新效果状态显示
            this.updateEffectsDisplay()
        }
        
        // 更新子弹
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.y < -50) {
                bullet.destroy()
            }
        })
          // 更新敌人并更新血量条
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.hasHealthBar) {
                this.updateEnemyHealthBar(enemy)
            }
        })
        
        // 更新道具
        this.powerUps.children.entries.forEach(powerUp => {
            if (powerUp.y > this.cameras.main.height + 50) {
                powerUp.destroy()
            }
        })
        
        // 手动碰撞检测
        this.checkCollisions()
    }
      checkCollisions() {
        // 子弹击中敌人
        this.bullets.children.entries.forEach(bullet => {
            this.enemies.children.entries.forEach(enemy => {
                const distance = this.getDistance(bullet, enemy)
                
                if (distance < 30) {
                    bullet.destroy()
                    
                    // 敌人受到伤害
                    enemy.currentHp--
                    console.log(`💥 子弹击中敌人！剩余血量: ${enemy.currentHp}/${enemy.maxHp}`)
                    
                    // 创建击中效果
                    this.createHitEffect(enemy.x, enemy.y)
                      // 受伤闪烁效果
                    enemy.setTint(0xffffff)
                    this.time.delayedCall(100, () => {
                        if (enemy && enemy.active) {
                            // 清除tint恢复原本颜色
                            enemy.clearTint()
                        }
                    })
                      // 检查敌人是否死亡
                    if (enemy.currentHp <= 0) {
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
                        
                        // 获得分数
                        this.addScore(enemy.scoreValue)
                        this.enemiesKilled++
                        
                        // 创建死亡效果
                        this.createDeathEffect(enemy.x, enemy.y, enemy.enemyType)
                          // Boss或强力敌人有更高概率掉落道具
                        const dropChance = this.calculateDropChance(enemy.enemyType)
                        if (Phaser.Math.Between(1, 100) <= dropChance) {
                            this.dropPowerUp(enemy.x, enemy.y)
                        }
                        
                        enemy.destroy()
                        console.log(`👾 ${enemy.enemyType}敌人被击败！获得${enemy.scoreValue}分 (总击败：${this.enemiesKilled})`)
                    }
                }
            })
        })                // 玩家碰到敌人
        if (this.player) {
            this.enemies.children.entries.forEach(enemy => {
                if (this.checkDistance(this.player, enemy, 35)) {
                    // 检查护盾是否激活
                    if (this.player.isShieldActive && this.player.isShieldActive()) {
                        // 护盾抵挡攻击，只销毁敌人
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
                        
                        enemy.destroy()
                        this.addScore(enemy.scoreValue || 10) // 护盾反击得分
                        console.log('🛡️ 护盾抵挡攻击！')
                        
                        // 护盾闪光效果
                        this.player.setTint(0xffffff)
                        this.time.delayedCall(100, () => {
                            if (this.player && this.player.isShieldActive()) {
                                this.player.setTint(0x00ffff) // 恢复护盾颜色
                            }
                        })
                    } else {
                        // 正常受伤逻辑
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
                        
                        enemy.destroy()
                        this.loseLife()
                        console.log('💀 玩家碰到敌人！')
                        
                        // 添加无敌时间，避免连续碰撞
                        this.player.setTint(0xff0000)
                        this.time.delayedCall(500, () => {
                            if (this.player) {
                                this.player.clearTint()
                            }
                        })
                    }
                }
            })
            
            // 玩家收集道具
            this.powerUps.children.entries.forEach(powerUp => {
                const distance = this.getDistance(this.player, powerUp)
                
                if (distance < 35) {
                    // 停止道具的所有动画
                    if (powerUp.moveTween) {
                        powerUp.moveTween.stop()
                        powerUp.moveTween = null
                    }
                    if (powerUp.scaleTween) {
                        powerUp.scaleTween.stop()
                        powerUp.scaleTween = null
                    }
                    if (powerUp.rotateTween) {
                        powerUp.rotateTween.stop()
                        powerUp.rotateTween = null
                    }
                      // 获取道具效果文本
                    const effectText = this.collectPowerUp()
                    
                    // 创建收集效果，传入效果文本
                    this.createCollectEffect(powerUp.x, powerUp.y, effectText)
                    
                    powerUp.destroy()
                    console.log('✨ 收集道具成功！')
                }
            })
        }
    }
    
    checkDistance(obj1, obj2, maxDistance) {
        const dx = obj1.x - obj2.x
        const dy = obj1.y - obj2.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < maxDistance
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x
        const dy = obj1.y - obj2.y
        return Math.sqrt(dx * dx + dy * dy)
    }
      createHitEffect(x, y) {
        // 创建击中闪光效果
        const flash = this.add.circle(x, y, 20, 0xffffff)
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy()
            }
        })
    }
      createDeathEffect(x, y, enemyType) {
        // 大幅简化死亡效果，减少粒子数量，避免闪烁
        let particles = 4 // 统一减少到4个粒子
        let duration = 300 // 统一300ms持续时间
        let color = 0xff4444
        
        switch (enemyType) {
            case 'fast':
                color = 0xff8800
                break
            case 'strong':
                color = 0x8800ff
                break
            case 'boss':
                color = 0x000088
                particles = 6 // Boss稍微多一点，但仍然很少
                break
        }
        
        // 创建简化的粒子爆炸效果
        for (let i = 0; i < particles; i++) {
            const angle = (Math.PI * 2 / particles) * i
            const distance = Phaser.Math.Between(15, 25) // 减少距离
            
            const particle = this.add.circle(x, y, 2, color) // 减小粒子尺寸
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.1,
                duration: duration,
                ease: 'Linear', // 使用更简单的缓动
                onComplete: () => {
                    particle.destroy()
                }
            })
        }
        
        // 完全禁用Boss死亡时的震屏效果
        // if (enemyType === 'boss') {
        //     GameUtils.screenShake(this, 4, 200)
        // }
    }createColorGraphics() {
        // 创建玩家图形（绿色矩形）
        const playerGraphics = this.add.graphics()
            .fillStyle(0x00ff00)
            .fillRect(0, 0, 40, 40)
        playerGraphics.generateTexture('player', 40, 40)
        playerGraphics.destroy() // 销毁图形对象
        
        // 创建子弹图形（黄色小矩形）
        const bulletGraphics = this.add.graphics()
            .fillStyle(0xffff00)
            .fillRect(0, 0, 4, 12)
        bulletGraphics.generateTexture('bullet', 4, 12)
        bulletGraphics.destroy() // 销毁图形对象
        
        // 创建基础敌人图形（红色矩形）
        const enemyGraphics = this.add.graphics()
            .fillStyle(0xff0000)
            .fillRect(0, 0, 35, 35)
        enemyGraphics.generateTexture('enemy', 35, 35)
        enemyGraphics.destroy() // 销毁图形对象
        
        // 创建快速敌人图形（橙色三角形）
        const fastEnemyGraphics = this.add.graphics()
            .fillStyle(0xff8800)
            .fillTriangle(15, 5, 5, 25, 25, 25)
        fastEnemyGraphics.generateTexture('enemy_fast', 30, 30)
        fastEnemyGraphics.destroy()
        
        // 创建强力敌人图形（紫色八边形）
        const strongEnemyGraphics = this.add.graphics()
            .fillStyle(0x8800ff)
        // 绘制八边形
        strongEnemyGraphics.beginPath()
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const x = 20 + Math.cos(angle) * 15
            const y = 20 + Math.sin(angle) * 15
            if (i === 0) {
                strongEnemyGraphics.moveTo(x, y)
            } else {
                strongEnemyGraphics.lineTo(x, y)
            }
        }
        strongEnemyGraphics.closePath()
        strongEnemyGraphics.fillPath()
        strongEnemyGraphics.generateTexture('enemy_strong', 40, 40)
        strongEnemyGraphics.destroy()
        
        // 创建Boss敌人图形（深蓝色星形）
        const bossEnemyGraphics = this.add.graphics()
            .fillStyle(0x000088)
        // 绘制星形
        bossEnemyGraphics.beginPath()
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2
            const radius = i % 2 === 0 ? 25 : 12
            const x = 30 + Math.cos(angle - Math.PI / 2) * radius
            const y = 30 + Math.sin(angle - Math.PI / 2) * radius
            if (i === 0) {
                bossEnemyGraphics.moveTo(x, y)
            } else {
                bossEnemyGraphics.lineTo(x, y)
            }
        }
        bossEnemyGraphics.closePath()
        bossEnemyGraphics.fillPath()
        bossEnemyGraphics.generateTexture('enemy_boss', 60, 60)
        bossEnemyGraphics.destroy()
        
        // 创建道具图形（紫色圆形）
        const powerupGraphics = this.add.graphics()
            .fillStyle(0xff00ff)
            .fillCircle(15, 15, 15)
        powerupGraphics.generateTexture('powerup', 30, 30)
        powerupGraphics.destroy() // 销毁图形对象
    }
    
    setupInput() {
        // 键盘输入
        this.cursors = this.input.keyboard.createCursorKeys()
        
        // 鼠标/触屏输入
        this.input.on('pointermove', (pointer) => {
            if (this.player) {
                this.player.setTargetX(pointer.x)
            }
        })
        
        this.input.on('pointerdown', (pointer) => {
            if (this.player) {
                this.player.setTargetX(pointer.x)
            }
        })
    }
    
    setupCollisions() {
        // 不再使用物理系统的碰撞检测
        // 碰撞检测将在update方法中手动处理
        console.log('✅ 碰撞系统已设置（手动检测模式）')
    }
      createUI() {
        // 分数显示
        this.scoreText = this.add.text(16, 16, `分数: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        
        // 生命显示
        this.livesText = this.add.text(16, 50, `生命: ${this.lives}`, {
            fontSize: '24px',  
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        
        // 等级显示
        this.levelText = this.add.text(16, 84, `等级: ${this.level}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        })
        
        // 效果状态显示
        this.effectsText = this.add.text(16, 118, '', {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        })
    }
      startEnemySpawning() {
        this.enemySpawnTimer = this.time.addEvent({
            delay: this.getEnemySpawnDelay(), // 动态计算生成间隔
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })
    }    getEnemySpawnDelay() {
        // 更合理的难度曲线，避免过快的敌人生成
        const baseDelay = 2000 // 基础2秒
        const reduction = Math.min(this.level * 50, 1200) // 每级减少50ms，最多减少1200ms
        return Math.max(baseDelay - reduction, 400) // 最快400ms生成一次，而不是150ms
    }    calculateDropChance(enemyType) {
        // 大幅降低道具掉落概率，避免道具过多
        let baseChance = 0
        const levelBonus = Math.min(this.level * 1, 15) // 等级奖励减少到每级1%，最多+15%
        
        switch (enemyType) {
            case 'basic':
                baseChance = 2 // 基础敌人降低到2%
                break
            case 'fast':
                baseChance = 5 // 快速敌人降低到5%
                break
            case 'strong':
                baseChance = 15 // 强力敌人降低到15%
                break
            case 'boss':
                baseChance = 35 // Boss降低到35%基础概率
                break
        }
        
        return Math.min(baseChance + levelBonus, 60) // 最高60%概率，而不是95%
    }
    
    startPowerUpSpawning() {
        // 增加道具生成频率来平衡高难度
        const powerUpDelay = Math.max(8000 - this.level * 200, 3000) // 从8秒减少到3秒
        
        this.powerUpSpawnTimer = this.time.addEvent({
            delay: powerUpDelay,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        })
    }    spawnEnemy() {
        // 检查游戏是否结束，如果结束则停止生成敌人
        if (this.isGameOver) {
            return
        }
        
        // 降低敌人潮概率和强度
        let waveChance = 0
        let waveCount = 1
        
        if (this.level >= 4) { // 4级才开始敌人潮，而不是3级
            waveChance = 8 + Math.floor((this.level - 4) * 1.5) // 起始8%，每级增加1.5%
            waveCount = Math.min(2 + Math.floor(this.level / 8), 4) // 最多4波，而不是6波
        }
        
        const isEnemyWave = Phaser.Math.Between(1, 100) <= waveChance
        
        if (isEnemyWave) {
            console.log(`🌊 敌人潮来袭！生成${waveCount}批敌人 (概率: ${waveChance}%)`)
        }
        
        const actualWaves = isEnemyWave ? waveCount : 1
        
        for (let wave = 0; wave < actualWaves; wave++) {
            // 根据等级决定敌人类型和数量
            const enemyCount = this.getEnemyCountForLevel()
            const enemyTypes = this.getEnemyTypesForLevel()
            
            for (let i = 0; i < enemyCount; i++) {
                // 更宽松的生成间隔
                const delay = wave * 400 + i * 120 // 波之间400ms，单个敌人间隔120ms
                this.time.delayedCall(delay, () => {
                    this.createSingleEnemy(enemyTypes)
                })
            }
        }
    }getEnemyCountForLevel() {
        // 重新平衡敌人数量，避免后期过于困难
        if (this.level <= 1) return 1
        if (this.level <= 2) return 2
        if (this.level <= 4) return 3
        if (this.level <= 6) return 4
        if (this.level <= 8) return 5
        if (this.level <= 10) return 6
        if (this.level <= 12) return 7
        if (this.level <= 15) return 8
        if (this.level <= 18) return 10
        if (this.level <= 22) return 12
        return 15 // 最高等级控制在15个敌人，而不是35个
    }    getEnemyTypesForLevel() {
        // 重新平衡敌人类型，避免后期全是强敌
        const types = ['basic']
        
        if (this.level >= 3) types.push('fast')     // 3级解锁快速敌人
        if (this.level >= 5) types.push('strong')   // 5级解锁强力敌人  
        if (this.level >= 8) {
            types.push('boss')    // 8级解锁Boss
            
            // 更温和的强敌概率增长
            if (this.level >= 10) {
                types.push('fast') // 10级后快速敌人概率增加
            }
            if (this.level >= 12) {
                types.push('strong') // 12级后强力敌人概率增加
            }
            if (this.level >= 15) {
                types.push('boss') // 15级后Boss概率增加
            }
            if (this.level >= 20) {
                // 20级后仍然保持基础敌人的存在，避免全是强敌
                types.push('basic', 'fast', 'strong')
            }
        }
        
        return types
    }    createSingleEnemy(availableTypes) {
        // 检查游戏是否结束，如果结束则停止创建敌人
        if (this.isGameOver) {
            return
        }
        
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50)
        const enemyType = Phaser.Utils.Array.GetRandom(availableTypes)
        
        console.log(`👾 生成${enemyType}敌人 - 位置: (${x}, -50), 等级: ${this.level}`)
        
        // 根据类型选择纹理
        let texture = 'enemy'
        switch (enemyType) {
            case 'fast':
                texture = 'enemy_fast'
                break
            case 'strong':
                texture = 'enemy_strong'
                break
            case 'boss':
                texture = 'enemy_boss'
                break
        }
        
        // 创建敌人精灵
        const enemy = this.add.sprite(x, -50, texture)
        
        // 根据类型设置敌人属性
        this.setupEnemyByType(enemy, enemyType)
        
        // 添加到敌人组
        this.enemies.add(enemy)
        
        // 设置移动动画
        this.setupEnemyMovement(enemy, enemyType)
    }    setupEnemyByType(enemy, type) {
        // 设置敌人的基础属性，控制血量增长避免无法击败
        enemy.enemyType = type
        enemy.maxHp = 1
        enemy.currentHp = 1
        enemy.scoreValue = 10
        
        // 更温和的等级加成，避免敌人变得无法击败
        const levelBonus = Math.min(Math.floor((this.level - 5) / 3), 8) // 每3级增加1点，最多+8
        
        switch (type) {
            case 'basic':
                enemy.setScale(1.0)
                if (levelBonus > 0) {
                    enemy.maxHp += Math.floor(levelBonus / 2) // 基础敌人血量增长很慢
                    enemy.currentHp = enemy.maxHp
                }
                break
                
            case 'fast':
                enemy.setScale(0.9)
                enemy.scoreValue = 15
                enemy.maxHp = 1 + Math.min(levelBonus, 3) // 快速敌人最多4血
                enemy.currentHp = enemy.maxHp
                break
                
            case 'strong':
                enemy.setScale(1.1)
                enemy.maxHp = 2 + Math.min(levelBonus, 5) // 强力敌人最多7血
                enemy.currentHp = enemy.maxHp
                enemy.scoreValue = 25 + levelBonus
                break
                
            case 'boss':
                enemy.setScale(1.0)
                enemy.maxHp = 3 + Math.min(levelBonus, 7) // Boss最多10血，而不是无限增长
                enemy.currentHp = enemy.maxHp
                enemy.scoreValue = 50 + levelBonus * 2
                break
        }
        
        // 显示血量条（如果HP > 1）
        if (enemy.maxHp > 1) {
            this.createEnemyHealthBar(enemy)
        }
    }
    
    setupEnemyMovement(enemy, type) {
        let speed, pattern
        
        switch (type) {
            case 'basic':
                speed = Phaser.Math.Between(80, 120)
                pattern = 'straight'
                break
                
            case 'fast':
                speed = Phaser.Math.Between(150, 220)
                pattern = 'straight'
                break
                
            case 'strong':
                speed = Phaser.Math.Between(60, 100)
                pattern = 'zigzag'
                break
                
            case 'boss':
                speed = Phaser.Math.Between(40, 80)
                pattern = 'circle'
                break
        }
        
        const duration = (this.cameras.main.height + 100) / speed * 1000
          if (pattern === 'straight') {
            // 直线移动
            enemy.moveTween = this.tweens.add({
                targets: enemy,
                y: this.cameras.main.height + 50,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    if (enemy && enemy.active) {
                        // 销毁血量条
                        if (enemy.hpBarBg) {
                            enemy.hpBarBg.destroy()
                        }
                        if (enemy.hpBar) {
                            enemy.hpBar.destroy()
                        }
                        
                        enemy.destroy()
                        this.loseLife()
                        console.log(`👾 ${type}敌人到达底部，失去生命`)
                    }
                }
            })
        } else if (pattern === 'zigzag') {
            // Z字形移动
            this.createZigzagMovement(enemy, duration)
        } else if (pattern === 'circle') {
            // 圆形移动
            this.createCircleMovement(enemy, duration)
        }
        
        // 旋转效果
        const rotationSpeed = type === 'fast' ? Math.PI * 6 : Math.PI * 3
        enemy.rotateTween = this.tweens.add({
            targets: enemy,
            rotation: rotationSpeed,
            duration: duration,
            ease: 'Linear'
        })
    }
      createEnemyHealthBar(enemy) {
        // 创建血量条背景
        const hpBarBg = this.add.rectangle(enemy.x, enemy.y - 25, 30, 4, 0x666666)
        // 创建血量条
        const hpBar = this.add.rectangle(enemy.x, enemy.y - 25, 30, 4, 0x00ff00)
        
        enemy.hpBarBg = hpBarBg
        enemy.hpBar = hpBar
        
        // 标记需要更新血量条位置
        enemy.hasHealthBar = true
    }
    
    updateEnemyHealthBar(enemy) {
        if (!enemy.hasHealthBar || !enemy.hpBarBg || !enemy.hpBar) return
        
        // 更新血量条位置
        if (enemy.hpBarBg.active) {
            enemy.hpBarBg.x = enemy.x
            enemy.hpBarBg.y = enemy.y - 25
        }
        if (enemy.hpBar.active) {
            enemy.hpBar.x = enemy.x
            enemy.hpBar.y = enemy.y - 25
            // 更新血量条宽度
            const hpPercent = enemy.currentHp / enemy.maxHp
            enemy.hpBar.width = 30 * hpPercent
            // 根据血量改变颜色
            if (hpPercent > 0.6) {
                enemy.hpBar.setFillStyle(0x00ff00) // 绿色
            } else if (hpPercent > 0.3) {
                enemy.hpBar.setFillStyle(0xffff00) // 黄色
            } else {
                enemy.hpBar.setFillStyle(0xff0000) // 红色
            }
        }
    }
      createZigzagMovement(enemy, duration) {
        const startX = enemy.x
        const zigzagDistance = 60
        
        enemy.moveTween = this.tweens.chain({
            targets: enemy,
            tweens: [
                { x: startX + zigzagDistance, y: enemy.y + 100, duration: duration * 0.25 },
                { x: startX - zigzagDistance, y: enemy.y + 200, duration: duration * 0.25 },
                { x: startX + zigzagDistance, y: enemy.y + 300, duration: duration * 0.25 },
                { x: startX, y: this.cameras.main.height + 50, duration: duration * 0.25 }
            ],
            onComplete: () => {
                if (enemy && enemy.active) {
                    // 销毁血量条
                    if (enemy.hpBarBg) {
                        enemy.hpBarBg.destroy()
                    }
                    if (enemy.hpBar) {
                        enemy.hpBar.destroy()
                    }
                    
                    enemy.destroy()
                    this.loseLife()
                    console.log('👾 强力敌人到达底部，失去生命')
                }
            }
        })
    }
      createCircleMovement(enemy, duration) {
        const centerX = enemy.x
        const radius = 40
        
        enemy.moveTween = this.tweens.add({
            targets: enemy,
            y: this.cameras.main.height + 50,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                // 圆形移动效果
                const progress = enemy.moveTween.progress
                const angle = progress * Math.PI * 4 // 4圈
                enemy.x = centerX + Math.sin(angle) * radius
            },
            onComplete: () => {
                if (enemy && enemy.active) {
                    // 销毁血量条
                    if (enemy.hpBarBg) {
                        enemy.hpBarBg.destroy()
                    }
                    if (enemy.hpBar) {
                        enemy.hpBar.destroy()
                    }
                    
                    enemy.destroy()
                    this.loseLife()
                    console.log('👾 Boss敌人到达底部，失去生命')
                }
            }
        })
    }    spawnPowerUp() {
        // 检查游戏是否结束，如果结束则停止生成道具
        if (this.isGameOver) {
            return
        }
        
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50)
        console.log(`✨ 生成道具 - 位置: (${x}, -50)`)
        
        this.createPowerUpSprite(x, -50)
    }
    
    dropPowerUp(x, y) {
        console.log(`💎 敌人掉落道具 - 位置: (${x}, ${y})`)
        this.createPowerUpSprite(x, y)
    }
    
    createPowerUpSprite(x, y) {
        // 创建道具精灵
        const powerUp = this.add.sprite(x, y, 'powerup')
        powerUp.setTint(0xff00ff) // 紫色
        
        // 添加到道具组
        this.powerUps.add(powerUp)
        
        // 使用补间动画让道具向下移动
        const speed = 80
        const duration = (this.cameras.main.height + 100 - y) / speed * 1000
        
        // 保存动画引用
        powerUp.moveTween = this.tweens.add({
            targets: powerUp,
            y: this.cameras.main.height + 50,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                if (powerUp && powerUp.active) {
                    powerUp.destroy()
                    console.log('✨ 道具已销毁')
                }
            }
        })
        
        // 添加浮动效果
        powerUp.scaleTween = this.tweens.add({
            targets: powerUp,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        })
        
        // 添加旋转效果
        powerUp.rotateTween = this.tweens.add({
            targets: powerUp,
            rotation: Math.PI * 2,
            duration: 2000,
            ease: 'Linear',
            repeat: -1
        })
    }
      fireBullet(x, y, angle = -90) {
        console.log(`🎯 发射子弹 - 位置: (${x}, ${y}), 角度: ${angle}°`)
        
        // 创建子弹
        const bullet = this.add.rectangle(x, y, 4, 12, 0xffff00)
        
        // 根据角度旋转子弹外观
        bullet.setRotation(Phaser.Math.DegToRad(angle + 90)) // +90因为默认朝右
        
        // 添加到子弹组
        this.bullets.add(bullet)
        
        // 计算目标位置（基于角度和距离）
        const speed = 400 // 子弹速度 pixels/second
        const distance = 800 // 子弹飞行距离
        const radian = Phaser.Math.DegToRad(angle)
        
        const targetX = x + Math.cos(radian) * distance
        const targetY = y + Math.sin(radian) * distance
        
        // 使用补间动画让子弹按角度移动
        this.tweens.add({
            targets: bullet,
            x: targetX,
            y: targetY,
            duration: (distance / speed) * 1000,
            ease: 'Linear',
            onComplete: () => {
                bullet.destroy()
            }
        })
        
        console.log(`🔫 子弹已创建，角度: ${angle}°，当前子弹数量: ${this.bullets.children.size}`)
    }
    
    addScore(points) {
        this.score += points
        this.scoreText.setText(`分数: ${GameUtils.formatScore(this.score)}`)
          // 每1000分升级
        const newLevel = GameUtils.calculateLevel(this.score)
        if (newLevel > this.level) {
            this.level = newLevel
            this.levelText.setText(`等级: ${this.level}`)
            this.increaseDifficulty()
            
            // 移除升级时的屏幕震动，避免闪烁
            // GameUtils.screenShake(this, 5, 200)
        }
    }
    
    loseLife() {
        this.lives--
        console.log(`💔 失去生命！当前生命值: ${this.lives}`)
        
        this.livesText.setText(`生命: ${this.lives}`)
        
        if (this.lives <= 0) {
            this.gameOver()
        }
    }    collectPowerUp() {
        // 基础加分效果
        this.addScore(50)
        
        // 随机选择道具效果（扩展到7种）
        const powerUpType = Phaser.Math.Between(1, 7)
        let effectText = '+50'
        
        switch (powerUpType) {
            case 1:
                // 增加射击速度
                if (this.player && this.player.increaseFireRate) {
                    this.player.increaseFireRate()
                    effectText = '🔥射速+'
                    console.log('🔥 获得道具：射击速度提升！')
                }
                break
            case 2:
                // 增加移动速度
                if (this.player && this.player.increaseSpeed) {
                    this.player.increaseSpeed()
                    effectText = '⚡速度+'
                    console.log('⚡ 获得道具：移动速度提升！')
                }
                break
            case 3:
                // 额外加分
                this.addScore(100)
                effectText = '+150'
                console.log('💰 获得道具：额外分数奖励！')
                break
            case 4:
                // 散射子弹
                if (this.player && this.player.enableMultiShot) {
                    this.player.enableMultiShot()
                    effectText = '🎯五重散射'
                    console.log('🎯 获得道具：五重散射！')
                }
                break
            case 5:
                // 护盾
                if (this.player && this.player.activateShield) {
                    this.player.activateShield()
                    effectText = '🛡️护盾'
                    console.log('🛡️ 获得道具：护盾激活！')
                }
                break
            case 6:
                // 炸弹 - 清除所有敌人
                this.clearAllEnemies()
                effectText = '💣清屏'
                console.log('💣 获得道具：炸弹清屏！')
                break
            case 7:
                // 恢复生命
                if (this.lives < 3) {
                    this.lives++
                    this.livesText.setText(`生命: ${this.lives}`)
                    effectText = '❤️生命+'
                    console.log('❤️ 获得道具：生命恢复！')
                } else {
                    // 生命已满，给额外分数
                    this.addScore(200)
                    effectText = '+250'
                    console.log('💰 生命已满，获得额外分数！')
                }
                break
        }
        
        return effectText // 返回效果文本用于显示
    }    increaseDifficulty() {
        // 更新敌人生成间隔
        const newDelay = this.getEnemySpawnDelay()
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.delay = newDelay
        }
        
        // 更新道具生成频率
        const newPowerUpDelay = Math.max(8000 - this.level * 200, 3000)
        if (this.powerUpSpawnTimer) {
            this.powerUpSpawnTimer.delay = newPowerUpDelay
        }
        
        console.log(`📈 难度提升！等级: ${this.level}, 敌人生成间隔: ${newDelay}ms, 道具间隔: ${newPowerUpDelay}ms`)
        
        // 更新升级提示
        let levelBonus = ''
        if (this.level === 3) levelBonus = ' - 解锁快速敌人！'
        if (this.level === 4) levelBonus = ' - 敌人潮开始！'
        if (this.level === 5) levelBonus = ' - 解锁强力敌人！'
        if (this.level === 8) levelBonus = ' - Boss登场！'
        if (this.level === 10) levelBonus = ' - 强敌增多！'
        if (this.level === 15) levelBonus = ' - 精英模式！'
        if (this.level === 20) levelBonus = ' - 终极挑战！'
        
        if (levelBonus) {
            console.log(`🎉 等级${this.level}${levelBonus}`)
        }
    }
      gameOver() {
        console.log('💀 游戏结束！')
        
        // 设置游戏结束标志，停止所有更新逻辑
        this.isGameOver = true
        
        // 保存最高分
        const isNewRecord = GameUtils.saveHighScore(this.score)
        const highScore = GameUtils.getHighScore()
        
        // 停止所有定时器
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy()
            this.enemySpawnTimer = null
        }
        if (this.powerUpSpawnTimer) {
            this.powerUpSpawnTimer.destroy()
            this.powerUpSpawnTimer = null
        }
        
        // 清理所有游戏对象
        if (this.bullets) {
            this.bullets.clear(true, true)
        }
        if (this.enemies) {
            this.enemies.clear(true, true)
        }
        if (this.powerUps) {
            this.powerUps.clear(true, true)
        }
        
        // 停止所有补间动画
        this.tweens.killAll()
        
        // 显示游戏结束界面
        this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                          this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8)
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 
                     '游戏结束', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 40, 
                     `最终分数: ${GameUtils.formatScore(this.score)}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        if (isNewRecord) {
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
                         '🎉 新纪录！', {
                fontSize: '28px',
                fill: '#ffff00',
                fontFamily: 'Arial'
            }).setOrigin(0.5)
        }
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 40, 
                     `最高分: ${GameUtils.formatScore(highScore)}`, {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, 
                     '点击重新开始', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5)
        
        // 点击重新开始
        this.input.once('pointerdown', () => {
            console.log('🔄 重新开始游戏...')
            
            // 添加短暂延迟，确保所有清理工作完成
            this.time.delayedCall(100, () => {
                this.scene.restart()
            })
        })
    }
      createCollectEffect(x, y, effectText = '+50') {
        // 创建收集时的光环效果
        const ring = this.add.circle(x, y, 15, 0x00ff00)
        ring.setStrokeStyle(3, 0xffff00)
        
        // 扩展动画
        this.tweens.add({
            targets: ring,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                ring.destroy()
            }
        })
        
        // 创建向上飘动的文本，显示实际效果
        const bonusText = this.add.text(x, y, effectText, {
            fontSize: '20px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5)
        
        this.tweens.add({
            targets: bonusText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                bonusText.destroy()
            }
        })
    }    clearAllEnemies() {
        // 炸弹效果：分批清除敌人，避免同时销毁造成闪烁
        const allEnemies = this.enemies.children.entries.slice() // 创建副本
        let enemiesCleared = 0
        let totalScore = 0
        
        if (allEnemies.length === 0) return
        
        console.log(`💣 开始分批清除 ${allEnemies.length} 个敌人...`)
        
        // 分批处理，每批最多5个敌人
        const batchSize = 5
        const batches = []
        
        for (let i = 0; i < allEnemies.length; i += batchSize) {
            batches.push(allEnemies.slice(i, i + batchSize))
        }
        
        // 逐批处理敌人
        batches.forEach((batch, batchIndex) => {
            this.time.delayedCall(batchIndex * 50, () => { // 每批间隔50ms
                batch.forEach((enemy, enemyIndex) => {
                    if (enemy && enemy.active) {
                        // 停止敌人动画
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
                        
                        // 只为第一批的少数敌人创建效果
                        if (batchIndex === 0 && enemyIndex < 3) {
                            this.createBombEffect(enemy.x, enemy.y)
                        }
                        
                        // 根据敌人类型计算分数
                        const baseScore = enemy.scoreValue || 10
                        totalScore += baseScore
                        
                        enemy.destroy()
                        enemiesCleared++
                    }
                })
                
                // 在最后一批处理完成后给予分数
                if (batchIndex === batches.length - 1) {
                    this.time.delayedCall(100, () => {
                        this.addScore(totalScore)
                        console.log(`💣 炸弹清除了 ${enemiesCleared} 个敌人，获得 ${totalScore} 分！`)
                        
                        // 完全禁用震动效果
                        // GameUtils.screenShake(this, 2, 100)
                    })
                }
            })
        })
    }
      createBombEffect(x, y) {
        // 极简的爆炸效果，避免渲染问题
        const explosion = this.add.circle(x, y, 3, 0xff4444) // 减小尺寸
        
        this.tweens.add({
            targets: explosion,
            scaleX: 2, // 减小缩放倍数
            scaleY: 2,
            alpha: 0,
            duration: 200, // 缩短持续时间
            ease: 'Linear', // 使用更简单的缓动
            onComplete: () => {
                explosion.destroy()
            }
        })
    }
      updateEffectsDisplay() {
        if (!this.player || !this.effectsText) return
        
        let effects = []
          if (this.player.isMultiShotActive()) {
            const remaining = Math.ceil((this.player.multiShotDuration - (this.time.now - this.player.multiShotStartTime)) / 1000)
            effects.push(`🎯五重散射 ${remaining}s`)
        }
        
        if (this.player.isShieldActive()) {
            const remaining = Math.ceil((this.player.shieldDuration - (this.time.now - this.player.shieldStartTime)) / 1000)
            effects.push(`🛡️护盾 ${remaining}s`)
        }
        
        this.effectsText.setText(effects.join(' | '))
    }
}
