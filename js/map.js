// map.js
// 地图渲染和显示模块

// 初始化地图画布
function initMapCanvas() {
    const mapMask = document.getElementById('map-mask');
    const mapCanvas = document.getElementById('game-map');
    
    if (!mapMask || !mapCanvas) {
        console.error('地图容器或画布未找到');
        return;
    }
    
    // 创建地图上下文并存储到全局对象
    const mapCtx = mapCanvas.getContext('2d');
    
    if (!window.mapModule) {
        window.mapModule = {};
    }
    
    // 存储DOM元素和上下文
    window.mapModule.mapMask = mapMask;
    window.mapModule.mapCanvas = mapCanvas;
    window.mapModule.mapCtx = mapCtx;
    
    // 初始化视口参数
    window.mapModule.viewport = {
        x: 0,           // 当前视口X坐标
        y: 0,           // 当前视口Y坐标
        width: mapMask.clientWidth,   // 视口宽度
        height: mapMask.clientHeight, // 视口高度
        scale: 1,       // 缩放比例（暂时不用）
        isDragging: false,
        lastX: 0,
        lastY: 0
    };
    
    // 初始化地图网格
    drawGrid();
    
    // 添加事件监听器
    addMapEventListeners();
}

// 添加地图事件监听器
function addMapEventListeners() {
    const {mapMask, mapCanvas} = window.mapModule;
    
    if (!mapMask || !mapCanvas) {
        console.error('地图容器或画布未找到，无法添加事件监听器');
        return;
    }
    
    // 鼠标按下事件
    mapMask.addEventListener('mousedown', (e) => {
        const viewport = window.mapModule.viewport;
        viewport.isDragging = true;
        viewport.lastX = e.clientX;
        viewport.lastY = e.clientY;
        mapMask.style.cursor = 'grabbing';
    });
    
    // 鼠标移动事件
    mapMask.addEventListener('mousemove', (e) => {
        const {viewport} = window.mapModule;
        
        if (viewport.isDragging) {
            const deltaX = e.clientX - viewport.lastX;
            const deltaY = e.clientY - viewport.lastY;
            
            // 更新视口位置
            viewport.x += deltaX;
            viewport.y += deltaY;
            
            // 边界检查
            checkViewportBoundaries();
            
            // 更新画布位置
            updateCanvasPosition();
            
            viewport.lastX = e.clientX;
            viewport.lastY = e.clientY;
        }
    });
    
    // 鼠标释放事件
    mapMask.addEventListener('mouseup', () => {
        const viewport = window.mapModule.viewport;
        viewport.isDragging = false;
        mapMask.style.cursor = 'grab';
    });
    
    // 鼠标离开事件
    mapMask.addEventListener('mouseleave', () => {
        const viewport = window.mapModule.viewport;
        viewport.isDragging = false;
        mapMask.style.cursor = 'grab';
    });
    
    // 滚轮事件（用于缩放）
    mapMask.addEventListener('wheel', (e) => {
        e.preventDefault(); // 阻止默认滚动行为
        
        const viewport = window.mapModule.viewport;
        const zoomSpeed = 0.1; // 缩放速度
        
        // 计算缩放比例
        let newScale = viewport.scale;
        if (e.deltaY < 0) {
            // 向上滚动 - 放大
            newScale += zoomSpeed;
        } else {
            // 向下滚动 - 缩小
            newScale -= zoomSpeed;
        }
        
        // 限制缩放范围
        newScale = Math.max(0.5, Math.min(3, newScale));
        
        // 计算缩放中心点（鼠标位置）
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        
        // 计算当前缩放中心在画布上的坐标
        const canvasX = viewport.x + mouseX / viewport.scale;
        const canvasY = viewport.y + mouseY / viewport.scale;
        
        // 更新缩放比例
        viewport.scale = newScale;
        
        // 调整视口位置以保持缩放中心不变
        viewport.x = canvasX - mouseX / viewport.scale;
        viewport.y = canvasY - mouseY / viewport.scale;
        
        // 更新画布位置和缩放
        updateCanvasPosition(false);
        
        // 更新视口边界
        checkViewportBoundaries();
    }, { passive: false });
}

// 更新画布位置
function updateCanvasPosition(resetOrigin = false) {
    const {mapCanvas, viewport, mapMask} = window.mapModule;
    
    if (!mapCanvas || !viewport) return;
    
    // 如果需要重置原点
    if (resetOrigin) {
        mapCanvas.style.transformOrigin = '0 0';
    }
    // 使用CSS transform来移动和缩放画布
    mapCanvas.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
}

// 检查视口边界
function checkViewportBoundaries() {
    const {mapCanvas, viewport, mapMask} = window.mapModule;
    
    if (!mapCanvas || !viewport || !mapMask) return;
    
    // 获取遮罩层的尺寸
    const maskWidth = mapMask.clientWidth;
    const maskHeight = mapMask.clientHeight;
    
    // 计算地图画布的实际尺寸（考虑缩放）
    const scaledWidth = mapCanvas.width * viewport.scale;
    const scaledHeight = mapCanvas.height * viewport.scale;
    
    // 应用新的边界限制
    // 确保地图左边不会超过视口中心线
    viewport.x = Math.max(-maskWidth / 2, Math.min(scaledWidth - maskWidth / 2, viewport.x));
    
    // 确保地图顶部不会超过视口水平中线
    viewport.y = Math.max(-maskHeight / 2, Math.min(scaledHeight - maskHeight / 2, viewport.y));
}

// 绘制地图网格
function drawGrid() {
    const mapCanvas = document.getElementById('game-map');
    const mapCtx = window.mapModule.mapCtx;
    if (!mapCanvas || !mapCtx) return;
    
    const width = mapCanvas.width;
    const height = mapCanvas.height;
    const cellSize = 20;
    
    // 清除画布
    mapCtx.clearRect(0, 0, width, height);
    
    // 设置样式
    mapCtx.strokeStyle = '#ddd';
    mapCtx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += cellSize) {
        mapCtx.beginPath();
        mapCtx.moveTo(x, 0);
        mapCtx.lineTo(x, height);
        mapCtx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += cellSize) {
        mapCtx.beginPath();
        mapCtx.moveTo(0, y);
        mapCtx.lineTo(width, y);
        mapCtx.stroke();
    }
}

// 更新地图显示
function updateMap(mapData) {
    if (!window.mapModule.mapCtx || !mapData) return;
    
    const {mapCanvas, mapCtx, viewport} = window.mapModule;
    
    const cellSize = 20;
    const lineWidth = 1;

    // 如果地图尺寸变化，调整canvas大小
    if (mapCanvas.width !== mapData.width * cellSize || mapCanvas.height !== mapData.height * cellSize) {
        mapCanvas.width = mapData.width * cellSize;
        mapCanvas.height = mapData.height * cellSize;
        
        drawGrid();
        // 更新视口尺寸
        if (viewport) {
            viewport.width = viewport.mapMask ? viewport.mapMask.clientWidth : mapCanvas.width;
            viewport.height = viewport.mapMask ? viewport.mapMask.clientHeight : mapCanvas.height;
        }
    }
    
    // 保存当前状态
    mapCtx.save();
    
    // 重置变换
    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
    
    // 绘制地图数据
    for (let i = 0; i < mapData.zones.length; i++) {
        const zone = mapData.zones[i];
        const x = zone.index % mapData.width;
        const y = Math.floor(zone.index / mapData.width);
        const color = zone.color;
        mapCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
        mapCtx.fillRect(x * cellSize + lineWidth, mapCanvas.height - ((y+1) * cellSize + lineWidth), cellSize - lineWidth * 2, cellSize - lineWidth * 2);
    }
    
    // 恢复状态
    mapCtx.restore();
}

// 导出函数
window.mapModule = {
    initMapCanvas: initMapCanvas,
    updateMap: updateMap
};