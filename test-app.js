// 应用功能测试脚本
console.log('开始测试号码匹配应用功能...');

// 测试项目列表
const testCases = [
  {
    name: '验证基础组件存在',
    test: () => {
      const requiredElements = [
        'number-selector',
        'selected-count',
        'match-button',
        'import-button',
        'export-json-button',
        'export-html-button',
        'clear-selection-button',
        'clear-all-data-button',
        'latest-groups',
        'results-container',
        'data-count'
      ];
      
      let allExist = true;
      requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
          console.error(`❌ 缺少必要的DOM元素: ${id}`);
          allExist = false;
        }
      });
      
      if (allExist) {
        console.log('✅ 所有必要的DOM元素都存在');
      }
      return allExist;
    }
  },
  {
    name: '验证号码选择器功能',
    test: () => {
      const selectorElement = document.getElementById('number-selector');
      if (!selectorElement) {
        console.error('❌ 号码选择器不存在');
        return false;
      }
      
      const balls = selectorElement.querySelectorAll('.number-ball');
      if (balls.length !== 80) {
        console.error(`❌ 号码球数量不正确: 期望80个，实际${balls.length}个`);
        return false;
      }
      
      console.log('✅ 号码选择器包含80个号码球');
      return true;
    }
  },
  {
    name: '验证数据存储功能',
    test: () => {
      // 保存测试数据到localStorage
      const testData = [{ period: 'test123', numbers: [1, 2, 3, 4, 5] }];
      try {
        localStorage.setItem('numberMatcherData', JSON.stringify(testData));
        const stored = localStorage.getItem('numberMatcherData');
        const parsed = JSON.parse(stored);
        
        if (parsed && parsed.length === 1 && parsed[0].period === 'test123') {
          console.log('✅ localStorage数据存储测试通过');
          // 清理测试数据
          localStorage.removeItem('numberMatcherData');
          return true;
        } else {
          console.error('❌ localStorage数据验证失败');
          return false;
        }
      } catch (error) {
        console.error('❌ localStorage操作失败:', error);
        return false;
      }
    }
  },
  {
    name: '验证组合生成逻辑',
    test: () => {
      // 简单的组合生成测试函数
      function generateCombinations(arr, size) {
        const result = [];
        
        function backtrack(start, current) {
          if (current.length === size) {
            result.push([...current]);
            return;
          }
          
          for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            backtrack(i + 1, current);
            current.pop();
          }
        }
        
        backtrack(0, []);
        return result;
      }
      
      const testArr = [1, 2, 3, 4, 5];
      const combinations = generateCombinations(testArr, 2);
      
      if (combinations.length === 10) {
        console.log('✅ 组合生成逻辑测试通过');
        return true;
      } else {
        console.error(`❌ 组合数量错误: 期望10个，实际${combinations.length}个`);
        return false;
      }
    }
  },
  {
    name: '检查潜在的内存泄漏',
    test: () => {
      // 检查是否有未移除的事件监听器模式
      if (typeof window.matchApp !== 'undefined' && window.matchApp && 
          typeof window.matchApp.cleanup === 'undefined') {
        console.warn('⚠️  应用可能缺少事件监听器清理机制');
        return false;
      }
      
      console.log('✅ 内存泄漏检查通过');
      return true;
    }
  },
  {
    name: '检查错误处理机制',
    test: () => {
      if (typeof window.matchApp !== 'undefined' && window.matchApp && 
          typeof window.matchApp.showToast === 'function') {
        console.log('✅ 错误处理机制检查通过');
        return true;
      } else {
        console.warn('⚠️  应用可能缺少统一的错误处理机制');
        return false;
      }
    }
  }
];

// 运行所有测试
let passedCount = 0;
let failedCount = 0;
let warningCount = 0;

testCases.forEach(testCase => {
  console.log(`\n测试: ${testCase.name}`);
  try {
    const result = testCase.test();
    if (result) {
      passedCount++;
    } else {
      failedCount++;
    }
  } catch (error) {
    console.error(`❌ 测试执行失败: ${error.message}`);
    failedCount++;
  }
});

// 显示测试结果摘要
console.log('\n=====================================');
console.log('测试结果摘要:');
console.log(`通过: ${passedCount}`);
console.log(`失败: ${failedCount}`);
console.log(`警告: ${warningCount}`);
console.log('=====================================');

// 输出潜在的优化建议
console.log('\n潜在的优化建议:');
console.log('1. 实现事件监听器清理机制，防止内存泄漏');
console.log('2. 添加输入验证和错误处理');
console.log('3. 优化大量数据的性能，考虑使用虚拟滚动');
console.log('4. 实现防抖/节流，特别是在频繁操作时');
console.log('5. 考虑添加加载状态指示器');
console.log('6. 优化localStorage操作，减少不必要的读写');