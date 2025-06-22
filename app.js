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

