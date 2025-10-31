import React, { useState, useEffect } from 'react';
import './TokenSearch.css';
import { NETWORKS, COMMON_TOKENS, QUICK_SELECT_TOKENS } from './constants';
import TokenList from './TokenList';


/**
 * TokenSearch 组件 - 独立的代币搜索组件
 * 
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示搜索模态框
 * @param {Function} props.onClose - 关闭模态框的回调函数
 * @param {Function} props.onTokenSelect - 选择代币的回调函数
 * @param {string} props.activeNetwork - 当前活跃的网络
 * @param {string} props.title - 模态框标题
 * @param {Array} props.quickSelectTokens - 快速选择代币列表（可选）
 */
const TokenSearch = ({ 
  isOpen, 
  onClose, 
  onTokenSelect, 
  activeNetwork = 'sepolia',
  title = '选择代币'
}) => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNetwork, setSearchNetwork] = useState(activeNetwork);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  // 根据字符串生成一致的颜色
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${(hash & 0x00ffffff) % 360}, 70%, 60%)`;
    return color;
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return '';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
        contractAddress: token.address_hash, // 使用address_hash字段作为地址
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
  const handleTokenSelect = (token) => {
    onTokenSelect(token);
    // 重置搜索状态
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  // 处理快速选择代币
  const handleQuickSelect = (token) => {
    handleTokenSelect(token);
  };

  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) {
    return null;
  }

  return (
    <div className="token-search-modal">
      <div className="modal-content">
        {/* 模态框头部 */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 搜索输入框 */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="搜索代币..." 
              className="search-input no-autofill"
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
              name="token-search-input"
              id="token-search-input"
              inputMode="text"
              autoComplete="off"
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

        {/* 搜索结果区域 */}
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">搜索中...</div>
          ) : searchQuery && searchResults.length > 0 ? (
            <TokenList 
              tokens={searchResults.map(token => ({
                ...token,
                address: token.contractAddress, // 映射地址字段以匹配TokenList组件期望的格式
                iconColor: stringToColor(token.symbol || ''),
                iconBorderColor: '#4a5568'
              }))}
              onTokenSelect={handleTokenSelect}
            />
          ) : searchQuery ? (
            <div className="no-results">未找到匹配的代币</div>
          ) : (
            <TokenList 
              tokens={COMMON_TOKENS.map(token => {
                const tokenAddress = token.addresses?.[searchNetwork] || '';
                return {
                  ...token,
                  address: tokenAddress,
                  iconColor: stringToColor(token.symbol || ''),
                  iconBorderColor: '#4a5568'
                };
              })}
              onTokenSelect={(token) => handleTokenSelect({...token, network: searchNetwork, contractAddress: token.address})}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSearch;