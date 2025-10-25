/**
 * TokenSwapCard 组件
 * 提供代币交换功能，包括代币选择、金额输入、汇率显示和交换执行
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.walletAddress - 钱包地址
 * @param {string} props.activeNetwork - 当前活跃的网络，默认为'sepolia'
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TokenSwapCard.css';
import TokenSearch from './TokenSearch';
import { NETWORKS, COMMON_TOKENS, QUICK_SELECT_TOKENS } from './constants';

/**
 * 获取代币价格数据
 * @param {string} symbol - 代币符号
 * @returns {Promise<number>} 代币价格（USD）
 */
const getTokenPrice = async (symbol) => {
  try {
    // 使用Binance API获取代币价格
    // 构建交易对，大部分代币使用USDT交易对，ETH特殊处理
    const tradingPair = symbol.toUpperCase() === 'ETH' ? 'ETHUSDT' : `${symbol.toUpperCase()}USDT`;
    
    // 调用Binance API获取价格
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${tradingPair}`);
    
    // 检查响应状态
    if (!response.ok) {
      // 如果直接查询USDT交易对失败，尝试其他常见交易对或返回备用值
      console.warn(`获取${symbol}价格失败，响应状态:`, response.status);
      
      // 如果是ETH，可以尝试BNBETH然后再转换成USD
      if (symbol.toUpperCase() === 'ETH') {
        return 0; // 在实际应用中可以添加备用逻辑
      }
      return 0;
    }
    
    const data = await response.json();
    
    // 检查返回的数据格式
    if (!data || !data.price) {
      console.warn(`获取${symbol}价格失败，返回数据格式不正确:`, data);
      return 0;
    }
    
    // 将价格转换为数字并返回
    return parseFloat(data.price) || 0;
  } catch (error) {
    console.error(`获取${symbol}价格数据失败:`, error);
    return 0;
  }
};

const TokenSwapCard = ({ walletAddress, activeNetwork = 'sepolia' }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('swap'); // swap, limit, buy, sell
  const [fromToken, setFromToken] = useState(COMMON_TOKENS[0]); // 默认ETH
  const [toToken, setToToken] = useState(COMMON_TOKENS[1]);   // 默认USDC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAmountUSD, setFromAmountUSD] = useState('0');
  const [toAmountUSD, setToAmountUSD] = useState('0');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(null); // 'from' or 'to'
  const [walletBalance, setWalletBalance] = useState('0');
  const [settings, setSettings] = useState({
    slippage: 0.5, // 默认滑点容忍度 0.5%
    deadline: 20,  // 默认交易截止时间 20分钟
  });
  const [showSettings, setShowSettings] = useState(false);
  const [swapStatus, setSwapStatus] = useState('idle'); // idle, pending, success, error
  const [swapError, setSwapError] = useState('');
  const [swapHash, setSwapHash] = useState('');


  /**
   * 处理网络切换
   * @param {string} networkKey - 网络键名
   */
  const handleNetworkChange = (networkKey) => {
    // 网络切换逻辑 - 可以在这里添加额外的网络切换处理
    console.log('切换到网络:', networkKey);
    // 注意：由于activeNetwork是prop，实际的网络切换应该在父组件中处理
  };

  /**
   * 初始化时获取钱包余额
   */
  useEffect(() => {
    if (walletAddress) {
      fetchWalletBalance();
    }
  }, [walletAddress, activeNetwork]);

  /**
   * 当代币或金额变化时，更新预估金额
   */
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      updateEstimatedAmount();
    }
  }, [fromAmount, fromToken, toToken]);

  /**
   * 获取钱包ETH余额
   */
  const fetchWalletBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[activeNetwork].rpcUrl);
      const balance = await provider.getBalance(walletAddress);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('获取钱包余额失败:', error);
    }
  };

  /**
   * 更新预估兑换金额
   */
  const updateEstimatedAmount = async () => {
    try {
      // 获取代币价格
      const fromPrice = await getTokenPrice(fromToken.symbol);
      const toPrice = await getTokenPrice(toToken.symbol);
      
      // 计算汇率
      const rate = fromPrice / toPrice;
      setExchangeRate(rate);
      
      // 计算预估兑换金额（考虑滑点）
      const estimated = parseFloat(fromAmount) * rate * (1 - settings.slippage / 100);
      setToAmount(estimated.toFixed(6));
      
      // 计算美元价值
      const usdValue = parseFloat(fromAmount) * fromPrice;
      setFromAmountUSD(usdValue.toFixed(2));
      
      // 计算接收代币的美元价值（预估）
      const toUsdValue = estimated * toPrice;
      setToAmountUSD(toUsdValue.toFixed(2));
    } catch (error) {
      console.error('更新预估金额失败:', error);
    }
  };

  /**
   * 切换代币
   */
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  /**
   * 选择代币
   * @param {Object} token - 选中的代币对象
   */
  const selectToken = (token) => {
    if (showTokenSelector === 'from') {
      setFromToken(token);
    } else if (showTokenSelector === 'to') {
      setToToken(token);
    }
    setShowTokenSelector(null); // 关闭选择器
  };

  /**
   * 根据字符串生成一致的颜色
   * @param {string} str - 输入字符串
   * @returns {string} 生成的颜色值
   */
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${(hash & 0x00ffffff) % 360}, 70%, 60%)`;
    return color;
  };

  /**
   * 格式化地址显示
   * @param {string} address - 钱包地址
   * @returns {string} 格式化后的地址
   */
  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return '';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /**
   * 生成默认代币图标组件
   * @param {string} symbol - 代币符号
   * @returns {JSX.Element} 图标组件
   */
  const getDefaultTokenIcon = (symbol) => {
    const initials = symbol.slice(0, 3).toUpperCase();
    const bgColor = stringToColor(symbol);
    return (
      <div 
        className="default-token-icon" 
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    );
  };

  /**
   * 处理兑换
   */
  const handleSwap = async () => {
    if (!walletAddress) {
      setSwapError('请先连接钱包');
      setSwapStatus('error');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setSwapError('请输入有效金额');
      setSwapStatus('error');
      return;
    }

    setIsLoading(true);
    setSwapStatus('pending');
    setSwapError('');

    try {
      // 实际应用中，这里应该调用实际的交易合约
      // 这里我们模拟一个交易过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟交易成功
      const mockTransactionHash = '0x' + Math.random().toString(16).substring(2, 66);
      setSwapHash(mockTransactionHash);
      setSwapStatus('success');
      
      // 重置表单
      setTimeout(() => {
        setFromAmount('');
        setToAmount('');
        setSwapStatus('idle');
        // 更新余额
        fetchWalletBalance();
      }, 3000);
    } catch (error) {
      console.error('交易失败:', error);
      setSwapError('交易失败，请稍后再试');
      setSwapStatus('error');
      setIsLoading(false);
    }
  };

  /**
   * 设置滑点容忍度
   * @param {number} value - 滑点容忍度值
   */
  const setSlippage = (value) => {
    setSettings(prev => ({ ...prev, slippage: value }));
    if (fromAmount) updateEstimatedAmount();
  };

  /**
   * 设置交易截止时间
   * @param {number} value - 截止时间（分钟）
   */
  const setDeadline = (value) => {
    setSettings(prev => ({ ...prev, deadline: value }));
  };

  return (
    <div className="token-swap-card-dark">
      {/* 顶部导航选项卡 */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          交换
        </button>
        <button 
          className={`tab-btn ${activeTab === 'limit' ? 'active' : ''}`}
          onClick={() => setActiveTab('limit')}
        >
          限额
        </button>
        <button 
          className={`tab-btn ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          购买
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          出售
        </button>
        <button 
          className="settings-btn" 
          onClick={() => setShowSettings(!showSettings)}
          aria-label="交易设置"
        >
          ⚙️
        </button>
      </div>
      
      {/* 交易设置区域 */}
      {showSettings && (
        <div className="settings-panel-dark">
          <div className="setting-item">
            <label>滑点容忍度</label>
            <select 
              value={settings.slippage} 
              onChange={(e) => setSettings({...settings, slippage: parseFloat(e.target.value)})}
              className="setting-select"
            >
              <option value={0.1}>0.1%</option>
              <option value={0.5}>0.5%</option>
              <option value={1.0}>1.0%</option>
              <option value={3.0}>3.0%</option>
              <option value={5.0}>5.0%</option>
            </select>
          </div>
          <div className="setting-item">
            <label>交易截止时间</label>
            <select 
              value={settings.deadline} 
              onChange={(e) => setSettings({...settings, deadline: parseInt(e.target.value)})}
              className="setting-select"
            >
              <option value={5}>5分钟</option>
              <option value={20}>20分钟</option>
              <option value={30}>30分钟</option>
              <option value={60}>60分钟</option>
            </select>
          </div>
        </div>
      )}
      
      {/* 交易表单 */}
      <div className="swap-form-dark">
        {/* 发送代币输入 */}
        <div className="token-input-container-dark">
          <div className="input-header">
            <span className="input-label">出售</span>
          </div>
          
          <input 
            type="text" 
            placeholder="0" 
            value={fromAmount} 
            onChange={(e) => setFromAmount(e.target.value)}
            className="amount-input-dark no-autofill"
            disabled={isLoading}
            autocomplete="off"
            autocorrect="off"
            name="token-amount-input"
            id="token-amount-input-send"
            formNoValidate
            data-lpignore="true"
            inputMode="decimal"
            autoComplete="off"
          />
          
          {/* 美元价值显示 */}
          {fromAmountUSD !== '0' && (
            <div className="usd-value">
              US${fromAmountUSD}
            </div>
          )}
          
          <button 
            className="token-selector-dark" 
            onClick={() => setShowTokenSelector('from')}
            disabled={isLoading}
          >
            {/* <img src={fromToken.icon} alt={fromToken.name} className="token-icon" /> */}
            <span className="token-symbol-dark">{fromToken.symbol}</span>
            <span className="chevron-dark">▼</span>
          </button>
          
          <div className="balance-info-dark">
            余额: {parseFloat(walletBalance).toFixed(4)} {fromToken.symbol}
          </div>
        </div>
        
        {/* 交换方向按钮 */}
        <button 
          className="swap-direction-btn-dark" 
          onClick={handleSwapTokens}
          disabled={isLoading}
          aria-label="切换代币"
        >
          ↓
        </button>
        
        {/* 接收代币输入 */}
        <div className="token-input-container-dark">
          <div className="input-header">
            <span className="input-label">购买</span>
          </div>
          
          <input 
            type="text" 
            placeholder="0" 
            value={toAmount} 
            onChange={(e) => setToAmount(e.target.value)}
            className="amount-input-dark no-autofill"
            readOnly
            name="token-amount-input-receive"
            id="token-amount-input-receive"
            formNoValidate
            data-lpignore="true"
            inputMode="decimal"
          />
          
          {/* 美元价值显示 */}
          {toAmountUSD !== '0' && (
            <div className="usd-value">
              US${toAmountUSD}
            </div>
          )}
          
          {/* 快速选择代币区域 - 接收代币下方显示 */}
          {showTokenSelector === 'to' && (
            <div className="quick-select-tokens">
              {QUICK_SELECT_TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  className="quick-token-btn"
                  onClick={() => {
                    const selectedToken = COMMON_TOKENS.find(t => t.symbol === token.symbol);
                    selectToken(selectedToken);
                  }}
                  title={token.name}
                >
                  <img src={token.icon} alt={token.name} className="quick-token-icon" />
                </button>
              ))}
            </div>
          )}
          
          <button 
            className="token-selector-dark select-token-btn"
            onClick={() => setShowTokenSelector('to')}
          >
            {/* <img src={toToken.icon} alt={toToken.name} className="token-icon" /> */}
            <span className="token-symbol-dark">{toToken.symbol}</span>
            <span className="chevron-dark">▼</span>
          </button>
        </div>
        
        {/* 交换按钮 */}
        <button 
          className="swap-btn-dark" 
          onClick={handleSwap}
          disabled={isLoading || !fromAmount || parseFloat(fromAmount) <= 0}
        >
          {isLoading ? '处理中...' : `交换`}
        </button>
      </div>
      
      {/* 代币选择器模态框 - 使用新的TokenSearch组件 */}
      <TokenSearch
        isOpen={!!showTokenSelector}
        onClose={() => setShowTokenSelector(null)}
        onTokenSelect={selectToken}
        activeNetwork={activeNetwork}
        title={showTokenSelector === 'from' ? '选择发送代币' : '选择接收代币'}
      />
    </div>
  );
};

export default TokenSwapCard;