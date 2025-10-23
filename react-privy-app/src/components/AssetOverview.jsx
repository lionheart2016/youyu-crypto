import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './AssetOverview.css';

// 网络配置
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.etherscan.io'
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io'
  }
};

// 获取ETH价格数据
const getEthPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
    const data = await response.json();
    return {
      price: data.ethereum.usd,
      change24h: data.ethereum.usd_24h_change
    };
  } catch (error) {
    console.error('获取价格数据失败:', error);
    return { price: 0, change24h: 0 };
  }
};

// 获取钱包余额
const getWalletBalance = async (address, network = 'sepolia') => {
  try {
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
    const balance = await provider.getBalance(address);
    	console.log('原始余额:', balance);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('获取余额失败:', error);
    return '0';
  }
};

// ERC20代币合约ABI（简化版）
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)'
];

// 常见代币合约地址列表（示例）
const COMMON_TOKENS = {
  sepolia: [
    { address: '0x8443B9f8B30F27E01f3239961Be730D5de2FEd8c', name: 'Test USDT', symbol: 'USDT' }, // 测试网USDT示例
    // 可以在这里添加更多测试网代币地址
  ],
  mainnet: [
    // 主网代币地址
  ]
};

// 获取钱包中的ERC20代币数量和余额
const getWalletTokens = async (address, network = 'sepolia') => {
  // 验证钱包地址是否有效
  if (!address || !ethers.isAddress(address)) {
    console.error('无效的钱包地址');
    return [];
  }
  
  try {
    // 初始化区块链提供商连接
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpcUrl);
    const tokens = [];
    
    // 获取预定义代币列表
    const tokenList = COMMON_TOKENS[network] || [];
    
    // 记录处理开始时间
    console.log(`开始查询钱包 ${address} 在 ${NETWORKS[network].name} 上的代币余额`);
    
    // 处理每个代币合约
    for (const tokenInfo of tokenList) {
      try {
        // 创建合约实例
        const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);

        // 获取余额
        const balance = await contract.balanceOf(address);
        // 打印余额类型
        console.log('xxx原始余额:', balance, typeof balance);

        // 格式化余额，转换为用户可读形式
        const decimal = await contract.decimals();
        const readable = ethers.formatUnits(balance, decimal);

        
        // 记录代币余额信息
        console.log(`找到代币: ${tokenInfo.name} (${tokenInfo.symbol}) - 余额: ${readable}`);
        
        // 添加到结果数组
        tokens.push({
          address: tokenInfo.address,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          balance: readable
        });



      } catch (error) {
        console.warn(`查询代币 ${tokenInfo.address} 余额失败:`, error.message);
        // 继续处理下一个代币，确保单个代币错误不影响整体功能
      }
    }
    
    console.log(`钱包 ${address} 共有 ${tokens.length} 种代币资产`);
    return tokens;
  } catch (error) {
    console.error(`获取钱包 ${address} 代币数据失败:`, error);
    return [];
  }
};

/**
 * 资产概览组件
 */
const AssetOverview = ({ walletAddress, activeNetwork = 'sepolia' }) => {
  const [balance, setBalance] = useState('0');
  const [priceData, setPriceData] = useState({ price: 0, change24h: 0 });
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 计算总资产价值
  const totalValue = (parseFloat(balance) * priceData.price).toFixed(2);

  // 刷新数据
  const refreshData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const [balanceResult, priceResult, tokensResult] = await Promise.all([
        getWalletBalance(walletAddress, activeNetwork),
        getEthPrice(),
        getWalletTokens(walletAddress, activeNetwork)
      ]);
      
      setBalance(balanceResult);
      setPriceData(priceResult);
      setTokens(tokensResult);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    refreshData();
  }, [walletAddress, activeNetwork]);

  if (!walletAddress) {
    return (
      <div className="asset-overview">
        <div className="no-wallet-message">
          <p>🔍 请先连接钱包查看资产信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-overview">
      <div className="overview-header">
        <h3>💰 资产概览</h3>
        <div className="network-info">
          <span className="network-badge">{NETWORKS[activeNetwork]?.name}</span>
          <button 
            className="refresh-btn" 
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>⏳ 加载资产信息中...</p>
        </div>
      ) : (
        <>
          <div className="asset-cards-container">
            {/* 余额卡片 */}
            <div className="asset-card balance-card">
              <div className="card-header">
                <span className="card-icon">💎</span>
                <span className="card-title">ETH 余额</span>
              </div>
              <div className="card-content">
                <div className="balance-amount">
                  {parseFloat(balance).toFixed(4)} ETH
                </div>
                <div className="balance-value">
                  ≈ ${(parseFloat(balance) * priceData.price).toFixed(2)}
                </div>
              </div>
            </div>

            {/* 价格卡片 */}
            <div className="asset-card price-card">
              <div className="card-header">
                <span className="card-icon">📈</span>
                <span className="card-title">ETH 价格</span>
              </div>
              <div className="card-content">
                <div className="price-amount">
                  ${priceData.price.toLocaleString()}
                </div>
                <div className={`price-change ${priceData.change24h >= 0 ? 'positive' : 'negative'}`}>
                  {priceData.change24h >= 0 ? '↗' : '↘'} {Math.abs(priceData.change24h).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* 总资产卡片 */}
            <div className="asset-card total-card">
              <div className="card-header">
                <span className="card-icon">💰</span>
                <span className="card-title">总资产</span>
              </div>
              <div className="card-content">
                <div className="total-amount">
                  ${totalValue}
                </div>
                <div className="asset-composition">
                  {tokens.length > 0 ? `${tokens.length + 1} 种资产` : '100% ETH'}
                </div>
              </div>
            </div>
          </div>
          
          {/* 代币列表 - 展示持有代币的详细信息 */}
          {tokens.length > 0 && (
            <div className="tokens-section">
              <div className="section-header">
                <h4>📊 代币资产</h4>
                <span className="token-count">持有代币: {tokens.length} 种</span>
              </div>
              <div className="tokens-list">
                {tokens.map(token => {
                  // 根据代币精度确定显示小数位数
                  const displayDecimals = Math.min(Math.max(token.decimals, 2), 8);
                  const formattedBalance = parseFloat(token.balance).toFixed(displayDecimals);
                  
                  return (
                    <div key={token.address} className="token-item">
                      <div className="token-info">
                        <div className="token-icon">💠</div>
                        <div className="token-details">
                          <div className="token-name">{token.name}</div>
                          <div className="token-symbol">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="token-balance">
                        {/* 精确展示代币数量 */}
                        {formattedBalance} {token.symbol}
                      </div>
                      <div className="token-value">
                        {/* 暂时显示为 $0.00，未来可以集成价格API获取真实价值 */}
                        $0.00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 当用户没有持有任何代币时显示提示信息 */}
          {tokens.length === 0 && (
            <div className="no-tokens-message">
              <p>📝 当前钱包未持有任何代币资产</p>
              <small>您可以通过交易获取代币或在测试网领取测试代币</small>
            </div>
          )}
        </>
      )}

      {lastUpdated && (
        <div className="last-updated">
          <small>最后更新: {lastUpdated.toLocaleTimeString()}</small>
        </div>
      )}
    </div>
  );
};

export default AssetOverview;