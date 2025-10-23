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
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('获取余额失败:', error);
    return '0';
  }
};

/**
 * 资产概览组件
 * 显示钱包余额、ETH价格和24小时变化率
 */
const AssetOverview = ({ walletAddress, activeNetwork = 'sepolia' }) => {
  const [balance, setBalance] = useState('0');
  const [priceData, setPriceData] = useState({ price: 0, change24h: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 计算总资产价值
  const totalValue = (parseFloat(balance) * priceData.price).toFixed(2);

  // 刷新数据
  const refreshData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const [balanceResult, priceResult] = await Promise.all([
        getWalletBalance(walletAddress, activeNetwork),
        getEthPrice()
      ]);
      
      setBalance(balanceResult);
      setPriceData(priceResult);
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
    
    // 设置定时刷新（每30秒）
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
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
        <div className="asset-cards">
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
                100% ETH
              </div>
            </div>
          </div>
        </div>
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