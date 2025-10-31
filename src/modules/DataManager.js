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
      const response = await fetch(this.dataFilePath);
      if (!response.ok) {
        throw new Error(`文件加载失败: ${response.status}`);
      }
      
      this.numberGroups = await response.json();
      // 按录入编号排序，确保最大的编号在前面（最新录入的）
      // 转换为数字进行比较，避免字符串比较问题
      this.numberGroups.sort((a, b) => {
        const idA = parseInt(a.id || a.period, 10);
        const idB = parseInt(b.id || b.period, 10);
        return idB - idA;
      });
      
      console.log(`成功从文件加载 ${this.numberGroups.length} 组号码数据`);
      
      // 更新UI
      this.updateDataCount();
      this.app.updateLatestGroupsDisplay();
      
      // 同时更新localStorage作为缓存
      this.saveToLocalStorage();
      
      return true;
    } catch (error) {
      console.error('从文件加载数据失败:', error);
      // 尝试从localStorage加载作为备份
      return this.loadFromLocalStorage();
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
      
      if (response.ok) {
        console.log('数据已保存到JSON文件');
        return true;
      } else {
        console.warn('无法直接写入JSON文件（可能需要服务器支持）');
        return false;
      }
    } catch (error) {
      console.warn('保存到JSON文件时出错（浏览器环境限制）:', error);
      // 在浏览器环境中，直接文件写入通常会失败，这是预期行为
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
}

export default DataManager;
