import Phaser from 'phaser'
import Player from '../entities/Player.js'
import Enemy from '../entities/Enemy.js'
import Bullet from '../entities/Bullet.js'
import PowerUp from '../entities/PowerUp.js'
import GameUtils from '../utils/GameUtils.js'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
        
        // 游戏状态
        this.score = 0
        this.lives = 3
        this.level = 1
        
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
        console.log('🎮 创建游戏场景...')
        
        // 重置游戏状态（重要：scene.restart()不会重新调用构造函数）
        this.score = 0
        this.lives = 3
        this.level = 1
        
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
    }
      update(time, delta) {
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
                    // 停止敌人的动画，防止继续到底部
                    if (enemy.moveTween) {
                        enemy.moveTween.stop()
                        enemy.moveTween = null
                    }
                    if (enemy.rotateTween) {
                        enemy.rotateTween.stop()
                        enemy.rotateTween = null
                    }
                    
                    bullet.destroy()
                    enemy.destroy()
                    this.addScore(10)
                    console.log('💥 子弹击中敌人！')
                    
                    // 创建击中效果
                    this.createHitEffect(enemy.x, enemy.y)
                }
            })
        })
          // 玩家碰到敌人
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
                        
                        enemy.destroy()
                        this.addScore(10) // 护盾反击得分
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
      createColorGraphics() {
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
        
        // 创建敌人图形（红色矩形）
        const enemyGraphics = this.add.graphics()
            .fillStyle(0xff0000)
            .fillRect(0, 0, 35, 35)
        enemyGraphics.generateTexture('enemy', 35, 35)
        enemyGraphics.destroy() // 销毁图形对象
        
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
            delay: 2000, // 每2秒生成一个敌人
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })
    }
    
    startPowerUpSpawning() {
        this.powerUpSpawnTimer = this.time.addEvent({
            delay: 10000, // 每10秒生成一个道具
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        })
    }
    
    spawnEnemy() {
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50)
        console.log(`👾 生成敌人 - 位置: (${x}, -50)`)
        
        // 创建敌人精灵
        const enemy = this.add.sprite(x, -50, 'enemy')
        enemy.setTint(0xff0000) // 红色
        
        // 添加到敌人组
        this.enemies.add(enemy)
        
        // 使用补间动画让敌人向下移动
        const speed = Phaser.Math.Between(100, 200)
        const duration = (this.cameras.main.height + 100) / speed * 1000
        
        // 保存动画引用到敌人对象上
        enemy.moveTween = this.tweens.add({
            targets: enemy,
            y: this.cameras.main.height + 50,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                if (enemy && enemy.active) {
                    enemy.destroy()
                    this.loseLife()
                    console.log('👾 敌人到达底部，失去生命')
                }
            }
        })
        
        // 添加旋转效果
        enemy.rotateTween = this.tweens.add({
            targets: enemy,
            rotation: Math.PI * 4,
            duration: duration,
            ease: 'Linear'
        })
    }
    
    spawnPowerUp() {
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50)
        console.log(`✨ 生成道具 - 位置: (${x}, -50)`)
        
        // 创建道具精灵
        const powerUp = this.add.sprite(x, -50, 'powerup')
        powerUp.setTint(0xff00ff) // 紫色
        
        // 添加到道具组
        this.powerUps.add(powerUp)
        
        // 使用补间动画让道具向下移动
        const speed = 80
        const duration = (this.cameras.main.height + 100) / speed * 1000
        
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
    
    fireBullet(x, y) {
        console.log(`🎯 发射子弹 - 位置: (${x}, ${y})`)
        
        // 创建子弹
        const bullet = this.add.rectangle(x, y, 4, 12, 0xffff00)
        
        // 添加到子弹组
        this.bullets.add(bullet)
        
        // 使用补间动画让子弹移动
        this.tweens.add({
            targets: bullet,
            y: -50,
            duration: 2000,
            ease: 'Linear',
            onComplete: () => {
                bullet.destroy()
            }
        })
        
        console.log(`🔫 子弹已创建，当前子弹数量: ${this.bullets.children.size}`)
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
            
            // 升级时的屏幕震动效果
            GameUtils.screenShake(this, 5, 200)
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
                // 多重子弹
                if (this.player && this.player.enableMultiShot) {
                    this.player.enableMultiShot()
                    effectText = '🎯三重射击'
                    console.log('🎯 获得道具：多重子弹！')
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
    }
    
    increaseDifficulty() {
        // 使用工具类计算新的敌人生成间隔
        const newDelay = GameUtils.getEnemySpawnDelay(this.level)
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.delay = newDelay
        }
        
        console.log(`📈 难度提升！等级: ${this.level}, 敌人生成间隔: ${newDelay}ms`)
    }
    
    gameOver() {
        console.log('💀 游戏结束！')
        
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
    }
    
    clearAllEnemies() {
        // 炸弹效果：清除所有敌人并给予分数奖励
        let enemiesCleared = 0
        
        this.enemies.children.entries.forEach(enemy => {
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
                
                // 创建爆炸效果
                this.createBombEffect(enemy.x, enemy.y)
                
                enemy.destroy()
                enemiesCleared++
            }
        })
        
        // 根据清除的敌人数量给予分数
        const bonusScore = enemiesCleared * 20
        if (bonusScore > 0) {
            this.addScore(bonusScore)
            console.log(`💣 炸弹清除了 ${enemiesCleared} 个敌人，获得 ${bonusScore} 分！`)
        }
    }
    
    createBombEffect(x, y) {
        // 创建爆炸效果
        const explosion = this.add.circle(x, y, 5, 0xff4444)
        
        this.tweens.add({
            targets: explosion,
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
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
            effects.push(`🎯三重射击 ${remaining}s`)
        }
        
        if (this.player.isShieldActive()) {
            const remaining = Math.ceil((this.player.shieldDuration - (this.time.now - this.player.shieldStartTime)) / 1000)
            effects.push(`🛡️护盾 ${remaining}s`)
        }
        
        this.effectsText.setText(effects.join(' | '))
    }
}
