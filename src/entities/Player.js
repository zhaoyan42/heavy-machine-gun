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
        
        // 检查时间效果
        this.isMultiShotActive()
        this.isShieldActive()
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
        
        if (this.isMultiShotActive()) {
            // 多重子弹：发射3发子弹
            this.scene.fireBullet(this.x - 15, this.y - 20) // 左边
            this.scene.fireBullet(this.x, this.y - 20)      // 中间
            this.scene.fireBullet(this.x + 15, this.y - 20) // 右边
        } else {
            // 普通子弹：发射1发
            this.scene.fireBullet(this.x, this.y - 20)
        }
    }
    
    setTargetX(x) {
        // 限制目标位置在屏幕范围内
        this.targetX = Phaser.Math.Clamp(x, 20, this.scene.cameras.main.width - 20)
    }
      // 道具效果方法
    increaseFireRate() {
        this.fireRate = Math.max(50, this.fireRate - 30)
        console.log(`🔥 射击速度提升！当前间隔: ${this.fireRate}ms`)
    }
    
    increaseSpeed() {
        this.speed = Math.min(500, this.speed + 50)
        console.log(`⚡ 移动速度提升！当前速度: ${this.speed}`)
    }
      // 多重子弹效果
    enableMultiShot() {
        if (!this.multiShot) {
            // 只有当前没有多重子弹效果时才激活
            this.multiShot = true
            this.multiShotDuration = 10000 // 10秒持续时间
            this.multiShotStartTime = this.scene.time.now
            console.log(`🎯 多重子弹激活！持续10秒`)
        } else {
            // 如果已经有多重子弹效果，延长持续时间
            this.multiShotDuration += 5000 // 延长5秒
            console.log(`🎯 多重子弹效果延长！再延长5秒`)
        }
    }
      // 护盾效果
    activateShield() {
        if (!this.shieldActive) {
            // 只有当前没有护盾效果时才激活
            this.shieldActive = true
            this.shieldDuration = 8000 // 8秒持续时间
            this.shieldStartTime = this.scene.time.now
            this.setTint(0x00ffff) // 蓝色表示护盾
            console.log(`🛡️ 护盾激活！持续8秒`)
        } else {
            // 如果已经有护盾效果，延长持续时间
            this.shieldDuration += 4000 // 延长4秒
            console.log(`🛡️ 护盾效果延长！再延长4秒`)
        }
    }
    
    // 炸弹效果
    activateBomb() {
        console.log(`💣 炸弹激活！清除所有敌人`)
        // 这个效果需要在GameScene中实现
        return 'bomb'
    }
    
    // 恢复生命
    restoreLife() {
        console.log(`❤️ 生命恢复！`)
        return 'heal'
    }
    
    // 检查多重子弹是否还有效
    isMultiShotActive() {
        if (this.multiShot && this.scene.time.now - this.multiShotStartTime > this.multiShotDuration) {
            this.multiShot = false
            console.log(`🎯 多重子弹效果结束`)
        }
        return this.multiShot
    }
    
    // 检查护盾是否还有效
    isShieldActive() {
        if (this.shieldActive && this.scene.time.now - this.shieldStartTime > this.shieldDuration) {
            this.shieldActive = false
            this.clearTint()
            console.log(`🛡️ 护盾效果结束`)
        }
        return this.shieldActive
    }
}
