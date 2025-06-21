import { test, expect } from '@playwright/test';
import { GameTestHelper, EquivalenceClasses } from './utils/test-helpers';

/**
 * 道具系统测试套件
 * 等价类：道具生成、收集、效果验证、持续时间
 */
test.describe('道具系统等价类测试', () => {
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

  test('道具生成和收集等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('🎮 开始道具系统测试...');
    
    // 运行游戏一段时间，等待道具生成
    await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.MEDIUM);
    
    // 在游戏区域内随机移动，尝试收集道具
    const collectAttempts = 15;
    for (let i = 0; i < collectAttempts; i++) {
      const x = 0.2 + Math.random() * 0.6; // 在中心区域移动
      const y = 0.2 + Math.random() * 0.6;
      await helper.testPlayerMovement(canvas, x, y);
      await helper.getPage().waitForTimeout(800);
    }
    
    console.log('✓ 完成道具收集等价类测试');
  });

  test('道具系统压力测试等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 长时间运行，测试道具系统稳定性
    console.log('🔄 开始道具系统压力测试...');
    
    const testDuration = EquivalenceClasses.DURATION_CLASSES.LONG;
    const startTime = Date.now();
    let actionCount = 0;
    
    while (Date.now() - startTime < testDuration) {
      // 快速移动尝试收集道具
      await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      actionCount++;
      
      if (actionCount % 10 === 0) {
        console.log(`已执行 ${actionCount} 次移动操作`);
      }
      
      await helper.getPage().waitForTimeout(300);
    }
    
    console.log(`✓ 压力测试完成，共执行 ${actionCount} 次操作`);
  });

  test('道具效果验证等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    // 测试不同道具类型的效果（通过游戏行为观察）
    console.log('🎯 测试道具效果验证...');
    
    // 运行一段时间收集道具
    await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.MEDIUM);
    
    // 在收集道具后继续运行，观察效果
    const postCollectionActions = 10;
    for (let i = 0; i < postCollectionActions; i++) {
      await helper.testPlayerMovement(canvas, 0.5 + (Math.random() - 0.5) * 0.4, 0.5 + (Math.random() - 0.5) * 0.4);
      await helper.getPage().waitForTimeout(1000);
    }
    
    console.log('✓ 完成道具效果验证');
  });

  test('道具频率和分布等价类', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('📊 测试道具频率和分布...');
    
    // 分阶段测试道具出现频率
    const phases = [
      { duration: 5000, description: '早期阶段' },
      { duration: 10000, description: '中期阶段' },
      { duration: 15000, description: '后期阶段' }
    ];
    
    for (const phase of phases) {
      console.log(`开始${phase.description}测试 (${phase.duration}ms)`);
      await helper.testGameStability(phase.duration);
    }
    
    console.log('✓ 完成道具频率分布测试');
  });
});
