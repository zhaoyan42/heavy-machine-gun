import Phaser from 'phaser'

export default class Enemy extends Phaser.Physics.Arcade.Sprite {    constructor(scene, x, y, speed = null, hp = null) {
        super(scene, x, y, 'enemy')
        
        // 添加到场景和物理系统
        scene.add.existing(this)
        scene.physics.add.existing(this)
        
        // 设置物理属性
        this.setCollideWorldBounds(false) // 允许敌人移出屏幕
          // 敌人属性 - 使用传入的参数或默认值
        this.speed = speed || Phaser.Math.Between(100, 200) // 随机速度
        this.health = hp || 1
        this.maxHp = hp || 1  // 最大血量
        this.currentHp = hp || 1  // 当前血量 
        this.points = 10
        this.scoreValue = 10  // 分数值属性
        
        // 侧边生成相关属性
        this.isFromSide = false
        this.sideSpawnTargetX = 0
        this.hasReachedTarget = false
        
        // 设置初始移动
        this.setupInitialMovement(x, y)
        
        // 设置碰撞体积
        this.setSize(30, 30)
        
        // 添加旋转效果
        this.rotationSpeed = Phaser.Math.Between(-2, 2)
        
        console.log('👾 敌人生成')
    }
    
    /**
     * 设置初始移动模式
     */
    setupInitialMovement(x, y) {
        if (this.isFromSide && this.sideSpawnTargetX > 0) {
            // 侧边生成的敌人先横向移动到目标位置
            const directionX = this.sideSpawnTargetX > x ? 1 : -1
            this.setVelocityX(this.speed * 0.8 * directionX)
            this.setVelocityY(this.speed * 0.3) // 缓慢下移
        } else {
            // 普通从顶部生成的敌人
            this.setVelocityY(this.speed)
            
            // 随机添加一些水平移动
            const horizontalSpeed = Phaser.Math.Between(-50, 50)
            this.setVelocityX(horizontalSpeed)
        }
    }
      update() {
        // 旋转效果
        this.rotation += this.rotationSpeed * 0.01
        
        // 侧边生成敌人的特殊移动逻辑
        if (this.isFromSide && !this.hasReachedTarget) {
            const targetDistance = Math.abs(this.x - this.sideSpawnTargetX)
            if (targetDistance < 20) {
                // 到达目标位置，切换为向下移动
                this.hasReachedTarget = true
                this.setVelocityX(Phaser.Math.Between(-30, 30)) // 轻微水平移动
                this.setVelocityY(this.speed) // 正常向下速度
            }
        }
        
        // 边界检测 - 如果触碰左右边界则反弹（只对非侧边生成的敌人）
        if (!this.isFromSide || this.hasReachedTarget) {
            if (this.x <= 0 || this.x >= this.scene.cameras.main.width) {
                this.setVelocityX(-this.body.velocity.x)
            }
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
        // 在销毁前检查scene是否存在，并创建爆炸效果
        if (this.scene && this.scene.add) {
            this.createExplosionEffect()
        }
        
        // 调用父类的destroy方法
        super.destroy()
    }
    
    createExplosionEffect() {
        // 安全检查：确保scene和add方法存在
        if (!this.scene || !this.scene.add) {
            console.warn('⚠️ 无法创建爆炸效果：scene不可用')
            return
        }
        
        // 创建简单的爆炸粒子效果
        const particles = this.scene.add.particles(this.x, this.y, 'enemy', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            quantity: 8
        })          // 1秒后移除粒子效果（使用安全检查）
        if (this.scene && this.scene.time) {
            this.scene.time.delayedCall(1000, () => {
                if (particles && !particles.destroyed) {
                    particles.destroy()
                }
            })
        }
    }
}
