class DataManager {
  constructor(app) {
    this.app = app;
    this.storageKey = 'numberMatcherData';
    this.dataFilePath = 'src/data/numberGroups.json';
    this.numberGroups = [];
  }
  
  // 从JSON文件加载数据
  async loadDataFromFile() {
    try {
      console.log(`尝试加载文件: ${this.dataFilePath}`);
      
      // 使用绝对路径
      const absolutePath = this.dataFilePath;
      console.log(`加载路径: ${absolutePath}`);
      
      const response = await fetch(absolutePath);
      console.log(`请求状态: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`文件加载失败: ${response.status} ${response.statusText}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      console.log(`响应内容类型: ${contentType}`);
      
      // 读取响应文本而不是直接解析JSON，以便更好地调试
      const responseText = await response.text();
      console.log(`响应文本长度: ${responseText.length} 字符`);
      
      // 验证JSON格式
      try {
        this.numberGroups = JSON.parse(responseText);
        console.log('JSON解析成功');
        
        // 验证解析后的数据结构
        if (!Array.isArray(this.numberGroups)) {
          throw new Error('解析后的数据不是数组');
        }
        console.log(`数据组数: ${this.numberGroups.length}`);
        
        // 按录入编号排序，确保最大的编号在前面（最新录入的）
        this.numberGroups.sort((a, b) => {
          const idA = parseInt(a.id || a.period, 10);
          const idB = parseInt(b.id || b.period, 10);
          return idB - idA;
        });
      } catch (jsonError) {
        console.error('JSON解析失败:', jsonError);
        // 输出前100个字符以帮助调试
        console.log('响应文本前100字符:', responseText.substring(0, 100));
        throw new Error(`JSON格式错误: ${jsonError.message}`);
      }
      
      // 更新UI
      this.updateDataCount();
      this.app.updateLatestGroupsDisplay();
      
      // 同时更新localStorage作为缓存
      this.saveToLocalStorage();
      
      return true;
    } catch (error) {
      console.error('从文件加载数据失败:', error);
      // 尝试从localStorage加载作为备份
      const localStorageResult = this.loadFromLocalStorage();
      console.log(`从localStorage加载结果: ${localStorageResult}`);
      return localStorageResult;
    }
  }
  
  // 从localStorage加载数据（作为备份）
  loadFromLocalStorage() {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        this.numberGroups = JSON.parse(storedData);
        // 按录入编号排序，确保最大的编号在前面（最新录入的）
        // 转换为数字进行比较，避免字符串比较问题
        this.numberGroups.sort((a, b) => {
          const idA = parseInt(a.id || a.period, 10);
          const idB = parseInt(b.id || b.period, 10);
          return idB - idA;
        });
        
        console.log(`成功从缓存加载 ${this.numberGroups.length} 组号码数据`);
        this.updateDataCount();
        this.app.updateLatestGroupsDisplay();
        return true;
      }
      return false;
    } catch (error) {
      console.error('从缓存加载数据失败:', error);
      return false;
    }
  }
  
  // 保存数据到localStorage
  saveToLocalStorage(data = this.numberGroups) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('数据已保存到localStorage缓存');
    } catch (error) {
      console.error('保存到localStorage缓存时出错:', error);
      throw new Error('保存到localStorage缓存失败');
    }
  }
  
  // 保存数据到JSON文件
  async saveToJsonFile(data = this.numberGroups) {
    try {
      console.log(`尝试保存数据到文件: ${this.dataFilePath}`);
      
      // 在浏览器环境中，我们无法直接写入文件系统
      // 这里使用fetch API和PUT请求尝试更新文件
      // 注意：在实际生产环境中，这需要后端服务器支持
      const response = await fetch(this.dataFilePath, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data, null, 2)
      });
      
      console.log(`保存请求状态: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log('数据已保存到JSON文件');
        return true;
      } else {
        console.warn(`无法直接写入JSON文件: ${response.status} ${response.statusText}（可能需要服务器支持）`);
        return false;
      }
    } catch (error) {
      console.error('保存到JSON文件失败:', error);
      if (error.stack) {
        console.error('错误堆栈:', error.stack);
      }
      // 在浏览器环境中，通常需要服务器支持才能保存文件
      console.warn('前端环境中可能需要服务器支持才能保存文件。这是预期行为，应用将继续使用localStorage作为备份。');
      return false;
    }
  }
  
  // 加载存储的数据（兼容旧方法）
  loadStoredData() {
    return this.loadDataFromFile();
  }
  
  // 保存数据（更新缓存，文件保存需要服务器支持）
  async saveData() {
    try {
      const dataToSave = this.numberGroups;
      
      // 保存到localStorage缓存
      this.saveToLocalStorage(dataToSave);
      
      // 尝试保存到JSON文件
      await this.saveToJsonFile(dataToSave);
      
      // 更新UI
      this.updateDataCount();
      this.app.updateLatestGroupsDisplay();
      
      console.log(`成功更新 ${this.numberGroups.length} 组数据`);
      return true;
    } catch (error) {
      console.error('更新数据失败:', error);
      this.app.showToast('更新数据失败', 'error');
      return false;
    }
  }
  
  // 更新数据计数显示
  updateDataCount() {
    const dataCountElement = document.getElementById('data-count');
    if (dataCountElement) {
      dataCountElement.textContent = `共 ${this.numberGroups.length} 组数据`;
    }
  }
  
  // 添加号码组
  async addNumberGroup(group) {
    // 验证重复期数
    if (this.numberGroups.some(g => g.period === group.period)) {
      console.error(`期数 ${group.period} 已存在`);
      return false;
    }
    
    this.numberGroups.push(group);
    // 按录入编号排序，确保最大的编号在前面（最新录入的）
    // 转换为数字进行比较，避免字符串比较问题
    this.numberGroups.sort((a, b) => {
      const idA = parseInt(a.id || a.period, 10);
      const idB = parseInt(b.id || b.period, 10);
      return idB - idA;
    });
    
    await this.saveData();
    return true;
  }
  
  // 批量添加号码组
  async addNumberGroups(groups) {
    let successCount = 0;
    let duplicateCount = 0;
    
    for (const group of groups) {
      const result = await this.addNumberGroup(group);
      if (result) {
        successCount++;
      } else {
        duplicateCount++;
      }
    }
    
    return { successCount, duplicateCount };
  }
  
  // 获取所有号码组
  getAllNumberGroups() {
    return [...this.numberGroups];
  }
  
  // 获取最新的N个号码组
  getLatestNumberGroups(count = 3) {
    return this.numberGroups.slice(0, count);
  }
  
  // 清空所有数据
  clearAllData() {
    try {
      // 清空localStorage缓存
      localStorage.removeItem(this.storageKey);
      this.numberGroups = [];
      
      // 更新UI
      this.updateDataCount();
      this.app.updateLatestGroupsDisplay();
      
      console.log('所有数据已清空（注意：文件中的数据未改变）');
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      this.app.showToast('清空数据失败', 'error');
      return false;
    }
  }
  
  // 导出为JSON
  exportToJson() {
    try {
      const dataStr = JSON.stringify(this.numberGroups, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `number-matcher-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('数据导出成功');
      return true;
    } catch (error) {
      console.error('导出JSON失败:', error);
      this.app.showToast('导出JSON失败', 'error');
      return false;
    }
  }
  
  // 从JSON导入
  importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (!Array.isArray(data)) {
            throw new Error('数据格式错误：不是有效的数组');
          }
          
          // 验证每个数据项
          const validGroups = [];
          const invalidCount = 0;
          
          data.forEach(group => {
            if (group && group.period && group.numbers && Array.isArray(group.numbers)) {
              validGroups.push(group);
            }
          });
          
          // 添加有效数据
          const result = this.addNumberGroups(validGroups);
          
          resolve({
            successCount: result.successCount,
            duplicateCount: result.duplicateCount,
            invalidCount
          });
        } catch (error) {
          console.error('解析JSON失败:', error);
          reject(new Error(`解析JSON失败: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // 导出为压缩包
  exportAsZip() {
    try {
      // 创建完整的HTML内容
      let htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>号码匹配数据导出 - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
    }
    .number-group {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .period {
      font-weight: bold;
      color: #d32f2f;
    }
    .numbers {
      margin-top: 10px;
    }
    .number {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: #d32f2f;
      color: white;
      text-align: center;
      line-height: 30px;
      border-radius: 50%;
      margin: 5px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>号码匹配数据导出</h1>
  <p>导出时间: ${new Date().toLocaleString()}</p>
  <p>数据组数: ${this.numberGroups.length}</p>
  <div class="number-groups">`;
    
      // 添加每个号码组
      this.numberGroups.forEach(group => {
        htmlContent += `
      <div class="number-group">
        <div class="period">期数: ${group.period}</div>
        <div class="numbers">`;
        
        group.numbers.forEach(number => {
          htmlContent += `
          <span class="number">${number}</span>`;
        });
        
        htmlContent += `
        </div>
      </div>`;
      });
    
      htmlContent += `
  </div>
</body>
</html>`;
    
      // 创建JSON数据
      const jsonContent = JSON.stringify(this.numberGroups, null, 2);
      
      // 尝试使用JSZip创建真正的ZIP压缩包
      if (window.JSZip) {
        // 如果JSZip已加载，使用它创建ZIP文件
        const zip = new JSZip();
        zip.file("号码匹配数据报表.html", htmlContent);
        zip.file("号码匹配数据.json", jsonContent);
        zip.file("numberGroups.json", jsonContent); // 数据库文件
        
        // 生成ZIP文件并下载
        zip.generateAsync({type: "blob"}).then(content => {
          const url = URL.createObjectURL(content);
          const link = document.createElement('a');
          link.href = url;
          link.download = '导出文件压缩包.zip';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('ZIP压缩包导出成功');
          this.app.showToast('ZIP压缩包导出成功', 'success');
        });
      } else {
        // 如果没有JSZip，动态加载它
        this.app.showToast('正在加载压缩包功能，请稍候...', 'info');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => {
          // 重新调用此方法
          this.exportAsZip();
        };
        script.onerror = () => {
          // 如果加载失败，提供备选方案
          this.app.showToast('压缩包功能加载失败，使用备选方案', 'warning');
          this.exportAsFallback(htmlContent, jsonContent);
        };
        document.body.appendChild(script);
      }
      return true;
    } catch (error) {
      console.error('导出压缩包失败:', error);
      this.app.showToast('导出压缩包失败', 'error');
      return false;
    }
  }
  
  // 备选导出方案
  exportAsFallback(htmlContent, jsonContent) {
    try {
      // 创建一个包含所有数据的HTML文件
      const combinedContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>号码匹配数据压缩包</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    a { display: inline-block; margin: 10px 0; padding: 10px 15px; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px; }
    a:hover { background: #b71c1c; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>号码匹配数据导出</h1>
  <p>点击下方链接下载所需文件：</p>
  
  <h2>HTML 报表</h2>
  <a href="data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}" download="号码匹配数据报表.html">下载HTML报表</a>
  
  <h2>JSON 数据</h2>
  <a href="data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}" download="号码匹配数据.json">下载JSON数据</a>
  
  <h2>数据库文件</h2>
  <a href="data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}" download="numberGroups.json">下载数据库文件 (numberGroups.json)</a>
  
  <p style="margin-top: 20px; color: #999; font-size: 14px;">提示：您可以将所有文件保存到本地，然后手动压缩成ZIP文件。</p>
</body>
</html>`;
    
      // 创建并下载文件
      const blob = new Blob([combinedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = '导出文件压缩包.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('备选方案导出成功');
      return true;
    } catch (error) {
      console.error('备选方案导出失败:', error);
      this.app.showToast('导出失败', 'error');
      return false;
    }
  }
  
  // 导出数据库文件
  exportDatabase() {
    try {
      // 创建数据库文件内容
      const databaseContent = JSON.stringify(this.numberGroups, null, 2);
      
      // 创建并下载文件
      const blob = new Blob([databaseContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'numberGroups.json'; // 与原数据库文件名相同
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.app.showToast('数据库导出成功，请手动覆盖原数据库文件', 'success');
      console.log('数据库导出成功');
      return true;
    } catch (error) {
      console.error('导出数据库失败:', error);
      this.app.showToast('导出数据库失败', 'error');
      return false;
    }
  }
  
  // 从远程URL同步数据
  async syncDataFromRemote(remoteUrl) {
    try {
      this.app.showToast('正在从远程同步数据，请稍候...', 'info');
      console.log(`开始从远程URL同步数据: ${remoteUrl}`);
      
      // 保存当前数据作为备份
      this.backupCurrentData();
      
      // 发送请求获取远程数据
      const response = await fetch(remoteUrl, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'reload' // 强制刷新缓存
      });
      
      console.log(`远程请求状态: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`远程数据加载失败: ${response.status} ${response.statusText}`);
      }
      
      // 读取并解析JSON数据
      const responseText = await response.text();
      console.log(`远程响应文本长度: ${responseText.length} 字符`);
      
      try {
        const remoteData = JSON.parse(responseText);
        
        // 验证数据格式
        if (!Array.isArray(remoteData)) {
          throw new Error('远程数据不是有效的数组格式');
        }
        
        console.log(`远程数据组数: ${remoteData.length}`);
        
        // 合并或替换本地数据
        // 这里使用替换策略，可以根据需求改为合并策略
        this.numberGroups = [...remoteData];
        
        // 按录入编号排序
        this.numberGroups.sort((a, b) => {
          const idA = parseInt(a.id || a.period, 10);
          const idB = parseInt(b.id || b.period, 10);
          return idB - idA;
        });
        
        // 保存更新后的数据
        await this.saveData();
        
        this.app.showToast(`成功从远程同步 ${this.numberGroups.length} 组数据`, 'success');
        console.log('远程数据同步成功');
        return true;
      } catch (jsonError) {
        console.error('远程数据解析失败:', jsonError);
        // 输出前100个字符以帮助调试
        console.log('响应文本前100字符:', responseText.substring(0, 100));
        throw new Error(`远程数据格式错误: ${jsonError.message}`);
      }
    } catch (error) {
      console.error('远程数据同步失败:', error);
      this.app.showToast(`远程同步失败: ${error.message}`, 'error');
      return false;
    }
  }
  
  // 备份当前数据
  backupCurrentData() {
    try {
      const backupKey = `backup_${this.storageKey}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(this.numberGroups));
      
      // 清理旧备份，保留最近5个
      this.cleanupOldBackups();
      
      console.log(`数据备份完成，备份键名: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('数据备份失败:', error);
      return null;
    }
  }
  
  // 清理旧备份
  cleanupOldBackups() {
    try {
      const backupKeys = [];
      const backupPrefix = `backup_${this.storageKey}_`;
      
      // 收集所有备份键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(backupPrefix)) {
          backupKeys.push(key);
        }
      }
      
      // 按时间戳排序（降序）
      backupKeys.sort().reverse();
      
      // 删除超过保留数量的备份
      const keepCount = 5;
      for (let i = keepCount; i < backupKeys.length; i++) {
        localStorage.removeItem(backupKeys[i]);
        console.log(`删除旧备份: ${backupKeys[i]}`);
      }
    } catch (error) {
      console.error('清理备份失败:', error);
    }
  }
  
  // 获取默认远程数据URL（可根据需求修改）
  getDefaultRemoteDataUrl() {
    // 您可以设置为GitHub Gist或其他公开URL
    // return 'https://gist.githubusercontent.com/YOUR_USERNAME/YOUR_GIST_ID/raw/numberGroups.json';
    return '';
  }
  
  // 批量导入号码组（优化版本，支持去重和更新）
  async importNumberGroups(groups, options = {}) {
    const {
      updateExisting = true,  // 是否更新已存在的组
      skipDuplicates = true,  // 是否跳过重复的组
      showToast = true        // 是否显示提示信息
    } = options;
    
    try {
      let successCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      // 备份当前数据
      this.backupCurrentData();
      
      for (const group of groups) {
        try {
          // 验证数据格式
          if (!group || !group.period || !group.numbers || !Array.isArray(group.numbers)) {
            errorCount++;
            continue;
          }
          
          // 检查是否已存在
          const existingIndex = this.numberGroups.findIndex(g => g.period === group.period);
          
          if (existingIndex >= 0) {
            if (updateExisting) {
              // 更新已存在的组
              this.numberGroups[existingIndex] = { ...group };
              updatedCount++;
            } else if (skipDuplicates) {
              // 跳过重复的组
              skippedCount++;
              continue;
            }
          } else {
            // 添加新组
            this.numberGroups.push({ ...group });
            successCount++;
          }
        } catch (err) {
          console.error('处理单个号码组失败:', err);
          errorCount++;
        }
      }
      
      // 按录入编号排序
      this.numberGroups.sort((a, b) => {
        const idA = parseInt(a.id || a.period, 10);
        const idB = parseInt(b.id || b.period, 10);
        return idB - idA;
      });
      
      // 保存更新后的数据
      await this.saveData();
      
      // 显示结果
      if (showToast) {
        let message = `导入完成: 添加 ${successCount} 组`;
        if (updatedCount > 0) message += `, 更新 ${updatedCount} 组`;
        if (skippedCount > 0) message += `, 跳过 ${skippedCount} 组`;
        if (errorCount > 0) message += `, 错误 ${errorCount} 组`;
        
        this.app.showToast(message, successCount + updatedCount > 0 ? 'success' : 'warning');
      }
      
      console.log(`批量导入结果: 添加${successCount} 更新${updatedCount} 跳过${skippedCount} 错误${errorCount}`);
      return { successCount, updatedCount, skippedCount, errorCount };
    } catch (error) {
      console.error('批量导入失败:', error);
      if (showToast) {
        this.app.showToast('批量导入失败', 'error');
      }
      return { successCount: 0, updatedCount: 0, skippedCount: 0, errorCount: groups.length };
    }
  }
}

export default DataManager;
