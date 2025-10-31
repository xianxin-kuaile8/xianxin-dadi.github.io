import DataManager from './DataManager.js';

class NumberMatcherApp {
  constructor() {
    // 初始化数据存储
    this.selectedNumbers = [];
    this.maxSelectionLimit = 25;
    this.currentMatchMode = null; // 存储当前匹配模式
    
    // 初始化DOM引用和事件监听
    this.initDOMReferences();
    this.initNumberSelector();
    this.setupEventListeners();
    
    // 初始化DataManager
    this.dataManager = new DataManager(this);
    
    // 加载存储的数据
    this.loadStoredData();
    
    console.log('NumberMatcherApp 初始化完成');
  }
  
  // 加载存储的数据
  async loadStoredData() {
    try {
      console.log('开始加载数据');
      await this.dataManager.loadStoredData();
      console.log('数据加载完成');
    } catch (error) {
      console.error('加载数据时出错:', error);
      // 如果加载失败，添加示例数据
      this.addExampleData();
    }
  }
  
  // 获取所有号码组
  getAllNumberGroups() {
    return this.dataManager.getAllNumberGroups();
  }
  
  // 获取最新号码组
  getLatestNumberGroups(count = 10) {
    return this.dataManager.getLatestNumberGroups(count);
  }
  
  // 添加号码组
  addNumberGroup(period, numbers) {
    return this.dataManager.addNumberGroup(period, numbers);
  }
  
