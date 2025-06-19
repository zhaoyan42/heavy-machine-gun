import Phaser from 'phaser'

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player')
        
        // 添加到场景（不使用物理系统）
        scene.add.existing(this)
        
        // 玩家属性
        this.speed = 300
        this.targetX = x
        this.fireRate = 200 // 射击间隔（毫秒）
        this.lastFired = 0
        
        console.log('👤 玩家创建成功')
    }
    
    update() {
        const currentTime = this.scene.time.now
        
        // 移动控制
        this.handleMovement()
        
        // 自动射击
        this.handleShooting(currentTime)
    }
      handleMovement() {
        // 键盘控制
        if (this.scene.cursors.left.isDown) {
            this.x -= this.speed * (1/60) // 基于帧率的移动
        } else if (this.scene.cursors.right.isDown) {
            this.x += this.speed * (1/60)
        } else {
            // 鼠标/触屏控制 - 平滑移动到目标位置
            const distance = this.targetX - this.x
            
            if (Math.abs(distance) > 5) {
                const direction = distance > 0 ? 1 : -1
                this.x += direction * this.speed * (1/60)
            }
        }
        
        // 限制在屏幕范围内
        this.x = Phaser.Math.Clamp(this.x, 20, this.scene.cameras.main.width - 20)
    }
      handleShooting(currentTime) {
        // 自动射击
        if (currentTime - this.lastFired > this.fireRate) {
            console.log(`🔥 玩家射击！时间: ${currentTime}`)
            this.fire()
            this.lastFired = currentTime
        }
    }
    
    fire() {
        // 在玩家位置上方发射子弹
        console.log(`💥 调用fireBullet - 玩家位置: (${this.x}, ${this.y})`)
        this.scene.fireBullet(this.x, this.y - 20)
    }
    
    setTargetX(x) {
        // 限制目标位置在屏幕范围内
        this.targetX = Phaser.Math.Clamp(x, 20, this.scene.cameras.main.width - 20)
    }
    
    // 道具效果方法
    increaseFireRate() {
        this.fireRate = Math.max(100, this.fireRate - 50)
        console.log(`🔥 射击速度提升！当前间隔: ${this.fireRate}ms`)
    }
    
    increaseSpeed() {
        this.speed = Math.min(500, this.speed + 50)
        console.log(`⚡ 移动速度提升！当前速度: ${this.speed}`)
    }
}
