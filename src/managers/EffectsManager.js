/**
 * 视觉效果管理器
 * 负责管理游戏中的所有视觉效果，如粒子效果、动画等
 */

import { EFFECTS_CONFIG } from '../config/GameConfig.js'

export default class EffectsManager {
    constructor(scene) {
        this.scene = scene
        this.createEffectTextures()
    }

    /**
     * 创建效果用的纹理
     */
    createEffectTextures() {
        // 创建粒子纹理
        this.scene.add.graphics()
            .fillStyle(0xffffff)
            .fillCircle(4, 4, 4)
            .generateTexture('particle', 8, 8)

        // 创建爆炸效果纹理
        this.scene.add.graphics()
            .fillStyle(0xff6600)
            .fillCircle(8, 8, 8)
            .generateTexture('explosion', 16, 16)

        // 创建收集效果纹理
        this.scene.add.graphics()
            .fillStyle(0x00ff00)
            .fillStar(8, 8, 5, 4, 8, 0)
            .generateTexture('collect', 16, 16)
    }

    /**
     * 创建击中效果
     */
    createHitEffect(x, y) {
        // 粒子爆炸
        for (let i = 0; i < EFFECTS_CONFIG.PARTICLE_COUNT; i++) {
            const particle = this.scene.add.sprite(x, y, 'particle')
            particle.setTint(Phaser.Math.Between(0xff0000, 0xffff00))
            
            const angle = (i / EFFECTS_CONFIG.PARTICLE_COUNT) * Math.PI * 2
            const speed = Phaser.Math.Between(50, 150)
            const velocityX = Math.cos(angle) * speed
            const velocityY = Math.sin(angle) * speed
            
            this.scene.tweens.add({
                targets: particle,
                x: x + velocityX,
                y: y + velocityY,
                alpha: 0,
                scale: 0,
                duration: EFFECTS_CONFIG.HIT_EFFECT_DURATION,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            })
        }

        // 冲击波效果
        const shockwave = this.scene.add.circle(x, y, 5, 0xffffff, 0.8)
        this.scene.tweens.add({
            targets: shockwave,
            radius: 50,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => shockwave.destroy()
        })
    }

    /**
     * 创建死亡效果
     */
    createDeathEffect(x, y) {
        // 爆炸效果
        const explosion = this.scene.add.sprite(x, y, 'explosion')
        explosion.setScale(0.5)
        
        this.scene.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        })

        // 粒子效果
        for (let i = 0; i < EFFECTS_CONFIG.PARTICLE_COUNT * 2; i++) {
            const particle = this.scene.add.sprite(x, y, 'particle')
            particle.setTint(Phaser.Math.Between(0xff4444, 0xffaa44))
            
            const angle = Math.random() * Math.PI * 2
            const speed = Phaser.Math.Between(100, 300)
            const velocityX = Math.cos(angle) * speed
            const velocityY = Math.sin(angle) * speed
            
            this.scene.tweens.add({
                targets: particle,
                x: x + velocityX,
                y: y + velocityY,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(400, 800),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            })
        }

        // 屏幕震动
        this.createScreenShake()
    }

    /**
     * 创建收集效果
     */
    createCollectEffect(x, y) {
        // 星星收集效果
        for (let i = 0; i < 8; i++) {
            const star = this.scene.add.sprite(x, y, 'collect')
            star.setTint(0x00ff88)
            star.setScale(0.5)
            
            const angle = (i / 8) * Math.PI * 2
            const distance = 30
            const targetX = x + Math.cos(angle) * distance
            const targetY = y + Math.sin(angle) * distance
            
            this.scene.tweens.add({
                targets: star,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 1.5,
                duration: 500,
                ease: 'Power2',
                onComplete: () => star.destroy()
            })
        }

        // 向上飘动的分数文本
        const scoreText = this.scene.add.text(x, y, '+道具', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        scoreText.setOrigin(0.5)

        this.scene.tweens.add({
            targets: scoreText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => scoreText.destroy()
        })
    }

    /**
     * 创建升级效果
     */
    createLevelUpEffect() {
        const centerX = this.scene.cameras.main.width / 2
        const centerY = this.scene.cameras.main.height / 2

        // 升级文本
        const levelUpText = this.scene.add.text(centerX, centerY, 'LEVEL UP!', {
            fontSize: '48px',
            color: '#ffff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#ff0000',
            strokeThickness: 4
        })
        levelUpText.setOrigin(0.5)
        levelUpText.setScrollFactor(0)

        // 闪烁和缩放效果
        this.scene.tweens.add({
            targets: levelUpText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => levelUpText.destroy()
        })

        // 粒子爆炸
        for (let i = 0; i < 20; i++) {
            const particle = this.scene.add.sprite(centerX, centerY, 'particle')
            particle.setTint(0xffff00)
            particle.setScrollFactor(0)
            
            const angle = (i / 20) * Math.PI * 2
            const speed = Phaser.Math.Between(200, 400)
            const velocityX = Math.cos(angle) * speed
            const velocityY = Math.sin(angle) * speed
            
            this.scene.tweens.add({
                targets: particle,
                x: centerX + velocityX,
                y: centerY + velocityY,
                alpha: 0,
                scale: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            })
        }

        // 屏幕闪光
        this.createScreenFlash(0xffff00)
    }

    /**
     * 创建屏幕震动效果
     */
    createScreenShake() {
        this.scene.cameras.main.shake(
            200, // 持续时间
            EFFECTS_CONFIG.SHAKE_INTENSITY // 强度
        )
    }

    /**
     * 创建屏幕闪光效果
     */
    createScreenFlash(color = 0xffffff, alpha = 0.5) {
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            color,
            alpha
        )
        flash.setScrollFactor(0)

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: EFFECTS_CONFIG.FLASH_DURATION,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        })
    }

    /**
     * 创建血迹效果
     */
    createBloodEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            const blood = this.scene.add.circle(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                Phaser.Math.Between(2, 6),
                0x990000
            )
            
            this.scene.tweens.add({
                targets: blood,
                alpha: 0,
                y: blood.y + 30,
                duration: Phaser.Math.Between(500, 1000),
                ease: 'Power2',
                onComplete: () => blood.destroy()
            })
        }
    }

    /**
     * 创建轨迹效果
     */
    createTrailEffect(startX, startY, endX, endY, color = 0xffffff) {
        const trail = this.scene.add.line(0, 0, startX, startY, endX, endY, color)
        trail.setLineWidth(2)
        trail.setAlpha(0.8)

        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => trail.destroy()
        })
    }

    /**
     * 清理所有效果
     */
    destroy() {
        // 这里可以添加清理逻辑，如果需要的话
    }
}
