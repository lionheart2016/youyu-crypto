const https = require('https');
const http = require('http');

// Sepolia 水龙头列表
const FAUCETS = [
    {
        name: 'Alchemy Sepolia Faucet',
        url: 'https://sepoliafaucet.com/',
        description: '需要 Alchemy 账户，每日 0.5 ETH',
        reliability: '高'
    },
    {
        name: 'Sepolia.dev Faucet', 
        url: 'https://faucet.sepolia.dev/',
        description: '需要主网地址验证，每日 0.1 ETH',
        reliability: '中'
    },
    {
        name: 'PK910 Mining Faucet',
        url: 'https://sepolia-faucet.pk910.de/',
        description: '挖矿模式，无需登录',
        reliability: '中'
    },
    {
        name: 'Chainlink Faucet',
        url: 'https://faucets.chain.link/sepolia',
        description: '需要钱包连接',
        reliability: '高'
    }
];

const WALLET_ADDRESS = '0x9de35812D126dCA811691df28ddF312233B16f67';

function displayFaucetInfo() {
    console.log('🚰 Sepolia ETH 水龙头信息\n');
    console.log('钱包地址:', WALLET_ADDRESS);
    console.log('\n推荐水龙头列表:');
    
    FAUCETS.forEach((faucet, index) => {
        console.log(`\n${index + 1}. ${faucet.name}`);
        console.log(`   URL: ${faucet.url}`);
        console.log(`   说明: ${faucet.description}`);
        console.log(`   可靠性: ${faucet.reliability}`);
    });
    
    console.log('\n💡 获取步骤:');
    console.log('1. 选择上述任意水龙头');
    console.log('2. 输入钱包地址:', WALLET_ADDRESS);
    console.log('3. 完成验证步骤');
    console.log('4. 领取测试 ETH');
    
    console.log('\n⚠️  注意事项:');
    console.log('- 测试 ETH 没有实际价值');
    console.log('- 每个水龙头都有每日限额');
    console.log('- 可能需要等待几分钟才能收到');
    console.log('- 如果失败，尝试其他水龙头');
}

function checkRecentTransactions() {
    console.log('\n🔍 检查最近交易...');
    console.log(`查看地址: https://sepolia.etherscan.io/address/${WALLET_ADDRESS}`);
    console.log('这将显示是否已经从水龙头收到 ETH\n');
}

function generateQuickCommands() {
    console.log('🛠️  快速命令:');
    console.log('检查余额:');
    console.log(`cd /Users/speed/Documents/Trae/yy-wallet/backend && node test_sepolia_send.js`);
    
    console.log('\n打开测试页面:');
    console.log('http://localhost:8080/test_sepolia_transaction.html');
    
    console.log('\n查看区块链浏览器:');
    console.log(`https://sepolia.etherscan.io/address/${WALLET_ADDRESS}`);
}

// 主函数
async function main() {
    console.log('🚀 Sepolia ETH 获取助手\n');
    console.log('=' .repeat(50));
    
    displayFaucetInfo();
    checkRecentTransactions();
    generateQuickCommands();
    
    console.log('\n' + '=' .repeat(50));
    console.log('💰 获取到 ETH 后，运行测试脚本验证!');
}

// 如果直接运行
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { displayFaucetInfo, checkRecentTransactions, generateQuickCommands };