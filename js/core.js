// core.js
// WebSocket连接和基础通信模块

// 建立WebSocket连接
function connectToServer() {
    const ip = document.getElementById('server-ip').value.trim();
    if (!ip) {
        alert('请输入服务器Key');
        return;
    }
    
    try {
        const ws = new WebSocket(`wss://worldbox.inmny.cn`);
        
        // 存储WebSocket实例到全局对象
        window.wsManager = {
            ws: ws,
            connectionStatusEl: document.getElementById('connection-status')
        };
        ws.onopen = () => {
            console.log('已连接到服务器');
            updateConnectionStatus(true);
            ws.send(JSON.stringify({
                type: 'client_register',
                clientId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                serverId: ip
            }));
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        };
        
        ws.onclose = (event) => {
            console.log(`连接关闭: ${event.reason}`);
            updateConnectionStatus(false);
            window.wsManager.ws = null;
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            alert(`连接错误: ${error.message}`);
            ws.close();
            window.wsManager.ws = null;
        };
    } catch (error) {
        console.error('创建连接失败:', error);
        alert(`创建连接失败: ${error.message}`);
    }
}

// 更新连接状态显示
function updateConnectionStatus(isConnected) {
    if (isConnected) {
        window.wsManager.connectionStatusEl.textContent = '已连接';
        window.wsManager.connectionStatusEl.style.backgroundColor = '#2ecc71';
    } else {
        window.wsManager.connectionStatusEl.textContent = '未连接';
        window.wsManager.connectionStatusEl.style.backgroundColor = '#e74c3c';
    }
}

// 处理服务器消息
function handleMessage(data) {
    switch(data.type) {
        case 'map_update':
            if (window.mapModule && typeof window.mapModule.updateMap === 'function') {
                window.mapModule.updateMap(data.mapData);
            }
            break;
        case 'faction_info':
            if (window.uiModule && typeof window.uiModule.updateFactionInfo === 'function') {
                window.uiModule.updateFactionInfo(data.faction);
            }
            break;
        case 'ruler_info':
            if (window.uiModule && typeof window.uiModule.updateRulerInfo === 'function') {
                window.uiModule.updateRulerInfo(data.ruler);
            }
            break;
        case 'faction_list':
            if (window.uiModule && typeof window.uiModule.updateFactionList === 'function') {
                window.uiModule.updateFactionList(data.factions);
            }
            break;
        case 'message':
            if (window.uiModule && typeof window.uiModule.addGlobalMessage === 'function') {
                window.uiModule.addGlobalMessage(data.message, data.msg_type);
            }
            break;
        case 'option_message':
            if (window.uiModule && typeof window.uiModule.addOptionMessage === 'function') {
                window.uiModule.addOptionMessage(data.message, data.options);
            }
        default:
            console.log('未知消息类型:', data.type);
    }
}

// 发送消息到服务器
function sendMessage(message) {
    if (!window.wsManager || !window.wsManager.ws || window.wsManager.ws.readyState !== WebSocket.OPEN) {
        alert('未连接到服务器');
        return false;
    }
    
    try {
        window.wsManager.ws.send(JSON.stringify({
            type: 'message',
            content: message
        }));
        return true;
    } catch (error) {
        console.error('发送消息失败:', error);
        alert(`发送消息失败: ${error.message}`);
        return false;
    }
}

// 导出函数
window.coreModule = {
    connectToServer: connectToServer,
    sendMessage: sendMessage
};
