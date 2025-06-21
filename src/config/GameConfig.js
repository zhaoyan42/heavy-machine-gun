/**
 * 游戏配置文件
 * 包含所有游戏相关的常量和配置参数
 */

// 游戏基础配置
export const GAME_CONFIG = {
    WIDTH: 414,
    HEIGHT: 736,
    BACKGROUND_COLOR: '#000000'
}

// 玩家配置
export const PLAYER_CONFIG = {
    INITIAL_LIVES: 3,
    MOVE_SPEED: 300,
    FIRE_RATE: 200, // 毫秒
    INVINCIBILITY_TIME: 500 // 无敌时间
}

// 敌人配置
export const ENEMY_CONFIG = {
    BASE_SPAWN_DELAY: 2000, // 基础生成间隔(毫秒)
    MIN_SPAWN_DELAY: 500,   // 最小生成间隔
    SPAWN_DELAY_DECREASE: 50, // 每级减少的生成间隔
    BASE_SPEED: 100,        // 基础移动速度
    SPEED_INCREASE: 20,     // 每级增加的速度
    BASE_HP: 1,             // 基础血量
    HP_INCREASE_LEVEL: 5,   // 每多少级增加血量
    SCORE_VALUE: 10         // 击败得分
}

// 道具配置
export const POWERUP_CONFIG = {
    BASE_SPAWN_CHANCE: 0.4,         // 基础生成概率 (40%) - 大幅提升
    SPAWN_CHANCE_INCREASE: 0.06,    // 每级增加的生成概率 (6%) - 提升增长速度
    MAX_SPAWN_CHANCE: 0.85,         // 最大生成概率 (85%) - 提升上限
      BASE_SPAWN_DELAY: 5000,         // 基础生成间隔(毫秒) - 从8秒减少到5秒
    SPAWN_DELAY_DECREASE: 500,      // 每级减少的生成间隔(毫秒)
    MIN_SPAWN_DELAY: 1200,          // 最小生成间隔(毫秒) - 从1.5秒减少到1.2秒
    
    FALL_SPEED: 150,                // 下落速度
      // 各种道具效果持续时间
    MULTI_SHOT_DURATION: 5000,     // 多重射击持续时间
    SHIELD_DURATION: 8000,         // 护盾持续时间
    EXTRA_POINTS_VALUE: 50,        // 额外分数
    EXTRA_LIFE_VALUE: 1,           // 额外生命
    
    // 高等级道具增强配置
    LEVEL_DURATION_BONUS: 300,     // 每级增加的持续时间(毫秒)
    MAX_DURATION_BONUS: 3000,      // 最大额外持续时间(毫秒)
    HIGH_LEVEL_POINTS_BONUS: 10,   // 高等级时额外分数奖励(每级)
    
    // 难度相关的道具权重调整
    DIFFICULTY_BONUS_MULTIPLIER: 1.3  // 高难度时道具效果增强倍数
}

// 分数和等级配置
export const SCORING_CONFIG = {
    ENEMY_KILL_POINTS: 10,
    LEVEL_UP_THRESHOLD: 1000,  // 每1000分升级（保留作为备用）
    COMBO_MULTIPLIER: 1.5,     // 连击倍数
    
    // 新的基于敌人数量的升级系统
    ENEMIES_PER_LEVEL: 10,     // 每击败10个敌人升级
    LEVEL_DIFFICULTY_INCREASE: 2  // 每级增加需要击败的敌人数
}

// 视觉效果配置
export const EFFECTS_CONFIG = {
    HIT_EFFECT_DURATION: 200,
    FLASH_DURATION: 100,
    SHAKE_INTENSITY: 0.003,        // 完全禁用震动效果
    PARTICLE_COUNT: 3          // 保持粒子效果作为视觉反馈
}

// 调试配置
export const DEBUG_CONFIG = {
    SHOW_COLLISION_BOUNDS: false,
    SHOW_FPS: false,
    LOG_ENEMY_SPAWN: true,
    LOG_POWERUP_SPAWN: true
}
