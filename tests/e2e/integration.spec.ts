import { test, expect } from '@playwright/test';
import { GameTestHelper, EquivalenceClasses } from './utils/test-helpers';

/**
 * 集成测试套件
 * 结合多个等价类进行综合测试，验证整体系统功能
 */
test.describe('综合集成等价类测试', () => {
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

  test('完整游戏流程等价类测试', async () => {
    console.log('🎮 开始完整游戏流程测试...');
    
    // 1. 游戏初始化
    const canvas = await helper.verifyGameInitialization();
    console.log('✓ 游戏初始化完成');
    
    // 2. 基础交互测试
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    console.log('✓ 基础交互测试完成');
    
    // 3. 边界测试
    await helper.testBoundaryClicks(canvas);
    console.log('✓ 边界测试完成');
    
    // 4. 道具系统测试
    await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.MEDIUM);
    console.log('✓ 道具系统测试完成');
    
    // 5. 压力测试
    await helper.testRapidClicks(canvas, 15);
    console.log('✓ 压力测试完成');
    
    // 6. 稳定性验证
    await helper.testGameStability(EquivalenceClasses.DURATION_CLASSES.SHORT);
    console.log('✓ 稳定性验证完成');
    
    console.log('🎉 完整游戏流程测试通过');
  });

  test('用户体验路径等价类测试', async () => {
    console.log('👤 开始用户体验路径测试...');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 模拟真实用户行为模式
    const userScenarios = [
      {
        name: '新手用户',
        actions: [
          () => helper.testPlayerMovement(canvas, 0.5, 0.5),
          () => helper.getPage().waitForTimeout(2000),
          () => helper.testPlayerMovement(canvas, 0.3, 0.3),
          () => helper.getPage().waitForTimeout(1500),
        ]
      },
      {
        name: '活跃用户',
        actions: [
          () => helper.testRapidClicks(canvas, 8),
          () => helper.testBoundaryClicks(canvas),
          () => helper.testGameStability(5000),
        ]
      },
      {
        name: '高级用户',
        actions: [
          () => helper.testRapidClicks(canvas, 20),
          () => helper.testGameStability(15000),
          () => helper.testBoundaryClicks(canvas),
          () => helper.testRapidClicks(canvas, 30),
        ]
      }
    ];

    for (const scenario of userScenarios) {
      console.log(`执行${scenario.name}场景...`);
      for (const action of scenario.actions) {
        await action();
      }
      console.log(`✓ ${scenario.name}场景完成`);
    }
    
    console.log('✓ 用户体验路径测试完成');
  });

  test('错误恢复等价类测试', async () => {
    console.log('🔧 开始错误恢复测试...');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 测试各种边界条件和异常情况
    
    // 1. 超快速点击
    console.log('测试超快速点击...');
    await helper.testRapidClicks(canvas, 50);
    
    // 2. 边界外点击（如果可能）
    console.log('测试边界处理...');
    const box = await canvas.boundingBox();
    if (box) {
      // 尝试点击边界附近
      await helper.getPage().mouse.click(box.x - 1, box.y - 1);
      await helper.getPage().mouse.click(box.x + box.width + 1, box.y + box.height + 1);
    }
    
    // 3. 验证游戏仍然响应
    console.log('验证游戏恢复能力...');
    await helper.testPlayerMovement(canvas, 0.5, 0.5);
    await expect(canvas).toBeVisible();
    
    console.log('✓ 错误恢复测试完成');
  });

  test('性能退化检测等价类测试', async () => {
    console.log('📈 开始性能退化检测...');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 分阶段测试性能
    const performancePhases = [
      { duration: 5000, name: '初期性能' },
      { duration: 15000, name: '中期性能' },
      { duration: 30000, name: '长期性能' }
    ];
    
    for (const phase of performancePhases) {
      console.log(`测试${phase.name} (${phase.duration}ms)...`);
      
      const startTime = Date.now();
      await helper.testGameStability(phase.duration);
      const endTime = Date.now();
      
      // 验证游戏仍然响应
      const responseStart = Date.now();
      await helper.testPlayerMovement(canvas, 0.5, 0.5);
      const responseTime = Date.now() - responseStart;
      
      console.log(`${phase.name}响应时间: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(3000); // 响应时间应保持合理
      
      console.log(`✓ ${phase.name}测试完成`);
    }
    
    console.log('✓ 性能退化检测完成');
  });

  test('多维度综合压力测试', async () => {
    console.log('🔥 开始多维度综合压力测试...');
    
    const canvas = await helper.verifyGameInitialization();
    
    // 组合多种压力源
    const stressTests = [
      {
        name: '高频点击 + 边界测试',
        test: async () => {
          await helper.testRapidClicks(canvas, 20);
          await helper.testBoundaryClicks(canvas);
        }
      },
      {
        name: '长时间运行 + 快速操作',
        test: async () => {
          await helper.testGameStability(20000);
          await helper.testRapidClicks(canvas, 30);
        }
      },
      {
        name: '视口变化 + 交互测试',
        test: async () => {
          await helper.getPage().setViewportSize({ width: 375, height: 667 });
          await helper.testPlayerMovement(canvas, 0.5, 0.5);
          await helper.getPage().setViewportSize({ width: 768, height: 1024 });
          await helper.testPlayerMovement(canvas, 0.5, 0.5);
        }
      }
    ];
    
    for (const stressTest of stressTests) {
      console.log(`执行${stressTest.name}...`);
      await stressTest.test();
      
      // 验证系统仍然稳定
      await expect(canvas).toBeVisible();
      await helper.testPlayerMovement(canvas, 0.5, 0.5);
      
      console.log(`✓ ${stressTest.name}完成`);
    }
    
    console.log('✓ 多维度综合压力测试完成');
  });
});
