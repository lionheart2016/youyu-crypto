import React, { useState, useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, createWalletClient, http, zeroAddress } from 'viem';
import { sepolia } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import './EIP7702Upgrader.css';

// Pimlico API配置
const PIMLICO_API_KEY = 'pim_J42TP3f8jieEHUZ3W4WyuA';
const PIMLICO_URL = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${PIMLICO_API_KEY}`;
const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

// 解析EIP-7702授权地址的辅助函数
function parseEip7702AuthorizedAddress(code) {
  if (!code || code === '0x' || code === '0x0') return null;
  const normalized = code.toLowerCase();
  const MAGIC = '0xef0100';
  const idx = normalized.indexOf(MAGIC);
  if (idx === -1) return null;
  return ('0x' + normalized.slice(idx + MAGIC.length, idx + MAGIC.length + 40));
}

const EIP7702Upgrader = () => {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState(null);
  const [authorizedImplementation, setAuthorizedImplementation] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [error, setError] = useState(null);

  // 获取嵌入式钱包
  const embeddedWallet = useMemo(() => {
    if (!wallets || wallets.length === 0) return null;
    return wallets.find((wallet) => wallet.walletClientType === 'privy');
  }, [wallets]);

  // 创建公共客户端
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL)
    });
  }, []);

  // 创建Pimlico客户端
  const pimlicoClient = useMemo(() => {
    return createPimlicoClient({
      transport: http(PIMLICO_URL)
    });
  }, []);

  // 检查EIP-7702授权状态
  const checkEip7702Status = async (address) => {
    if (!address || !publicClient) return null;
    
    try {
      setIsCheckingStatus(true);
      console.log('🔍 检查EIP-7702授权状态:', address);
      
      const code = await publicClient.getCode({ address });
      console.log('📊 获取到的合约代码:', code);
      
      const implementationAddress = parseEip7702AuthorizedAddress(code);
      setAuthorizedImplementation(implementationAddress);
      
      return implementationAddress;
    } catch (error) {
      console.error('❌ 检查EIP-7702状态失败:', error);
      setError(error.message);
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // 创建智能账户客户端
  const createSmartAccount = async () => {
    if (!embeddedWallet || !publicClient || !pimlicoClient) {
      throw new Error('缺少必要的客户端配置');
    }

    // 获取钱包客户端
    const walletClient = createWalletClient({
      account: embeddedWallet.address,
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL)
    });

    // 直接使用嵌入式钱包地址创建智能账户客户端
    const smartAccountClient = createSmartAccountClient({
      account: {
        address: embeddedWallet.address,
        async signMessage({ message }) {
          return await walletClient.signMessage({ message });
        },
        async signTypedData(typedData) {
          return await walletClient.signTypedData(typedData);
        }
      },
      chain: sepolia,
      transport: http(SEPOLIA_RPC_URL),
      bundlerTransport: http(PIMLICO_URL),
      paymaster: pimlicoClient
    });

    return smartAccountClient;
  };

  // 处理升级操作
  const handleUpgradeToSmartWallet = async () => {
    try {
      setIsUpgrading(true);
      setError(null);
      setTransactionHash(null);
      setUpgradeStatus({ status: 'pending', message: '准备升级...' });
      
      if (!embeddedWallet) {
        throw new Error('未找到嵌入式钱包');
      }
      
      console.log('🚀 开始升级到智能钱包:', embeddedWallet.address);
      setUpgradeStatus({ status: 'processing', message: '正在创建智能账户客户端...' });
      
      // 创建智能账户客户端
      const smartAccountClient = await createSmartAccount();
      console.log('✅ 智能账户客户端创建成功:', smartAccountClient);
      
      setUpgradeStatus({ status: 'processing', message: '正在发送用户操作...' });
      
      // 发送用户操作 - 使用简单的转账操作进行测试
      // 使用更简单的API调用，避免paymaster相关错误
      const userOpHash = await smartAccountClient.sendTransaction({
        to: embeddedWallet.address, // 发送到自己的地址
        data: '0x', // 空数据
        value: 0n // 零金额
      });
      
      console.log('✅ 用户操作发送成功，哈希:', userOpHash);
      
      setUpgradeStatus({ status: 'processing', message: '等待交易确认...' });
      
      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: userOpHash
      });
      
      console.log('✅ 交易确认成功:', receipt);
      setTransactionHash(receipt.transactionHash);
      
      // 检查升级后的状态
      const implementation = await checkEip7702Status(embeddedWallet.address);
      
      if (implementation) {
        setUpgradeStatus({
          status: 'success', 
          message: '升级成功！您的钱包现在是智能钱包',
          implementation: implementation,
          transactionHash: receipt.transactionHash
        });
        console.log('✅ 升级成功，智能钱包实现地址:', implementation);
      } else {
        throw new Error('升级后未检测到智能钱包实现');
      }
      
    } catch (error) {
      console.error('💥 升级失败:', error);
      setError(error.message);
      setUpgradeStatus({
        status: 'error', 
        message: `升级失败: ${error.message || '未知错误'}`
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // 当钱包变化时检查状态
  useEffect(() => {
    if (embeddedWallet && embeddedWallet.address) {
      checkEip7702Status(embeddedWallet.address);
    }
  }, [embeddedWallet]);

  const isUpgraded = !!authorizedImplementation;

  return (
    <div className="eip7702-upgrader action-card">
      <div className="action-header">
        <h5>🚀 升级到智能钱包</h5>
        <span className="action-description">使用EIP-7702和Pimlico服务将您的钱包升级为智能账户</span>
      </div>
      
      <div className="upgrade-content">
        {/* 钱包状态显示 */}
        <div className="wallet-status">
          <div className="status-item">
            <span className="status-label">钱包类型:</span>
            <span className="status-value">
              {isUpgraded ? '✅ 智能钱包' : '🔄 普通钱包'}
            </span>
          </div>
          
          {embeddedWallet && (
            <div className="status-item">
              <span className="status-label">钱包地址:</span>
              <span className="status-value address">
                {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
              </span>
            </div>
          )}
          
          {isUpgraded && (
            <div className="status-item">
              <span className="status-label">实现地址:</span>
              <span className="status-value implementation-address">
                {authorizedImplementation.slice(0, 6)}...{authorizedImplementation.slice(-4)}
              </span>
            </div>
          )}
        </div>
        
        {/* Pimlico服务信息 */}
        <div className="pimlico-info">
          <h6>🔧 使用Pimlico服务</h6>
          <p className="pimlico-description">
            通过Pimlico的账户抽象服务，享受Gas赞助、批量交易等高级功能
          </p>
        </div>
        
        {/* 功能说明 */}
        <div className="features-section">
          <h6>🎯 升级后您将获得:</h6>
          <ul className="feature-list">
            <li className="feature-item">
              <span className="feature-icon">💼</span>
              <span className="feature-text">交易批处理</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">Gas费用赞助</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">🔐</span>
              <span className="feature-text">自定义权限控制</span>
            </li>
            <li className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">增强的安全功能</span>
            </li>
          </ul>
        </div>
        
        {/* 操作按钮 */}
        <div className="action-buttons">
          {!isUpgraded ? (
            <button 
              className="action-btn upgrade-btn"
              onClick={handleUpgradeToSmartWallet}
              disabled={isUpgrading || !embeddedWallet || isCheckingStatus}
            >
              {isUpgrading ? '⏳ 升级中...' : '🚀 升级为智能钱包'}
            </button>
          ) : (
            <button 
              className="action-btn check-status-btn"
              onClick={() => checkEip7702Status(embeddedWallet?.address)}
              disabled={isCheckingStatus || !embeddedWallet}
            >
              {isCheckingStatus ? '⏳ 检查中...' : '🔍 检查状态'}
            </button>
          )}
        </div>
        
        {/* 状态信息 */}
        {upgradeStatus && (
          <div className={`status-message ${upgradeStatus.status}`}>
            {upgradeStatus.status === 'success' && (
              <div className="success-content">
                <span className="status-emoji">🎉</span>
                <span className="status-text">{upgradeStatus.message}</span>
                {upgradeStatus.transactionHash && (
                  <div className="transaction-info">
                    <span>交易哈希: </span>
                    <span className="transaction-hash">
                      {upgradeStatus.transactionHash.slice(0, 10)}...{upgradeStatus.transactionHash.slice(-8)}
                    </span>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${upgradeStatus.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etherscan-link"
                    >
                      在Etherscan查看
                    </a>
                  </div>
                )}
              </div>
            )}
            {upgradeStatus.status === 'error' && (
              <div className="error-content">
                <span className="status-emoji">❌</span>
                <span className="status-text">{upgradeStatus.message}</span>
              </div>
            )}
            {upgradeStatus.status === 'processing' && (
              <div className="processing-content">
                <span className="status-emoji">⏳</span>
                <span className="status-text">{upgradeStatus.message}</span>
              </div>
            )}
          </div>
        )}
        
        {/* 错误信息 */}
        {error && (
          <div className="error-message">
            <span className="error-emoji">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
        
        {/* 交易哈希显示 */}
        {transactionHash && (
          <div className="transaction-hash-section">
            <h6>📄 交易信息</h6>
            <div className="transaction-hash-info">
              <span className="hash-label">交易哈希:</span>
              <span className="hash-value">{transactionHash}</span>
              <a 
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etherscan-link"
              >
                在Etherscan查看
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EIP7702Upgrader;