/**
 * UI管理器
 * 负责管理游戏中的所有UI元素和界面显示
 */

import { GAME_CONFIG } from '../config/GameConfig.js'

export default class UIManager {
    constructor(scene) {
        this.scene = scene
          // UI元素
        this.scoreText = null
        this.livesText = null
        this.levelText = null
        this.speedText = null        // 新增：移动速度显示
        this.fireRateText = null     // 新增：射击速度显示
        this.multiShotText = null    // 新增：多重射击状态显示
        this.shieldText = null       // 新增：护盾状态显示
        this.gameOverText = null
        this.restartText = null
        this.debugText = null
        
        this.createUI()
    }

    /**
     * 创建所有UI元素
     */
    createUI() {
        this.createGameUI()
        this.createDebugUI()
    }    /**
     * 创建游戏主界面UI
     */
    createGameUI() {
        // 分数显示
        this.scoreText = this.scene.add.text(16, 16, '分数: 0', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.scoreText.setScrollFactor(0)

        // 生命值显示
        this.livesText = this.scene.add.text(16, 50, '生命: 3', {
            fontSize: '24px',
            color: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.livesText.setScrollFactor(0)

        // 等级显示
        this.levelText = this.scene.add.text(16, 84, '等级: 1', {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.levelText.setScrollFactor(0)

        // 移动速度显示
        this.speedText = this.scene.add.text(16, 118, '速度: 300', {
            fontSize: '20px',
            color: '#00ff88',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.speedText.setScrollFactor(0)

        // 射击速度显示
        this.fireRateText = this.scene.add.text(16, 148, '射击: 200ms', {
            fontSize: '20px',
            color: '#ff8800',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.fireRateText.setScrollFactor(0)

        // 多重射击状态显示
        this.multiShotText = this.scene.add.text(16, 178, '', {
            fontSize: '18px',
            color: '#ff00ff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.multiShotText.setScrollFactor(0)

        // 护盾状态显示
        this.shieldText = this.scene.add.text(16, 208, '', {
            fontSize: '18px',
            color: '#00ffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        })
        this.shieldText.setScrollFactor(0)
    }    /**
     * 创建调试UI
     */
    createDebugUI() {
        // 隐藏调试信息，不再显示第二个状态栏
        this.debugText = this.scene.add.text(16, GAME_CONFIG.HEIGHT - 100, '', {
            fontSize: '16px',
            color: '#00ff00',
            fontFamily: 'Arial, sans-serif'
        })
        this.debugText.setScrollFactor(0)
        this.debugText.setVisible(false) // 隐藏调试信息
    }

    /**
     * 更新分数显示
     */
    updateScore(score) {
        if (this.scoreText) {
            this.scoreText.setText(`分数: ${score}`)
        }
    }

    /**
     * 更新生命值显示
     */
    updateLives(lives) {
        if (this.livesText) {
            this.livesText.setText(`生命: ${lives}`)
            
            // 生命值低时改变颜色
            if (lives <= 1) {
                this.livesText.setColor('#ff0000')
                this.livesText.setScale(1.2)
            } else {
                this.livesText.setColor('#ff6666')
                this.livesText.setScale(1.0)
            }
        }
    }

    /**
     * 更新等级显示
     */
    updateLevel(level) {
        if (this.levelText) {
            this.levelText.setText(`等级: ${level}`)
            
            // 升级时的闪烁效果
            this.scene.tweens.add({
                targets: this.levelText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            })
        }
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo(info) {
        if (this.debugText) {
            const debugLines = [
                `FPS: ${Math.round(this.scene.game.loop.actualFps)}`,
                `敌人数量: ${this.scene.enemies.children.size}`,
                `子弹数量: ${this.scene.bullets.children.size}`,
                `道具数量: ${this.scene.powerUps.children.size}`,
                `击败敌人: ${this.scene.enemiesKilled}`,
                ...info
            ]
            this.debugText.setText(debugLines.join('\n'))
        }
    }

    /**
     * 显示游戏结束界面
     */
    showGameOver(finalScore) {
        // 半透明背景
        const overlay = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            0x000000, 
            0.7
        )
        overlay.setScrollFactor(0)

        // 游戏结束文本
        this.gameOverText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 100, 
            '游戏结束', {
                fontSize: '48px',
                color: '#ff0000',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 4
            }
        )
        this.gameOverText.setOrigin(0.5)
        this.gameOverText.setScrollFactor(0)

        // 最终分数
        const finalScoreText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 20, 
            `最终分数: ${finalScore}`, {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }
        )
        finalScoreText.setOrigin(0.5)
        finalScoreText.setScrollFactor(0)

        // 重新开始提示
        this.restartText = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 + 60, 
            '点击屏幕重新开始', {
                fontSize: '24px',
                color: '#ffff00',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }
        )
        this.restartText.setOrigin(0.5)
        this.restartText.setScrollFactor(0)

        // 闪烁效果
        this.scene.tweens.add({
            targets: this.restartText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        })
    }

    /**
     * 显示道具效果提示
     */
    showPowerUpNotification(type, duration) {
        const messages = {
            'multiShot': '多重射击激活！',
            'shield': '护盾激活！',
            'extraPoints': '获得额外分数！',
            'extraLife': '获得额外生命！'
        }

        const message = messages[type] || '道具激活！'
        
        const notification = this.scene.add.text(
            GAME_CONFIG.WIDTH / 2, 
            150, 
            message, {
                fontSize: '28px',
                color: '#00ff00',
                fontFamily: 'Arial, sans-serif',
                stroke: '#000000',
                strokeThickness: 2
            }
        )
        notification.setOrigin(0.5)
        notification.setScrollFactor(0)

        // 动画效果
        this.scene.tweens.add({
            targets: notification,
            y: 100,
            alpha: 0,
            duration: duration || 2000,
            ease: 'Power2',
            onComplete: () => {
                notification.destroy()
            }
        })
    }

    /**
     * 更新玩家速度显示
     */
    updateSpeed(speed) {
        if (this.speedText) {
            this.speedText.setText(`速度: ${speed}`)
        }
    }

    /**
     * 更新射击速度显示
     */
    updateFireRate(fireRate) {
        if (this.fireRateText) {
            this.fireRateText.setText(`射击: ${fireRate}ms`)
        }
    }

    /**
     * 更新多重射击状态显示
     */
    updateMultiShotStatus(isActive, remainingTime = 0) {
        if (this.multiShotText) {
            if (isActive) {
                const seconds = Math.ceil(remainingTime / 1000)
                this.multiShotText.setText(`🎯 多重射击: ${seconds}s`)
                this.multiShotText.setVisible(true)
            } else {
                this.multiShotText.setText('')
                this.multiShotText.setVisible(false)
            }
        }
    }

    /**
     * 更新护盾状态显示
     */
    updateShieldStatus(isActive, remainingTime = 0) {
        if (this.shieldText) {
            if (isActive) {
                const seconds = Math.ceil(remainingTime / 1000)
                this.shieldText.setText(`🛡️ 护盾: ${seconds}s`)
                this.shieldText.setVisible(true)
            } else {
                this.shieldText.setText('')
                this.shieldText.setVisible(false)
            }
        }
    }

    /**
     * 更新所有Player相关的UI显示
     */
    updatePlayerStatus(player, scene) {
        if (!player) return
        
        // 更新基础属性
        this.updateSpeed(player.speed)
        this.updateFireRate(player.fireRate)
        
        // 更新道具状态
        const currentTime = scene.time.now
        
        // 多重射击状态
        if (player.multiShot) {
            const remainingTime = Math.max(0, 
                player.multiShotDuration - (currentTime - player.multiShotStartTime)
            )
            this.updateMultiShotStatus(true, remainingTime)
        } else {
            this.updateMultiShotStatus(false)
        }
        
        // 护盾状态
        if (player.shieldActive) {
            const remainingTime = Math.max(0, 
                player.shieldDuration - (currentTime - player.shieldStartTime)
            )
            this.updateShieldStatus(true, remainingTime)
        } else {
            this.updateShieldStatus(false)
        }
    }    /**
     * 销毁所有UI元素
     */
    destroy() {
        if (this.scoreText) this.scoreText.destroy()
        if (this.livesText) this.livesText.destroy()
        if (this.levelText) this.levelText.destroy()
        if (this.speedText) this.speedText.destroy()
        if (this.fireRateText) this.fireRateText.destroy()
        if (this.multiShotText) this.multiShotText.destroy()
        if (this.shieldText) this.shieldText.destroy()
        if (this.gameOverText) this.gameOverText.destroy()
        if (this.restartText) this.restartText.destroy()
        if (this.debugText) this.debugText.destroy()
    }
}
