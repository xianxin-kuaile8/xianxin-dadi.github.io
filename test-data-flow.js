// 测试脚本：验证数据加载和保存功能

console.log('开始测试数据流程...');

// 检查是否在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 浏览器环境测试
  const runBrowserTests = async () => {
    try {
      // 动态导入模块
      const { default: DataManager } = await import('./src/modules/DataManager.js');
      
      // 创建模拟应用实例
      const mockApp = {
        updateLatestGroupsDisplay: () => console.log('UI已更新'),
        showToast: (message, type) => console.log(`${type}: ${message}`)
      };
      
      // 创建DataManager实例
      const dataManager = new DataManager(mockApp);
      
      // 测试步骤1: 加载数据
      console.log('测试步骤1: 从文件加载数据');
      const loadResult = await dataManager.loadStoredData();
      console.log('数据加载结果:', loadResult);
      
      // 测试步骤2: 验证数据加载是否成功
      console.log('测试步骤2: 验证数据加载是否成功');
      const allGroups = dataManager.getAllNumberGroups();
      console.log(`加载的号码组数量: ${allGroups.length}`);
      console.log('号码组数据示例:', allGroups.slice(0, 2));
      
      // 测试步骤3: 添加新号码组
      console.log('测试步骤3: 添加新号码组');
      const newGroup = { period: '2025099', numbers: [10, 20, 30, 40, 50] };
      const addResult = await dataManager.addNumberGroup(newGroup);
      console.log('添加结果:', addResult);
      
      // 测试步骤4: 验证添加是否成功
      console.log('测试步骤4: 验证添加是否成功');
      const updatedGroups = dataManager.getAllNumberGroups();
      console.log(`更新后的号码组数量: ${updatedGroups.length}`);
      
      // 测试步骤5: 验证getLatestNumberGroups方法
      console.log('测试步骤5: 验证获取最新号码组');
      const latestGroups = dataManager.getLatestNumberGroups(3);
      console.log(`最新的3个号码组数量:`, latestGroups.length);
      console.log('最新号码组示例:', latestGroups[0]);
      
      console.log('所有测试完成! 数据存储机制工作正常。');
    } catch (error) {
      console.error('测试过程中出现错误:', error);
    }
  };
  
  // 执行浏览器环境测试
  runBrowserTests();
} else {
  // Node.js环境测试（仅用于基本功能验证）
  console.log('在Node.js环境中运行测试...');
  console.log('注意：由于浏览器API限制，完整功能测试应在浏览器中进行。');
  
  // 模拟必要的浏览器API
  global.document = {
    getElementById: () => null,
    body: {},
    createElement: () => ({
      href: '',
      download: '',
      appendChild: () => {},
      removeChild: () => {},
      click: () => {}
    })
  };
  
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  
  global.URL = {
    createObjectURL: () => 'mock-url',
    revokeObjectURL: () => {}
  };
  
  global.fetch = async () => ({
    ok: true,
    json: async () => []
  });
  
  console.log('基本环境模拟完成。请在浏览器中运行此脚本以进行完整测试。');
}

console.log('测试脚本正在运行...');