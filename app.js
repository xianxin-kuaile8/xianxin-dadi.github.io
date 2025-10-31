// 应用程序主文件
class NumberMatcherApp {
    constructor() {
        // 数据存储
        this.numberGroups = [];
        this.selectedNumbers = new Set();
        this.maxSelection = 25;
        
        // DOM元素引用
        this.initDOMReferences();
        
        // 初始化
        this.initNumberSelector();
        this.setupEventListeners();
        
        // 初始化DataManager并加载数据
        this.initializeDataManager();
    }
    
    // 初始化DataManager
    async initializeDataManager() {
        try {
            // 动态导入DataManager
            const { default: DataManager } = await import('./src/modules/DataManager.js');
            this.dataManager = new DataManager(this);
            
            // 加载数据
            await this.dataManager.loadStoredData();
            
            // 更新UI
            this.updateLatestGroupsDisplay();
            this.updateDataCount();
        } catch (error) {
            console.error('初始化DataManager失败:', error);
            this.showToast('数据管理器初始化失败', 'error');
            // 回退到localStorage
            this.loadStoredData();
        }
    }
    
    // 初始化DOM引用
    initDOMReferences() {
        // 确保所有元素都能正确找到
          console.log('初始化DOM引用...');
        
        this.numberSelector = document.getElementById('number-selector');
        console.log('号码选择器:', this.numberSelector);
        
        this.selectedCountEl = document.getElementById('selected-count');
        this.clearSelectionBtn = document.getElementById('clear-selection');
        this.matchButtons = document.querySelectorAll('.match-btn');
        console.log('匹配按钮数量:', this.matchButtons.length);
        
        this.resultsContainer = document.getElementById('results-container');
        this.latestGroupsContainer = document.getElementById('latest-groups-container');
        
        // 导入相关
        this.singleIdInput = document.getElementById('single-id');
        this.singleNumbersInput = document.getElementById('single-numbers');
        this.importSingleBtn = document.getElementById('import-single');
        this.batchInput = document.getElementById('batch-input');
        this.importBatchBtn = document.getElementById('import-batch');
        
        // 数据管理相关
        this.exportHtmlBtn = document.getElementById('export-html');
        console.log('导出按钮:', this.exportHtmlBtn);
        
        // 导出数据库按钮
        this.exportDatabaseBtn = document.getElementById('export-database');
        console.log('导出数据库按钮:', this.exportDatabaseBtn);
        
        // 保存功能已移除
        
        // JSON导出和导入相关
        this.exportJsonBtn = document.getElementById('export-json');
        this.importJsonInput = document.getElementById('import-json');
        console.log('JSON导出按钮:', this.exportJsonBtn);
        console.log('JSON导入输入框:', this.importJsonInput);
        
        this.clearAllDataBtn = document.getElementById('clear-all-data');
        this.dataCountEl = document.getElementById('data-count');
        
        // Toast提示
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toast-message');
        this.toastIcon = document.getElementById('toast-icon');
        
        // 当前匹配模式
        this.currentMatchMode = null;
        
        // 确保所有必需的DOM元素都存在
        if (!this.numberSelector) {
            console.error('未找到号码选择器容器！');
        }
    };
    
    // 初始化号码选择器 - 完全重构以确保正确创建1-80的号码球
    initNumberSelector() {
        try {
            if (!this.numberSelector) {
                console.error('严重错误：号码选择器容器未找到！');
                return;
            }
            
            // 清空容器
            this.numberSelector.innerHTML = '';
            console.log('开始创建1-80号码球...');
            
            // 创建1-80的号码球 - 使用更直接的方法
            const fragment = document.createDocumentFragment();
            for (let i = 1; i <= 80; i++) {
                const number = i.toString().padStart(2, '0');
                const ball = document.createElement('div');
                ball.className = 'number-ball cursor-pointer transition-all duration-200 hover:scale-110';
                ball.textContent = number;
                ball.dataset.number = number;
                
                // 添加点击事件
                const ballRef = ball; // 创建引用以避免闭包问题
                ball.onclick = () => this.toggleNumberSelection(number, ballRef);
                
                fragment.appendChild(ball);
                
                // 每创建10个号码球记录一次日志，确认进度
                if (i % 10 === 0) {
                    console.log(`已创建${i}个号码球`);
                }
            }
            
            // 一次性将所有号码球添加到DOM
            this.numberSelector.appendChild(fragment);
            console.log('号码选择器初始化完成，共创建了80个号码球');
        } catch (error) {
            console.error('初始化号码选择器时出错:', error);
        }
    };
    
    // 切换号码选择状态
    toggleNumberSelection(number, element) {
        if (this.selectedNumbers.has(number)) {
            // 取消选择
            this.selectedNumbers.delete(number);
            element.classList.remove('selected');
        } else {
            // 选中号码
            if (this.selectedNumbers.size >= this.maxSelection) {
                this.showToast('最多只能选择25个号码', 'error');
                return;
            }
            this.selectedNumbers.add(number);
            element.classList.add('selected');
        }
        
        this.updateSelectedCount();
        
        // 如果有当前匹配模式，且选择的号码足够，自动重新执行匹配
        if (this.currentMatchMode && this.selectedNumbers.size >= this.currentMatchMode) {
            // 不清除结果，直接重新匹配
            setTimeout(() => this.performMatch(this.currentMatchMode), 100);
        } else {
            this.clearResults();
        }
    };
    
    // 更新已选择数量
    updateSelectedCount() {
        this.selectedCountEl.textContent = this.selectedNumbers.size;
    };
    
    // 一键清除选择
    clearSelection() {
        this.selectedNumbers.clear();
        document.querySelectorAll('.number-ball.selected').forEach(ball => {
            ball.classList.remove('selected');
        });
        this.updateSelectedCount();
        this.clearResults();
        this.showToast('已清除所有选择', 'success');
    };
    
    // 清除结果显示
    clearResults() {
        this.resultsContainer.innerHTML = '<p class="text-gray-400 text-center py-6">请先选择号码并点击匹配按钮</p>';
    };
    
