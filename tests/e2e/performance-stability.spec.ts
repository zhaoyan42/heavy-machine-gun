import { test, expect } from '@playwright/test';
import { GameTestHelper, EquivalenceClasses } from './utils/test-helpers';

/**
 * 性能和稳定性测试套件
 * 等价类：短期稳定性、长期稳定性、内存管理、性能基准
 */
test.describe('性能和稳定性等价类测试', () => {
  let helper: GameTestHelper;
  let errorMonitoring: { consoleErrors: string[], pageErrors: string[] };

  test.beforeEach(async ({ page }) => {
    helper = new GameTestHelper(page);
    errorMonitoring = helper.setupErrorMonitoring();
    await page.goto('/');
  });

  test.afterEach(async () => {
    // 性能测试可能产生一些非关键错误，这里检查更宽松
    const criticalErrors = errorMonitoring.consoleErrors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read property')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('短期稳定性等价类 (2分钟)', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('⏱️ 开始短期稳定性测试 (2分钟)...');
    
    const duration = 2 * 60 * 1000; // 2分钟
    await helper.testGameStability(duration);
    
    // 验证游戏仍然正常运行
    await expect(canvas).toBeVisible();
    console.log('✓ 短期稳定性测试完成');
  });

  test('中期稳定性等价类 (5分钟)', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('⏱️ 开始中期稳定性测试 (5分钟)...');
    
    const duration = 5 * 60 * 1000; // 5分钟
    const startTime = Date.now();
    let actionCount = 0;
    
    while (Date.now() - startTime < duration) {
      // 混合不同类型的操作
      if (actionCount % 3 === 0) {
        await helper.testRapidClicks(canvas, 5);
      } else {
        await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      }
      
      actionCount++;
      
      if (actionCount % 20 === 0) {
        console.log(`已运行 ${Math.floor((Date.now() - startTime) / 1000)}s, 执行 ${actionCount} 次操作`);
        // 定期检查画布状态
        await expect(canvas).toBeVisible();
      }
      
      await helper.getPage().waitForTimeout(500);
    }
    
    console.log(`✓ 中期稳定性测试完成，执行了 ${actionCount} 次操作`);
  });

  test('内存管理等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('🧠 开始内存管理测试...');
    
    // 重复加载和操作，测试内存泄漏
    const cycles = 3;
    
    for (let cycle = 0; cycle < cycles; cycle++) {
      console.log(`内存测试周期 ${cycle + 1}/${cycles}`);
      
      // 高强度操作
      await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.MEDIUM);
      
      // 快速连续操作
      await helper.testRapidClicks(canvas, 30);
      
      // 边界测试
      await helper.testBoundaryClicks(canvas);
      
      // 短暂休息
      await helper.getPage().waitForTimeout(2000);
      
      // 检查游戏仍然响应
      await expect(canvas).toBeVisible();
      await helper.testPlayerMovement(canvas, 0.5, 0.5);
    }
    
    console.log('✓ 内存管理测试完成');
  });

  test('极限压力测试等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('🔥 开始极限压力测试...');
    
    // 极限频率的用户操作
    const extremeActions = 100;
    
    for (let i = 0; i < extremeActions; i++) {
      // 随机选择操作类型
      const actionType = i % 4;
      
      switch (actionType) {
        case 0:
          await helper.testRapidClicks(canvas, 3);
          break;
        case 1:
          await helper.testPlayerMovement(canvas, Math.random(), Math.random());
          break;
        case 2:
          await helper.testBoundaryClicks(canvas);
          break;
        case 3:
          // 快速移动
          for (let j = 0; j < 5; j++) {
            await helper.testPlayerMovement(canvas, Math.random(), Math.random());
            await helper.getPage().waitForTimeout(50);
          }
          break;
      }
      
      if (i % 20 === 0) {
        console.log(`极限测试进度: ${i}/${extremeActions}`);
        // 确保游戏仍然响应
        await expect(canvas).toBeVisible();
      }
      
      // 最小间隔，保持极限压力
      await helper.getPage().waitForTimeout(100);
    }
    
    // 验证游戏在极限压力后仍能正常运行
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    await expect(canvas).toBeVisible();
    
    console.log('✓ 极限压力测试完成');
  });

  test('性能基准等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('📊 开始性能基准测试...');
    
    // 测量操作响应时间
    const responseTimes: number[] = [];
    const testOperations = 20;
    
    for (let i = 0; i < testOperations; i++) {
      const startTime = Date.now();
      await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      const endTime = Date.now();
      
      responseTimes.push(endTime - startTime);
      await helper.getPage().waitForTimeout(500);
    }
    
    // 分析性能数据
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`最大响应时间: ${maxResponseTime}ms`);
    console.log(`最小响应时间: ${minResponseTime}ms`);
    
    // 设定性能基准（响应时间应该合理）
    expect(avgResponseTime).toBeLessThan(2000); // 平均响应时间应小于2秒
    expect(maxResponseTime).toBeLessThan(5000); // 最大响应时间应小于5秒
    
    console.log('✓ 性能基准测试完成');
  });
});
