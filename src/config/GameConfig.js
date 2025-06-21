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
    SPAWN_CHANCE: 0.25,     // 生成概率 (从0.1提升到0.25，增加150%)
    SPAWN_DELAY: 8000,      // 生成间隔(毫秒) (从15秒减少到8秒)
    FALL_SPEED: 150,        // 下落速度
    
    // 各种道具效果持续时间
    MULTI_SHOT_DURATION: 5000,    // 多重射击持续时间
    SHIELD_DURATION: 8000,        // 护盾持续时间
    EXTRA_POINTS_VALUE: 50,       // 额外分数
    EXTRA_LIFE_VALUE: 1           // 额外生命
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
