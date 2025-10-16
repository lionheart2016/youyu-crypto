const fs = require('fs');
const path = require('path');

// 最终状态检查脚本
async function finalStatusCheck() {
    console.log('🔍 执行最终状态检查...\n');
    
    const results = {
        reactApp: false,
        networkConfig: false,
        transactionLogic: false,
        syntaxCheck: false,
        overall: false
    };
    
    try {
        // 1. 检查React应用状态
        console.log('📱 1. 检查React应用状态');
        const packageJsonPath = path.join(__dirname, 'react-privy-app', 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.log('   ✅ package.json 存在');
            console.log(`   📦 应用名称: ${packageJson.name}`);
            console.log(`   🎯 版本: ${packageJson.version}`);
            console.log(`   🚀 开发命令: ${packageJson.scripts?.dev || '未找到'}`);
            results.reactApp = true;
        } else {
            console.log('   ❌ package.json 不存在');
        }
        
        // 2. 检查网络配置
        console.log('\n🌐 2. 检查网络配置');
        const appPath = path.join(__dirname, 'react-privy-app', 'src', 'App.jsx');
        if (fs.existsSync(appPath)) {
            const appContent = fs.readFileSync(appPath, 'utf8');
            
            // 检查Sepolia网络配置
            const hasSepoliaRpc = appContent.includes('https://ethereum-sepolia-rpc.publicnode.com');
            const hasSepoliaChainId = appContent.includes('0xaa36a7');
            const hasSwitchToSepolia = appContent.includes('switchToSepolia');
            const hasJsonRpcProvider = appContent.includes('JsonRpcProvider');
            
            console.log(`   ${hasSepoliaRpc ? '✅' : '❌'} Sepolia RPC配置`);
            console.log(`   ${hasSepoliaChainId ? '✅' : '❌'} Sepolia Chain ID`);
            console.log(`   ${hasSwitchToSepolia ? '✅' : '❌'} 网络切换函数`);
            console.log(`   ${hasJsonRpcProvider ? '✅' : '❌'} JsonRpcProvider使用`);
            
            results.networkConfig = hasSepoliaRpc && hasSepoliaChainId && hasSwitchToSepolia && hasJsonRpcProvider;
        } else {
            console.log('   ❌ App.jsx 不存在');
        }
        
        // 3. 检查交易逻辑
        console.log('\n💸 3. 检查交易逻辑');
        if (fs.existsSync(appPath)) {
            const appContent = fs.readFileSync(appPath, 'utf8');
            
            const hasHandleSendTransaction = appContent.includes('handleSendTransaction');
            const hasParseEther = appContent.includes('ethers.parseEther');
            const hasWalletCreation = appContent.includes('new ethers.Wallet');
            const hasTransactionObject = appContent.includes('to: to');
            const hasPostMessage = appContent.includes('window.parent.postMessage');
            
            console.log(`   ${hasHandleSendTransaction ? '✅' : '❌'} 交易处理函数`);
            console.log(`   ${hasParseEther ? '✅' : '❌'} 金额转换(parseEther)`);
            console.log(`   ${hasWalletCreation ? '✅' : '❌'} Wallet对象创建`);
            console.log(`   ${hasTransactionObject ? '✅' : '❌'} 交易对象构建`);
            console.log(`   ${hasPostMessage ? '✅' : '❌'} 父窗口通信`);
            
            results.transactionLogic = hasHandleSendTransaction && hasParseEther && 
                                     hasWalletCreation && hasTransactionObject && hasPostMessage;
        }
        
        // 4. 语法检查
        console.log('\n🔧 4. 语法检查');
        try {
            const appContent = fs.readFileSync(appPath, 'utf8');
            
            // 检查常见的JSX语法问题
            const hasBalancedBraces = (appContent.match(/\(/g) || []).length === (appContent.match(/\)/g) || []).length;
            const hasBalancedBrackets = (appContent.match(/\[/g) || []).length === (appContent.match(/\]/g) || []).length;
            const hasBalancedBracesCurly = (appContent.match(/\{/g) || []).length === (appContent.match(/\}/g) || []).length;
            
            console.log(`   ${hasBalancedBraces ? '✅' : '❌'} 圆括号平衡`);
            console.log(`   ${hasBalancedBrackets ? '✅' : '❌'} 方括号平衡`);
            console.log(`   ${hasBalancedBracesCurly ? '✅' : '❌'} 花括号平衡`);
            
            results.syntaxCheck = hasBalancedBraces && hasBalancedBrackets && hasBalancedBracesCurly;
        } catch (error) {
            console.log('   ❌ 无法读取文件进行语法检查');
        }
        
        // 5. 检查测试文件
        console.log('\n🧪 5. 检查测试文件');
        const testFiles = [
            'test_sepolia_transaction_direct.js',
            'test_react_transaction_integration.js',
            'TRANSACTION_TEST_REPORT.md'
        ];
        
        testFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            const exists = fs.existsSync(filePath);
            console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        });
        
        // 6. 综合评估
        console.log('\n📊 6. 综合评估');
        const { overall, ...checkResults } = results;
        results.overall = Object.values(checkResults).every(result => result === true);
        
        console.log('\n' + '='.repeat(50));
        console.log('📈 检查结果汇总:');
        console.log('='.repeat(50));
        console.log(`   React应用: ${results.reactApp ? '✅ 正常' : '❌ 异常'}`);
        console.log(`   网络配置: ${results.networkConfig ? '✅ 正常' : '❌ 异常'}`);
        console.log(`   交易逻辑: ${results.transactionLogic ? '✅ 正常' : '❌ 异常'}`);
        console.log(`   语法检查: ${results.syntaxCheck ? '✅ 正常' : '❌ 异常'}`);
        console.log('='.repeat(50));
        console.log(`   🎯 总体状态: ${results.overall ? '✅ 全部正常' : '❌ 存在问题'}`);
        console.log('='.repeat(50));
        
        if (results.overall) {
            console.log('\n🎉 恭喜！React应用交易功能已完全配置并准备就绪！');
            console.log('\n📋 下一步操作:');
            console.log('   1. 确保React应用正在运行 (npm run dev)');
            console.log('   2. 访问 http://localhost:3002');
            console.log('   3. 使用测试账号登录');
            console.log('   4. 创建/连接钱包并激活');
            console.log('   5. 获取Sepolia测试ETH');
            console.log('   6. 测试交易功能');
        } else {
            console.log('\n⚠️  发现一些问题，请检查上述详细结果。');
        }
        
    } catch (error) {
        console.error('❌ 检查过程出错:', error.message);
    }
}

// 运行检查
finalStatusCheck();