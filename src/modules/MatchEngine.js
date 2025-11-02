class MatchEngine {
  constructor(app) {
    this.app = app;
  }
  
  // 执行匹配操作
  async performMatch(selectedNumbers, matchMode) {
    try {
      // 验证输入
      if (!selectedNumbers || selectedNumbers.length === 0) {
        throw new Error('请至少选择一个号码');
      }
      
      if (!matchMode || matchMode < 2 || matchMode > 8) {
        throw new Error('无效的匹配模式，需要选择2-8个号码');
      }
      
      // 生成所有可能的组合
      const combinations = this.generateCombinations(selectedNumbers, matchMode);
      console.log(`生成了 ${combinations.length} 种组合`);
      
      // 获取数据
      const dataManager = this.app.dataManager;
      const numberGroups = dataManager.getAllNumberGroups();
      
      if (numberGroups.length === 0) {
        throw new Error('没有可用的号码组数据');
      }
      
      // 匹配结果
      const matchResults = [];
      const totalSteps = combinations.length;
      
      // 使用分批处理避免UI阻塞
      const batchSize = 1000;
      const progressElement = document.getElementById('match-progress');
      
      for (let i = 0; i < combinations.length; i += batchSize) {
        const batch = combinations.slice(i, i + batchSize);
        
        // 处理当前批次
        for (let j = 0; j < batch.length; j++) {
          const combo = batch[j];
          const matchInfo = this.findMatchesForCombination(combo, numberGroups);
          
          if (matchInfo.matches.length > 0) {
            matchResults.push({
              combination: combo,
              matches: matchInfo.matches,
              matchCount: matchInfo.matches.length,
              lastMatchIndex: matchInfo.lastMatchIndex,
              missCount: matchInfo.missCount
            });
          }
          
          // 更新进度
          const currentStep = i + j + 1;
          if (progressElement) {
            progressElement.textContent = `匹配中... ${currentStep}/${totalSteps}`;
            progressElement.style.width = `${(currentStep / totalSteps) * 100}%`;
          }
        }
        
        // 允许UI更新
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      // 按匹配次数排序，次数相同则按遗漏期数排序
      matchResults.sort((a, b) => {
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return a.missCount - b.missCount;
      });
      
      console.log(`找到 ${matchResults.length} 个匹配结果`);
      return matchResults;
    } catch (error) {
      console.error('执行匹配时出错:', error);
      throw error;
    }
  }
  
  // 为单个组合查找匹配
  findMatchesForCombination(combination, numberGroups) {
    const matches = [];
    let lastMatchIndex = -1;
    
    // 检查每个号码组
    for (let i = 0; i < numberGroups.length; i++) {
      const group = numberGroups[i];
      const matchedNumbers = [];
      
      // 检查组合中的每个号码是否在当前组中
      for (const num of combination) {
        if (group.numbers.includes(num)) {
          matchedNumbers.push(num);
        }
      }
      
      // 如果所有号码都匹配
      if (matchedNumbers.length === combination.length) {
        matches.push({
          period: group.period,
          matchedNumbers,
          index: i
        });
        lastMatchIndex = i;
      }
    }
    
    // 计算遗漏期数
    const missCount = lastMatchIndex !== -1 ? lastMatchIndex : numberGroups.length;
    
    return {
      combination,
      matches,
      lastMatchIndex,
      missCount
    };
  }
  
  // 生成组合
  generateCombinations(numbers, size) {
    const combinations = [];
    
    // 辅助函数：递归生成组合
    function backtrack(start, currentCombo) {
      if (currentCombo.length === size) {
        combinations.push([...currentCombo]);
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        currentCombo.push(numbers[i]);
        backtrack(i + 1, currentCombo);
        currentCombo.pop();
      }
    }
    
    // 开始生成组合
    backtrack(0, []);
    return combinations;
  }
  
  // 计算遗漏期数
  calculateMissCount(lastMatchIndex, totalGroups) {
    if (lastMatchIndex === -1) {
      return totalGroups;
    }
    return lastMatchIndex;
  }
}

export default MatchEngine;
