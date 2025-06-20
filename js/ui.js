// ui.js
// 用户界面交互模块

// 初始化UI事件监听
function initUIEvents() {
    // 获取DOM元素
    const allyBtn = document.getElementById('ally-btn');
    const warBtn = document.getElementById('war-btn');
    const submitTaxBtn = document.getElementById('submit-tax');
    
    // 标签导航按钮
    const tabButtons = document.querySelectorAll('.tab-navigation button');
    
    // 消息面板选项按钮容器
    const messagesList = document.getElementById('global-messages');
    
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有按钮的active类
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // 为当前按钮添加active类
                button.classList.add('active');
                
                // 获取目标标签内容ID
                const tabId = button.getAttribute('data-tab');
                
                // 隐藏所有标签内容
                const tabPanes = document.querySelectorAll('.tab-pane');
                if (tabPanes) {
                    tabPanes.forEach(pane => {
                        pane.classList.remove('active');
                    });
                }
                
                // 显示对应的标签内容
                const activePane = document.getElementById(`tab-${tabId}`);
                if (activePane) {
                    activePane.classList.add('active');
                }
            });
        });
    }
    
    if (allyBtn) {
        allyBtn.addEventListener('click', () => {
            const targetFactionSelect = document.getElementById('target-faction');
            const selectedOptions = Array.from(targetFactionSelect.selectedOptions);
            const selectedValues = selectedOptions.map(option => option.value).filter(value => value !== '');
            
            if (selectedValues.length > 0) {
                // 将所有目标势力拼接在一起作为一次结盟
                sendDiplomacyCommand('request_ally', selectedValues.join('|'));
            }
        });
    }
    
    if (warBtn) {
        warBtn.addEventListener('click', () => {
            const targetFactionSelect = document.getElementById('target-faction');
            const selectedOptions = Array.from(targetFactionSelect.selectedOptions);
            const selectedValues = selectedOptions.map(option => option.value).filter(value => value !== '');
            
            if (selectedValues.length > 0) {
                selectedValues.forEach(value => {
                    sendDiplomacyCommand('declare_war', value);
                });
            }
        });
    }
    
    if (submitTaxBtn) {
        submitTaxBtn.addEventListener('click', () => {
            const taxRate = document.getElementById('tax-rate').value;
            if (taxRate !== '') {
                sendInternalCommand('tax_rate', taxRate);
            }
        });
    }
    
    // 处理消息选项点击事件
    if (messagesList) {
        messagesList.addEventListener('click', (event) => {
            const optionBtn = event.target.closest('.option-btn');
            if (optionBtn && optionBtn.dataset.command) {
                // 这里可以添加发送指令前的确认逻辑
                const command = JSON.parse(optionBtn.dataset.command);
                
                // 调用core.js中的sendCommand函数发送命令
                if (window.coreModule && window.coreModule.sendCommand) {
                    window.coreModule.sendCommand(command);
                    
                    // 可选：禁用已点击的按钮
                    optionBtn.disabled = true;
                    optionBtn.style.opacity = '0.6';
                    optionBtn.style.cursor = 'not-allowed';
                }
            }
        });
    }
}

// 更新势力信息显示
function updateFactionInfo(faction) {
    const factionInfo = document.getElementById('faction-info');
    if (!factionInfo) return;
    
    if (!faction) {
        factionInfo.innerHTML = '<p>未选择势力</p>';
        return;
    }
    
    // 构建势力信息HTML
    let infoHtml = `<h3>${faction.name}</h3>`;
    infoHtml += `<p>首都: ${faction.capital}</p>`;

    const cities = faction.cities;
    let population = 0;
    cities.forEach(city => {
        population += city.population;
    });
    infoHtml += `<p>总人口: ${population}</p>`;
    let zones = 0;
    cities.forEach(city => {
        zones += city.zones;
    });
    infoHtml += `<p>总领土: ${zones}</p>`;

    infoHtml += `<p>声望: ${faction.renown}</p>`;
    infoHtml += `<p>影响力: ${faction.type}</p>`;
    infoHtml += `<p>城市数量: ${cities.length}</p>`;
    for (let i=0; i<cities.length; i++){
        // 缩进加入各城市信息
        infoHtml += `<p style="margin-left: 20px;">城市 ${i+1}: ${cities[i].name}</p>`;
        infoHtml += `<p style="margin-left: 40px;">人口: ${cities[i].population}</p>`;
        infoHtml += `<p style="margin-left: 40px;">领土: ${cities[i].zones}</p>`;
    }
    
    factionInfo.innerHTML = infoHtml;
}

