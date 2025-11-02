import DataManager from './DataManager.js';

class NumberMatcherApp {
  constructor() {
    // 初始化数据存储
    this.selectedNumbers = [];
    this.maxSelectionLimit = 25;
    this.currentMatchMode = null; // 存储当前匹配模式
    this.statsElement = null; // 数据统计元素引用
    
    // 初始化DOM引用和事件监听
    this.initDOMReferences();
    this.initNumberSelector();
    this.setupEventListeners();
    
    // 初始化DataManager
    this.dataManager = new DataManager(this);
    this.dataManager.dataSource = 'unknown'; // 初始化数据源标记
    
    // 加载存储的数据
    this.loadStoredData();
    
    // 创建数据管理面板
    this.createDataManagerPanel();
    
    console.log('NumberMatcherApp 初始化完成');
  }
  
  // 加载存储的数据
  async loadStoredData() {
    try {
      console.log('开始加载数据');
      await this.dataManager.loadStoredData();
      console.log('数据加载完成');
      this.dataManager.dataSource = 'file'; // 标记数据源为文件
      
      // 记录最后更新时间
      localStorage.setItem('lastDataUpdateTime', Date.now().toString());
      
      // 更新统计信息
      this.updateDataStats();
    } catch (error) {
      console.error('加载数据时出错:', error);
      // 如果加载失败，添加示例数据
      this.addExampleData();
      this.dataManager.dataSource = 'localStorage'; // 标记数据源为localStorage
      
      // 记录最后更新时间
      localStorage.setItem('lastDataUpdateTime', Date.now().toString());
      
      // 更新统计信息
      this.updateDataStats();
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
            <span class="period">期数: ${group.id}</span>
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
      // 导出数据库按钮已移除
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
      this.latestGroupsContainer = document.getElementById('latest-groups-container');
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
    // 导出数据库按钮已移除，无需绑定事件
    
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
  
  // 其他方法将在后续实现;
  
  // 创建数据管理面板
  createDataManagerPanel() {
    // 创建数据管理面板的新实现
    const dataManagerPanel = document.createElement('div');
    dataManagerPanel.className = 'data-manager-panel';
    dataManagerPanel.id = 'data-manager-panel';
    
    // 面板标题
    const panelHeader = document.createElement('div');
    panelHeader.className = 'panel-header';
    const title = document.createElement('h3');
    title.textContent = '数据管理';
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => this.toggleDataManagerPanel());
    
    panelHeader.appendChild(title);
    panelHeader.appendChild(closeButton);
    
    // 面板内容
    const panelContent = document.createElement('div');
    panelContent.className = 'panel-content';
    
    // 数据统计信息
    const statsSection = document.createElement('div');
    statsSection.className = 'data-section';
    const statsTitle = document.createElement('h4');
    statsTitle.textContent = '数据统计';
    const statsInfo = document.createElement('div');
    statsInfo.className = 'stats-info';
    this.statsElement = document.createElement('p');
    this.statsElement.textContent = '加载中...';
    statsInfo.appendChild(this.statsElement);
    statsSection.appendChild(statsTitle);
    statsSection.appendChild(statsInfo);
    
    // 远程同步部分
    const remoteSyncSection = document.createElement('div');
    remoteSyncSection.className = 'data-section';
    const remoteSyncTitle = document.createElement('h4');
    remoteSyncTitle.textContent = '远程同步';
    
    const remoteUrlInput = document.createElement('input');
    remoteUrlInput.type = 'text';
    remoteUrlInput.className = 'remote-url-input';
    remoteUrlInput.placeholder = '输入远程数据URL（如GitHub Gist链接）';
    // 从localStorage加载上次使用的URL
    const savedUrl = localStorage.getItem('lastRemoteDataUrl');
    if (savedUrl) {
      remoteUrlInput.value = savedUrl;
    }
    
    const syncButton = document.createElement('button');
    syncButton.className = 'sync-button';
    syncButton.textContent = '同步数据';
    syncButton.addEventListener('click', async () => {
      const url = remoteUrlInput.value.trim();
      if (!url) {
        this.showToast('请输入有效的远程URL', 'error');
        return;
      }
      
      // 保存URL到localStorage
      localStorage.setItem('lastRemoteDataUrl', url);
      
      // 执行同步
      if (this.dataManager && this.dataManager.syncDataFromRemote) {
        await this.dataManager.syncDataFromRemote(url);
        this.updateDataStats(); // 更新统计信息
      } else {
        this.showToast('数据管理器未初始化', 'error');
      }
    });
    
    // 使用默认URL按钮
    const useDefaultUrlButton = document.createElement('button');
    useDefaultUrlButton.className = 'default-url-button';
    useDefaultUrlButton.textContent = '使用默认URL';
    useDefaultUrlButton.addEventListener('click', () => {
      if (this.dataManager && this.dataManager.getDefaultRemoteDataUrl) {
        const defaultUrl = this.dataManager.getDefaultRemoteDataUrl();
        if (defaultUrl) {
          remoteUrlInput.value = defaultUrl;
        } else {
          this.showToast('请先在DataManager中设置默认URL', 'info');
        }
      }
    });
    
    remoteSyncSection.appendChild(remoteSyncTitle);
    remoteSyncSection.appendChild(remoteUrlInput);
    remoteSyncSection.appendChild(syncButton);
    remoteSyncSection.appendChild(useDefaultUrlButton);
    
    // 数据导入导出部分
    const importExportSection = document.createElement('div');
    importExportSection.className = 'data-section';
    const importExportTitle = document.createElement('h4');
    importExportTitle.textContent = '导入导出';
    
    // 导出按钮
    const exportButton = document.createElement('button');
    exportButton.className = 'export-button';
    exportButton.textContent = '导出数据';
    exportButton.addEventListener('click', () => {
      // 导出数据库功能已移除，使用导出为JSON代替
    });
    
    // 导入按钮和隐藏的文件输入
    const importFileInput = document.createElement('input');
    importFileInput.type = 'file';
    importFileInput.className = 'import-file-input';
    importFileInput.accept = '.json';
    importFileInput.style.display = 'none';
    importFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        this.showToast('正在导入数据，请稍候...', 'info');
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (this.dataManager && this.dataManager.importNumberGroups) {
          await this.dataManager.importNumberGroups(data);
          this.updateDataStats(); // 更新统计信息
        } else {
          // 降级处理 - 直接替换数据
          this.dataManager.numberGroups = data;
          await this.dataManager.saveData();
          this.showToast(`成功导入 ${data.length} 组数据`, 'success');
        }
      } catch (error) {
        console.error('数据导入失败:', error);
        this.showToast(`数据导入失败: ${error.message}`, 'error');
      } finally {
        // 重置文件输入，允许重复选择同一文件
        importFileInput.value = '';
      }
    });
    
    const importButton = document.createElement('button');
    importButton.className = 'import-button';
    importButton.textContent = '导入数据';
    importButton.addEventListener('click', () => importFileInput.click());
    
    importExportSection.appendChild(importExportTitle);
    importExportSection.appendChild(exportButton);
    importExportSection.appendChild(importButton);
    importExportSection.appendChild(importFileInput);
    
    // 数据清理部分
    const cleanupSection = document.createElement('div');
    cleanupSection.className = 'data-section';
    const cleanupTitle = document.createElement('h4');
    cleanupTitle.textContent = '数据清理';
    
    const clearLocalDataButton = document.createElement('button');
    clearLocalDataButton.className = 'clear-data-button';
    clearLocalDataButton.textContent = '清除本地数据';
    clearLocalDataButton.addEventListener('click', () => {
      if (confirm('确定要清除本地数据吗？此操作不可恢复！')) {
        if (this.dataManager) {
          this.dataManager.clearAllData();
          this.updateDataStats();
          this.showToast('本地数据已清除', 'success');
        }
      }
    });
    
    cleanupSection.appendChild(cleanupTitle);
    cleanupSection.appendChild(clearLocalDataButton);
    
    // 文档链接
    const docsSection = document.createElement('div');
    docsSection.className = 'data-section';
    const docsTitle = document.createElement('h4');
    docsTitle.textContent = '数据维护';
    
    const docsInfo = document.createElement('p');
    docsInfo.className = 'docs-info';
    docsInfo.innerHTML = `
      <p>您可以通过以下方式更新数据：</p>
      <ol>
        <li>使用GitHub Gist托管JSON文件，获取raw链接进行同步</li>
        <li>直接编辑本地JSON文件后导入</li>
        <li>使用导出功能备份当前数据</li>
      </ol>
      <p><strong>提示：</strong>同步前请确保远程URL的JSON格式正确，系统会自动备份当前数据。</p>
    `;
    
    docsSection.appendChild(docsTitle);
    docsSection.appendChild(docsInfo);
    
    // 将所有部分添加到面板内容
    panelContent.appendChild(statsSection);
    panelContent.appendChild(remoteSyncSection);
    panelContent.appendChild(importExportSection);
    panelContent.appendChild(cleanupSection);
    panelContent.appendChild(docsSection);
    
    dataManagerPanel.appendChild(panelHeader);
    dataManagerPanel.appendChild(panelContent);
    
    // 添加到页面
    const mainContainer = document.querySelector('.main-container') || document.body;
    mainContainer.appendChild(dataManagerPanel);
  }
  
  // 切换数据管理面板显示/隐藏
  toggleDataManagerPanel() {
    const panel = document.getElementById('data-manager-panel');
    if (panel) {
      panel.classList.toggle('active');
      // 面板显示状态改变后的处理
      if (panel.classList.contains('active')) {
        document.body.classList.add('data-panel-open');
      } else {
        document.body.classList.remove('data-panel-open');
      }
      if (panel.classList.contains('active')) {
        this.updateDataStats(); // 显示面板时更新统计信息
      }
    }
  };
  
  // 更新数据统计信息
  updateDataStats() {
    if (this.statsElement && this.dataManager) {
      const totalGroups = (this.dataManager && this.dataManager.getAllNumberGroups && typeof this.dataManager.getAllNumberGroups === 'function') 
         ? this.dataManager.getAllNumberGroups().length 
         : (this.dataManager && this.dataManager.numberGroups && Array.isArray(this.dataManager.numberGroups)) 
           ? this.dataManager.numberGroups.length 
           : 0;
      const lastUpdated = localStorage.getItem('lastDataUpdateTime');
      let lastUpdateText = '从未更新';
      
      if (lastUpdated) {
        const date = new Date(parseInt(lastUpdated));
        lastUpdateText = date.toLocaleString();
      }
      
      this.statsElement.innerHTML = `
        <p>总号码组数量: ${totalGroups}</p>
        <p>上次更新时间: ${lastUpdateText}</p>
        <p>数据来源: ${this.dataManager.dataSource || '未知'}</p>
      `;
      
      // 同时更新数据计数元素
      if (this.dataCountElement) {
        this.dataCountElement.textContent = totalGroups;
      }
    }
  };
}

export default NumberMatcherApp;