    // 设置事件监听器
    setupEventListeners() {
        // 清除选择按钮
        if (this.clearSelectionBtn) {
            this.clearSelectionBtn.addEventListener('click', () => {
                this.clearSelection();
                // 清除匹配状态
                this.currentMatchMode = null;
                // 移除所有匹配按钮的active类
                if (this.matchButtons.length > 0) {
                    this.matchButtons.forEach(matchBtn => matchBtn.classList.remove('active'));
                }
            });
        }
        
        // 匹配按钮 - 增强点击反馈和active样式
        if (this.matchButtons.length > 0) {
            console.log('匹配按钮初始化:', this.matchButtons);
            this.matchButtons.forEach(btn => {
                // 先移除可能存在的旧监听器
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', () => {
                    // 移除所有按钮的active类
                    this.matchButtons.forEach(matchBtn => matchBtn.classList.remove('active'));
                    // 为当前按钮添加active类
                    newBtn.classList.add('active');
                    
                    // 更强的视觉反馈
                    const originalBg = newBtn.classList.value;
                    newBtn.classList.add('bg-neon-blue', 'scale-105', 'shadow-neon');
                    setTimeout(() => {
                        newBtn.className = originalBg + ' active'; // 保留active类
                    }, 300);
                    
                    const matchCount = parseInt(newBtn.dataset.match);
                    console.log('执行匹配:', matchCount);
                    // 设置当前匹配模式
                    this.currentMatchMode = matchCount;
                    this.performMatch(matchCount);
                });
            });
        }
        
        // 保存到数据库按钮
        if (this.saveDatabaseBtn) {
            console.log('保存到数据库按钮初始化');
            const newSaveBtn = this.saveDatabaseBtn.cloneNode(true);
            this.saveDatabaseBtn.parentNode.replaceChild(newSaveBtn, this.saveDatabaseBtn);
            this.saveDatabaseBtn = newSaveBtn;
            
            this.saveDatabaseBtn.addEventListener('click', () => {
                console.log('点击保存到数据库按钮');
                this.saveDataWithConfirmation();
            });
        } else {
            console.warn('保存到数据库按钮未找到');
            // 尝试通过ID查找
            const fallbackSaveBtn = document.getElementById('save-database');
            if (fallbackSaveBtn) {
                this.saveDatabaseBtn = fallbackSaveBtn;
                this.saveDatabaseBtn.addEventListener('click', () => this.saveDataWithConfirmation());
                console.log('通过ID找到保存到数据库按钮');
            }
        }
        
        // 单个导入 - 增强版
        try {
            if (this.importSingleBtn) {
                console.log('找到单次导入按钮');
                this.importSingleBtn.onclick = () => {
                    console.log('点击了单次导入按钮');
                    this.importSingleNumberGroup();
                };
            } else {
                console.error('单次导入按钮未找到！');
            }
            
            // 批量导入 - 增强版
            if (this.importBatchBtn) {
                console.log('找到批量导入按钮');
                this.importBatchBtn.onclick = () => {
                    console.log('点击了批量导入按钮');
                    this.importBatchNumberGroups();
                };
            } else {
                console.error('批量导入按钮未找到！');
            }
            console.log('导入功能初始化完成');
        } catch (error) {
            console.error('导入功能初始化出错:', error);
        }
        
        // 导出HTML - 增强事件绑定和错误处理
        try {
            if (this.exportHtmlBtn) {
                console.log('导出按钮已找到，重新绑定事件');
                // 先移除可能存在的旧监听器
                const newExportBtn = this.exportHtmlBtn.cloneNode(true);
                this.exportHtmlBtn.parentNode.replaceChild(newExportBtn, this.exportHtmlBtn);
                this.exportHtmlBtn = newExportBtn; // 更新引用
                
                this.exportHtmlBtn.onclick = () => {
                    console.log('导出HTML按钮点击，执行导出');
                    try {
                        this.exportToHtml();
                    } catch (error) {
                        console.error('导出HTML错误:', error);
                        this.showToast('导出失败: ' + error.message, 'error');
                    }
                };
            } else {
                console.error('导出按钮未找到');
                // 尝试通过查询选择器再次查找
                const fallbackExportBtn = document.querySelector('#export-html');
                if (fallbackExportBtn) {
                    this.exportHtmlBtn = fallbackExportBtn;
                    console.log('通过查询选择器找到导出按钮');
                    this.exportHtmlBtn.onclick = () => this.exportToHtml();
                }
            }
        } catch (error) {
            console.error('导出功能初始化出错:', error);
        }
        
        // JSON导出功能 - 增强事件绑定和错误处理
        try {
            if (this.exportJsonBtn) {
                console.log('JSON导出按钮已找到，绑定事件');
                // 先移除可能存在的旧监听器
                const newExportJsonBtn = this.exportJsonBtn.cloneNode(true);
                this.exportJsonBtn.parentNode.replaceChild(newExportJsonBtn, this.exportJsonBtn);
                this.exportJsonBtn = newExportJsonBtn; // 更新引用
                
                this.exportJsonBtn.onclick = () => {
                    console.log('导出JSON按钮点击，执行导出');
                    try {
                        this.exportToJson();
                    } catch (error) {
                        console.error('导出JSON错误:', error);
                        this.showToast('导出JSON失败: ' + error.message, 'error');
                    }
                };
            } else {
                console.error('JSON导出按钮未找到');
            }
        } catch (error) {
            console.error('JSON导出功能初始化出错:', error);
        }
        
        // JSON导入功能 - 增强事件绑定和错误处理
        try {
            if (this.importJsonInput) {
                console.log('JSON导入输入框已找到，绑定事件');
                // 先移除可能存在的旧监听器
                const newImportJsonInput = this.importJsonInput.cloneNode(true);
                this.importJsonInput.parentNode.replaceChild(newImportJsonInput, this.importJsonInput);
                this.importJsonInput = newImportJsonInput; // 更新引用
                
                this.importJsonInput.onchange = (event) => {
                    console.log('JSON文件选择，执行导入');
                    try {
                        const file = event.target.files[0];
                        if (file) {
                            this.importFromJson(file);
                        }
                        // 清空input值，允许重新选择同一个文件
                        event.target.value = '';
                    } catch (error) {
                        console.error('导入JSON错误:', error);
                        this.showToast('导入JSON失败: ' + error.message, 'error');
                        // 清空input值
                        event.target.value = '';
                    }
                };
            } else {
                console.error('JSON导入输入框未找到');
            }
        } catch (error) {
            console.error('JSON导入功能初始化出错:', error);
        }
        
        // 清空所有数据
        if (this.clearAllDataBtn) {
            this.clearAllDataBtn.addEventListener('click', () => this.clearAllData());
        }
        
        // 导出数据库按钮
        if (this.exportDatabaseBtn) {
            console.log('导出数据库按钮已找到，绑定事件');
            const newExportDbBtn = this.exportDatabaseBtn.cloneNode(true);
            this.exportDatabaseBtn.parentNode.replaceChild(newExportDbBtn, this.exportDatabaseBtn);
            this.exportDatabaseBtn = newExportDbBtn;
            
            this.exportDatabaseBtn.onclick = () => {
                console.log('导出数据库按钮点击');
                this.exportDatabase();
            };
        } else {
            // 尝试通过ID查找
            const fallbackExportDbBtn = document.getElementById('export-database');
            if (fallbackExportDbBtn) {
                this.exportDatabaseBtn = fallbackExportDbBtn;
                this.exportDatabaseBtn.onclick = () => this.exportDatabase();
                console.log('通过ID找到导出数据库按钮');
            }
        }
    };
    
    // 从localStorage加载数据（备用方案）
    loadStoredData() {
        try {
            const stored = localStorage.getItem('numberGroups');
            if (stored) {
                this.numberGroups = JSON.parse(stored);
                // 按编号排序，确保最新的在后面
                this.numberGroups.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                console.log('从localStorage加载了数据，共', this.numberGroups.length, '条');
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showToast('加载数据失败', 'error');
        }
    };
    
    // 保存数据到localStorage
    saveData() {
        try {
            localStorage.setItem('numberGroups', JSON.stringify(this.numberGroups));
            this.updateLatestGroupsDisplay();
            this.updateDataCount();
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showToast('保存数据失败', 'error');
            return false;
        }
    };
    
    // 保存数据方法已优化（自动保存）
    
    // 更新最新号码组显示
    updateLatestGroupsDisplay() {
        if (this.numberGroups.length === 0) {
            this.latestGroupsContainer.innerHTML = '<p class="text-gray-400 text-center py-6">暂无录入的号码组</p>';
            return;
        }
        
        // 按编号降序排序，获取最新的3个号码组（最大的编号为最新）
        const latestGroups = [...this.numberGroups]
            .sort((a, b) => {
                const idA = parseInt(a.id, 10);
                const idB = parseInt(b.id, 10);
                return idB - idA; // 降序排序，最大的编号在前
            })
            .slice(0, 3);
        this.latestGroupsContainer.innerHTML = '';
        
        latestGroups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'p-3 border border-gray-700 rounded-lg bg-dark-accent/50';
            
            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-2';
            header.innerHTML = `
                <span class="font-bold text-neon-blue">编号: ${group.id}</span>
                <span class="text-xs text-gray-500">${new Date(group.timestamp).toLocaleString()}</span>
            `;
            
            const numbers = document.createElement('div');
            numbers.className = 'flex flex-wrap gap-1';
            group.numbers.forEach(num => {
                const numEl = document.createElement('span');
                numEl.className = 'inline-flex items-center justify-center w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue text-sm font-medium';
                numEl.textContent = num;
                numbers.appendChild(numEl);
            });
            
            groupEl.appendChild(header);
            groupEl.appendChild(numbers);
            this.latestGroupsContainer.appendChild(groupEl);
        });
    }
    
    // 更新数据计数
    updateDataCount() {
        this.dataCountEl.textContent = this.numberGroups.length;
    }
    
    // 添加防抖辅助方法
    debounce(fn, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }
    
    // 优化的事件监听器绑定方法
    addEventListener(element, event, handler) {
        if (!element) return;
        
        // 移除可能存在的旧监听器
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        // 绑定新监听器
        newElement.addEventListener(event, handler);
        
        // 存储监听器信息以便后续清理
        if (!this.eventListeners) this.eventListeners = [];
        this.eventListeners.push({ element: newElement, event, handler });
        
        return newElement;
    }
    
    // 清理所有事件监听器
    cleanup() {
        if (!this.eventListeners) return;
        
        this.eventListeners.forEach(({ element, event, handler }) => {
            if (element && element.removeEventListener) {
                element.removeEventListener(event, handler);
            }
        });
        
        this.eventListeners = [];
    }
    
    // 导入单个号码组
    importSingleNumberGroup() {
        const id = this.singleIdInput.value.trim();
        const numbersStr = this.singleNumbersInput.value.trim();
        
        if (!id || !numbersStr) {
            this.showToast('请填写完整的编号和号码组', 'error');
            return;
        }
        
        if (!/^\d+$/.test(id)) {
            this.showToast('编号必须为数字', 'error');
            return;
        }
        
        try {
            // 移除可能的空格，确保正确分割
            const cleanNumbersStr = numbersStr.replace(/\s+/g, ',');
            const numbers = cleanNumbersStr.split(',').filter(num => num.trim()).map(num => num.trim().padStart(2, '0'));
            
            // 验证号码格式和数量
            if (numbers.length !== 20) {
                this.showToast(`每个号码组必须包含20个号码，当前提供了${numbers.length}个`, 'error');
                return;
            }
            
            // 验证号码范围
            const invalidNumbers = numbers.filter(num => {
                const numInt = parseInt(num);
                return isNaN(numInt) || numInt < 1 || numInt > 80;
            });
            
            if (invalidNumbers.length > 0) {
                this.showToast(`以下号码无效: ${invalidNumbers.join(', ')}，号码必须在1-80之间`, 'error');
                return;
            }
            
            // 检查重复号码
            const uniqueNumbers = new Set(numbers);
            if (uniqueNumbers.size !== 20) {
                this.showToast('号码组中存在重复号码', 'error');
                return;
            }
            
            // 检查重复编号
            if (this.numberGroups.some(group => group.id === id)) {
                this.showToast('该编号已存在', 'error');
                return;
            }
            
            // 显示加载状态
            this.showLoading('正在导入...');
            
            setTimeout(() => {
                // 添加到数据中
                this.numberGroups.push({
                    id,
                    numbers: Array.from(uniqueNumbers).sort(), // 排序后存储
                    timestamp: new Date().toISOString()
                });
                
                // 重新排序 - 按编号降序，确保最大的编号在前面
                this.numberGroups.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                
                this.saveData();
                this.singleIdInput.value = '';
                this.singleNumbersInput.value = '';
                
                this.hideLoading();
                this.showToast('导入成功', 'success');
                
                // 导入成功后自动执行匹配分析（如果有选中的号码）
                if (this.selectedNumbers.size >= 3) {
                    // 根据选中号码数量选择合适的匹配数
                    const matchCount = Math.min(this.selectedNumbers.size, 5);
                    setTimeout(() => this.performMatch(matchCount), 1000);
                }
            }, 100); // 短暂延迟让UI有机会更新
        } catch (error) {
            console.error('导入失败:', error);
            this.hideLoading();
            this.showToast('导入失败，请检查格式', 'error');
        }
    }
    
    // 批量导入号码组
    importBatchNumberGroups() {
        const input = this.batchInput.value.trim();
        if (!input) {
            this.showToast('请输入批量数据', 'error');
            return;
        }
        
        const lines = input.split('\n').filter(line => line.trim());
        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        
        const existingIds = new Set(this.numberGroups.map(group => group.id));
        const totalLines = lines.length;
        
        // 显示加载状态
        this.showLoading(`正在导入数据...`);
        
        // 分批处理以避免UI阻塞
        const batchSize = 50;
        const processBatch = (startIndex) => {
            const endIndex = Math.min(startIndex + batchSize, totalLines);
            const batch = lines.slice(startIndex, endIndex);
            
            for (const line of batch) {
                try {
                    const [id, numbersStr] = line.split(/\s+/, 2);
                    
                    if (!id || !numbersStr) {
                        errorCount++;
                        continue;
                    }
                    
                    if (!/^\d+$/.test(id)) {
                        errorCount++;
                        continue;
                    }
                    
                    if (existingIds.has(id)) {
                        duplicateCount++;
                        continue;
                    }
                    
                    const numbers = numbersStr.split(',').map(num => num.trim().padStart(2, '0'));
                    
                    if (numbers.length !== 20) {
                        errorCount++;
                        continue;
                    }
                    
                    let validNumbers = true;
                    for (const num of numbers) {
                        const numInt = parseInt(num);
                        if (isNaN(numInt) || numInt < 1 || numInt > 80) {
                            validNumbers = false;
                            break;
                        }
                    }
                    
                    if (!validNumbers) {
                        errorCount++;
                        continue;
                    }
                    
                    this.numberGroups.push({
                        id,
                        numbers,
                        timestamp: new Date().toISOString()
                    });
                    existingIds.add(id);
                    importedCount++;
                } catch (error) {
                    errorCount++;
                }
            }
            
            // 更新进度
            if (endIndex < totalLines) {
                this.showLoading(`正在导入数据... ${endIndex}/${totalLines}`);
                setTimeout(() => processBatch(endIndex), 10); // 短暂延迟让UI有机会更新
            } else {
                // 所有批次处理完成
                // 重新排序
                this.numberGroups.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                
                this.saveData();
                this.batchInput.value = '';
                
                this.hideLoading();
                let message = `批量导入完成。成功: ${importedCount}, 重复: ${duplicateCount}, 错误: ${errorCount}`;
                this.showToast(message, importedCount > 0 ? 'success' : 'error');
            }
        };
        
        // 开始处理第一批次
        processBatch(0);
    }
    
    // 执行号码匹配 - 添加防抖功能和性能优化
    performMatch = this.debounce(function(matchCount) {
        if (!matchCount || matchCount < 1) {
            matchCount = 3; // 默认值
        }
        
        if (this.selectedNumbers.size < matchCount) {
            this.showToast(`请至少选择${matchCount}个号码`, 'error');
            return;
        }
        
        if (this.numberGroups.length === 0) {
            this.showToast('暂无号码组数据', 'error');
            return;
        }
        
        // 显示加载状态
        this.showLoading(`正在进行${matchCount}码匹配...`);
        
        try {
            // 使用setTimeout让UI有机会更新
            setTimeout(() => {
                const selectedArray = Array.from(this.selectedNumbers);
                
                // 计算组合可能数量，防止过度计算
                // 增加上限以支持更复杂的匹配需求
                const maxCombinations = 300000;
                const possibleCombinations = this.calculateCombinationCount(selectedArray.length, matchCount);
                
                if (possibleCombinations > maxCombinations) {
                    this.hideLoading();
                    this.showToast(`组合数量过多(${possibleCombinations})，请减少选择的号码数量或降低匹配数量`, 'error');
                    return;
                }
                
                // 优化组合生成，避免阻塞UI
                const combinations = this.generateCombinations(selectedArray, matchCount);
                const matchResults = {};
                
                // 计算组合数量，用于进度显示
                const totalCombinations = combinations.length;
                let processedCombinations = 0;
                
                // 优化性能：预处理号码组数据，使用Set提高查找效率
                const optimizedNumberGroups = this.numberGroups.map(group => ({
                    id: group.id,
                    numbersSet: new Set(group.numbers)
                }));
                
                // 分批处理组合匹配
                const batchSize = Math.max(100, Math.floor(totalCombinations / 50)); // 根据组合数量动态调整批处理大小
                const processBatch = (startIndex) => {
                    const endIndex = Math.min(startIndex + batchSize, totalCombinations);
                    const batch = combinations.slice(startIndex, endIndex);
                    
                    for (const combo of batch) {
                        const comboKey = combo.sort().join(',');
                        matchResults[comboKey] = {
                            combination: combo,
                            count: 0,
                            latestGroupId: null,
                            latestGroupTimestamp: null,
                            frequencyRate: 0
                        };
                        
                        // 优化：使用Set提高匹配效率
                        const comboSet = new Set(combo);
                        
                        // 确保处理所有号码组，包括25282等
                        for (const group of optimizedNumberGroups) {
                            // 优化：快速检查交集大小
                            let intersectionCount = 0;
                            for (const num of combo) {
                                if (group.numbersSet.has(num)) {
                                    intersectionCount++;
                                }
                                // 提前退出：如果剩余数字即使全部匹配也无法达到matchCount
                                if (intersectionCount + (combo.length - intersectionCount) < matchCount) {
                                    break;
                                }
                            }
                            
                            if (intersectionCount === matchCount) {
                                matchResults[comboKey].count++;
                                
                                // 获取当前匹配组的完整信息
                                const fullGroup = this.numberGroups.find(g => g.id === group.id);
                                
                                // 获取当前匹配组的ID和时间戳
                                const currentGroupId = group.id;
                                const currentTimestamp = fullGroup && fullGroup.timestamp ? 
                                    new Date(fullGroup.timestamp).getTime() : 0;
                                
                                // 如果这是第一个匹配，直接设置
                                if (!matchResults[comboKey].latestGroupId) {
                                    matchResults[comboKey].latestGroupId = currentGroupId;
                                    matchResults[comboKey].latestGroupTimestamp = fullGroup?.timestamp || new Date().toISOString();
                                } else {
                                    // 提取纯数字部分的辅助函数
                                    const extractNumbers = (id) => {
                                        const numStr = String(id).replace(/[^0-9]/g, '');
                                        return parseInt(numStr || '0', 10);
                                    };
                                    
                                    // 转换当前ID和已存储ID为数字
                                    const currentGroupNum = extractNumbers(currentGroupId);
                                    const storedGroupNum = extractNumbers(matchResults[comboKey].latestGroupId);
                                    
                                    // 获取最新录入的号码组（用于比较哪个更接近）
                                    const latestStoredNumberGroup = [...this.numberGroups].sort((a, b) => {
                                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                                    })[0];
                                    const latestStoredNum = latestStoredNumberGroup ? 
                                        extractNumbers(latestStoredNumberGroup.id) : 0;
                                    
                                    // 计算差值：当前组ID与最新录入组ID的差值
                                    const currentDiff = Math.abs(currentGroupNum - latestStoredNum);
                                    const storedDiff = Math.abs(storedGroupNum - latestStoredNum);
                                    
                                    // 优先选择差值更小的（更接近最新录入组的ID）
                                    if (currentDiff < storedDiff) {
                                        matchResults[comboKey].latestGroupId = currentGroupId;
                                        matchResults[comboKey].latestGroupTimestamp = fullGroup?.timestamp || new Date().toISOString();
                                    } else if (currentDiff === storedDiff) {
                                        // 如果差值相同，使用时间戳判断
                                        const storedTimestamp = matchResults[comboKey].latestGroupTimestamp ? 
                                            new Date(matchResults[comboKey].latestGroupTimestamp).getTime() : 0;
                                        
                                        if (currentTimestamp > storedTimestamp) {
                                            matchResults[comboKey].latestGroupId = currentGroupId;
                                            matchResults[comboKey].latestGroupTimestamp = fullGroup?.timestamp || new Date().toISOString();
                                        }
                                    }
                                }
                            }
                        }
                        
                        processedCombinations++;
                    }
                    
                    // 更新进度或完成处理
                    if (endIndex < totalCombinations) {
                        const progress = Math.round((processedCombinations / totalCombinations) * 100);
                        this.showLoading(`正在进行${matchCount}码匹配... ${progress}%`);
                        setTimeout(() => processBatch(endIndex), 10);
                    } else {
                        // 过滤出有匹配的结果并排序
                        const validResults = Object.values(matchResults).filter(result => result.count > 0);
                        
                        // 计算频率率并排序
                        validResults.forEach(result => {
                            result.frequencyRate = (result.count / this.numberGroups.length * 100).toFixed(2);
                        });
                        
                        validResults.sort((a, b) => b.count - a.count);
                        
                        // 隐藏加载状态
                        this.hideLoading();
                        
                        // 显示结果
                        this.displayMatchResults(validResults, matchCount);
                    }
                };
                
                // 开始处理
                if (totalCombinations > 0) {
                    processBatch(0);
                } else {
                    this.hideLoading();
                    this.displayMatchResults([], matchCount);
                }
            }, 10);
        } catch (error) {
            console.error('匹配过程中发生错误:', error);
            this.hideLoading();
            this.showToast('匹配失败，请重试', 'error');
        }
    }, 500); // 500ms防抖延迟
    
    // 计算组合数量 (n选k)
    calculateCombinationCount(n, k) {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        
        k = Math.min(k, n - k); // 优化：使用组合对称性
        let result = 1;
        
        for (let i = 1; i <= k; i++) {
            result = result * (n - k + i) / i;
            // 防止过大的数值
            if (result > 1000000) break;
        }
        
        return Math.round(result);
    }
    
    // 生成组合
    generateCombinations(array, size) {
        const result = [];
        
        function backtrack(start, currentCombo) {
            if (currentCombo.length === size) {
                result.push([...currentCombo]);
                return;
            }
            
            for (let i = start; i < array.length; i++) {
                currentCombo.push(array[i]);
                backtrack(i + 1, currentCombo);
                currentCombo.pop();
            }
        }
        
        backtrack(0, []);
        return result;
    }
    
    // 显示匹配结果
    displayMatchResults(results, matchCount) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<p class="text-gray-400 text-center py-6">未找到匹配结果</p>';
            return;
        }
        
        // 只显示前15个结果
        const displayResults = results.slice(0, 15);
        
        this.resultsContainer.innerHTML = '';
        
        // 创建结果表格
        const table = document.createElement('table');
        table.className = 'w-full text-left';
        
        // 表头
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr class="border-b border-gray-700">
                <th class="py-3 px-2">排名</th>
                <th class="py-3 px-2">${matchCount}码组合</th>
                <th class="py-3 px-2">出现次数</th>
                <th class="py-3 px-2">频率率</th>
                <th class="py-3 px-2">最近期数</th>
                <th class="py-3 px-2">遗漏期数</th>
            </tr>
        `;
        
        // 表体
        const tbody = document.createElement('tbody');
        
        displayResults.forEach((result, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-800 hover:bg-dark-accent/30 transition-colors';
            
            // 获取最近出现的那组号码的编号
            const latestGroupId = result.latestGroupId;
            // 获取最新录入的号码组编号（按时间戳排序获取真正最新的）
            const latestStoredNumberGroup = [...this.numberGroups].sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            })[0];
            
            // 遗漏期数计算：智能处理ID格式差异
            let missedPeriods = 0;
            
            // 确保我们有必要的数据
            if (latestStoredNumberGroup && latestGroupId) {
                // 提取纯数字部分的辅助函数
                const extractNumbers = (id) => {
                    const numStr = String(id).replace(/[^0-9]/g, '');
                    return numStr || '0';
                };
                
                // 提取并规范化ID中的数字部分
                const latestStoredNumStr = extractNumbers(latestStoredNumberGroup.id);
                const latestGroupNumStr = extractNumbers(latestGroupId);
                
                // 处理不同格式的ID：当处理类似 25289 和 2025034 的情况
                // 我们需要智能提取真正有意义的部分进行比较
                let latestStoredNum = parseInt(latestStoredNumStr, 10);
                let latestGroupNum = parseInt(latestGroupNumStr, 10);
                
                // 验证转换结果
                if (!isNaN(latestStoredNum) && !isNaN(latestGroupNum)) {
                    // 计算直接差值
                    let directDiff = latestStoredNum - latestGroupNum;
                    
                    // 智能判断ID格式差异情况
                    const lenDiff = Math.abs(latestStoredNumStr.length - latestGroupNumStr.length);
                    
                    // 策略1：如果长度差异较大，尝试使用最后几位数字进行比较
                    if (lenDiff >= 2 || directDiff < 0 || directDiff > 1000) {
                        // 获取最后5位数字（期数通常不会超过5位数）
                        const latestStoredLast5 = latestStoredNumStr.slice(-5).padStart(5, '0');
                        const latestGroupLast5 = latestGroupNumStr.slice(-5).padStart(5, '0');
                        
                        // 计算最后5位的差值
                        const last5Diff = parseInt(latestStoredLast5, 10) - parseInt(latestGroupLast5, 10);
                        
                        // 如果最后5位差值合理，使用这个结果
                        if (last5Diff >= 0 && last5Diff < 1000) {
                            missedPeriods = last5Diff;
                        } else {
                            // 策略2：如果ID格式完全不同，尝试只比较最后3-4位
                            // 例如 2025034 取 5034，25289 取 5289
                            const latestStoredLast4 = latestStoredNumStr.slice(-4).padStart(4, '0');
                            const latestGroupLast4 = latestGroupNumStr.slice(-4).padStart(4, '0');
                            const last4Diff = parseInt(latestStoredLast4, 10) - parseInt(latestGroupLast4, 10);
                            
                            if (last4Diff >= 0 && last4Diff < 1000) {
                                missedPeriods = last4Diff;
                            } else {
                                // 作为最后的尝试，使用完整数字但确保结果合理
                                missedPeriods = directDiff > 0 ? directDiff : 0;
                            }
                        }
                    } else {
                        // 如果直接差值合理，直接使用
                        missedPeriods = directDiff;
                    }
                }
            }
            
            const frequencyRate = result.frequencyRate || '0.00';
            const isHighFrequency = parseFloat(frequencyRate) > 10; // 高频率阈值
            
            row.innerHTML = `
                <td class="py-3 px-2 font-medium ${index < 3 ? 'text-neon-red' : 'text-gray-300'}">${index + 1}</td>
                <td class="py-3 px-2">
                    <div class="flex gap-1 flex-wrap">
                        ${result.combination.map(num => `
                            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-medium">${num}</span>
                        `).join('')}
                    </div>
                </td>
                <td class="py-3 px-2 font-medium">${result.count}</td>
                <td class="py-3 px-2 font-medium ${isHighFrequency ? 'text-neon-green' : 'text-gray-300'}">${frequencyRate}%</td>
                <td class="py-3 px-2">${latestGroupId || '-'}</td>
                <td class="py-3 px-2 ${missedPeriods > 10 ? 'text-neon-red' : 'text-gray-300'}">${missedPeriods}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        this.resultsContainer.appendChild(table);
        
        // 显示统计信息
        const stats = document.createElement('div');
        stats.className = 'mt-4 text-sm text-gray-400 flex flex-col gap-2';
        stats.innerHTML = `
            <div class="flex justify-between">
                <span>共找到 ${results.length} 组匹配</span>
                <span>显示前15组最高频匹配</span>
            </div>
            <div class="flex justify-between">
                <span>数据总组数: ${this.numberGroups.length}</span>
                ${results.length > 0 ? `<span>最高频率率: ${results[0].frequencyRate || '0.00'}%</span>` : ''}
            </div>
            <div class="mt-2 text-xs text-gray-500">
                提示: 高频率组合(>10%)用<span class="text-neon-green">绿色</span>标注，遗漏期数过多(>10)用<span class="text-neon-red">红色</span>标注
            </div>
        `;
        this.resultsContainer.appendChild(stats);
    }
    
    // 导出为JSON
    exportToJson() {
        try {
            console.log('开始导出JSON，数据组数:', this.numberGroups.length);
            
            if (this.numberGroups.length === 0) {
                this.showToast('暂无数据可导出', 'error');
                return;
            }
            
            // 显示加载状态
            this.showLoading('正在生成JSON文件...');
            
            // 使用setTimeout让UI有机会更新
            setTimeout(() => {
                try {
                    // 确保数据已排序并过滤掉无效数据 - 使用降序排序
                    const sortedGroups = [...this.numberGroups]
                        .filter(group => group && group.id && Array.isArray(group.numbers))
                        .sort((a, b) => parseInt(b.id) - parseInt(a.id));
                    
                    if (sortedGroups.length === 0) {
                        this.hideLoading();
                        this.showToast('没有有效的号码组数据可供导出', 'error');
                        return;
                    }
                    
                    // 准备导出数据
                    const exportData = {
                        version: '1.0',
                        exportDate: new Date().toISOString(),
                        exportTimeLocal: new Date().toLocaleString('zh-CN'),
                        dataCount: sortedGroups.length,
                        numberGroups: sortedGroups,
                        metadata: {
                            firstId: sortedGroups[0]?.id,
                            lastId: sortedGroups[sortedGroups.length - 1]?.id,
                            exportTimestamp: Date.now()
                        }
                    };
                    
                    // 转换为JSON字符串
                    const jsonString = JSON.stringify(exportData, null, 2);
                    console.log('JSON字符串生成完成');
                    
                    // 创建Blob并下载
                    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `号码组数据_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
                    
                    document.body.appendChild(a);
                    a.style.display = 'none';
                    
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    a.dispatchEvent(clickEvent);
                    
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                    
                    console.log('JSON导出完成');
                    
                    // 隐藏加载状态
                    this.hideLoading();
                    this.showToast(`成功导出${sortedGroups.length}个号码组的JSON数据`, 'success');
                    
                    // 如果数据量大，提示用户
                    if (sortedGroups.length > 200) {
                        setTimeout(() => {
                            this.showToast('数据量较大，建议定期备份', 'info');
                        }, 3500);
                    }
                } catch (error) {
                    console.error('导出JSON过程中出错:', error);
                    this.hideLoading();
                    this.showToast('JSON导出失败: ' + error.message, 'error');
                }
            }, 100);
        } catch (error) {
            console.error('导出JSON初始化错误:', error);
            this.hideLoading();
            this.showToast('JSON导出失败: ' + error.message, 'error');
        }
    }
    
    // 导入JSON功能
    importFromJson(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // 解析JSON数据
                    const jsonData = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!jsonData.numberGroups || !Array.isArray(jsonData.numberGroups)) {
                        throw new Error('无效的JSON文件格式，缺少numberGroups数组');
                    }
                    
                    // 获取导入的号码组
                    const importedGroups = jsonData.numberGroups;
                    
                    // 检查是否有重复的编号
                    const existingIds = new Set(this.numberGroups.map(group => group.id));
                    let newGroupsCount = 0;
                    let updatedGroupsCount = 0;
                    
                    // 合并数据
                    importedGroups.forEach(importedGroup => {
                        if (!importedGroup.id || !importedGroup.numbers || !Array.isArray(importedGroup.numbers)) {
                            console.warn('跳过无效的号码组数据:', importedGroup);
                            return;
                        }
                        
                        // 规范化数据格式
                        const normalizedGroup = {
                            id: importedGroup.id.toString(),
                            numbers: importedGroup.numbers
                        };
                        
                        // 检查是否已存在
                        const existingIndex = this.numberGroups.findIndex(group => group.id === normalizedGroup.id);
                        
                        if (existingIndex >= 0) {
                            // 更新已存在的号码组
                            this.numberGroups[existingIndex] = normalizedGroup;
                            updatedGroupsCount++;
                        } else {
                            // 添加新的号码组
                            this.numberGroups.push(normalizedGroup);
                            newGroupsCount++;
                        }
                    });
                    
                    // 按编号排序
                    this.numberGroups.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                    
                    // 保存到localStorage
                    this.saveNumberGroups();
                    
                    // 更新UI
                    this.renderLatestGroups();
                    this.updateDataCount();
                    
                    const totalImported = newGroupsCount + updatedGroupsCount;
                    this.showToast(`成功导入${totalImported}个号码组数据，新增${newGroupsCount}个，更新${updatedGroupsCount}个`, 'success');
                    
                    resolve({ newGroups: newGroupsCount, updatedGroups: updatedGroupsCount });
                } catch (error) {
                    console.error('导入JSON时出错:', error);
                    this.showToast(`导入失败: ${error.message}`, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = (error) => {
                console.error('读取文件失败:', error);
                this.showToast('读取文件失败，请重试', 'error');
                reject(error);
            };
            
            // 读取文件
            reader.readAsText(file);
        });
    }
    
    // 导出为ZIP压缩包
    exportToHtml() {
        try {
            console.log('开始导出ZIP压缩包，数据组数:', this.numberGroups.length);
            
            if (this.numberGroups.length === 0) {
                this.showToast('暂无数据可导出', 'error');
                return;
            }
            
            // 显示加载状态
            this.showLoading('正在生成导出文件...');
            
            // 使用setTimeout让UI有机会更新
            setTimeout(async () => {
                try {
                    // 确保数据已排序并过滤掉无效数据
                    const sortedGroups = [...this.numberGroups]
                        .filter(group => group && group.id && Array.isArray(group.numbers))
                        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
                    
                    // 检查是否有JSZip库，如果没有则动态加载
                    if (window.JSZip) {
                        console.log('使用已加载的JSZip库');
                        this.performZipExport(sortedGroups);
                    } else {
                        console.log('动态加载JSZip库...');
                        try {
                            await this.loadJSZipLibrary();
                            this.performZipExport(sortedGroups);
                        } catch (jszipError) {
                            console.warn('JSZip加载失败，使用备选方案:', jszipError);
                            this.exportAsFallback(sortedGroups);
                        }
                    }
                } catch (error) {
                    console.error('导出过程中出错:', error);
                    this.hideLoading();
                    this.showToast('导出失败: ' + error.message, 'error');
                }
            }, 100);
        } catch (error) {
            console.error('导出初始化错误:', error);
            this.hideLoading();
            this.showToast('导出失败: ' + error.message, 'error');
        }
    }
    
    // 动态加载JSZip库
    async loadJSZipLibrary() {
        return new Promise((resolve, reject) => {
            // 检查是否已经在加载中
            if (window.jsZipLoading) {
                return new Promise((innerResolve, innerReject) => {
                    const checkInterval = setInterval(() => {
                        if (window.JSZip) {
                            clearInterval(checkInterval);
                            innerResolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        innerReject(new Error('JSZip加载超时'));
                    }, 5000);
                });
            }
            
            window.jsZipLoading = true;
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => {
                window.jsZipLoading = false;
                if (window.JSZip) {
                    resolve();
                } else {
                    reject(new Error('JSZip加载失败'));
                }
            };
            script.onerror = () => {
                window.jsZipLoading = false;
                reject(new Error('JSZip加载出错'));
            };
            document.head.appendChild(script);
        });
    }
    
    // 执行ZIP导出
    async performZipExport(sortedGroups) {
        try {
            const zip = new JSZip();
            
            // 生成HTML报表内容
            const htmlContent = this.generateHtmlReport(sortedGroups);
            zip.file('号码匹配数据报表.html', htmlContent);
            
            // 添加JSON数据
            const jsonData = JSON.stringify(sortedGroups, null, 2);
            zip.file('号码匹配数据.json', jsonData);
            
            // 添加数据库文件
            const dbContent = localStorage.getItem('numberGroups') || '[]';
            zip.file('numberGroups.json', dbContent);
            
            // 生成ZIP文件
            const content = await zip.generateAsync({ type: 'blob' });
            
            // 下载文件
            const fileName = `号码组数据_${new Date().toISOString().slice(0, 10)}.zip`;
            const url = URL.createObjectURL(content);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log('ZIP导出完成');
            
            // 隐藏加载状态
            this.hideLoading();
            this.showToast(`成功导出ZIP压缩包，包含${sortedGroups.length}个号码组数据`, 'success');
        } catch (error) {
            console.error('ZIP导出失败:', error);
            this.hideLoading();
            this.showToast('ZIP导出失败: ' + error.message, 'error');
        }
    }
    
    // 生成HTML报表
    generateHtmlReport(sortedGroups) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>号码组数据备份 - ${new Date().toLocaleString('zh-CN')}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #181825;
            color: #e2e8f0;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #89b4fa;
            margin-bottom: 30px;
        }
        .summary {
            background-color: #29293a;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .number-group {
            background-color: #29293a;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .group-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .group-id {
            color: #f38ba8;
        }
        .numbers {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #313244;
            color: #a6e3a1;
            font-weight: bold;
            font-size: 14px;
            transition: all 0.2s ease;
        }
        .number:hover {
            background-color: #a6e3a1;
            color: #181825;
        }
        @media (max-width: 768px) {
            .number {
                width: 30px;
                height: 30px;
                font-size: 12px;
            }
            .group-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>号码组数据备份</h1>
        
        <div class="summary">
            <div><strong>备份时间:</strong> ${new Date().toLocaleString('zh-CN')}</div>
            <div><strong>数据组数:</strong> ${sortedGroups.length}</div>
            <div><strong>编号范围:</strong> ${sortedGroups[0] ? sortedGroups[0].id : '无'} - ${sortedGroups[sortedGroups.length - 1] ? sortedGroups[sortedGroups.length - 1].id : '无'}</div>
        </div>
        
        <div id="data-container">
            ${sortedGroups.map(group => `
            <div class="number-group">
                <div class="group-header">
                    <span class="group-id">编号: ${group.id}</span>
                    <span>${group.timestamp ? new Date(group.timestamp).toLocaleString('zh-CN') : '-'}</span>
                </div>
                <div class="numbers">
                    ${Array.isArray(group.numbers) ? group.numbers.map(num => `<span class="number">${num}</span>`).join('') : ''}
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }
    
    // 备选导出方案（当JSZip不可用时）
    exportAsFallback(sortedGroups) {
        try {
            // 生成包含所有下载链接的HTML文件
            const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>号码组数据导出 - ${new Date().toLocaleString('zh-CN')}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #181825;
            color: #e2e8f0;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            color: #89b4fa;
            margin-bottom: 30px;
        }
        .download-section {
            background-color: #29293a;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .download-button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #89b4fa;
            color: #181825;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px;
            transition: all 0.2s ease;
        }
        .download-button:hover {
            background-color: #a5b4fc;
            transform: translateY(-2px);
        }
        .info {
            color: #94a3b8;
            margin-top: 20px;
        }
    </style>
    <script>
        // 生成并下载HTML报表
        function downloadHtmlReport() {
            const htmlContent = \`<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>号码组数据报表</title>\n    <style>\n        body { font-family: sans-serif; background: #181825; color: #e2e8f0; padding: 20px; }\n        .summary { background: #29293a; padding: 20px; border-radius: 8px; margin-bottom: 30px; }\n        .number-group { background: #29293a; padding: 15px; border-radius: 8px; margin-bottom: 15px; }\n        .number { display: inline-flex; width: 36px; height: 36px; border-radius: 50%; background: #313244; color: #a6e3a1; align-items: center; justify-content: center; margin: 4px; }\n    </style>\n</head>\n<body>\n    <h1>号码组数据报表</h1>\n    <div class=\"summary\">\n        <div><strong>备份时间:</strong> ${new Date().toLocaleString('zh-CN')}</div>\n        <div><strong>数据组数:</strong> ${sortedGroups.length}</div>\n    </div>\n    <div id=\"data-container\">\n        ${sortedGroups.map(group => `\n        <div class=\"number-group\">\n            <div><strong>编号:</strong> ${group.id}</div>\n            <div>\n                ${Array.isArray(group.numbers) ? group.numbers.map(num => `<span class=\"number\">${num}</span>`).join('') : ''}\n            </div>\n        </div>\n        `).join('')}\n    </div>\n</body>\n</html>\`;
            
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '号码匹配数据报表.html';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // 生成并下载JSON数据
        function downloadJsonData() {
            const jsonData = JSON.stringify(${JSON.stringify(sortedGroups)}, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '号码匹配数据.json';
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // 生成并下载数据库文件
        function downloadDatabase() {
            const dbContent = localStorage.getItem('numberGroups') || '[]';
            const blob = new Blob([dbContent], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'numberGroups.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>号码组数据导出</h1>
        <div class="download-section">
            <p>请点击下方按钮下载所需的文件：</p>
            <button class="download-button" onclick="downloadHtmlReport()">下载HTML报表</button>
            <button class="download-button" onclick="downloadJsonData()">下载JSON数据</button>
            <button class="download-button" onclick="downloadDatabase()">下载数据库文件</button>
        </div>
        <div class="info">
            <p>导出时间: ${new Date().toLocaleString('zh-CN')}</p>
            <p>数据组数: ${sortedGroups.length}</p>
        </div>
    </div>
</body>
</html>`;
            
            // 创建下载链接
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `号码组数据导出_${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log('备选方案导出完成');
            
            // 隐藏加载状态
            this.hideLoading();
            this.showToast(`导出完成，请下载HTML文件后再点击其中的按钮获取所需文件`, 'success');
        } catch (error) {
            console.error('备选导出方案失败:', error);
            this.hideLoading();
            this.showToast('导出失败: ' + error.message, 'error');
        }
    }
    
    // 导出数据库文件
    exportDatabase() {
        try {
            console.log('导出数据库文件');
            
            const dbContent = localStorage.getItem('numberGroups') || '[]';
            const blob = new Blob([dbContent], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `numberGroups_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.showToast('数据库文件导出成功', 'success');
        } catch (error) {
            console.error('导出数据库失败:', error);
            this.showToast('导出数据库失败: ' + error.message, 'error');
        }
    }
    
    // 清空所有数据
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            this.numberGroups = [];
            this.saveData();
            this.clearSelection();
            this.showToast('所有数据已清空', 'success');
        }
    }
    
    // 显示提示信息
    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        if (type === 'success') {
            this.toastIcon.className = 'fa fa-check-circle text-neon-green';
            this.toast.classList.remove('border-neon-red');
            this.toast.classList.add('border-neon-green');
        } else {
            this.toastIcon.className = 'fa fa-exclamation-circle text-neon-red';
            this.toast.classList.remove('border-neon-green');
            this.toast.classList.add('border-neon-red');
        }
        
        // 显示Toast，添加阴影效果
        this.toast.classList.remove('translate-y-20', 'opacity-0');
        this.toast.classList.add('translate-y-0', 'opacity-100', 'shadow-lg');
        
        // 3秒后隐藏
        setTimeout(() => {
            this.toast.classList.remove('translate-y-0', 'opacity-100', 'shadow-lg');
            this.toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
    
    // 添加号码组（用于示例数据导入）
    addNumberGroup(group) {
        // 检查重复编号
        if (this.numberGroups.some(g => g.id === group.id.toString())) {
            return false;
        }
        
        this.numberGroups.push({
            id: group.id.toString(),
            numbers: group.numbers,
            timestamp: group.timestamp || new Date().toISOString()
        });
        
        // 重新排序 - 按编号降序
        this.numberGroups.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        
        // 保存数据
        this.saveData();
        return true;
    }
    
    // 显示加载状态
    showLoading(message = '处理中...') {
        this.toastMessage.textContent = message;
        this.toastIcon.className = 'fa fa-circle-o-notch fa-spin text-neon-blue';
        this.toast.classList.remove('border-neon-red', 'border-neon-green');
        this.toast.classList.add('border-neon-blue', 'translate-y-0', 'opacity-100', 'shadow-lg');
    }
    
    // 隐藏加载状态
    hideLoading() {
        this.toast.classList.remove('translate-y-0', 'opacity-100', 'shadow-lg');
        this.toast.classList.add('translate-y-20', 'opacity-0');
    }
}

// 初始化应用 - 添加完整的错误处理和确保DOM完全加载
window.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOMContentLoaded事件触发，开始初始化应用...');
        
        // 确认所有必要的DOM元素都已加载
        const checkRequiredElements = () => {
            const requiredIds = ['number-selector', 'export-html', 'import-single'];
            for (const id of requiredIds) {
                const element = document.getElementById(id);
                if (!element) {
                    console.error(`关键DOM元素 ${id} 未找到！`);
                } else {
                    console.log(`找到DOM元素: ${id}`);
                }
            }
        };
        
        checkRequiredElements();
        
        // 使用setTimeout确保DOM完全解析
        setTimeout(() => {
            try {
                console.log('延迟初始化应用...');
                const app = new NumberMatcherApp();
                
                // 立即重新初始化号码选择器
                console.log('强制重新初始化号码选择器...');
                app.initDOMReferences();
                app.initNumberSelector();
                
                // 添加一些示例数据
                function addSampleData() {
                    const sampleGroups = [
                        { id: "25289", numbers: ["03","06","07","10","11","13","14","15","31","35","40","41","43","45","55","57","66","72","73","75"] },
                        { id: "25288", numbers: ["02","05","08","12","16","18","20","22","25","28","30","32","37","42","44","46","52","56","60","70"] },
                        { id: "25287", numbers: ["01","04","09","17","19","21","23","24","26","27","29","33","34","36","38","39","47","48","49","50"] }
                    ];
                    
                    sampleGroups.forEach(group => {
                        app.addNumberGroup(group);
                    });
                }

                // 检查是否需要添加示例数据
                if (app.numberGroups.length === 0) {
                    addSampleData();
                    // 显示Toast提示
                    const toast = document.getElementById('toast');
                    const toastMessage = document.getElementById('toast-message');
                    if (toast && toastMessage) {
                        toastMessage.textContent = '已加载示例数据，请体验各项功能';
                        toast.classList.remove('border-neon-red', 'border-neon-blue');
                        toast.classList.add('border-neon-green', 'translate-y-0', 'opacity-100', 'shadow-lg');
                        setTimeout(() => {
                            toast.classList.remove('translate-y-0', 'opacity-100', 'shadow-lg');
                            toast.classList.add('translate-y-20', 'opacity-0');
                        }, 3000);
                    }
                }
                
                console.log('应用初始化完成！');
            } catch (err) {
                console.error('应用初始化时发生错误:', err);
            }
        }, 100);
    } catch (err) {
        console.error('DOMContentLoaded处理程序出错:', err);
    }
});

// 添加一个简单的测试函数，直接在页面加载后执行
function testNumberSelector() {
    try {
        const selector = document.getElementById('number-selector');
        if (selector) {
            console.log('测试：直接操作号码选择器');
            selector.innerHTML = '<div class="text-center text-neon-green p-4">号码选择器容器工作正常</div>';
            
            // 直接添加几个测试号码球
            for (let i = 1; i <= 5; i++) {
                const number = i.toString().padStart(2, '0');
                const ball = document.createElement('div');
                ball.className = 'number-ball';
                ball.textContent = number;
                selector.appendChild(ball);
            }
        }
    } catch (err) {
        console.error('测试函数出错:', err);
    }
};

// 立即执行测试函数
testNumberSelector();