// 更新城市信息显示
function updateCityInfo(city) {
    const cityInfo = document.getElementById('city-info');
    if (!cityInfo) return;
    
    if (!city) {
        cityInfo.innerHTML = '<p>请选择一个城市查看详情</p>';
        return;
    }
    
    // 构建城市信息HTML
    let infoHtml = `<h3>${city.name}</h3>`;
    infoHtml += `<p>位置: (${city.x}, ${city.y})</p>`;
    infoHtml += `<p>人口: ${city.population.toLocaleString()}</p>`;
    infoHtml += `<p>财富: $${city.wealth.toLocaleString()}</p>`;
    infoHtml += `<p>防御等级: ${city.defenseLevel}</p>`;
    infoHtml += `<p>建筑数量: ${city.buildingCount}</p>`;
    infoHtml += `<p>特殊属性: ${city.specialTraits.join(', ') || '无'}</p>`;
    infoHtml += `<p>安全状况: ${city.safety > 0.7 ? '高' : city.safety > 0.4 ? '中' : '低'}</p>`;
    
    cityInfo.innerHTML = infoHtml;
}

// 更新国王信息显示
function updateRulerInfo(ruler) {
    const rulerInfo = document.getElementById('ruler-info');
    if (!rulerInfo) return;
    
    if (!ruler) {
        rulerInfo.innerHTML = '<p>暂无国王信息</p>';
        return;
    }
    
    // 构建国王信息HTML
    let infoHtml = `<h3>${ruler.name}</h3>`;
    infoHtml += `<p>称号: ${ruler.title}</p>`;
    infoHtml += `<p>年龄: ${ruler.age}</p>`;
    infoHtml += `<p>统治时间: ${ruler.reignDuration}年</p>`;
    infoHtml += `<p>魅力: ${ruler.charm}</p>`;
    infoHtml += `<p>智慧: ${ruler.wisdom}</p>`;
    infoHtml += `<p>军事才能: ${ruler.militarySkill}</p>`;
    infoHtml += `<p>性格特征: ${ruler.personalityTraits.join(', ')}</p>`;
    infoHtml += `<p>健康状况: ${ruler.health > 0.8 ? '优秀' : ruler.health > 0.5 ? '良好' : ruler.health > 0.2 ? '一般' : '较差'}</p>`;
    
    rulerInfo.innerHTML = infoHtml;
}

