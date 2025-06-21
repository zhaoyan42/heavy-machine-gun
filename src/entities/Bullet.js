import Phaser from 'phaser'

export default class Bullet extends Phaser.Physics.Arcade.Sprite {    constructor(scene, x, y, angle = -Math.PI / 2) {
        super(scene, x, y, 'bullet')
        
        // 子弹属性
        this.speed = 500
        this.damage = 1
        this.angle = angle // 保存射击角度
        
        // 添加到场景
        scene.add.existing(this)
        
        // 添加到物理系统
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false)
        
        // 设置碰撞体积
        this.setSize(4, 12)
          console.log(`🔍 子弹物理体检查:`, this.body ? '存在' : '不存在')        
        // 根据角度计算速度分量
        // 在Phaser中：角度0是向右，-Math.PI/2是向上，Math.PI是向左，Math.PI/2是向下
        // 正确的公式：x = cos(angle), y = sin(angle)，但Y轴向上需要取负值
        const velocityX = Math.cos(this.angle) * this.speed
        const velocityY = Math.sin(this.angle) * this.speed
        
        // 设置初始速度（考虑角度）
        if (this.body) {
            this.setVelocity(velocityX, velocityY)
            console.log(`💥 子弹创建成功 - 位置: (${this.x}, ${this.y}), 角度: ${(this.angle * 180 / Math.PI).toFixed(1)}°, 速度: (${this.body.velocity.x.toFixed(1)}, ${this.body.velocity.y.toFixed(1)})`)
        } else {
            console.error('❌ 子弹物理体创建失败，尝试手动设置位置')
            // 如果物理体不存在，尝试手动更新位置
            this.isManualMove = true
            this.velocityX = velocityX
            this.velocityY = velocityY
        }
        
        // 添加轻微的光效
        this.setTint(0xffff00)
    }      update() {
        // 如果物理体不存在，手动更新位置
        if (this.isManualMove) {
            this.x += this.velocityX * (1/60) // 假设60FPS
            this.y += this.velocityY * (1/60)
        }
        
        // 调试信息：每30帧打印一次位置
        if (!this.debugCounter) this.debugCounter = 0
        this.debugCounter++
        if (this.debugCounter % 30 === 0) {
            console.log(`🎯 子弹位置更新: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`)
        }
        
        // 如果子弹移出屏幕边界，则销毁
        if (this.y < -50 || this.y > this.scene.cameras.main.height + 50 || 
            this.x < -50 || this.x > this.scene.cameras.main.width + 50) {
            console.log(`🗑️ 子弹销毁 - 位置: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`)
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
