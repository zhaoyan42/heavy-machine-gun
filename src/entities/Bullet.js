import Phaser from 'phaser'

export default class Bullet extends Phaser.Physics.Arcade.Sprite {    constructor(scene, x, y) {
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
        
        console.log(`🔍 子弹物理体检查:`, this.body ? '存在' : '不存在')
        
        // 设置初始速度（向上移动）
        if (this.body) {
            this.setVelocity(0, -this.speed)
            console.log(`💥 子弹创建成功 - 位置: (${this.x}, ${this.y}), 速度: (${this.body.velocity.x}, ${this.body.velocity.y})`)
        } else {
            console.error('❌ 子弹物理体创建失败，尝试手动设置位置')
            // 如果物理体不存在，尝试手动更新位置
            this.isManualMove = true
        }
        
        // 添加轻微的光效
        this.setTint(0xffff00)
    }
      update() {
        // 如果物理体不存在，手动更新位置
        if (this.isManualMove) {
            this.y -= this.speed * (1/60) // 假设60FPS
        }
        
        // 调试信息：每30帧打印一次位置
        if (!this.debugCounter) this.debugCounter = 0
        this.debugCounter++
        if (this.debugCounter % 30 === 0) {
            console.log(`🎯 子弹位置更新: (${this.x}, ${this.y})`)
        }
        
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
