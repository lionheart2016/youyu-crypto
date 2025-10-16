const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// 系统配置
const CONFIG = {
    backend: {
        port: 3003,
        url: 'http://localhost:3003',
        healthEndpoint: '/health'
    },
    frontend: {
        port: 3000,
        url: 'http://localhost:3000'
    },
    reactApp: {
        port: 3002,
        url: 'http://localhost:3002'
    },
    testServer: {
        port: 8080,
        url: 'http://localhost:8080'
    }
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return colors[color] + text + colors.reset;
}

// 检查端口占用
function checkPort(port, serviceName) {
    try {
        const result = execSync(`lsof -i :${port} | grep LISTEN`, { encoding: 'utf8' });
        if (result) {
            console.log(colorize(`✅ ${serviceName} 端口 ${port} 正在运行`, 'green'));
            return true;
        }
    } catch (error) {
        console.log(colorize(`❌ ${serviceName} 端口 ${port} 未运行`, 'red'));
        return false;
    }
    return false;
}

// HTTP 请求检查
function checkHttpService(url, serviceName, timeout = 5000) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const request = protocol.get(url, (response) => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
                console.log(colorize(`✅ ${serviceName} (${url}) 响应正常`, 'green'));
                resolve(true);
            } else {
                console.log(colorize(`⚠️  ${serviceName} (${url}) 响应异常: ${response.statusCode}`, 'yellow'));
                resolve(false);
            }
        });
        
        request.on('error', (error) => {
            console.log(colorize(`❌ ${serviceName} (${url}) 连接失败: ${error.message}`, 'red'));
            resolve(false);
        });
        
        request.setTimeout(timeout, () => {
            request.destroy();
            console.log(colorize(`⏱️  ${serviceName} (${url}) 连接超时`, 'yellow'));
            resolve(false);
        });
    });
}

// 检查环境变量
function checkEnvironmentVariables() {
    console.log(colorize('\n🔍 检查环境变量...', 'cyan'));
    
    const envFiles = [
        '/Users/speed/Documents/Trae/yy-wallet/backend/.env',
        '/Users/speed/Documents/Trae/yy-wallet/frontend/.env',
        '/Users/speed/Documents/Trae/yy-wallet/react-privy-app/.env'
    ];
    
    envFiles.forEach((envFile, index) => {
        try {
            const fs = require('fs');
            const content = fs.readFileSync(envFile, 'utf8');
            console.log(colorize(`✅ ${envFile.split('/').pop()} 文件存在`, 'green'));
            
            // 检查关键配置
            if (content.includes('ETHEREUM_RPC_URL')) {
                const rpcMatch = content.match(/ETHEREUM_RPC_URL=(.+)/);
                if (rpcMatch) {
                    const rpcUrl = rpcMatch[1];
                    if (rpcUrl.includes('sepolia')) {
                        console.log(colorize(`   🌐 RPC URL 已配置为 Sepolia: ${rpcUrl}`, 'green'));
                    } else {
                        console.log(colorize(`   ⚠️  RPC URL 不是 Sepolia: ${rpcUrl}`, 'yellow'));
                    }
                }
            }
            
            if (content.includes('ETHEREUM_PRIVATE_KEY')) {
                console.log(colorize(`   🔑 私钥已配置`, 'green'));
            }
            
        } catch (error) {
            console.log(colorize(`❌ ${envFile.split('/').pop()} 文件不存在`, 'red'));
        }
    });
}

// 检查网络连接
async function checkNetworkConnectivity() {
    console.log(colorize('\n🌐 检查网络连接...', 'cyan'));
    
    const networks = [
        {
            name: 'Sepolia RPC',
            url: 'https://ethereum-sepolia-rpc.publicnode.com',
            timeout: 10000
        }
    ];
    
    for (const network of networks) {
        await checkHttpService(network.url, network.name, network.timeout);
    }
}

