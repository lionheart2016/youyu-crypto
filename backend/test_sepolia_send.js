const { ethers } = require('ethers');

async function testSepoliaTransaction() {
    try {
        console.log('🚀 开始 Sepolia 交易测试...\n');
        
        // 从环境变量获取配置
        const privateKey = process.env.ETHEREUM_PRIVATE_KEY || '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
        const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
        
        console.log('📡 连接到 Sepolia 网络...');
        console.log('RPC URL:', rpcUrl);
        
        // 创建提供者
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // 创建钱包
        const wallet = new ethers.Wallet(privateKey, provider);
        const address = await wallet.getAddress();
        console.log('💳 钱包地址:', address);
        
        // 检查余额
        const balance = await provider.getBalance(address);
        const balanceInEth = ethers.formatEther(balance);
        console.log('💰 钱包余额:', balanceInEth, 'ETH');
        
        // 检查网络
        const network = await provider.getNetwork();
        console.log('🌐 当前网络:', network.name, '(链ID:', network.chainId, ')');
        
        // 检查最新区块
        const blockNumber = await provider.getBlockNumber();
        console.log('📦 最新区块号:', blockNumber);
        
        // 如果余额为0，给出提示
        if (balance === 0n) {
            console.log('\n⚠️  警告: 钱包余额为 0 ETH');
            console.log('🚰 请从 Sepolia 水龙头获取测试 ETH:');
            console.log('   - https://sepoliafaucet.com/');
            console.log('   - https://faucet.sepolia.dev/');
            console.log('   - https://sepolia-faucet.pk910.de/');
            return;
        }
        
        // 准备交易
        const targetAddress = '0x742d35cc6634c0532925a3b844bc9e7595f0beb7';
        const amount = '0.0001'; // 发送 0.0001 ETH
        const amountInWei = ethers.parseEther(amount);
        
        console.log('\n📤 准备发送交易:');
        console.log('接收地址:', targetAddress);
        console.log('发送金额:', amount, 'ETH (', amountInWei.toString(), 'wei)');
        
        // 获取当前gas价格
        const gasPrice = await provider.getFeeData();
        console.log('⛽ Gas价格:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'gwei');
        
        // 估算gas限制
        const estimatedGas = await provider.estimateGas({
            to: targetAddress,
            value: amountInWei
        });
        console.log('🔥 估算Gas限制:', estimatedGas.toString());
        
        // 计算总费用
        const totalCost = amountInWei + (gasPrice.gasPrice * estimatedGas);
        console.log('💸 总费用估算:', ethers.formatEther(totalCost), 'ETH');
        
        // 检查余额是否足够
        if (balance < totalCost) {
            console.log('\n❌ 余额不足！');
            console.log('需要:', ethers.formatEther(totalCost), 'ETH');
            console.log('可用:', balanceInEth, 'ETH');
            return;
        }
        
        console.log('\n✅ 余额检查通过，准备发送交易...');
        
        // 发送交易
        console.log('🚀 正在发送交易...');
        const tx = await wallet.sendTransaction({
            to: targetAddress,
            value: amountInWei,
            gasLimit: estimatedGas,
            gasPrice: gasPrice.gasPrice
        });
        
        console.log('🎉 交易已发送！');
        console.log('📋 交易哈希:', tx.hash);
        console.log('🔗 查看交易: https://sepolia.etherscan.io/tx/' + tx.hash);
        
        // 等待交易确认
        console.log('\n⏳ 等待交易确认...');
        const receipt = await tx.wait();
        console.log('✅ 交易已确认！');
        console.log('📦 区块号:', receipt.blockNumber);
        console.log('💰 实际Gas费用:', ethers.formatEther(receipt.gasUsed * gasPrice.gasPrice), 'ETH');
        
        // 检查目标地址余额
        const targetBalance = await provider.getBalance(targetAddress);
        const targetBalanceInEth = ethers.formatEther(targetBalance);
        console.log('\n📊 目标地址新余额:', targetBalanceInEth, 'ETH');
        
        console.log('\n🎊 Sepolia 交易测试完成！');
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        console.error('错误详情:', error);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💡 提示: 余额不足，请从水龙头获取测试 ETH');
        } else if (error.code === 'NETWORK_ERROR') {
            console.log('\n💡 提示: 网络连接失败，请检查 RPC URL');
        } else if (error.message.includes('transaction')) {
            console.log('\n💡 提示: 交易相关错误，请检查地址和金额');
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    testSepoliaTransaction();
}

module.exports = { testSepoliaTransaction };