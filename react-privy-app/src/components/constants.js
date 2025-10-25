/**
 * 共享常量定义文件
 * 包含网络配置、常用代币列表和快速选择代币列表
 */

// 网络配置
export const NETWORKS = {
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

// 常用代币列表 - 包含主网和测试网地址
export const COMMON_TOKENS = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    decimals: 18, 
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    addresses: {
      mainnet: '0x0000000000000000000000000000000000000000',
      sepolia: '0x0000000000000000000000000000000000000000',
      unichain: '0x0000000000000000000000000000000000000000',
      monad: '0x0000000000000000000000000000000000000000'
    }
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    decimals: 6, 
    icon: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1668147255',
    addresses: {
      mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      unichain: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      monad: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
  },
  { 
    symbol: 'USDT', 
    name: 'Tether', 
    decimals: 6, 
    icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1696501661',
    addresses: {
      mainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      sepolia: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B',
      unichain: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B',
      monad: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B'
    }
  },
  { 
    symbol: 'DAI', 
    name: 'DAI Stablecoin', 
    decimals: 18, 
    icon: 'https://assets.coingecko.com/coins/images/9956/large/4943.png?1636636734',
    addresses: {
      mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      sepolia: '0x3e622317f8C93f3298527c1047B7B6e2c9c2bC3a',
      unichain: '0x3e622317f8C93f3298527c1047B7B6e2c9c2bC3a',
      monad: '0x3e622317f8C93f3298527c1047B7B6e2c9c2bC3a'
    }
  },
  { 
    symbol: 'UNI', 
    name: 'Uniswap', 
    decimals: 18, 
    icon: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1608232835',
    addresses: {
      mainnet: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      sepolia: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      unichain: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      monad: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    }
  },
];

// 快速选择代币列表
export const QUICK_SELECT_TOKENS = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
    addresses: {
      mainnet: '0x0000000000000000000000000000000000000000',
      sepolia: '0x0000000000000000000000000000000000000000',
      unichain: '0x0000000000000000000000000000000000000000',
      monad: '0x0000000000000000000000000000000000000000'
    }
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    icon: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1668147255',
    addresses: {
      mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      unichain: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      monad: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
  },
  { 
    symbol: 'USDT', 
    name: 'Tether', 
    icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png?1696501661',
    addresses: {
      mainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      sepolia: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B',
      unichain: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B',
      monad: '0xaA8E23Fb1089BE1f0f5B4A6E9a6bE2b511F0A91B'
    }
  },
  { 
    symbol: 'UNI', 
    name: 'Uniswap', 
    icon: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1608232835',
    addresses: {
      mainnet: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      sepolia: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      unichain: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      monad: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    }
  },
];