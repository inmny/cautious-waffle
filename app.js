// app.js - 主入口文件
// 按需加载模块并初始化应用

document.addEventListener('DOMContentLoaded', function() {
    // 确保所有模块都已加载
    if (!window.coreModule || !window.mapModule || 
        !window.uiModule || !window.commandsModule) {
        console.error('一个或多个模块未加载，等待所有模块加载完成...');
        
        // 设置超时（5秒）以防模块加载失败
        let timeout = 5000;
        const checkModulesInterval = setInterval(() => {
            if (window.coreModule && window.mapModule && 
                window.uiModule && window.commandsModule) {
                clearInterval(checkModulesInterval);
                initializeApp();
            } else if (timeout <= 0) {
                clearInterval(checkModulesInterval);
                alert('模块加载超时，请刷新页面重试');
                console.error('模块加载超时');
            } else {
                timeout -= 100;
            }
        }, 100);
    } else {
        initializeApp();
    }
});

function initializeApp() {
    // 初始化地图画布
    if (window.mapModule && typeof window.mapModule.initMapCanvas === 'function') {
        window.mapModule.initMapCanvas();
    }
    
    // 绑定连接按钮事件
    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn && window.coreModule && typeof window.coreModule.connectToServer === 'function') {
        connectBtn.addEventListener('click', window.coreModule.connectToServer);
    }
    
    // 初始化UI事件
    if (window.uiModule && typeof window.uiModule.initUIEvents === 'function') {
        window.uiModule.initUIEvents();
    }
}

// 初始化战争列表
function initWarList() {
    // 这里应该使用WebSocket或HTTP请求从服务器获取实际数据
    // 模拟数据作为示例
    const mockWars = [
        {
            id: 1,
            name: '北境冲突',
            participants: ['王国A', '王国B'],
            startDate: Date.now() - 86400000 * 7, // 一周前
            status: '进行中',
            objective: '领土争端',
            description: '关于北方边境矿脉的争夺'
        },
        {
            id: 2,
            name: '东部联盟战争',
            participants: ['王国C', '王国D', '王国E'],
            startDate: Date.now() - 86400000 * 15, // 15天前
            status: '僵持',
            objective: '势力范围划分',
            description: '多个王国之间的势力平衡战争'
        }
    ];
    
    uiModule.updateWarList(mockWars);
}

// 初始化战争列表
initWarList();

// 设置定时器定期更新战争列表（假设每30秒更新一次）
setInterval(() => {
    // 在实际应用中，这里应该通过WebSocket从服务器获取最新数据
    // 模拟数据更新
    const updatedWars = [...uiModule.getWarListData()].map(war => ({...war}));
    // 模拟可能的数据变化
    if (Math.random() > 0.5) {
        updatedWars[0].status = '即将结束';
    }
    
    uiModule.updateWarList(updatedWars);
}, 30000);

