import Phaser from 'phaser'

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet')
        
        // 子弹属性
        this.speed = 500
        this.damage = 1
        
        // 添加到场景
        scene.add.existing(this)
        
        // 添加到物理系统
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false)
        
        // 设置碰撞体积
        this.setSize(4, 12)
        
        // 设置初始速度（向上移动）
        this.setVelocity(0, -this.speed)
        
        // 添加轻微的光效
        this.setTint(0xffff00)
        
        console.log(`💥 子弹创建 - 位置: (${this.x}, ${this.y}), 速度: (${this.body.velocity.x}, ${this.body.velocity.y})`)
    }
    
    update() {
        // 如果子弹移出屏幕上方，则销毁
        if (this.y < -50) {
            console.log(`🗑️ 子弹销毁 - 位置: (${this.x}, ${this.y})`)
            this.destroy()
        }
    }
    
    // 子弹击中目标时调用
    hit() {
        // 创建击中效果
        this.createHitEffect()
        
        // 销毁子弹
        this.destroy()
    }
    
    createHitEffect() {
        // 创建简单的击中闪光效果
        const flash = this.scene.add.circle(this.x, this.y, 8, 0xffffff)
        
        // 淡出效果
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy()
            }
        })
    }
}