// 检查钱包状态
async function checkWalletStatus() {
    console.log(colorize('\n💳 检查钱包状态...', 'cyan'));
    
    try {
        const { execSync } = require('child_process');
        const result = execSync('cd /Users/speed/Documents/Trae/yy-wallet/backend && node -e "const { ethers } = require(\'ethers\'); const provider = new ethers.JsonRpcProvider(\'https://ethereum-sepolia-rpc.publicnode.com\'); const wallet = new ethers.Wallet(\'0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d\', provider); wallet.getAddress().then(addr => provider.getBalance(addr).then(balance => console.log(`地址: ${addr}, 余额: ${ethers.formatEther(balance)} ETH`)));"', { encoding: 'utf8' });
        console.log(colorize(`✅ 钱包状态正常`, 'green'));
        console.log(colorize(`   ${result.trim()}`, 'blue'));
    } catch (error) {
        console.log(colorize(`❌ 钱包状态检查失败: ${error.message}`, 'red'));
    }
}

// 显示快速修复建议
function showQuickFixes() {
    console.log(colorize('\n🔧 快速修复建议:', 'cyan'));
    console.log('1. 如果服务未运行:');
    console.log('   cd /Users/speed/Documents/Trae/yy-wallet/backend && npm run start:dev');
    console.log('   cd /Users/speed/Documents/Trae/yy-wallet/frontend && npm run dev');
    console.log('   cd /Users/speed/Documents/Trae/yy-wallet/react-privy-app && npm run dev');
    
    console.log('\n2. 如果端口被占用:');
    console.log('   lsof -i :3000 # 查看占用进程');
    console.log('   kill -9 PID   # 终止进程');
    
    console.log('\n3. 如果网络连接失败:');
    console.log('   检查 RPC URL 配置');
    console.log('   尝试备用 RPC 节点');
    
    console.log('\n4. 如果钱包余额不足:');
    console.log('   node /Users/speed/Documents/Trae/yy-wallet/get_sepolia_eth.js');
}

// 主诊断函数
async function runHealthCheck() {
    console.log(colorize('🏥 系统健康检查', 'bright'));
    console.log(colorize('=' .repeat(50), 'bright'));
    
    // 检查端口状态
    console.log(colorize('\n📡 检查服务端口...', 'cyan'));
    const backendRunning = checkPort(CONFIG.backend.port, 'Backend');
    const frontendRunning = checkPort(CONFIG.frontend.port, 'Frontend');
    const reactAppRunning = checkPort(CONFIG.reactApp.port, 'React App');
    const testServerRunning = checkPort(CONFIG.testServer.port, 'Test Server');
    
    // 检查 HTTP 服务
    console.log(colorize('\n🌐 检查 HTTP 服务...', 'cyan'));
    const checks = await Promise.all([
        checkHttpService(CONFIG.backend.url, 'Backend API'),
        checkHttpService(CONFIG.frontend.url, 'Frontend'),
        checkHttpService(CONFIG.reactApp.url, 'React App'),
        checkHttpService(CONFIG.testServer.url + '/test_sepolia_transaction.html', 'Test Page')
    ]);
    
    // 检查环境变量
    checkEnvironmentVariables();
    
    // 检查网络连接
    await checkNetworkConnectivity();
    
    // 检查钱包状态
    await checkWalletStatus();
    
    // 显示修复建议
    showQuickFixes();
    
    // 总结
    console.log(colorize('\n📊 检查完成!', 'bright'));
    console.log(colorize('=' .repeat(50), 'bright'));
    
    const allServicesRunning = backendRunning && frontendRunning && reactAppRunning && testServerRunning;
    const allHttpServicesOk = checks.every(check => check);
    
    if (allServicesRunning && allHttpServicesOk) {
        console.log(colorize('🎉 系统状态良好! 可以开始 Sepolia 交易测试', 'green'));
        console.log(colorize('📍 测试页面: http://localhost:8080/test_sepolia_transaction.html', 'blue'));
    } else {
        console.log(colorize('⚠️  发现一些问题，请查看上面的修复建议', 'yellow'));
    }
}

// 如果直接运行
if (require.main === module) {
    runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };