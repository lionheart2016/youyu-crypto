// 浏览器控制台日志收集器
// 用于捕获和显示所有控制台输出，便于调试

(function() {
  // 保存原始的控制台方法
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  // 日志存储
  window.capturedLogs = [];
  
  // 日志级别样式
  const logStyles = {
    log: 'color: #d1d5db; background: #1f2937; padding: 2px 4px; border-radius: 2px;',
    error: 'color: #f87171; background: #7f1d1d; padding: 2px 4px; border-radius: 2px; font-weight: bold;',
    warn: 'color: #facc15; background: #78350f; padding: 2px 4px; border-radius: 2px;',
    info: 'color: #60a5fa; background: #1e3a8a; padding: 2px 4px; border-radius: 2px;'
  };
  
  // 重写控制台方法
  function captureLog(type, args) {
    const timestamp = new Date().toLocaleTimeString();
    const message = Array.from(args).map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    const logEntry = {
      timestamp,
      type,
      message,
      raw: args
    };
    
    window.capturedLogs.push(logEntry);
    
    // 保持原始的控制台输出
    originalConsole[type].apply(console, args);
    
    // 同时显示在我们的日志区域（如果存在）
    displayLog(logEntry);
  }
  
  // 显示日志到页面
  function displayLog(logEntry) {
    const logContainer = document.getElementById('console-log-container');
    if (!logContainer) return;
    
    const logElement = document.createElement('div');
    logElement.className = `console-log console-${logEntry.type}`;
    logElement.innerHTML = `
      <span class="console-timestamp">${logEntry.timestamp}</span>
      <span class="console-type ${logEntry.type}">${logEntry.type.toUpperCase()}</span>
      <span class="console-message">${logEntry.message}</span>
    `;
    
    logContainer.appendChild(logElement);
    
    // 自动滚动到底部
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // 限制日志数量
    const maxLogs = 1000;
    if (logContainer.children.length > maxLogs) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }
  
  // 重写控制台方法
  console.log = function(...args) {
    captureLog('log', args);
  };
  
  console.error = function(...args) {
    captureLog('error', args);
  };
  
  console.warn = function(...args) {
    captureLog('warn', args);
  };
  
  console.info = function(...args) {
    captureLog('info', args);
  };
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .console-log-container {
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
    }
    
    .console-log {
      margin-bottom: 4px;
      padding: 2px 4px;
      border-radius: 2px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .console-timestamp {
      color: #666;
      white-space: nowrap;
      min-width: 60px;
    }
    
    .console-type {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10px;
      padding: 2px 4px;
      border-radius: 2px;
      min-width: 40px;
      text-align: center;
    }
    
    .console-type.log {
      background: #374151;
      color: #d1d5db;
    }
    
    .console-type.error {
      background: #7f1d1d;
      color: #f87171;
    }
    
    .console-type.warn {
      background: #78350f;
      color: #facc15;
    }
    
    .console-type.info {
      background: #1e3a8a;
      color: #60a5fa;
    }
    
    .console-message {
      color: #e5e7eb;
      flex: 1;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .console-log:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .console-log.console-error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 2px solid #ef4444;
    }
    
    .console-log.console-warn {
      background: rgba(245, 158, 11, 0.1);
      border-left: 2px solid #f59e0b;
    }
  `;
  document.head.appendChild(style);
  
  // 添加日志导出功能
  window.exportLogs = function() {
    const logText = window.capturedLogs.map(log => 
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 添加日志清空功能
  window.clearCapturedLogs = function() {
    window.capturedLogs = [];
    const logContainer = document.getElementById('console-log-container');
    if (logContainer) {
      logContainer.innerHTML = '';
    }
  };
  
  console.log('🎯 控制台日志收集器已启动');
  console.log('💡 可用命令:');
  console.log('  - window.exportLogs() - 导出所有捕获的日志');
  console.log('  - window.clearCapturedLogs() - 清空捕获的日志');
  console.log('  - window.capturedLogs - 查看所有捕获的日志数组');
  
})();