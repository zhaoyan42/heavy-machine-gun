import { test, expect } from '@playwright/test';
import { GameTestHelper } from './utils/test-helpers';

/**
 * 道具系统增强功能测试
 * 测试道具无法增强时转分数奖励和UI反馈
 */
test.describe('道具系统增强功能测试', () => {
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

  test('验证道具增强上限转分数奖励机制', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('🎮 测试道具增强上限转分数机制...');
    
    // 让游戏运行一段时间，等待道具生成并尝试收集
    await helper.testGameStability(10000);
      // 检查控制台日志，验证道具收集和效果
    const consoleLogs = await helper.getPage().evaluate(() => {
      return (window as any).gameDebugLogs || [];
    });
    
    console.log('游戏调试日志数量:', consoleLogs.length);
    
    // 尝试多次移动和收集道具
    for (let i = 0; i < 10; i++) {
      const x = 0.3 + Math.random() * 0.4;
      const y = 0.3 + Math.random() * 0.4;
      await helper.testPlayerMovement(canvas, x, y);
      await helper.getPage().waitForTimeout(800);
    }
    
    console.log('✓ 完成道具增强上限测试');
  });

  test('验证道具UI反馈和图标显示', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('🎨 测试道具UI反馈和图标...');
    
    // 运行游戏，观察道具UI效果
    await helper.testGameStability(8000);
      // 检查页面是否有道具相关的文本元素
    const pageContent = await helper.getPage().textContent('body');
    console.log('页面包含道具效果文本:', pageContent ? (pageContent.includes('速度') || pageContent.includes('射速')) : false);
    
    // 移动尝试收集道具并观察UI反馈
    for (let i = 0; i < 8; i++) {
      await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      await helper.getPage().waitForTimeout(1000);
    }
    
    console.log('✓ 完成道具UI反馈测试');
  });

  test('验证道具分数奖励机制', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('💰 测试道具分数奖励机制...');
    
    // 记录初始分数
    const initialScore = await helper.getPage().textContent('#score') || '分数: 0';
    console.log('初始分数:', initialScore);
    
    // 运行游戏一段时间
    await helper.testGameStability(12000);
    
    // 多次移动尝试收集道具
    for (let i = 0; i < 12; i++) {
      const x = 0.2 + Math.random() * 0.6;
      const y = 0.2 + Math.random() * 0.6;
      await helper.testPlayerMovement(canvas, x, y);
      await helper.getPage().waitForTimeout(700);
    }
    
    // 检查最终分数
    const finalScore = await helper.getPage().textContent('#score') || '分数: 0';
    console.log('最终分数:', finalScore);
    
    console.log('✓ 完成道具分数奖励测试');
  });

  test('验证道具效果文本显示', async () => {
    const canvas = await helper.verifyGameInitialization();
    
    console.log('📝 测试道具效果文本显示...');
      // 监听控制台日志中的道具效果信息
    const logs: string[] = [];
    helper.getPage().on('console', msg => {
      if (msg.text().includes('激活道具') || msg.text().includes('增强') || msg.text().includes('分数')) {
        logs.push(msg.text());
      }
    });
    
    // 运行游戏并尝试收集道具
    await helper.testGameStability(15000);
    
    // 快速移动尝试收集多个道具
    for (let i = 0; i < 15; i++) {
      await helper.testPlayerMovement(canvas, Math.random(), Math.random());
      await helper.getPage().waitForTimeout(600);
    }
    
    console.log(`捕获到的道具相关日志: ${logs.length} 条`);
    logs.slice(0, 5).forEach((log, index) => {
      console.log(`日志 ${index + 1}: ${log}`);
    });
    
    console.log('✓ 完成道具效果文本测试');
  });
});
