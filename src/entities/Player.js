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
    }    handleShooting(currentTime) {
        // 检查游戏是否结束，如果结束则停止射击
        if (this.scene.isGameOver) {
            return
        }
        
        // 自动射击
        if (currentTime - this.lastFired > this.fireRate) {
            console.log(`🔥 玩家射击！时间: ${currentTime}`)
            this.fire()
            this.lastFired = currentTime
        }
    }fire() {
        // 在玩家位置上方发射子弹
        console.log(`💥 调用fireBullet - 玩家位置: (${this.x}, ${this.y})`)
        
        if (this.isMultiShotActive()) {
            // 散射效果：发射5发子弹，30度角度范围
            const baseAngle = -90 // 向上射击（-90度）
            const spreadAngle = 30 // 总散射角度
            const bulletCount = 5
            
            for (let i = 0; i < bulletCount; i++) {
                // 计算每发子弹的角度偏移
                const angleOffset = (spreadAngle / (bulletCount - 1)) * i - (spreadAngle / 2)
                const bulletAngle = baseAngle + angleOffset
                
                // 发射有角度的子弹
                this.scene.fireBullet(this.x, this.y - 20, bulletAngle)
            }
        } else {
            // 普通子弹：发射1发，直线向上
            this.scene.fireBullet(this.x, this.y - 20)
        }
    }
    
    setTargetX(x) {
        // 限制目标位置在屏幕范围内
        this.targetX = Phaser.Math.Clamp(x, 20, this.scene.cameras.main.width - 20)
    }

    /**
     * 移动到指定位置
     */
    moveTo(x, y) {
        this.setTargetX(x)
    }

    // 道具效果方法
    increaseFireRate() {
        this.fireRate = Math.max(50, this.fireRate - 30)
        console.log(`🔥 射击速度提升！当前间隔: ${this.fireRate}ms`)
    }
    
    increaseSpeed() {
        this.speed = Math.min(500, this.speed + 50)
        console.log(`⚡ 移动速度提升！当前速度: ${this.speed}`)
    }    // 散射子弹效果
    enableMultiShot() {
        if (!this.multiShot) {
            // 只有当前没有散射效果时才激活
            this.multiShot = true
            this.multiShotDuration = 15000 // 增加到15秒持续时间
            this.multiShotStartTime = this.scene.time.now
            console.log(`🎯 五重散射激活！持续15秒`)
        } else {
            // 如果已经有散射效果，延长持续时间
            this.multiShotDuration += 8000 // 延长8秒
            console.log(`🎯 五重散射效果延长！再延长8秒`)
        }
    }      // 护盾效果
    activateShield() {
        if (!this.shieldActive) {
            // 只有当前没有护盾效果时才激活
            this.shieldActive = true
            this.shieldDuration = 12000 // 增加到12秒持续时间
            this.shieldStartTime = this.scene.time.now
            this.setTint(0x00ffff) // 蓝色表示护盾
            console.log(`🛡️ 护盾激活！持续12秒`)
        } else {
            // 如果已经有护盾效果，延长持续时间
            this.shieldDuration += 6000 // 延长6秒
            console.log(`🛡️ 护盾效果延长！再延长6秒`)
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
      // 检查散射是否还有效
    isMultiShotActive() {
        if (this.multiShot && this.scene.time.now - this.multiShotStartTime > this.multiShotDuration) {
            this.multiShot = false
            console.log(`🎯 五重散射效果结束`)
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
