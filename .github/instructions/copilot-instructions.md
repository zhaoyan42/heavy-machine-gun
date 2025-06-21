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

## AI友好的文件和目录结构

为了便于AI进行代码分析、理解和编写，项目的文件和目录结构应遵循以下原则：

### 结构组织原则
1. **功能分组**: 相关功能的文件放在同一目录下
   - `entities/`: 所有游戏实体类 (Player, Enemy, Bullet, PowerUp)
   - `scenes/`: 游戏场景文件 (GameScene)
   - `utils/`: 工具和辅助函数 (GameUtils)

2. **清晰命名**: 文件名应直接反映其功能和内容
   - 避免缩写和模糊命名
   - 使用描述性的名称，如 `Player.js` 而不是 `p.js`

3. **单一职责**: 每个文件应该有明确的单一职责
   - 一个类一个文件
   - 相关的常量和配置可以组织在专门的配置文件中

4. **层级深度控制**: 目录层级不宜过深，一般不超过3层
   - 便于AI快速定位和理解项目结构
   - 减少路径复杂度

5. **文档和代码同步**: 在关键目录下提供README.md说明
   - 解释该目录的用途和文件组织逻辑
   - 便于AI理解项目架构和设计意图

### 推荐的项目结构
```
src/
├── entities/           # 游戏实体类
│   ├── Player.js      # 玩家类
│   ├── Enemy.js       # 敌人类
│   ├── Bullet.js      # 子弹类
│   └── PowerUp.js     # 道具类
├── scenes/            # 游戏场景
│   └── GameScene.js   # 主游戏场景
├── utils/             # 工具和辅助函数
│   └── GameUtils.js   # 游戏工具函数
├── config/            # 配置文件（如需要）
└── assets/            # 资源相关代码（如需要）
```

### AI分析优化建议
- **代码注释**: 在类和方法上添加清晰的JSDoc注释
- **类型提示**: 在关键参数和返回值上添加类型说明
- **常量集中**: 将配置常量集中管理，便于AI理解游戏平衡参数
- **模块依赖**: 明确标注模块间的依赖关系
- **文件大小控制**: 遵循AI友好的文件行数限制

## 文件大小和复杂度控制

为了便于AI进行有效的代码分析、理解和编辑，每个文件的代码行数应遵循以下规则：

### 文件行数限制
1. **核心实体类**: 200-400行
   - 如 `Player.js`, `Enemy.js`, `Bullet.js`
   - 包含完整的类定义、方法和必要注释
   - 超过400行时考虑拆分功能模块

2. **场景类**: 300-500行
   - 如 `GameScene.js`
   - 包含场景初始化、游戏循环和事件处理
   - 复杂场景可拆分为多个子场景或管理器

3. **工具类**: 100-200行
   - 如 `GameUtils.js`
   - 包含相关的工具函数和常量
   - 按功能分组，避免单一文件过多不相关函数

4. **配置文件**: 50-150行
   - 游戏配置、常量定义等
   - 结构清晰，便于参数调整

### 拆分原则
当文件超过建议行数时，考虑以下拆分策略：

1. **功能模块拆分**
   ```javascript
   // 原文件：Player.js (>400行)
   // 拆分为：
   // - Player.js (核心类定义)
   // - PlayerController.js (控制逻辑)
   // - PlayerAnimations.js (动画管理)
   ```

2. **状态管理拆分**
   ```javascript
   // 原文件：GameScene.js (>500行)
   // 拆分为：
   // - GameScene.js (主场景)
   // - GameStateManager.js (状态管理)
   // - UIManager.js (界面管理)
   ```

3. **配置分离**
   ```javascript
   // 从实体类中分离配置
   // - GameConfig.js (游戏配置)
   // - EntityConfig.js (实体参数)
   // - UIConfig.js (界面配置)
   ```

### AI分析优化考虑
- **单次读取完整性**: 文件大小适中，AI可一次性读取全部内容
- **上下文理解**: 相关代码在同一文件中，便于AI理解关联关系
- **编辑范围控制**: 修改范围明确，减少意外影响其他功能
- **依赖关系清晰**: 模块间依赖简单明确，便于AI分析影响范围

### 代码密度建议
- **有效代码比例**: 60-80% (排除空行和注释)
- **注释覆盖率**: 20-30% (包含JSDoc和行内注释)
- **空行使用**: 适当的空行分隔逻辑块，提高可读性
