import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './TokenSwapCard.css';



// 网络配置 - 与AssetOverview组件保持一致
const NETWORKS = {
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.etherscan.io',
    blockscoutApi: 'https://eth-sepolia.blockscout.com',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    color: '#627EEA'
  },
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    blockscoutApi: 'https://eth.blockscout.com',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    color: '#627EEA'
  },
  unichain: {
    name: 'Unichain Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://unichain-sepolia-rpc.publicnode.com',
    explorer: 'https://unichain-sepolia.blockscout.com',
    blockscoutApi: 'https://unichain-sepolia.blockscout.com',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    color: '#FF0080'
  },
  monad: {
    name: 'Monad Testnet',
    chainId: 11155432,
    rpcUrl: 'https://monad-testnet-rpc.publicnode.com',
    explorer: 'https://monad-testnet.blockscout.com',
    blockscoutApi: 'https://monad-testnet.blockscout.com',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    color: '#8B5CF6'
  }
};

// 常用代币列表 - 实际应用中可以从API获取
const COMMON_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', decimals: 18, icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, icon: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1668147255' },
  { symbol: 'USDT', name: 'Tether', decimals: 6, icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1696501661' },
  { symbol: 'DAI', name: 'DAI Stablecoin', decimals: 18, icon: 'https://assets.coingecko.com/coins/images/9956/large/4943.png?1636636734' },
  { symbol: 'UNI', name: 'Uniswap', decimals: 18, icon: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1608232835' },
];

// 快速选择代币列表
const QUICK_SELECT_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628' },
  { symbol: 'USDC', name: 'USD Coin', icon: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1668147255' },
  { symbol: 'USDT', name: 'Tether', icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1696501661' },
  { symbol: 'UNI', name: 'Uniswap', icon: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1608232835' },
];

// 获取代币价格数据
const getTokenPrice = async (symbol) => {
  try {
    // 注意：实际应用中应该使用更可靠的价格API
    // 这里使用CoinGecko的简单API作为示例
    const coinId = symbol.toLowerCase() === 'eth' ? 'ethereum' : symbol.toLowerCase();
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await response.json();
    return data[coinId]?.usd || 0;
  } catch (error) {
    console.error('获取价格数据失败:', error);
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
  // 代币搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  // 网络选择相关状态
  const [searchNetwork, setSearchNetwork] = useState(activeNetwork);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  // 初始化时获取钱包余额
  useEffect(() => {
    if (walletAddress) {
      fetchWalletBalance();
    }
  }, [walletAddress, activeNetwork]);

  // 当代币或金额变化时，更新预估金额
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      updateEstimatedAmount();
    }
  }, [fromAmount, fromToken, toToken]);

  // 获取钱包ETH余额
  const fetchWalletBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[activeNetwork].rpcUrl);
      const balance = await provider.getBalance(walletAddress);
      setWalletBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('获取钱包余额失败:', error);
    }
  };

  // 更新预估兑换金额
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

  // 切换代币
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // 根据字符串生成一致的颜色
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${(hash & 0x00ffffff) % 360}, 70%, 60%)`;
    return color;
  };

  // 生成默认代币图标组件
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

  // 从Blockscout API搜索代币
  const searchTokensFromAPI = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiUrl = `${NETWORKS[searchNetwork].blockscoutApi}/api/v2/tokens`;
      const params = new URLSearchParams({
        q: query.trim(),
        limit: 20
      });
      
      const response = await fetch(`${apiUrl}?${params}`);
      if (!response.ok) {
        throw new Error('API请求失败');
      }
      
      const data = await response.json();
      
      // 格式化搜索结果为我们需要的格式
      const formattedResults = data.items.map(token => ({
        symbol: token.symbol || 'Unknown',
        name: token.name || token.symbol || 'Unknown Token',
        decimals: parseInt(token.decimals) || 18,
        contractAddress: token.address,
        network: searchNetwork
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('搜索代币失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // 切换搜索网络
  const handleNetworkChange = (networkKey) => {
    setSearchNetwork(networkKey);
    setShowNetworkSelector(false);
    // 如果有搜索内容，重新搜索
    if (searchQuery.trim()) {
      searchTokensFromAPI(searchQuery);
    }
  };

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchTokensFromAPI(query);
  };

  // 选择代币
  const selectToken = (token) => {
    if (showTokenSelector === 'from') {
      setFromToken(token);
      // 如果选择的是ETH，重置余额
      if (token.symbol === 'ETH' && walletAddress) {
        fetchWalletBalance();
      }
    } else {
      setToToken(token);
    }
    setShowTokenSelector(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 处理兑换
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

  // 设置滑点容忍度
  const setSlippage = (value) => {
    setSettings(prev => ({ ...prev, slippage: value }));
    if (fromAmount) updateEstimatedAmount();
  };

  // 设置交易截止时间
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
            className="amount-input-dark"
            disabled={isLoading}
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
            <img src={fromToken.icon} alt={fromToken.name} className="token-icon" />
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
            className="amount-input-dark"
            readOnly
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
            <img src={toToken.icon} alt={toToken.name} className="token-icon" />
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
      
      {/* 交易状态反馈 */}
      {swapStatus !== 'idle' && (
        <div className={`swap-status-dark ${swapStatus}`}>
          {swapStatus === 'pending' && <p>交易处理中...</p>}
          {swapStatus === 'success' && (
            <p>
              交易成功! 
              <a 
                href={`${NETWORKS[activeNetwork].explorer}/tx/${swapHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tx-hash-link"
              >
                查看交易
              </a>
            </p>
          )}
          {swapStatus === 'error' && <p>{swapError}</p>}
        </div>
      )}
      
      {/* 代币选择器模态框 */}
      {showTokenSelector && (
        <div className="token-selector-modal-dark">
          <div className="modal-overlay-dark" onClick={() => setShowTokenSelector(null)}></div>
          <div className="modal-content-dark">
            <div className="modal-header-dark">
              <h3>{showTokenSelector === 'from' ? '选择发送代币' : '选择接收代币'}</h3>
              <button 
                className="close-btn-dark" 
                onClick={() => setShowTokenSelector(null)}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            <div className="search-container-dark">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="搜索代币..." 
                  className="search-input-dark"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button 
                  className="network-selector-btn"
                  onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                >
                  <img 
                    src={NETWORKS[searchNetwork].icon} 
                    alt={NETWORKS[searchNetwork].name} 
                    className="network-icon"
                  />
                  {NETWORKS[searchNetwork].name === 'Ethereum Mainnet' ? 'ETH' : 
                   NETWORKS[searchNetwork].name === 'Sepolia Testnet' ? 'Sepolia' : 
                   NETWORKS[searchNetwork].name}
                  <span className="chevron-up-down">{showNetworkSelector ? '▲' : '▼'}</span>
                </button>
              </div>
              
              {/* 网络选择下拉框 */}
              {showNetworkSelector && (
                <div className="network-dropdown">
                  {Object.entries(NETWORKS).map(([key, network]) => (
                    <div 
                      key={key} 
                      className={`network-item ${searchNetwork === key ? 'active' : ''}`}
                      onClick={() => handleNetworkChange(key)}
                    >
                      <img 
                        src={network.icon} 
                        alt={network.name} 
                        className="network-icon"
                      />
                      <span className="network-name">{network.name}</span>
                      {network.name === 'Monad Testnet' && (
                        <span className="network-badge">新</span>
                      )}
                      {searchNetwork === key && (
                        <span className="network-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isSearching ? (
              <div className="search-loading">搜索中...</div>
            ) : searchQuery && searchResults.length > 0 ? (
              <div className="token-list-dark">
                {searchResults.map((token) => (
                  <div 
                    key={token.contractAddress || token.symbol} 
                    className="token-item-dark"
                    onClick={() => selectToken(token)}
                  >
                    <div className="token-icon-container">
                      {token.symbol && token.symbol !== 'Unknown' ? (
                        getDefaultTokenIcon(token.symbol)
                      ) : (
                        <div className="default-token-icon unknown">?</div>
                      )}
                      <span className="token-address-short">
                        {token.contractAddress ? `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}` : ''}
                      </span>
                    </div>
                    <div className="token-info-dark">
                      <span className="token-symbol-dark">{token.symbol}</span>
                      <span className="token-name-dark">{token.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="no-results">未找到匹配的代币</div>
            ) : (
              <div className="token-list-dark">
                {COMMON_TOKENS.map((token) => (
                  <div 
                    key={token.symbol} 
                    className="token-item-dark"
                    onClick={() => selectToken({...token, network: searchNetwork})}
                  >
                    <div className="token-icon-container">
                      {token.icon ? (
                        <img src={token.icon} alt={token.name} className="token-icon" />
                      ) : (
                        getDefaultTokenIcon(token.symbol)
                      )}
                    </div>
                    <div className="token-info-dark">
                      <span className="token-symbol-dark">{token.symbol}</span>
                      <span className="token-name-dark">{token.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSwapCard;