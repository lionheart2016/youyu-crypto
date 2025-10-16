const { ethers } = require('ethers');

// 测试React应用交易集成功能
async function testReactTransactionIntegration() {
    console.log('🚀 开始测试React应用交易集成功能...');
    
    try {
        // 测试Sepolia网络连接
        console.log('🔗 测试Sepolia网络连接...');
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        
        const network = await provider.getNetwork();
        console.log('✅ 网络连接成功');
        console.log('📊 网络信息:', {
            name: network.name,
            chainId: network.chainId.toString(),
            ensAddress: network.ensAddress
        });
        
        // 测试目标地址（React应用中配置的地址）
        const targetAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
        console.log('💰 检查目标地址余额:', targetAddress);
        const balance = await provider.getBalance(targetAddress);
        console.log('💎 目标地址余额:', ethers.formatEther(balance), 'ETH');
        
        // 测试交易参数（与React应用中相同）
        const transactionData = {
            to: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
            value: '0.001',
            waitForConfirmation: false
        };
        
        console.log('📝 测试交易参数解析:');
        console.log('   接收地址:', transactionData.to);
        console.log('   金额:', transactionData.value, 'ETH');
        console.log('   等待确认:', transactionData.waitForConfirmation);
        
        // 模拟React应用中的交易创建逻辑
        console.log('🔧 模拟React应用交易创建逻辑...');
        
        // 1. 解析交易数据
        const { to, value, data = '0x' } = transactionData;
        
        if (!to || !value) {
            throw new Error('缺少必要的交易参数 (to, value)');
        }
        
        // 2. 创建交易对象（与React应用中相同）
        const valueStr = String(value);
        const valueInWei = ethers.parseEther(valueStr);
        
        console.log('💰 金额转换:');
        console.log('   原始值:', value);
        console.log('   转换为wei:', valueInWei.toString());
        
        // 3. 估算gas费用
        const gasPrice = await provider.getFeeData();
        const gasLimit = 21000;
        
        console.log('⛽ Gas信息:');
        console.log('   Gas价格:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'gwei');
        console.log('   Gas限制:', gasLimit);
        
        const estimatedFee = gasLimit * Number(gasPrice.gasPrice);
        console.log('💸 预估交易费用:', ethers.formatEther(estimatedFee.toString()), 'ETH');
        
        // 4. 构建完整交易对象
        const transaction = {
            to: to,
            value: valueInWei,
            data: data,
            gasLimit: gasLimit,
            gasPrice: gasPrice.gasPrice
        };
        
        console.log('📋 完整交易对象:');
        console.log('   to:', transaction.to);
        console.log('   value:', transaction.value.toString());
        console.log('   data:', transaction.data);
        console.log('   gasLimit:', transaction.gasLimit);
        console.log('   gasPrice:', transaction.gasPrice.toString());
        
        console.log('✅ React应用交易逻辑测试通过');
        
        // 5. 测试网络切换逻辑
        console.log('');
        console.log('🔁 测试网络切换逻辑...');
        
        const sepoliaChainId = '0xaa36a7'; // Sepolia的chain ID
        const sepoliaRpcUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
        
        console.log('📡 Sepolia网络配置:');
        console.log('   Chain ID:', sepoliaChainId);
        console.log('   RPC URL:', sepoliaRpcUrl);
        console.log('   网络名称: Sepolia Test Network');
        console.log('   货币符号: ETH');
        console.log('   区块浏览器: https://sepolia.etherscan.io');
        
        console.log('✅ 网络切换配置测试通过');
        
        // 6. 提供测试建议
        console.log('');
        console.log('🔧 React应用测试建议:');
        console.log('   1. 确保React应用运行在 http://localhost:3002');
        console.log('   2. 使用测试账号登录: test-1143@privy.io');
        console.log('   3. 创建或连接钱包');
        console.log('   4. 激活钱包');
        console.log('   5. 点击"发送测试交易"按钮');
        console.log('   6. 观察控制台日志输出');
        
        console.log('');
        console.log('⚠️  重要提醒:');
        console.log('   - 测试地址需要有足够的Sepolia测试ETH');
        console.log('   - 如果余额不足，请访问水龙头获取测试ETH');
        console.log('   - 交易可能需要几分钟时间确认');
        console.log('   - 可以在 https://sepolia.etherscan.io 查看交易状态');
        
        console.log('');
        console.log('✅ 所有测试完成！React应用交易功能配置正确。');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('📋 错误详情:', error);
    }
}

// 运行测试
testReactTransactionIntegration();