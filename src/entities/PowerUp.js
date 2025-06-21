import Phaser from 'phaser'

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {    constructor(scene, x, y, type = null, value = null) {
        // 先确定类型，再调用super
        const powerUpType = type || 'multiShot' // 默认类型
        const textureKey = `powerup-${powerUpType}`
        
        super(scene, x, y, textureKey)
        
        // 添加到场景和物理系统
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false) // 允许道具移出屏幕
        
        // 道具属性
        this.speed = 80
        this.type = powerUpType
        this.value = value || this.getDefaultValue() // 新增value属性
        this.points = 50
        
        // 设置初始速度（向下移动）
        this.setVelocityY(this.speed)
        
        // 设置碰撞体积
        this.setSize(25, 25)
        
        // 根据道具类型设置颜色和效果
        this.setupPowerUpType()
        
        // 添加浮动效果
        this.floatOffset = 0
        this.floatSpeed = 0.05
        
        console.log(`✨ 道具生成: ${this.type}`)
    }
    
    update() {
        // 浮动效果
        this.floatOffset += this.floatSpeed
        this.y += Math.sin(this.floatOffset) * 0.5
        
        // 旋转效果
        this.rotation += 0.02
        
        // 如果道具移出屏幕下方，则销毁
        if (this.y > this.scene.cameras.main.height + 50) {
            this.destroy()
        }
    }
    
    getRandomType() {
        const types = ['speed', 'firerate', 'multishot', 'points']
        return Phaser.Utils.Array.GetRandom(types)
    }
      getDefaultValue() {
        switch (this.type) {
            case 'multiShot':
                return 5000  // 默认5秒
            case 'shield':
                return 8000  // 默认8秒
            case 'extraPoints':
                return 50    // 默认50分
            case 'extraLife':
                return 1     // 默认1条命
            case 'permanentFireRate':
                return 20    // 默认减少20ms射击间隔
            case 'permanentSpeed':
                return 30    // 默认增加30移动速度
            case 'bomb':
                return 1     // 默认清屏效果
            default:
                return 0
        }
    }
      setupPowerUpType() {
        switch (this.type) {
            case 'speed':
                this.setTint(0x00ff00) // 绿色 - 速度提升
                break
            case 'firerate':
                this.setTint(0xff6600) // 橙色 - 射击速度提升
                break
            case 'multishot':
            case 'multiShot':
                this.setTint(0x0066ff) // 蓝色 - 多重射击
                break
            case 'points':
            case 'extraPoints':
                this.setTint(0xffff00) // 黄色 - 额外分数
                break
            case 'extraLife':
                this.setTint(0xff69b4) // 粉红色 - 额外生命
                break
            case 'shield':
                this.setTint(0x00ffff) // 青色 - 护盾
                break
            case 'bomb':
                this.setTint(0xff4500) // 红橙色 - 炸弹
                break
            case 'permanentFireRate':
                this.setTint(0xffd700) // 金色 - 永久射速增强
                break
            case 'permanentSpeed':
                this.setTint(0x32cd32) // 酸橙绿 - 永久速度增强
                break
            default:
                this.setTint(0xff00ff) // 紫色 - 默认
        }
    }
    
    collect(player) {
        // 创建收集效果
        this.createCollectEffect()
        
        // 应用道具效果
        this.applyEffect(player)
        
        // 销毁道具
        this.destroy()
    }
      applyEffect(player) {
        switch (this.type) {
            case 'speed':
                if (player.increaseSpeed) {
                    player.increaseSpeed()
                }
                break
                
            case 'firerate':
                if (player.increaseFireRate) {
                    player.increaseFireRate()
                }
                break
                
            case 'multishot':
            case 'multiShot':
                if (player.enableMultiShot) {
                    player.enableMultiShot()
                }
                console.log('🔫 多重射击激活！')
                break
                
            case 'points':
            case 'extraPoints':
                // 额外分数在GameScene中处理
                console.log('💰 获得额外分数')
                break
                
            case 'extraLife':
                console.log('❤️ 获得额外生命')
                break
                
            case 'shield':
                if (player.activateShield) {
                    player.activateShield()
                }
                console.log('🛡️ 护盾激活！')
                break
                
            case 'bomb':
                console.log('💣 炸弹激活！')
                break
                
            case 'permanentFireRate':
                if (player.permanentFireRateBoost) {
                    player.permanentFireRateBoost(this.value)
                }
                console.log(`🔥 永久射速增强！减少${this.value}ms射击间隔`)
                break
                
            case 'permanentSpeed':
                if (player.permanentSpeedBoost) {
                    player.permanentSpeedBoost(this.value)
                }
                console.log(`⚡ 永久移动速度增强！增加${this.value}速度`)
                break
        }
    }
    
    createCollectEffect() {
        // 创建收集时的光环效果
        const ring = this.scene.add.circle(this.x, this.y, 5, 0xffffff)
        ring.setStrokeStyle(2, this.tintTopLeft)
        
        // 扩展动画
        this.scene.tweens.add({
            targets: ring,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                ring.destroy()
            }
        })
        
        // 创建向上飘动的分数文本
        const scoreText = this.scene.add.text(this.x, this.y, `+${this.points}`, {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5)
        
        this.scene.tweens.add({
            targets: scoreText,
            y: this.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                scoreText.destroy()
            }
        })
    }
}
