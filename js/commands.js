// commands.js
// 指令发送模块

// 发送外交指令
function sendDiplomacyCommand(commandType, targetFactionId) {
    if (!targetFactionId) {
        alert('请选择目标势力');
        return;
    }
    
    const command = commandType + '|' + targetFactionId;
    
    // 使用核心模块发送消息
    if (window.coreModule && typeof window.coreModule.sendMessage === 'function') {
        window.coreModule.sendMessage(command);
    } else {
        console.error('核心模块未加载，无法发送消息');
    }
}
function sendCommand(command, arg) {
    const final_cmd = command + '|' + arg;
    
    // 使用核心模块发送消息
    if (window.coreModule && typeof window.coreModule.sendMessage === 'function') {
        window.coreModule.sendMessage(final_cmd);
    } else {
        console.error('核心模块未加载，无法发送消息');
    }
}

// 发送内政指令
function sendInternalCommand(commandType, value) {
    let command = {};
    
    switch(commandType) {
        case 'tax_rate':
            command = {
                type: 'internal_policy',
                policy: 'tax_rate',
                value: parseFloat(value)
            };
            break;
        // 可以添加更多内政指令类型
        default:
            console.error('未知内政指令类型:', commandType);
            return;
    }
    
    // 使用核心模块发送消息
    if (window.coreModule && typeof window.coreModule.sendMessage === 'function') {
        window.coreModule.sendMessage(command);
    } else {
        console.error('核心模块未加载，无法发送消息');
    }
}

// 导出函数
window.commandsModule = {
    sendDiplomacyCommand: sendDiplomacyCommand,
    sendInternalCommand: sendInternalCommand,
    sendCommand: sendCommand,
};