  // 更新最新号码组显示
  updateLatestGroupsDisplay() {
    // 使用dataManager中的数据更新UI
    const latestGroups = this.getLatestNumberGroups(10);
    if (this.latestGroupsContainer) {
      this.latestGroupsContainer.innerHTML = '';
      
      latestGroups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'number-group';
        groupElement.innerHTML = `
          <div class="group-header">
            <span class="period">期数: ${group.period}</span>
            <span class="date">${new Date(group.timestamp || Date.now()).toLocaleDateString()}</span>
          </div>
          <div class="group-numbers">
            ${group.numbers.map(num => `<span class="number-ball">${num}</span>`).join('')}
          </div>
        `;
        this.latestGroupsContainer.appendChild(groupElement);
      });
    }
  }
  
  // 添加示例数据
  addExampleData() {
    const exampleGroups = [
      { period: '2024001', numbers: [1, 2, 3, 4, 5, 6, 7] },
      { period: '2024002', numbers: [8, 9, 10, 11, 12, 13, 14] },
      { period: '2024003', numbers: [15, 16, 17, 18, 19, 20, 21] }
    ];
    
    exampleGroups.forEach(group => {
      this.addNumberGroup(group.period, group.numbers);
    });
  }
  
  // 显示提示信息
  showToast(message, type = 'info') {
    if (this.toast && this.toastMessage && this.toastIcon) {
      this.toastMessage.textContent = message;
      
      // 设置图标和样式
      this.toast.className = 'toast';
      this.toast.classList.add(`toast-${type}`);
      this.toastIcon.className = 'toast-icon';
      
      // 显示提示
      this.toast.style.display = 'block';
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.toast.style.display = 'none';
      }, 3000);
    }
  }
  
  // 初始化DOM引用
  initDOMReferences() {
    try {
      // 主要UI元素
      this.numberSelector = document.getElementById('number-selector');
      this.matchButton = document.getElementById('match-button');
      this.clearSelectionButton = document.getElementById('clear-selection');
      this.resultsContainer = document.getElementById('results-container');
      this.selectedCount = document.getElementById('selected-count');
      this.toast = document.getElementById('toast');
      this.toastMessage = document.getElementById('toast-message');
      this.toastIcon = document.getElementById('toast-icon');
      
      // 选择模式按钮
      for (let i = 2; i <= 8; i++) {
        this[`selectMode${i}Button`] = document.getElementById(`select-mode-${i}`);
      }
      
      // 数据管理元素
      this.exportHtmlButton = document.getElementById('export-html');
      this.exportJsonButton = document.getElementById('export-json');
      this.exportDatabaseButton = document.getElementById('export-database');
      this.importJsonButton = document.getElementById('import-json-label'); // 修改为正确的ID
      this.importJsonInput = document.getElementById('import-json'); // 修改为正确的ID
      this.clearAllButton = document.getElementById('clear-all');
      this.clearAllDataButton = document.getElementById('clear-all-data') || document.getElementById('clear-all'); // 添加备选ID
      this.saveDatabaseButton = document.getElementById('save-database'); // 保存到数据库按钮
      
      // 导入单个号码组
      this.importSingleButton = document.getElementById('import-single');
      this.importSingleInput = document.getElementById('import-single-input');
      this.importBatchButton = document.getElementById('import-batch');
      this.importBatchInput = document.getElementById('import-batch-input');
      
      // 最新号码组显示
      this.latestGroupsContainer = document.getElementById('latest-groups');
      this.dataCountElement = document.getElementById('data-count');
      
      // 验证必要元素
      const requiredElements = [
        'numberSelector', 'matchButton', 'clearSelectionButton',
        'resultsContainer', 'selectedCount', 'toast'
      ];
      
      requiredElements.forEach(elementName => {
        if (!this[elementName]) {
          console.error(`关键DOM元素未找到: ${elementName}`);
        }
      });
      
      console.log('DOM引用初始化完成');
    } catch (error) {
      console.error('初始化DOM引用时出错:', error);
    }
  }
  
  // 初始化号码选择器
  initNumberSelector() {
    console.log('初始化号码选择器');
  }
  
  // 设置事件监听
  setupEventListeners() {
    console.log('设置事件监听');
    
    // 导出压缩包按钮事件
    if (this.exportHtmlButton) {
      this.exportHtmlButton.addEventListener('click', () => {
        this.dataManager.exportAsZip();
      });
      // 更新按钮文本
      this.exportHtmlButton.textContent = '导出为压缩包';
    }
    
    // 导出JSON按钮事件
    if (this.exportJsonButton) {
      this.exportJsonButton.addEventListener('click', () => {
        this.dataManager.exportToJson();
      });
    }
    
    // 导出数据库按钮事件
    if (this.exportDatabaseButton) {
      this.exportDatabaseButton.addEventListener('click', () => {
        this.dataManager.exportDatabase();
      });
    }
    
    // 导入JSON按钮事件
    if (this.importJsonButton && this.importJsonInput) {
      this.importJsonButton.addEventListener('click', () => {
        this.importJsonInput.click();
      });
      
      this.importJsonInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const result = await this.dataManager.importFromJson(file);
            this.showToast(`成功导入 ${result.successCount} 组数据，重复 ${result.duplicateCount} 组，无效 ${result.invalidCount} 组`, 'success');
          } catch (error) {
            this.showToast(error.message, 'error');
          }
        }
        // 重置文件输入
        e.target.value = '';
      });
    }
    
    // 匹配选项按钮事件
    const matchButtons = document.querySelectorAll('.match-btn');
    matchButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有按钮的active类
        matchButtons.forEach(btn => btn.classList.remove('active'));
        // 为当前按钮添加active类
        button.classList.add('active');
        // 存储当前匹配模式
        this.currentMatchMode = parseInt(button.getAttribute('data-match'), 10);
        console.log(`匹配模式已设置为: 选${this.currentMatchMode}`);
      });
    });
    
    // 清空所有数据按钮事件
    if (this.clearAllDataButton) {
      this.clearAllDataButton.addEventListener('click', () => {
        if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
          if (this.dataManager.clearAllData()) {
            this.showToast('所有数据已清空', 'success');
          }
        }
      });
    }
    
    // 保存到数据库按钮事件
    if (this.saveDatabaseButton) {
      this.saveDatabaseButton.addEventListener('click', async () => {
        try {
          if (await this.dataManager.saveData()) {
            this.showToast('数据已成功保存到数据库', 'success');
          }
        } catch (error) {
          this.showToast('保存数据失败: ' + error.message, 'error');
        }
      });
    }
  }
  
  // 其他方法将在后续实现
}

export default NumberMatcherApp;
