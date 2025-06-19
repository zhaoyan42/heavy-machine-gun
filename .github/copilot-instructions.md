<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 重机枪游戏 - Copilot 开发指南

这是一个基于Phaser.js开发的竖版射击游戏项目。

## 项目信息

- **游戏类型**: 竖版射击游戏（Vertical Shooting Game）
- **技术栈**: Phaser.js + Vite + JavaScript ES6+
- **目标平台**: Web浏览器（特别优化移动设备）
- **设计理念**: 简单易玩，支持触屏操作

## 代码规范

1. **使用ES6+语法**: 包括箭头函数、解构赋值、模板字符串等
2. **模块化设计**: 每个游戏实体都是独立的类文件
3. **命名规范**: 
   - 类名使用PascalCase (如: `GameScene`, `Player`)
   - 方法和变量使用camelCase (如: `fireBullet`, `targetX`)
   - 常量使用UPPER_CASE (如: `GAME_WIDTH`, `FIRE_RATE`)

## 游戏架构

### 场景系统
- `GameScene.js`: 主游戏场景，管理游戏逻辑和状态

### 实体系统
- `Player.js`: 玩家角色，处理移动、射击和道具效果
- `Enemy.js`: 敌人实体，包含AI行为和生命值系统
- `Bullet.js`: 子弹实体，处理飞行和击中效果
- `PowerUp.js`: 道具系统，提供各种增强效果

### 工具系统
- `GameUtils.js`: 通用工具函数，包含数学计算、本地存储等

## 开发指导原则

1. **移动优先**: 所有功能都应考虑移动设备的使用体验
2. **性能优化**: 注意对象池、内存管理和渲染优化
3. **用户体验**: 提供即时反馈，如粒子效果、震屏等
4. **可扩展性**: 新功能应易于集成，不破坏现有架构

## 常用Phaser.js模式

```javascript
// 创建精灵
const sprite = this.add.sprite(x, y, 'texture')

// 物理体
this.physics.add.existing(sprite)

// 输入处理
this.input.on('pointerdown', callback)

// 定时器
this.time.addEvent({
    delay: 1000,
    callback: callback,
    loop: true
})

// 补间动画
this.tweens.add({
    targets: sprite,
    x: newX,
    duration: 1000
})
```

## 游戏设计要点

- **屏幕尺寸**: 414x736 (iPhone Plus尺寸)，支持自适应缩放
- **控制方式**: 触屏点击移动 + 自动射击
- **难度曲线**: 基于分数的动态难度调整
- **视觉反馈**: 粒子效果、震屏、颜色变化等

## 调试提示

- 使用 `console.log` 添加调试信息，包含表情符号便于识别
- 通过 `window.game` 访问游戏实例进行调试
- Phaser的debug模式可以显示物理边界

## 性能建议

- 及时销毁超出屏幕的对象
- 使用对象池管理频繁创建/销毁的对象
- 避免在update循环中进行复杂计算
- 使用纹理图集减少WebGL调用
