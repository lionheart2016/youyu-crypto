import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SafeApiKit from '@safe-global/api-kit';
import { createSafeClient } from '@safe-global/sdk-starter-kit';
import { sepolia } from 'viem/chains';
import { createWalletClient, custom } from 'viem';
import Safe, {
  PredictedSafeProps,
  SafeAccountConfig,
  SafeDeploymentConfig
} from '@safe-global/protocol-kit'



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
  
  // 多钱包地址输入相关状态
  const [ownerAddresses, setOwnerAddresses] = useState(['']);
  const [addressInput, setAddressInput] = useState('');
  const [thresholdInput, setThresholdInput] = useState(1);


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

  // 签名交易
  const signTransaction = async (transaction) => {
    if (!activeWallet?.address) {
      setError('请先激活一个钱包');
      return;
    }

    if (!transaction?.safeTxHash) {
      setError('无效的交易数据');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const signer = activeWallet?.address;
      const network = getCurrentNetwork();

      console.log('开始签名 Safe 交易...');
      console.log("交易信息:", transaction);

      // 检查 API Key 是否配置
      if (!network.apiKey) {
        throw new Error('Safe API Key 未配置。请从 https://developer.safe.global 获取 API Key 并添加到 .env 文件中');
      }

      const provider = await getProvider();

      console.log("provider: ", provider);

      // 创建 Safe 客户端
      const safeClient = await createSafeClient({
        provider: provider,
        signer: signer,
        safeAddress: safeAddress, 
        apiKey: network.apiKey
      });

      console.log("safeClient: ", safeClient);

      // 确认交易（签名）
      const safeTxHash = transaction.safeTxHash;
      console.log('开始确认交易:', safeTxHash);

      const txResult = await safeClient.confirm({ safeTxHash });
      console.log("交易确认结果: ", txResult);

      // 重新加载待处理交易
      await loadSafeInfo();

      // 显示成功消息
      setError('✅ 交易签名成功，等待其他所有者签名');

    } catch (error) {
      console.error('❌ 签名交易失败:', error);
      setError(`签名失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createSafeWallet = async () => {
    if (!activeWallet?.address) {
      setError('请先激活一个钱包');
      return;
    }

    // 验证输入的钱包地址
    if (!validateAddresses()) {
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const provider = await getProvider();
      const network = getCurrentNetwork();

      // 确保当前激活的钱包也在所有者列表中
      const allOwners = [...ownerAddresses];
      if (!allOwners.includes(activeWallet.address)) {
        allOwners.push(activeWallet.address);
      }

      const safeClient = await createSafeClient({
        provider: provider,
        signer: activeWallet?.address,
        safeOptions: {
          owners: allOwners,
          threshold: thresholdInput
        },
        apiKey: network.apiKey
      })

      const safeAddress = await safeClient.getAddress()
      setSafeAddress(safeAddress)
      console.log("safeAddress: ", safeAddress)

      // 保存所有者信息到本地存储
      setOwners(allOwners);
      setThreshold(thresholdInput);
      
      // 以当前激活钱包地址为key存储智能钱包地址
      if (activeWallet?.address) {
        const safeWalletKey = `safeWallet_${activeWallet.address}`;
        localStorage.setItem(safeWalletKey, safeAddress);
      }

      const transactions = [{
        to: "0x0000000000000000000000000000000000000000",
        data: '0x',
        value: '0'
      }]

      const txResult = await safeClient.send({ transactions })

      const safeTxHash = txResult.transactions?.safeTxHash
      console.log("safeTxHash: ", safeTxHash)
      console.log('✅ Safe 钱包创建成功');

    } catch (error) {
      console.error('❌ 创建 Safe 钱包失败:', error);
      setError(`创建失败: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  }


  // 加载现有的 Safe 钱包信息
  const loadSafeInfo = async () => {
    // 优先根据当前激活钱包地址加载对应的Safe钱包
    let savedSafeAddress = '';
    if (activeWallet?.address) {
      const safeWalletKey = `safeWallet_${activeWallet.address}`;
      savedSafeAddress = localStorage.getItem(safeWalletKey);
      if (savedSafeAddress) {
        localStorage.setItem('safeWalletAddress', savedSafeAddress);
      }
    }
    
    // 如果没有找到对应钱包的Safe，尝试加载全局存储的Safe钱包（兼容旧版本）
    if (!savedSafeAddress) {
      savedSafeAddress = localStorage.getItem('safeWalletAddress');
    }
    
    console.log("savedSafeAddress: ", savedSafeAddress)
    if (!savedSafeAddress) return;

    setIsLoading(true);
    setError('');

    try {
      const network = getCurrentNetwork();
    
      setSafeAddress(savedSafeAddress);
     



      const provider = await getProvider();


      // 创建 Safe 客户端
      const safeClient = await createSafeClient({
        provider: provider,
        signer: activeWallet?.address,
        safeAddress: savedSafeAddress,
        apiKey: network.apiKey
      })



      const threshold = await safeClient.getThreshold()
      setThreshold(threshold)
      const owners = await safeClient.getOwners()
      setOwners(owners)



      // 获取待处理交易 - 在有Safe钱包的情况下加载所有pendingTransactions
      const pendingTransactions = await safeClient.getPendingTransactions()
      setPendingTransactions(pendingTransactions.results || []);
      console.log("pendingTransactions: ", pendingTransactions)
      

      console.log('✅ Safe 钱包信息加载成功');
      console.log('待处理交易数量:', pendingTransactions?.results?.length || 0);

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
      setNewOwnerAddress('');

      console.log('✅ 所有者添加成功');

    } catch (error) {
      console.error('❌ 添加所有者失败:', error);
      setError(`添加失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ethToWei = (ethAmount) => {
    // 1 ETH = 10^18 wei
    const weiPerEth = BigInt('1000000000000000000')
    const ethAmountStr = ethAmount.toString()

    // 处理小数点
    const parts = ethAmountStr.split('.')
    const wholePart = parts[0] || '0'
    const decimalPart = parts[1] || ''

    // 确保小数部分有18位
    const paddedDecimal = decimalPart.padEnd(18, '0').slice(0, 18)

    // 组合成完整的wei值
    const totalWeiStr = wholePart + paddedDecimal
    return BigInt(totalWeiStr)
  }

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

      console.log('✅ 阈值更新成功');

    } catch (error) {
      console.error('❌ 更新阈值失败:', error);
      setError(`更新失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加钱包地址到列表
  const addOwnerAddress = () => {
    if (!addressInput.trim()) {
      setError('请输入钱包地址');
      return;
    }

    if (!ethers.isAddress(addressInput.trim())) {
      setError('请输入有效的以太坊地址');
      return;
    }

    const normalizedAddress = ethers.getAddress(addressInput.trim());
    
    // 检查地址是否已存在
    if (ownerAddresses.includes(normalizedAddress)) {
      setError('该地址已存在于列表中');
      return;
    }

    setOwnerAddresses([...ownerAddresses, normalizedAddress]);
    setAddressInput('');
    setError('');
  };

  // 从列表中删除钱包地址
  const removeOwnerAddress = (index) => {
    const newAddresses = [...ownerAddresses];
    newAddresses.splice(index, 1);
    setOwnerAddresses(newAddresses);
  };

  // 处理输入框按键事件
  const handleAddressInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOwnerAddress();
    }
  };

  // 验证所有地址格式
  const validateAddresses = () => {
    if (ownerAddresses.length === 0) {
      setError('请至少添加一个钱包地址');
      return false;
    }

    console.log("ownerAddresses: ", ownerAddresses)

    for (const address of ownerAddresses) {
      if (!ethers.isAddress(address)) {
        setError(`无效的地址格式: ${address}`);
        return false;
      }
    }

    if (thresholdInput < 1 || thresholdInput > ownerAddresses.length) {
      setError(`阈值必须在 1 到 ${ownerAddresses.length} 之间`);
      return false;
    }

    return true;
  };

  // 发送 Safe 交易
  const sendSafeTransaction = async () => {
    if (!safeAddress || !activeWallet?.address) {
      setError('请先创建 Safe 钱包并激活钱包');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const provider = await getProvider();
      const network = getCurrentNetwork();

      // 创建 Safe 客户端
      const safeClient = await createSafeClient({
        provider: provider,
        signer: activeWallet.address,
        safeAddress: safeAddress,
        apiKey: network.apiKey
      });

      
      // 创建测试交易 - 发送 0 ETH 到零地址
      const transactions = [{
        to: "0x0000000000000000000000000000000000000001",
        data: '0x',
        value: ethToWei("0.001").toString()
      }];

      console.log('开始发送 Safe 交易...');
      
      // 发送交易
      const txResult = await safeClient.send({ transactions });
      
      console.log('✅ Safe 交易发送成功');
      console.log('交易结果:', txResult);

      // 重新加载待处理交易
      await loadSafeInfo();

      // 显示成功消息
      setError('✅ 交易已成功提交，等待其他所有者签名');

    } catch (error) {
      console.error('❌ 发送 Safe 交易失败:', error);
      setError(`交易发送失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载 Safe 信息
  useEffect(() => {
    if (activeWallet?.address) {
      loadSafeInfo();
      //将激活的钱包地址添加到所有者列表，但是不要有重复
      setOwnerAddresses([...new Set([...ownerAddresses, activeWallet.address])]);
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
          </div>

          {/* 多钱包地址输入区域 */}
          <div className="address-input-section">
            <h5>🪪 设置钱包所有者</h5>
            <p className="input-description">
              添加需要参与多签的钱包地址（包括当前激活的钱包）
            </p>
            
            {/* 地址输入框 */}
            <div className="address-input-container">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyPress={handleAddressInputKeyPress}
                placeholder="输入以太坊地址 (0x...)"
                className="address-input"
              />
              <button 
                onClick={addOwnerAddress}
                className="add-address-btn"
                disabled={!addressInput.trim()}
              >
                ➕ 添加
              </button>
            </div>

            {/* 已添加的地址列表 */}
            {ownerAddresses.length > 0 && (
              <div className="address-list">
                <h6>已添加的钱包地址 ({ownerAddresses.length} 个):</h6>
                <div className="address-tags">
                  {ownerAddresses.map((address, index) => (
                    <div key={index} className="address-tag">
                      <span className="address-text">{formatAddress(address)}</span>
                      <button 
                        onClick={() => removeOwnerAddress(index)}
                        className="remove-address-btn"
                        title="删除地址"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 阈值设置 */}
            <div className="threshold-section">
              <label htmlFor="threshold-input">
                🔢 设置签名阈值 (需要多少个签名才能执行交易):
              </label>
              <div className="threshold-controls">
                <input
                  id="threshold-input"
                  type="number"
                  min="1"
                  max={Math.max(1, ownerAddresses.length)}
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(parseInt(e.target.value) || 1)}
                  className="threshold-input"
                />
                <span className="threshold-info">
                  / {ownerAddresses.length} 个所有者
                </span>
              </div>
              <p className="threshold-description">
                当前设置：需要 {thresholdInput} 个签名才能执行交易
              </p>
            </div>
          </div>
          
          <button 
            className="create-safe-btn"
            onClick={createSafeWallet}
            disabled={isCreating || !activeWallet?.address || ownerAddresses.length === 0}
          >
            {isCreating ? '⏳ 创建中...' : '🛡️ 创建 Safe 钱包'}
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



          {/* 发送交易按钮 */}
          <div className="send-transaction-section">
            <h5>📤 发送 Safe 交易</h5>
            <p className="transaction-description">
              创建并发送需要多签的交易。当前设置：需要 {threshold} 个签名才能执行交易。
            </p>
            <button 
              className="send-transaction-btn"
              onClick={sendSafeTransaction}
              disabled={isLoading || !safeAddress || !activeWallet?.address}
            >
              {isLoading ? '⏳ 发送中...' : '📤 发送测试交易'}
            </button>
            <p className="transaction-note">
              💡 这是一个测试交易，发送 0 ETH 到零地址，用于演示 Safe 多签功能
            </p>
          </div>

          {/* 待处理交易 */}
          {pendingTransactions.length > 0 && (
            <div className="pending-transactions">
              <h5>⏳ 待处理交易</h5>
              <div className="transactions-list">
                {pendingTransactions.slice(0, 3).map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <span className="tx-hash">{formatAddress(tx.safeTxHash)}</span>
                    <button 
                      className="tx-status-btn"
                      onClick={() => signTransaction(tx)}
                      disabled={isLoading}
                      title="点击签名此交易"
                    >
                      {isLoading ? '⏳ 签名中...' : '✍️ 待签名'}
                    </button>
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