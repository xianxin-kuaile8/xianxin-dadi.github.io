class NumberSelector {
  constructor(app, numberSelectorElement) {
    this.app = app;
    this.numberSelectorElement = numberSelectorElement;
    this.selectedNumbers = [];
    this.maxSelectionLimit = 25;
    this.selectedCountElement = document.getElementById('selected-count');
    this.selectedNumbersElement = document.getElementById('selected-numbers');
    
    // 初始化号码选择器
    this.initNumberButtons();
  }
  
  // 初始化号码按钮
  initNumberButtons() {
    this.numberSelectorElement.innerHTML = '';
    
    // 创建7行5列的号码布局
    const rows = 7;
    const cols = 5;
    
    for (let row = 0; row < rows; row++) {
      const numberRow = document.createElement('div');
      numberRow.className = 'number-row';
      
      for (let col = 0; col < cols; col++) {
        const number = row * cols + col + 1;
        if (number > 35) break; // 只生成35个号码
        
        const button = document.createElement('button');
        button.className = 'number-button';
        button.textContent = number;
        button.dataset.number = number;
        
        // 添加点击事件
        button.addEventListener('click', () => {
          this.toggleNumberSelection(number, button);
        });
        
        numberRow.appendChild(button);
      }
      
      this.numberSelectorElement.appendChild(numberRow);
    }
    
    this.updateSelectedCount();
    this.updateSelectedNumbersDisplay();
  }
  
  // 切换号码选中状态
  toggleNumberSelection(number, button) {
    const index = this.selectedNumbers.indexOf(number);
    
    if (index === -1) {
      // 选中号码
      if (this.selectedNumbers.length >= this.maxSelectionLimit) {
        this.app.showToast(`最多只能选择${this.maxSelectionLimit}个号码`, 'error');
        return;
      }
      
      this.selectedNumbers.push(number);
      this.selectedNumbers.sort((a, b) => a - b);
      button.classList.add('selected');
    } else {
      // 取消选中
      this.selectedNumbers.splice(index, 1);
      button.classList.remove('selected');
    }
    
    this.updateSelectedCount();
    this.updateSelectedNumbersDisplay();
    this.app.onNumberSelectionChange(this.selectedNumbers);
  }
  
  // 更新选中数量显示
  updateSelectedCount() {
    if (this.selectedCountElement) {
      this.selectedCountElement.textContent = `${this.selectedNumbers.length}/${this.maxSelectionLimit}`;
    }
  }
  
  // 更新已选号码显示
  updateSelectedNumbersDisplay() {
    if (this.selectedNumbersElement) {
      if (this.selectedNumbers.length === 0) {
        this.selectedNumbersElement.textContent = '暂无选择';
        return;
      }
      
      this.selectedNumbersElement.innerHTML = '';
      this.selectedNumbers.forEach((num, index) => {
        const numSpan = document.createElement('span');
        numSpan.className = 'selected-number';
        numSpan.textContent = num;
        
        // 添加删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-number';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deselectNumber(num);
        });
        
        numSpan.appendChild(deleteBtn);
        this.selectedNumbersElement.appendChild(numSpan);
        
        // 添加分隔符
        if (index < this.selectedNumbers.length - 1) {
          const separator = document.createTextNode(' ');
          this.selectedNumbersElement.appendChild(separator);
        }
      });
    }
  }
  
  // 取消选中特定号码
  deselectNumber(number) {
    const index = this.selectedNumbers.indexOf(number);
    if (index !== -1) {
      this.selectedNumbers.splice(index, 1);
      
      // 更新按钮状态
      const button = this.numberSelectorElement.querySelector(`[data-number="${number}"]`);
      if (button) {
        button.classList.remove('selected');
      }
      
      this.updateSelectedCount();
      this.updateSelectedNumbersDisplay();
      this.app.onNumberSelectionChange(this.selectedNumbers);
    }
  }
  
  // 清空所有选中
  clearSelection() {
    this.selectedNumbers = [];
    
    // 重置所有按钮状态
    const buttons = this.numberSelectorElement.querySelectorAll('.number-button.selected');
    buttons.forEach(button => {
      button.classList.remove('selected');
    });
    
    this.updateSelectedCount();
    this.updateSelectedNumbersDisplay();
    this.app.onNumberSelectionChange(this.selectedNumbers);
  }
  
  // 获取已选号码
  getSelectedNumbers() {
    return [...this.selectedNumbers];
  }
  
  // 设置选中号码（用于从外部控制）
  setSelectedNumbers(numbers) {
    // 先清空当前选中
    this.clearSelection();
    
    // 选择新的号码
    numbers.forEach(number => {
      if (number >= 1 && number <= 35) {
        this.toggleNumberSelection(number, 
          this.numberSelectorElement.querySelector(`[data-number="${number}"]`));
      }
    });
  }
}

export default NumberSelector;
