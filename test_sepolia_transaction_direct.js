const { ethers } = require('ethers');

// 测试Sepolia网络交易功能
async function testSepoliaTransaction() {
    console.log('🚀 开始测试Sepolia网络交易功能...');
    
    try {
        // 连接到Sepolia网络
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
        
        console.log('🔗 连接到Sepolia网络...');
        const network = await provider.getNetwork();
        console.log('✅ 网络连接成功');
        console.log('📊 网络信息:', {
            name: network.name,
            chainId: network.chainId.toString(),
            ensAddress: network.ensAddress
        });
        
        // 测试地址（来自系统健康检查）
        const testAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
        
        console.log('💰 检查测试地址余额...');
        const balance = await provider.getBalance(testAddress);
        console.log('💎 余额:', ethers.formatEther(balance), 'ETH');
        
        if (balance === 0n) {
            console.log('⚠️  警告：测试地址余额为0，需要获取测试ETH');
            console.log('🚰 请访问以下水龙头获取测试ETH:');
            console.log('   - https://sepoliafaucet.com/ (Alchemy)');
            console.log('   - https://faucet.sepolia.dev/ (Sepolia.dev)');
            console.log('   - https://sepolia-faucet.pk910.de/ (PK910 Mining)');
            console.log('   - https://faucets.chain.link/sepolia (Chainlink)');
        } else {
            console.log('✅ 测试地址有足够的余额进行交易测试');
        }
        
        // 获取当前gas价格
        console.log('⛽ 获取当前gas价格...');
        const gasPrice = await provider.getFeeData();
        console.log('📈 Gas价格:', {
            gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') + ' gwei' : 'N/A',
            maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') + ' gwei' : 'N/A',
            maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') + ' gwei' : 'N/A'
        });
        
        // 测试交易参数
        const transaction = {
            to: '0x742d35cc6634c0532925a3b844bc9e7595f0beb7',
            value: ethers.parseEther('0.001'),
            gasLimit: 21000,
            gasPrice: gasPrice.gasPrice || ethers.parseUnits('20', 'gwei')
        };
        
        console.log('📝 测试交易参数:');
        console.log('   接收地址:', transaction.to);
        console.log('   金额:', ethers.formatEther(transaction.value), 'ETH');
        console.log('   Gas限制:', transaction.gasLimit);
        console.log('   Gas价格:', ethers.formatUnits(transaction.gasPrice, 'gwei'), 'gwei');
        
        // 估算交易费用
        const estimatedFee = Number(transaction.gasLimit) * Number(transaction.gasPrice);
        console.log('💸 预估交易费用:', ethers.formatEther(estimatedFee.toString()), 'ETH');
        
        console.log('✅ Sepolia网络交易测试准备完成');
        console.log('');
        console.log('🔧 React应用中的配置建议:');
        console.log('   - 使用JsonRpcProvider连接Sepolia网络');
        console.log('   - 确保钱包地址有足够的测试ETH');
        console.log('   - 设置合理的gas价格和限制');
        console.log('   - 处理网络切换和错误情况');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('📋 错误详情:', error);
    }
}

// 运行测试
testSepoliaTransaction();