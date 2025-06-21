import { Page, expect } from '@playwright/test';

/**
 * 测试辅助工具类
 * 提供通用的测试方法和等价类验证
 */
export class GameTestHelper {
  constructor(private page: Page) {}

  /**
   * 获取页面对象（用于需要直接访问page的场景）
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * 游戏初始化等价类验证
   */
  async verifyGameInitialization() {
    // 等待页面完全加载
    await this.page.waitForLoadState('networkidle');
    
    // 检查画布存在
    const canvas = this.page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 等待游戏初始化完成
    await this.page.waitForTimeout(2000);
    
    // 检查游戏标题
    await expect(this.page).toHaveTitle(/重机枪.*射击游戏|Heavy Machine Gun/);
    
    return canvas;
  }

  /**
   * 控制台错误监控
   */
  setupErrorMonitoring() {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    this.page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    return { consoleErrors, pageErrors };
  }

  /**
   * 玩家控制等价类 - 点击移动
   */
  async testPlayerMovement(canvas: any, x: number, y: number) {
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    
    if (!box) throw new Error('未获取到canvas的boundingBox');
    
    // 计算实际点击位置
    const clickX = box.x + (box.width * x);
    const clickY = box.y + (box.height * y);
    
    await this.page.mouse.click(clickX, clickY);
    await this.page.waitForTimeout(500);
  }

  /**
   * UI元素等价类验证
   */
  async verifyUIElements() {
    // 检查基本UI元素是否存在
    const canvas = this.page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 检查页面内容
    const pageContent = await this.page.content();
    expect(pageContent).toContain('canvas');
  }

  /**
   * 游戏运行稳定性测试
   */
  async testGameStability(duration: number = 10000) {
    const startTime = Date.now();
    const canvas = this.page.locator('canvas');
    
    while (Date.now() - startTime < duration) {
      // 随机点击移动
      await this.testPlayerMovement(canvas, Math.random(), Math.random());
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * 边界值测试 - 屏幕边缘点击
   */
  async testBoundaryClicks(canvas: any) {
    const boundaries = [
      { x: 0, y: 0 },        // 左上角
      { x: 1, y: 0 },        // 右上角
      { x: 0, y: 1 },        // 左下角
      { x: 1, y: 1 },        // 右下角
      { x: 0.5, y: 0 },      // 上边中心
      { x: 0.5, y: 1 },      // 下边中心
      { x: 0, y: 0.5 },      // 左边中心
      { x: 1, y: 0.5 },      // 右边中心
    ];

    for (const boundary of boundaries) {
      await this.testPlayerMovement(canvas, boundary.x, boundary.y);
    }
  }

  /**
   * 快速连续点击测试
   */
  async testRapidClicks(canvas: any, count: number = 10) {
    const box = await canvas.boundingBox();
    if (!box) throw new Error('未获取到canvas的boundingBox');
    
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    for (let i = 0; i < count; i++) {
      await this.page.mouse.click(centerX, centerY);
      await this.page.waitForTimeout(50); // 快速点击
    }
  }

  /**
   * 检查错误状态
   */
  async checkErrorState(consoleErrors: string[], pageErrors: string[]) {
    // 过滤掉一些可能的非关键错误
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_FAILED')
    );
    
    expect(criticalErrors.length).toBe(0);
    expect(pageErrors.length).toBe(0);
  }
}

/**
 * 等价类定义
 */
export const EquivalenceClasses = {
  // 有效等价类
  VALID_CLICK_AREAS: [
    { x: 0.5, y: 0.5, description: '中心区域' },
    { x: 0.3, y: 0.3, description: '左上区域' },
    { x: 0.7, y: 0.7, description: '右下区域' },
  ],
  
  // 边界值等价类
  BOUNDARY_VALUES: [
    { x: 0, y: 0, description: '左上角边界' },
    { x: 1, y: 1, description: '右下角边界' },
    { x: 0.5, y: 0, description: '上边界中心' },
    { x: 0.5, y: 1, description: '下边界中心' },
  ],
  
  // 无效等价类（超出边界）
  INVALID_AREAS: [
    { x: -0.1, y: 0.5, description: '左侧超出' },
    { x: 1.1, y: 0.5, description: '右侧超出' },
    { x: 0.5, y: -0.1, description: '上方超出' },
    { x: 0.5, y: 1.1, description: '下方超出' },
  ],
  
  // 测试持续时间等价类
  DURATION_CLASSES: {
    SHORT: 2000,    // 短时间测试
    MEDIUM: 10000,  // 中等时间测试
    LONG: 30000,    // 长时间测试
  }
};
