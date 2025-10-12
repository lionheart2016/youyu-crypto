<template>
  <div class="create-wallet-page min-h-screen bg-gray-900 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-4">创建Privy钱包</h1>
          <p class="text-gray-400">使用Privy创建您的第一个嵌入式区块链钱包</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <!-- 创建钱包卡片 -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">创建新钱包</h3>
              <p class="text-gray-400 text-sm">使用Privy创建安全的嵌入式钱包</p>
            </div>
            
            <CreateWallet />
          </div>
          
          <!-- 钱包信息卡片 -->
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">钱包信息</h3>
              <p class="text-gray-400 text-sm">查看您的钱包详情</p>
            </div>
            
            <div v-if="walletAddress" class="space-y-4">
              <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-400 text-sm">地址</span>
                  <button @click="copyAddress" class="text-blue-400 hover:text-blue-300 text-xs">
                    复制
                  </button>
                </div>
                <div class="text-white font-mono text-sm break-all">
                  {{ formatAddress(walletAddress) }}
                </div>
              </div>
              
              <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-gray-400 text-sm">余额</span>
                  <button @click="refreshBalance" class="text-blue-400 hover:text-blue-300 text-xs">
                    刷新
                  </button>
                </div>
                <div class="text-green-400 font-semibold">
                  {{ walletBalance }} ETH
                </div>
              </div>
              
              <div class="space-y-2">
                <button 
                  @click="viewOnExplorer" 
                  class="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  查看区块浏览器
                </button>
                <button 
                  @click="disconnectWallet" 
                  class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  断开连接
                </button>
              </div>
            </div>
            
            <div v-else class="text-center text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>请先创建或连接钱包</p>
            </div>
          </div>
        </div>
        
        <!-- 功能说明 -->
        <div class="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 class="text-lg font-semibold text-white mb-4">Privy钱包功能</h3>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 class="text-white font-medium mb-2">安全存储</h4>
              <p class="text-gray-400 text-sm">私钥安全存储，永不暴露给应用</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 class="text-white font-medium mb-2">快速交易</h4>
              <p class="text-gray-400 text-sm">一键发送交易，支持多种代币</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 class="text-white font-medium mb-2">多链支持</h4>
              <p class="text-gray-400 text-sm">支持以太坊、Polygon等主流链</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePrivy } from '../contexts/PrivyContext.js';
import CreateWallet from '../components/CreateWallet.vue';

const {
  authenticated,
  walletAddress,
  walletBalance,
  disconnectWallet: privyDisconnect
} = usePrivy();

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 复制地址
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(walletAddress.value);
    alert('地址已复制到剪贴板');
  } catch (error) {
    console.error('复制地址失败:', error);
    alert('复制地址失败');
  }
};

// 查看区块浏览器
const viewOnExplorer = () => {
  if (walletAddress.value) {
    window.open(`https://etherscan.io/address/${walletAddress.value}`, '_blank');
  }
};

// 刷新余额（这里可以添加实际的余额刷新逻辑）
const refreshBalance = () => {
  console.log('刷新余额...');
  // 这里可以添加实际的余额刷新逻辑
};

// 断开连接
const disconnectWallet = async () => {
  try {
    await privyDisconnect();
  } catch (error) {
    console.error('断开连接失败:', error);
    alert('断开连接失败，请重试');
  }
};
</script>