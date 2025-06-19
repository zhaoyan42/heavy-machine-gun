import Phaser from 'phaser'

export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = null) {
        super(scene, x, y, 'powerup')
        
        // 添加到场景和物理系统
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false) // 允许道具移出屏幕
        
        // 道具属性
        this.speed = 80
        this.type = type || this.getRandomType()
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
    
    setupPowerUpType() {
        switch (this.type) {
            case 'speed':
                this.setTint(0x00ff00) // 绿色 - 速度提升
                break
            case 'firerate':
                this.setTint(0xff6600) // 橙色 - 射击速度提升
                break
            case 'multishot':
                this.setTint(0x0066ff) // 蓝色 - 多重射击
                break
            case 'points':
                this.setTint(0xffff00) // 黄色 - 额外分数
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
                // 暂时只是增加射击速度，后续可以实现真正的多重射击
                if (player.increaseFireRate) {
                    player.increaseFireRate()
                }
                console.log('🔫 多重射击效果（暂未实现）')
                break
                
            case 'points':
                // 额外分数在GameScene中处理
                console.log('💰 获得额外分数')
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
