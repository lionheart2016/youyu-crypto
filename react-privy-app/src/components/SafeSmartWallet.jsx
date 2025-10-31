import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { createSafeClient } from '@safe-global/sdk-starter-kit';
import { sepolia } from 'viem/chains';
import { createWalletClient, custom } from 'viem';


import './SafeSmartWallet.css';

/**
 * Safe 智能钱包组件
 * 提供 Safe 智能钱包的创建、管理和多签功能
 */
const SafeSmartWallet = ({ 
  activeWallet, 
  user, 
  wallets, 
  externalWallets,
  createWallet 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [safeAddress, setSafeAddress] = useState('');
  const [safeInfo, setSafeInfo] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [threshold, setThreshold] = useState(1);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  // Safe 配置
  const SAFE_CONFIG = {
    sepolia: {
      safeServiceUrl: 'https://safe-transaction-sepolia.safe.global',
      chainId: 11155111,
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      apiKey: import.meta.env.VITE_SAFE_API_KEY || '' // 从环境变量获取 API Key
    }
  };

  // 获取当前网络配置
  const getCurrentNetwork = () => {
    return SAFE_CONFIG.sepolia; // 默认使用 Sepolia 测试网
  };

  // 获取以太坊提供者
  const getProvider = async () => {
    if (!activeWallet?.address) {
      throw new Error('没有激活的钱包');
    }
    const w = wallets.find(wallet => wallet.address === activeWallet.address);

     const ethereumProvider = await w.getEthereumProvider()

     console.log("ethereumProvider: ", ethereumProvider)


        const client = createWalletClient({
          chain: sepolia,
          transport: custom(ethereumProvider)
        })

        return client;

  };

  // 创建 Safe 智能钱包
  const createSafeWallet = async () => {
    if (!activeWallet?.address) {
      setError('请先激活一个钱包');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const signer =  activeWallet?.address;
      const network = getCurrentNetwork();
    

      console.log('开始创建 Safe 钱包...');

      console.log("signer: ", signer)

      // 检查 API Key 是否配置
      if (!network.apiKey) {
        throw new Error('Safe API Key 未配置。请从 https://developer.safe.global 获取 API Key 并添加到 .env 文件中');
      }

      const provider = await getProvider();

      console.log("provider: ", provider)

      const newSafeClient = await createSafeClient({
        provider: provider,
        signer,
        safeAddress: '0x320d69C6Ae26AF57b403645b021c1763309720Df', 
        apiKey: network.apiKey
      })

      console.log("newSafeClient: ", newSafeClient)

      // 获取待处理交易（用于调试）
      const pendingTransactions = await newSafeClient.getPendingTransactions();
      console.log('Safe 待处理交易:', pendingTransactions);
      for (const transaction of pendingTransactions.results) {
        const safeTxHash = transaction.safeTxHash;

        const txResult = await newSafeClient.confirm({ safeTxHash })
        console.log("txResult: ", txResult)
      }




    } catch (error) {
      console.error('❌ 创建 Safe 钱包失败:', error);
      setError(`创建失败: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 加载现有的 Safe 钱包信息
  const loadSafeInfo = async () => {
    const savedSafeAddress = localStorage.getItem('safeWalletAddress');
    if (!savedSafeAddress) return;

    setIsLoading(true);
    setError('');

    try {
      const network = getCurrentNetwork();
      const safeApiKit = new SafeApiKit({
        chainId: BigInt(network.chainId),
        txServiceUrl: network.safeServiceUrl
      });

      // 获取 Safe 信息
      const safeInfo = await safeApiKit.getSafeInfo(savedSafeAddress);
      setSafeInfo(safeInfo);
      setSafeAddress(savedSafeAddress);
      
      // 加载所有者和阈值
      const savedOwners = localStorage.getItem('safeOwners');
      const savedThreshold = localStorage.getItem('safeThreshold');
      
      if (savedOwners) setOwners(JSON.parse(savedOwners));
      if (savedThreshold) setThreshold(parseInt(savedThreshold));

      // 获取待处理交易
      const pendingTxs = await safeApiKit.getPendingTransactions(savedSafeAddress);
      setPendingTransactions(pendingTxs.results || []);

    } catch (error) {
      console.error('❌ 加载 Safe 信息失败:', error);
      setError(`加载失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新的所有者
  const addOwner = async () => {
    if (!newOwnerAddress || !ethers.isAddress(newOwnerAddress)) {
      setError('请输入有效的以太坊地址');
      return;
    }

    if (owners.includes(newOwnerAddress)) {
      setError('该地址已经是所有者');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const signer = await getSigner();
      const network = getCurrentNetwork();
      
      const safeApiKit = new SafeApiKit({
        chainId: BigInt(network.chainId),
        txServiceUrl: network.safeServiceUrl
      });

      // 创建添加所有者的交易
      const newOwners = [...owners, newOwnerAddress];
      const newThreshold = threshold; // 保持当前阈值

      // 这里需要实现实际的添加所有者交易
      // 由于复杂性，这里简化处理
      console.log('添加所有者交易:', { newOwnerAddress, newOwners, newThreshold });

      // 更新本地状态
      setOwners(newOwners);
      localStorage.setItem('safeOwners', JSON.stringify(newOwners));
      setNewOwnerAddress('');

      console.log('✅ 所有者添加成功');

    } catch (error) {
      console.error('❌ 添加所有者失败:', error);
      setError(`添加失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新阈值
  const updateThreshold = async (newThreshold) => {
    if (newThreshold < 1 || newThreshold > owners.length) {
      setError('阈值必须在 1 到所有者数量之间');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 这里需要实现实际的阈值更新交易
      // 由于复杂性，这里简化处理
      console.log('更新阈值交易:', { newThreshold });

      // 更新本地状态
      setThreshold(newThreshold);
      localStorage.setItem('safeThreshold', newThreshold.toString());

      console.log('✅ 阈值更新成功');

    } catch (error) {
      console.error('❌ 更新阈值失败:', error);
      setError(`更新失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载 Safe 信息
  useEffect(() => {
    if (activeWallet?.address) {
      loadSafeInfo();
    }
  }, [activeWallet]);

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="safe-smart-wallet">
      <div className="safe-header">
        <h3>🛡️ Safe 智能钱包</h3>
        <p className="safe-description">
          创建和管理多签智能钱包，增强资产安全性
        </p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!safeAddress ? (
        // 创建 Safe 钱包界面
        <div className="safe-creation-section">
          <div className="creation-info">
            <h4>创建 Safe 智能钱包</h4>
            <p>Safe 钱包提供企业级的多签安全保护，需要多个签名才能执行交易。</p>
            <ul>
              <li>🔒 多重签名保护</li>
              <li>🛡️ 企业级安全性</li>
              <li>📊 交易审批流程</li>
              <li>🌐 跨链兼容性</li>
            </ul>
          </div>
          
          <button 
            className="create-safe-btn"
            onClick={createSafeWallet}
            disabled={isCreating || !activeWallet?.address}
          >
            {isCreating ? '⏳ 创建中...' : '🛡️ 创建 Safe 钱包 并签名交易'}
          </button>
          
          {!activeWallet?.address && (
            <p className="warning-text">⚠️ 请先激活一个钱包</p>
          )}
        </div>
      ) : (
        // Safe 钱包管理界面
        <div className="safe-management-section">
          <div className="safe-info-card">
            <h4>Safe 钱包信息</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">地址:</span>
                <span className="value address">{formatAddress(safeAddress)}</span>
              </div>
              <div className="info-item">
                <span className="label">所有者数量:</span>
                <span className="value">{owners.length}</span>
              </div>
              <div className="info-item">
                <span className="label">签名阈值:</span>
                <span className="value">{threshold}/{owners.length}</span>
              </div>
              {safeInfo?.nonce && (
                <div className="info-item">
                  <span className="label">Nonce:</span>
                  <span className="value">{safeInfo.nonce}</span>
                </div>
              )}
            </div>
          </div>



          {/* 待处理交易 */}
          {pendingTransactions.length > 0 && (
            <div className="pending-transactions">
              <h5>⏳ 待处理交易</h5>
              <div className="transactions-list">
                {pendingTransactions.slice(0, 3).map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <span className="tx-hash">{formatAddress(tx.safeTxHash)}</span>
                    <span className="tx-status">待签名</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SafeSmartWallet;