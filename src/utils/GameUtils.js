// 游戏工具类 - 包含常用的游戏功能函数

export default class GameUtils {
    
    // 生成随机数（包含最小值和最大值）
    static randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    
    // 生成随机浮点数
    static randomFloatBetween(min, max) {
        return Math.random() * (max - min) + min
    }
    
    // 计算两点间距离
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1
        const dy = y2 - y1
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    // 角度转弧度
    static degToRad(degrees) {
        return degrees * (Math.PI / 180)
    }
    
    // 弧度转角度
    static radToDeg(radians) {
        return radians * (180 / Math.PI)
    }
    
    // 限制数值在指定范围内
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
    
    // 线性插值
    static lerp(start, end, factor) {
        return start + (end - start) * factor
    }
    
    // 检查点是否在矩形内
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
    }
    
    // 检查两个矩形是否重叠
    static rectOverlap(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return r1x < r2x + r2w && r1x + r1w > r2x && r1y < r2y + r2h && r1y + r1h > r2y
    }
    
    // 格式化分数显示（添加千分位分隔符）
    static formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    // 根据分数计算等级
    static calculateLevel(score) {
        return Math.floor(score / 1000) + 1
    }
    
    // 根据等级计算敌人生成间隔
    static getEnemySpawnDelay(level) {
        const baseDelay = 2000
        const reduction = (level - 1) * 100
        return Math.max(500, baseDelay - reduction)
    }
    
    // 根据等级计算敌人速度
    static getEnemySpeed(level) {
        const baseSpeed = 100
        const increase = (level - 1) * 20
        return Math.min(300, baseSpeed + increase)
    }
    
    // 创建简单的颜色渐变
    static interpolateColor(color1, color2, factor) {
        const r1 = (color1 >> 16) & 0xff
        const g1 = (color1 >> 8) & 0xff
        const b1 = color1 & 0xff
        
        const r2 = (color2 >> 16) & 0xff
        const g2 = (color2 >> 8) & 0xff
        const b2 = color2 & 0xff
        
        const r = Math.round(r1 + (r2 - r1) * factor)
        const g = Math.round(g1 + (g2 - g1) * factor)
        const b = Math.round(b1 + (b2 - b1) * factor)
        
        return (r << 16) | (g << 8) | b
    }
    
    // 震屏效果
    static screenShake(scene, intensity = 10, duration = 100) {
        if (scene.cameras && scene.cameras.main) {
            scene.cameras.main.shake(duration, intensity)
        }
    }
    
    // 保存最高分到本地存储
    static saveHighScore(score) {
        const currentHigh = this.getHighScore()
        if (score > currentHigh) {
            localStorage.setItem('heavyMachineGun_highScore', score.toString())
            return true // 新纪录
        }
        return false
    }
    
    // 获取最高分
    static getHighScore() {
        const saved = localStorage.getItem('heavyMachineGun_highScore')
        return saved ? parseInt(saved, 10) : 0
    }
    
    // 保存游戏设置
    static saveSettings(settings) {
        localStorage.setItem('heavyMachineGun_settings', JSON.stringify(settings))
    }
    
    // 获取游戏设置
    static getSettings() {
        const saved = localStorage.getItem('heavyMachineGun_settings')
        return saved ? JSON.parse(saved) : {
            soundEnabled: true,
            musicEnabled: true,
            vibrationEnabled: true
        }
    }
    
    // 检测是否为移动设备
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }
    
    // 检测是否支持触摸
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args)
                inThrottle = true
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }
}
