import { PrivyProvider } from '@privy-io/react-auth';

// 使用链ID配置，避免依赖特定的网络导出
export const privyConfig = {
  // Privy App ID配置
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'cmgkk8drf001lk00cob8vgj4e',
  
  // 支持的链配置 - 使用链ID
  supportedChains: [
    { chainId: 1, name: 'Ethereum' },
    { chainId: 11155111, name: 'Sepolia' },
    { chainId: 137, name: 'Polygon' },
    { chainId: 10, name: 'Optimism' },
    { chainId: 42161, name: 'Arbitrum' }
  ],"explanation":"添加Sepolia测试网络支持"}
  
  // 登录方式配置
  loginMethods: ['wallet', 'email', 'sms', 'google', 'apple', 'discord'],
  
  // 外观配置
  appearance: {
    theme: 'light',
    accentColor: '#3B82F6',
    logo: '/logo.png'
  },
  
  // 嵌入式钱包配置
  embeddedWallets: {
    createOnLogin: 'users-without-wallets'
  },
  
  // 默认链
  defaultChain: { chainId: 11155111, name: 'Sepolia' }
};

export { PrivyProvider };