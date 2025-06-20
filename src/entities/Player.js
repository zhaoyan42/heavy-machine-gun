import Phaser from 'phaser'

export default class Player extends Phaser.GameObjects.Sprite {    constructor(scene, x, y) {
        super(scene, x, y, 'player')
        
        // 添加到场景（不使用物理系统）
        scene.add.existing(this)
        
        // 玩家属性
        this.speed = 300
        this.targetX = x
        this.fireRate = 200 // 射击间隔（毫秒）
        this.lastFired = 0
        
        // 重生和无敌状态
        this.isRespawning = false
        this.isInvincible = false
        
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
    }    handleMovement() {
        // 如果玩家正在重生，不处理移动
        if (this.isRespawning) {
            return
        }
        
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
    }handleShooting(currentTime) {
        // 检查游戏是否结束，或玩家是否正在重生，如果是则停止射击
        if (this.scene.isGameOver || this.isRespawning) {
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
            const baseAngle = -Math.PI / 2 // 向上射击（-90度，转换为弧度）
            const spreadAngle = Math.PI / 6 // 30度转换为弧度
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
    }    // 道具效果方法
    increaseFireRate() {
        const oldFireRate = this.fireRate
        this.fireRate = Math.max(50, this.fireRate - 30)
        const actualIncrease = oldFireRate - this.fireRate
        console.log(`🔥 射击速度提升！当前间隔: ${this.fireRate}ms`)
        
        // 返回实际增强值，用于判断是否达到上限
        return actualIncrease
    }
    
    increaseSpeed() {
        const oldSpeed = this.speed
        this.speed = Math.min(500, this.speed + 50)
        const actualIncrease = this.speed - oldSpeed
        console.log(`⚡ 移动速度提升！当前速度: ${this.speed}`)
        
        // 返回实际增强值，用于判断是否达到上限
        return actualIncrease
    }
      // 永久增强方法
    permanentFireRateBoost(value) {
        const oldFireRate = this.fireRate
        this.fireRate = Math.max(50, this.fireRate - value) // 最小射击间隔50ms
        const actualIncrease = oldFireRate - this.fireRate
        console.log(`🔥⭐ 永久射速增强！减少${actualIncrease}ms射击间隔 (${oldFireRate}ms → ${this.fireRate}ms)`)
        
        // 返回实际增强值，用于判断是否达到上限
        return actualIncrease
    }
    
    permanentSpeedBoost(value) {
        const oldSpeed = this.speed
        this.speed = Math.min(600, this.speed + value) // 最大移动速度600
        const actualIncrease = this.speed - oldSpeed
        console.log(`⚡⭐ 永久移动速度增强！增加${actualIncrease}速度 (${oldSpeed} → ${this.speed})`)
        
        // 返回实际增强值，用于判断是否达到上限
        return actualIncrease
    }// 散射子弹效果
    enableMultiShot() {
        let wasActive = this.multiShot
        let extensionTime = 0
        
        if (!this.multiShot) {
            // 只有当前没有散射效果时才激活
            this.multiShot = true
            this.multiShotDuration = 15000 // 增加到15秒持续时间
            this.multiShotStartTime = this.scene.time.now
            console.log(`🎯 五重散射激活！持续15秒`)
            return { enhanced: true, extensionTime: 15000 }
        } else {
            // 如果已经有散射效果，延长持续时间
            extensionTime = 8000
            this.multiShotDuration += extensionTime // 延长8秒
            console.log(`🎯 五重散射效果延长！再延长8秒`)
            return { enhanced: true, extensionTime: extensionTime }
        }
    }      // 护盾效果
    activateShield() {
        let extensionTime = 0
        
        if (!this.shieldActive) {
            // 只有当前没有护盾效果时才激活
            this.shieldActive = true
            this.shieldDuration = 12000 // 增加到12秒持续时间
            this.shieldStartTime = this.scene.time.now
            this.setTint(0x00ffff) // 蓝色表示护盾
            console.log(`🛡️ 护盾激活！持续12秒`)
            return { enhanced: true, extensionTime: 12000 }
        } else {
            // 如果已经有护盾效果，延长持续时间
            extensionTime = 6000
            this.shieldDuration += extensionTime // 延长6秒
            console.log(`🛡️ 护盾效果延长！再延长6秒`)
            return { enhanced: true, extensionTime: extensionTime }
        }
    }
      // 炸弹效果
    activateBomb() {
        console.log(`💣 炸弹激活！清除所有敌人`)
        // 这个效果需要在GameScene中实现
        return { type: 'bomb', value: 1 }
    }
      // 恢复生命
    restoreLife() {
        console.log(`❤️ 生命恢复！`)
        // 返回heal类型，让CollisionManager处理生命值增加
        return { type: 'heal', value: 1 }
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
    }    /**
     * 激活道具效果
     * @param {string} type 道具类型
     * @param {number} value 道具数值（可选）
     * @returns {object} 返回道具效果结果，包含是否增强成功和分数奖励
     */
    activatePowerUp(type, value = null) {
        console.log(`✨ 激活道具: ${type}`, value ? `值: ${value}` : '')
        
        switch (type) {
            case 'speed':
                const speedIncrease = this.increaseSpeed()
                if (speedIncrease === 0) {
                    // 速度已达上限，转为分数奖励
                    const bonusPoints = 100
                    console.log(`⚡ 速度已达上限！转为分数奖励: +${bonusPoints}`)
                    return { enhanced: false, type: 'points', value: bonusPoints, reason: '速度已达上限' }
                }
                return { enhanced: true, actualValue: speedIncrease }
                
            case 'firerate':
                const fireRateIncrease = this.increaseFireRate()
                if (fireRateIncrease === 0) {
                    // 射速已达上限，转为分数奖励
                    const bonusPoints = 120
                    console.log(`🔥 射速已达上限！转为分数奖励: +${bonusPoints}`)
                    return { enhanced: false, type: 'points', value: bonusPoints, reason: '射速已达上限' }
                }
                return { enhanced: true, actualValue: fireRateIncrease }
                
            case 'multishot':
            case 'multiShot':
                const multiShotResult = this.enableMultiShot()
                return multiShotResult
                
            case 'shield':
                const shieldResult = this.activateShield()
                return shieldResult
                
            case 'bomb':
                return this.activateBomb()
                
            case 'heal':
            case 'extraLife':
                return this.restoreLife()
                
            case 'points':
            case 'extraPoints':
                // 分数相关的道具效果由GameScene处理
                console.log(`💰 获得额外分数: ${value || 100}`)
                return { type: 'points', value: value || 100 }
                
            case 'permanentFireRate':
                const permFireRateIncrease = this.permanentFireRateBoost(value || 20)
                if (permFireRateIncrease === 0) {
                    // 永久射速已达上限，转为分数奖励
                    const bonusPoints = 200
                    console.log(`🚀 永久射速已达上限！转为分数奖励: +${bonusPoints}`)
                    return { enhanced: false, type: 'points', value: bonusPoints, reason: '永久射速已达上限' }
                }
                return { enhanced: true, actualValue: permFireRateIncrease }
                
            case 'permanentSpeed':
                const permSpeedIncrease = this.permanentSpeedBoost(value || 30)
                if (permSpeedIncrease === 0) {
                    // 永久速度已达上限，转为分数奖励
                    const bonusPoints = 150
                    console.log(`💨 永久速度已达上限！转为分数奖励: +${bonusPoints}`)
                    return { enhanced: false, type: 'points', value: bonusPoints, reason: '永久速度已达上限' }
                }
                return { enhanced: true, actualValue: permSpeedIncrease }
                
            default:
                console.warn(`⚠️ 未知道具类型: ${type}`)
                return { enhanced: false, type: 'points', value: 50, reason: '未知道具类型' }
        }
    }

    /**
     * 重置所有增强效果到初始状态
     */
    resetAllEnhancements() {
        console.log('🔄 重置玩家所有增强效果')
        
        // 重置临时效果
        this.multiShot = false
        this.shieldActive = false
        this.multiShotDuration = 0
        this.shieldDuration = 0
        this.multiShotStartTime = 0
        this.shieldStartTime = 0
        
        // 清除视觉效果
        this.clearTint()
        
        // 重置属性到初始值
        this.speed = 300
        this.fireRate = 200
        
        console.log('✅ 所有增强效果已重置到初始状态')
    }
}
