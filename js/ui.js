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

    allyBtn.addEventListener('click', () => {
        const targetFactionId = document.getElementById('kingdom-info-content').kingdomId;
        if (targetFactionId) {
            sendCommand('request_ally', targetFactionId);
        }
    });
    warBtn.addEventListener('click', () => {
        const targetFactionId = document.getElementById('kingdom-info-content').kingdomId;
        if (targetFactionId) {
            sendCommand('declare_war', targetFactionId);
        }
    });
    
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
    infoHtml += `<p>年龄: ${ruler.age}</p>`;
    infoHtml += `<p>声望: ${ruler.renown}</p>`;
    infoHtml += `<p>智力: ${ruler.intelligence}</p>`;
    infoHtml += `<p>军事: ${ruler.warfare}</p>`;
    infoHtml += `<p>内政: ${ruler.stewardship}</p>`;
    infoHtml += `<p>外交: ${ruler.diplomacy}</p>`;
    
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
// 更新外交信息显示
function updateDiplomacyInfo(diplomacy) {
    const diplomacyInfo = document.getElementById('diplomacy-info');
    if (!diplomacyInfo) return;
    
    if (!diplomacy || diplomacy.length === 0) {
        diplomacyInfo.innerHTML = '<p>暂无外交信息</p>';
        return;
    }
    
    // 构建外交信息HTML
    let infoHtml = '<h4>外交关系</h4>';
    infoHtml += '<ul>';
    
    diplomacy.forEach(item => {
        infoHtml += `<li>${item.target_faction_name}: <span class="relation-${item.relation}">${item.relation}</span></li>`;
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

// 修改导出函数
window.uiModule = {
    addGlobalMessage: addGlobalMessage,
    addOptionMessage: addOptionMessage,
    updateFactionInfo: updateFactionInfo,
    updateFactionList: updateFactionList,
    updateCityInfo: updateCityInfo,
    updateRulerInfo: updateRulerInfo,
    updateDiplomacyInfo: updateDiplomacyInfo,
    initUIEvents: initUIEvents,
    updateWarList: updateWarList,
    updateWarDetails: updateWarDetails,
    updateKingdomList: updateKingdomList,
    updateKingdomDetails: updateKingdomDetails,
};

// 以下添加新的UI函数
function updateWarList(wars) {
    let warListContent = document.querySelector('.war-list-content');
    const warCountElement = document.getElementById('war-count');
    const totalWarCountElement = document.getElementById('total-war-count');
    
    if (!warListContent) {
        console.error('未找到战争列表内容容器');
        return;
    }
    
    // 清空现有列表
    warListContent.innerHTML = '';
    
    if (wars.length === 0) {
        warListContent.innerHTML = '<p>当前没有进行中的战争</p>';
        if (warCountElement) warCountElement.textContent = '0';
        if (totalWarCountElement) totalWarCountElement.textContent = '0';
        return;
    }
    
    // 更新统计信息
    if (warCountElement) warCountElement.textContent = wars.length;
    if (totalWarCountElement) totalWarCountElement.textContent = wars.length;
    
    // 创建战争列表项
    wars.forEach(war => {
        const warItem = document.createElement('div');
        warItem.className = 'war-item';
        warItem.innerHTML = `
            <span>${war.name}(${war.id})</span>
        `;
        
        // 添加点击事件
        warItem.addEventListener('click', () => {
            showWarDetails(war);
            
            // 高亮选中的战争条目
            document.querySelectorAll('.war-item').forEach(item => {
                item.classList.remove('selected');
            });
            warItem.classList.add('selected');
        });
        
        warListContent.appendChild(warItem);
    });
    
    // 初始化滚动条
    setupScrollbar('.war-list-content');
}
function showWarDetails(war) {
    const contentContainer = document.getElementById('war-info-content');
    if (!contentContainer) {
        console.error('未找到战争信息内容容器');
        return;
    }
    
    // 设置当前战争ID
    contentContainer.warId = war.id;
    
    // 显示加载状态
    contentContainer.innerHTML = `<h4>${war.name}(${war.id})</h4><p>加载中...</p>`;
    
    // 向服务器请求详细信息
    commandsModule.sendCommand('fetch_war_details', war.id);
}
function updateWarDetails(details) {
    const contentContainer = document.getElementById('war-info-content');
    
    // 保存当前滚动位置
    const scrollTop = contentContainer.scrollTop;
    
    if (details.alive)
    {
        // 构建完整的战争详情内容
        let detailsHtml = `<h4>${details.name}(${details.id})</h4>`;
        
        // 添加参战方信息
        detailsHtml += `<p>开战攻方: ${details.attackers.join(', ')}</p>`;
        detailsHtml += `<p>开战守方: ${details.defenders.join(', ')}</p>`;
        detailsHtml += `<p>开始年份: ${details.start_year}</p>`;
        
        // 添加停战提议按钮
        detailsHtml += `<button id="proposePeaceBtn" class="action-button">提议停战</button>`;

        contentContainer.innerHTML = detailsHtml;
        const proposePeaceBtn = document.getElementById('proposePeaceBtn');
        if (proposePeaceBtn) {
            // 为停战按钮添加悬停效果样式
            proposePeaceBtn.classList.add('hover-effect');
            
            // 初始化按钮状态
            if (!proposePeaceBtn.dataset.initialized) {
                // 为停战按钮添加禁用状态样式
                proposePeaceBtn.classList.add('disabled-state');
                
                // 添加单击事件监听器
                proposePeaceBtn.addEventListener('click', () => {
                    if (contentContainer.warId) {
                        commandsModule.sendCommand('request_stop_war', contentContainer.warId);
                        // 禁用按钮防止重复点击
                        proposePeaceBtn.disabled = true;
                        // 移除之前的禁用状态样式并添加新的点击反馈样式
                        proposePeaceBtn.classList.remove('disabled-state');
                        proposePeaceBtn.classList.add('clicked-state');
                    }
                });
                
                // 标记按钮已初始化
                proposePeaceBtn.dataset.initialized = 'true';
            }
        }
    }
    else
    {
        contentContainer.innerHTML = contentContainer.innerHTML + '<p>已停战</p>'
    }
    contentContainer.scrollTop = scrollTop;
}
// 以下添加新的UI函数
function updateKingdomList(kingdoms) {
    let kingdomListContent = document.querySelector('.kingdom-list-content');
    const kingdomCountElement = document.getElementById('kingdom-count');
    const totalKingdomCountElement = document.getElementById('total-kingdom-count');
    
    if (!kingdomListContent) {
        console.error('未找到国家列表内容容器');
        return;
    }
    
    // 清空现有列表
    kingdomListContent.innerHTML = '';
    
    if (kingdoms.length === 0) {
        kingdomListContent.innerHTML = '<p>当前没有其他国家</p>';
        if (kingdomCountElement) kingdomCountElement.textContent = '0';
        if (totalKingdomCountElement) totalKingdomCountElement.textContent = '0';
        return;
    }
    
    // 更新统计信息
    if (kingdomCountElement) kingdomCountElement.textContent = kingdoms.length;
    if (totalKingdomCountElement) totalKingdomCountElement.textContent = kingdoms.length;
    
    // 创建战争列表项
    kingdoms.forEach(kingdom => {
        const kingdomItem = document.createElement('div');
        kingdomItem.className = 'kingdom-item';
        kingdomItem.innerHTML = `
            <span>${kingdom.name}(${kingdom.id})</span>
        `;
        
        // 添加点击事件
        kingdomItem.addEventListener('click', () => {
            showKingdomDetails(kingdom);
            
            // 高亮选中的战争条目
            document.querySelectorAll('.kingdom-item').forEach(item => {
                item.classList.remove('selected');
            });
            kingdomItem.classList.add('selected');
        });
        
        kingdomListContent.appendChild(kingdomItem);
    });
    
    // 初始化滚动条
    setupScrollbar('.kingdom-list-content');
}
// 初始化战争列表滚动条
function setupScrollbar(list_content_name) {
    const listContent = document.querySelector(list_content_name);
    const scrollThumb = document.querySelector('.scroll-thumb');
    
    if (!listContent || !scrollThumb) return;
    
    // 计算滚动条比例
    const listHeight = listContent.clientHeight;
    const contentHeight = listContent.scrollHeight;
    
    if (contentHeight <= listHeight) {
        // 内容高度小于容器高度，不需要滚动条
        scrollThumb.style.display = 'none';
        return;
    } else {
        scrollThumb.style.display = 'block';
    }
    
    const thumbHeight = Math.max(20, (listHeight / contentHeight) * listHeight);
    scrollThumb.style.height = `${thumbHeight}px`;
    
    // 计算滚动比例
    const scrollRatio = (contentHeight - listHeight) / (listHeight - thumbHeight);
    
    // 滚动条拖拽功能
    let isDragging = false;
    
    scrollThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        const offsetY = e.clientY - scrollThumb.offsetTop;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onStopDrag);
        
        function onMouseMove(e) {
            if (!isDragging) return;
            
            const newTop = Math.max(0, Math.min(e.clientY - offsetY, listHeight - thumbHeight));
            scrollThumb.style.top = `${newTop}px`;
            
            // 滚动列表
            listContent.scrollTop = (newTop / (listHeight - thumbHeight)) * (contentHeight - listHeight);
        }
        
        function onStopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onStopDrag);
        }
    });
    
    // 监听列表滚动事件
    listContent.addEventListener('scroll', () => {
        if (isDragging) return;
        
        const scrollTop = listContent.scrollTop;
        const newTop = (scrollTop / (contentHeight - listHeight)) * (listHeight - thumbHeight);
        scrollThumb.style.top = `${newTop}px`;
    });
}
function showKingdomDetails(kingdom) {
    const contentContainer = document.getElementById('kingdom-info-content');
    if (!contentContainer) {
        console.error('未找到国家信息内容容器');
        return;
    }
    
    // 设置当前战争ID
    contentContainer.kingdomId = kingdom.id;
    
    // 显示加载状态
    contentContainer.innerHTML = `<h4>${kingdom.name}(${kingdom.id})</h4><p>加载中...</p>`;
    
    // 向服务器请求详细信息
    commandsModule.sendCommand('fetch_kingdom_details', kingdom.id);
}
function updateKingdomDetails(details) {
    const contentContainer = document.getElementById('kingdom-info-content');
    
    // 保存当前滚动位置
    const scrollTop = contentContainer.scrollTop;
    
    if (details.alive)
    {
        contentContainer.kingdomId = details.id;
        let detailsHtml = `<h4>${details.name}(${details.id})</h4>`;
        detailsHtml += `<p>首都: ${details.capital}</p>`;
    
        const cities = details.cities;
        let population = 0;
        cities.forEach(city => {
            population += city.population;
        });
        detailsHtml += `<p>总人口: ${population}</p>`;
        let zones = 0;
        cities.forEach(city => {
            zones += city.zones;
        });
        detailsHtml += `<p>总领土: ${zones}</p>`;
    
        detailsHtml += `<p>声望: ${details.renown}</p>`;
        detailsHtml += `<p>影响力: ${details.type}</p>`;
        detailsHtml += `<p>城市数量: ${cities.length}</p>`;
        for (let i=0; i<cities.length; i++){
            // 缩进加入各城市信息
            detailsHtml += `<p style="margin-left: 20px;">城市 ${i+1}: ${cities[i].name}</p>`;
            detailsHtml += `<p style="margin-left: 40px;">人口: ${cities[i].population}</p>`;
            detailsHtml += `<p style="margin-left: 40px;">领土: ${cities[i].zones}</p>`;
        }

        contentContainer.innerHTML = detailsHtml;
        // 加入请求结盟、宣战按钮
    }
    else
    {
        contentContainer.innerHTML = contentContainer.innerHTML + '<p>已灭亡</p>'
    }
    contentContainer.scrollTop = scrollTop;
}