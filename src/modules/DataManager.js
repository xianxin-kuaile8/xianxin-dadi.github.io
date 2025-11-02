/**
 * 简化版数据管理器 - 专注于直接加载和提供号码组数据
 */
class DataManager {
  constructor(app, dataFilePath = 'numberGroups.json') {
    console.log('[DataManager] 初始化');
    this.app = app;
    this.dataFilePath = dataFilePath;
    this.numberGroups = [];
    // 内置默认数据，确保即使JSON文件加载失败也能显示数据
    this.defaultNumberGroups = [
      { "id": "2025274", "numbers": ["02","03","10","18","26","31","33","34","46","49","50","51","54","55","60","62","74","75","76","80"] },
      { "id": "2025275", "numbers": ["07","09","13","14","28","32","33","34","35","37","48","50","51","56","57","59","65","69","72","76"] },
      { "id": "2025276", "numbers": ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20"] }
    ];
    this.callbacks = {
      onDataLoaded: null,
      onDataUpdated: null,
      onError: null
    };
  }

  // 初始化数据 - 使用Promise确保异步加载完成
  async init() {
    console.log('[DataManager] 开始初始化数据...');
    try {
      await this.loadDataFromFile();
      // 如果加载的数据为空，使用默认数据
      if (this.numberGroups.length === 0) {
        console.log('[DataManager] 使用内置默认数据');
        this.numberGroups = this.defaultNumberGroups;
        this.updateUI();
      }
      return true;
    } catch (error) {
      console.error('[DataManager] 初始化数据失败:', error);
      // 出错时使用默认数据
      this.numberGroups = this.defaultNumberGroups;
      this.updateUI();
      return true; // 即使出错也返回true，确保应用能继续运行
    }
  }

  // 使用fetch API加载JSON文件（更现代的方式）
  async loadDataFromFile() {
    // 定义要尝试的多个路径
    const pathsToTry = [
      this.dataFilePath, // 当前目录
      `./${this.dataFilePath}`, // ./当前目录
      `../${this.dataFilePath}`, // 上一级目录
      `src/data/${this.dataFilePath}`, // src/data目录
      `../../${this.dataFilePath}` // 上上级目录
    ];

    for (let i = 0; i < pathsToTry.length; i++) {
      const path = pathsToTry[i];
      try {
        console.log(`[DataManager] 尝试路径 ${i + 1}/${pathsToTry.length}: ${path}`);
        
        // 构建完整路径，确保在file://协议下也能正确工作
        let url = path;
        if (window.location.protocol === 'file:') {
          // 对于file://协议，尝试使用相对路径
          const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
          url = `${baseUrl}/${path}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          this.processData(data);
          console.log(`[DataManager] 成功从 ${path} 加载数据`);
          return;
        } else {
          console.log(`[DataManager] 加载 ${path} 失败，状态码: ${response.status}`);
        }
      } catch (error) {
        console.log(`[DataManager] 加载 ${path} 时出错:`, error.message);
        // 继续尝试下一个路径
      }
    }

    // 所有路径都尝试失败
    console.log('[DataManager] 所有路径都加载失败，使用默认数据');
    this.numberGroups = this.defaultNumberGroups;
    this.updateUI();
  }

  // 处理加载到的数据
  processData(data) {
    try {
      let numberGroups;
      
      // 支持两种格式：直接数组或包含numberGroups字段的对象
      if (Array.isArray(data)) {
        numberGroups = data;
      } else if (data && data.numberGroups && Array.isArray(data.numberGroups)) {
        numberGroups = data.numberGroups;
      } else {
        throw new Error('无效的数据格式');
      }
      
      // 规范化数据
      this.numberGroups = this.normalizeData(numberGroups);
      console.log(`[DataManager] 成功加载 ${this.numberGroups.length} 组号码数据`);
      this.updateUI();
      return true;
    } catch (error) {
      console.error('[DataManager] 处理数据失败:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return false;
    }
  }

  // 规范化数据格式
  normalizeData(groups) {
    return groups
      .filter(group => group && group.id && Array.isArray(group.numbers))
      .map(group => ({
        id: String(group.id),
        numbers: group.numbers.map(num => {
          const str = String(num).trim();
          return str.length === 1 ? '0' + str : str;
        })
      }))
      .sort((a, b) => parseInt(b.id) - parseInt(a.id));
  }

  // 更新UI显示
  updateUI() {
    console.log(`[DataManager] 更新UI显示，共有 ${this.numberGroups.length} 组数据`);
    if (this.app && typeof this.app.updateDataCount === 'function') {
      this.app.updateDataCount(this.numberGroups.length);
    }
    if (this.app && typeof this.app.updateLatestGroupsDisplay === 'function') {
      this.app.updateLatestGroupsDisplay();
    }
    
    // 触发回调函数
    if (this.callbacks.onDataLoaded) {
      this.callbacks.onDataLoaded(this.numberGroups);
    }
    if (this.callbacks.onDataUpdated) {
      this.callbacks.onDataUpdated(this.numberGroups);
    }
  }

  // 获取所有号码组
  getAllNumberGroups() {
    return [...(this.numberGroups || [])];
  }

  // 获取最新的号码组
  getLatestNumberGroups(limit = 10) {
    return [...(this.numberGroups || [])].slice(0, limit);
  }

  // 获取指定ID的号码组
  getNumberGroupById(id) {
    return this.numberGroups?.find(group => group.id === String(id)) || null;
  }

  // 设置回调函数
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

// 为了兼容性，同时支持ES模块和直接浏览器使用
try {
  // 尝试导出为CommonJS模块
  module.exports = DataManager;
} catch (e) {
  // 浏览器环境下直接挂载到window对象
  if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
  }
}

// 导出为ES模块
export default DataManager;
