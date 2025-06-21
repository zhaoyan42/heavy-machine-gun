import { test, expect } from '@playwright/test';
import { GameTestHelper } from './utils/test-helpers';

/**
 * UI/UX显示和交互测试套件
 * 等价类：状态栏显示、视觉元素、响应式布局
 */
test.describe('UI/UX等价类测试', () => {
  let helper: GameTestHelper;
  let errorMonitoring: { consoleErrors: string[], pageErrors: string[] };

  test.beforeEach(async ({ page }) => {
    helper = new GameTestHelper(page);
    errorMonitoring = helper.setupErrorMonitoring();
    await page.goto('/');
  });

  test.afterEach(async () => {
    await helper.checkErrorState(errorMonitoring.consoleErrors, errorMonitoring.pageErrors);
  });

  test('基础UI元素显示等价类', async () => {
    await helper.verifyGameInitialization();
    
    // 检查画布基本属性
    const canvas = helper.getPage().locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 检查页面基本结构
    const pageContent = await helper.getPage().content();
    expect(pageContent).toContain('canvas');
    
    // 检查页面标题
    await expect(helper.getPage()).toHaveTitle(/重机枪.*射击游戏|Heavy Machine Gun/);
    
    console.log('✓ 基础UI元素验证完成');
  });

  test('画布尺寸和比例等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 检查画布尺寸合理性
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    
    if (box) {
      expect(box.width).toBeGreaterThan(200);
      expect(box.height).toBeGreaterThan(200);
      
      // 检查宽高比是否合理（应该接近414:736的比例）
      const aspectRatio = box.width / box.height;
      expect(aspectRatio).toBeGreaterThan(0.4);
      expect(aspectRatio).toBeLessThan(1.0);
      
      console.log(`画布尺寸: ${box.width}x${box.height}, 宽高比: ${aspectRatio.toFixed(2)}`);
    }
    
    console.log('✓ 画布尺寸验证完成');
  });

  test('响应式布局等价类', async () => {
    await helper.verifyGameInitialization();
    
    // 测试不同视口尺寸
    const viewports = [
      { width: 375, height: 667, description: 'iPhone SE' },
      { width: 414, height: 736, description: 'iPhone Plus' },
      { width: 768, height: 1024, description: 'iPad' },
      { width: 1920, height: 1080, description: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      console.log(`测试 ${viewport.description} 视口: ${viewport.width}x${viewport.height}`);
      
      await helper.getPage().setViewportSize(viewport);
      await helper.getPage().waitForTimeout(1000);
      
      // 验证画布仍然可见且尺寸合理
      const canvas = helper.getPage().locator('canvas');
      await expect(canvas).toBeVisible();
      
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
    
    console.log('✓ 响应式布局测试完成');
  });

  test('视觉稳定性等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 运行游戏一段时间，检查视觉稳定性
    console.log('🎮 开始视觉稳定性测试...');
    
    // 在游戏运行过程中定期检查画布状态
    const checkIntervals = 5;
    const intervalDuration = 2000;
    
    for (let i = 0; i < checkIntervals; i++) {
      await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      await helper.getPage().waitForTimeout(intervalDuration);
      
      // 确认画布仍然可见
      await expect(canvas).toBeVisible();
      
      // 检查画布尺寸没有异常变化
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
      
      console.log(`视觉检查 ${i + 1}/${checkIntervals} 完成`);
    }
    
    console.log('✓ 视觉稳定性测试完成');
  });

  test('文本和数字显示等价类', async () => {
    await helper.verifyGameInitialization();
    
    // 运行游戏，检查可能的文本显示
    console.log('📝 检查文本显示等价类...');
    
    // 检查页面是否有明显的文本渲染问题
    const pageContent = await helper.getPage().content();
    
    // 确保页面内容不为空
    expect(pageContent.length).toBeGreaterThan(100);
    
    // 检查是否有基本的HTML结构
    expect(pageContent).toContain('<html');
    expect(pageContent).toContain('<body');
    expect(pageContent).toContain('canvas');
    
    console.log('✓ 文本显示检查完成');
  });
});
