import Phaser from 'phaser'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy')
        
        // 添加到场景和物理系统
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false) // 允许敌人移出屏幕
        
        // 敌人属性
        this.speed = Phaser.Math.Between(100, 200) // 随机速度
        this.health = 1
        this.points = 10
        
        // 设置初始速度（向下移动）
        this.setVelocityY(this.speed)
        
        // 随机添加一些水平移动
        const horizontalSpeed = Phaser.Math.Between(-50, 50)
        this.setVelocityX(horizontalSpeed)
        
        // 设置碰撞体积
        this.setSize(30, 30)
        
        // 添加旋转效果
        this.rotationSpeed = Phaser.Math.Between(-2, 2)
        
        console.log('👾 敌人生成')
    }
    
    update() {
        // 旋转效果
        this.rotation += this.rotationSpeed * 0.01
        
        // 边界检测 - 如果触碰左右边界则反弹
        if (this.x <= 0 || this.x >= this.scene.cameras.main.width) {
            this.setVelocityX(-this.body.velocity.x)
        }
    }
    
    takeDamage(damage = 1) {
        this.health -= damage
        
        if (this.health <= 0) {
            this.destroy()
            return true // 敌人被摧毁
        }
        
        return false // 敌人仍然存活
    }
    
    destroy() {
        // 创建爆炸效果
        this.createExplosionEffect()
        
        // 调用父类的destroy方法
        super.destroy()
    }
    
    createExplosionEffect() {
        // 创建简单的爆炸粒子效果
        const particles = this.scene.add.particles(this.x, this.y, 'enemy', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            quantity: 8
        })
        
        // 1秒后移除粒子效果
        this.scene.time.delayedCall(1000, () => {
            particles.destroy()
        })
    }
}
