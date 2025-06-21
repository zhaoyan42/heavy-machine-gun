import { test, expect } from '@playwright/test';
import { GameTestHelper, EquivalenceClasses } from './utils/test-helpers';

/**
 * 核心游戏功能测试套件
 * 等价类：游戏初始化、基础交互、状态管理
 */
test.describe('核心游戏功能测试', () => {
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

  test('游戏初始化等价类验证', async () => {
    // 测试游戏正常启动和初始化
    const canvas = await helper.verifyGameInitialization();
    await helper.verifyUIElements();
    
    // 验证画布尺寸合理
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test('玩家移动控制等价类 - 有效区域', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 测试有效点击区域等价类
    for (const validArea of EquivalenceClasses.VALID_CLICK_AREAS) {
      await helper.testPlayerMovement(canvas, validArea.x, validArea.y);
      console.log(`✓ 测试${validArea.description}点击`);
    }
  });

  test('边界值测试 - 屏幕边缘控制', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 测试边界值等价类
    await helper.testBoundaryClicks(canvas);
    console.log('✓ 完成边界值点击测试');
  });

  test('快速连续点击等价类测试', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 测试快速连续点击（压力测试）
    await helper.testRapidClicks(canvas, 20);
    console.log('✓ 完成快速连续点击测试');
  });

  test('游戏状态管理等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 测试游戏运行状态
    await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.SHORT);
      // 模拟游戏重启（通过刷新页面）
    await helper.getPage().reload();
    await helper.verifyGameInitialization();
    console.log('✓ 完成游戏状态管理测试');
  });
});