// 显示全局消息
function addGlobalMessage(message, type = 'info', timestamp = null) {
    const messagesList = document.getElementById('global-messages');
    if (!messagesList) return;
    
    // 创建消息元素
    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${type !== 'info' ? type : ''}`;
    
    // 添加时间戳
    const time = timestamp || new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageItem.innerHTML = `
        <time>${timeString}</time> ${message}
    `;
    
    // 添加到消息列表
    messagesList.appendChild(messageItem);
    
    // 滚动到底部
    messagesList.scrollTop = messagesList.scrollHeight;
}

// 显示带有选项的全局消息
function addOptionMessage(message, options, timestamp = null) {
    const messagesList = document.getElementById('global-messages');
    if (!messagesList) return;
    
    // 创建消息元素
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    
    // 添加时间戳
    const time = timestamp || new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 构建消息HTML
    let htmlContent = `
        <div class="message-content">
            <time>${timeString}</time> ${message}
        </div>
        <div class="message-options">
    `;
    
    // 添加选项按钮
    options.forEach(option => {
        htmlContent += `
            <button class="option-msg-btn" data-command="${option.callback_command}">${option.name}</button>
        `;
    });
    
    htmlContent += `
        </div>
    `;
    
    messageItem.innerHTML = htmlContent;
    
    // 添加到消息列表
    messagesList.appendChild(messageItem);
    
    // 滚动到底部
    messagesList.scrollTop = messagesList.scrollHeight;
    
    // 为每个选项按钮添加点击事件
    messageItem.querySelectorAll('.option-msg-btn').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            if (command) {
                // 使用core.js的sendMessage函数发送命令
                if (window.coreModule && typeof window.coreModule.sendMessage === 'function') {
                    window.coreModule.sendMessage(command);
                } else {
                    console.error('核心模块未加载，无法发送消息');
                }
                
                // 禁用已点击的按钮防止重复提交
                button.disabled = true;
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            }
        });
    });
    
    // 返回按钮元素数组
    return Array.from(messageItem.querySelectorAll('.option-btn'));
}

// 示例：外交关系变化的消息提示
function showDiplomacyNotification(factionName, relationChange) {
    let message = '';
    let type = 'info';
    
    switch(relationChange) {
        case 'ally':
            message = `与${factionName}成功结盟！`;
            type = 'success';
            break;
        case 'decline_ally':
            message = `与${factionName}的结盟请求被驳回`;
            type = 'alert';
            break;
        case 'war':
            message = `${factionName}向您宣战了！`;
            type = 'alert';
            break;
        case 'peace':
            message = `${factionName}提议与您停战`;
            type = 'info';
            break;
        default:
            message = `与${factionName}的关系发生变化`;    }
    
    if (message) {
        addGlobalMessage(message, type);
    }
}

// 将外交关系数值转换为文本
function getRelationText(relationValue) {
    if (relationValue >= 90) return '盟友';
    if (relationValue >= 70) return '友好';
    if (relationValue >= 50) return '中立';
    if (relationValue >= 30) return '紧张';
    return '敌对';
}

// 更新外交信息显示
function updateDiplomacyInfo(diplomacy) {
    const diplomacyInfo = document.getElementById('diplomacy-info');
    if (!diplomacyInfo) return;
    
    if (!diplomacy || Object.keys(diplomacy).length === 0) {
        diplomacyInfo.innerHTML = '<p>暂无外交信息</p>';
        return;
    }
    
    // 构建外交信息HTML
    let infoHtml = '<h4>外交关系</h4>';
    infoHtml += '<ul>';
    
    Object.entries(diplomacy).forEach(([factionId, relation]) => {
        const relationText = getRelationText(relation);
        infoHtml += `<li>势力 ${factionId}: <span class="relation-${relationText.toLowerCase()}">${relationText}</span></li>`;
    });
    
    infoHtml += '</ul>';
    
    diplomacyInfo.innerHTML = infoHtml;
}

// 更新势力列表
function updateFactionList(factions) {
    const targetFactionSelect = document.getElementById('target-faction');
    if (!targetFactionSelect) return;
    

    // 清空现有选项
    targetFactionSelect.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '选择势力';
    targetFactionSelect.appendChild(defaultOption);
    
    // 添加势力选项
    factions.forEach(faction => {
        const option = document.createElement('option');
        option.value = faction.id;
        option.textContent = `${faction.name} (${faction.id})`;
        targetFactionSelect.appendChild(option);
    });
}

// 导出函数
window.uiModule = {
    addGlobalMessage: addGlobalMessage,
    addOptionMessage: addOptionMessage,
    showDiplomacyNotification: showDiplomacyNotification,
    updateFactionInfo: updateFactionInfo,
    updateFactionList: updateFactionList,
    updateCityInfo: updateCityInfo,
    updateRulerInfo: updateRulerInfo,
    updateDiplomacyInfo: updateDiplomacyInfo,
    initUIEvents: initUIEvents
};