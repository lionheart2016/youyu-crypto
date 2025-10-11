<template>
  <div class="privy-wallet">
    <!-- 未连接状态 -->
    <div v-if="!authenticated" class="wallet-disconnected">
      <button 
        @click="connectWallet" 
        class="connect-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        连接Privy钱包
      </button>
      <p class="text-sm text-gray-500 mt-2">使用Privy安全连接您的钱包</p>
    </div>

    <!-- 已连接状态 -->
    <div v-else class="wallet-connected">
      <div class="wallet-info bg-gray-800 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span class="text-green-400 font-medium">已连接</span>
          </div>
          <button 
            @click="disconnectWallet" 
            class="text-gray-400 hover:text-red-400 transition-colors"
            title="断开连接"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        
        <div class="wallet-details">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-400 text-sm">地址:</span>
            <span class="text-white font-mono text-sm">{{ formatAddress(walletAddress) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-400 text-sm">余额:</span>
            <span class="text-green-400 font-semibold">{{ walletBalance }} ETH</span>
          </div>
        </div>
        
        <div class="wallet-actions mt-4 flex space-x-2">
          <button 
            @click="copyAddress" 
            class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            复制地址
          </button>
          <button 
            @click="viewOnExplorer" 
            class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
          >
            查看交易
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePrivy } from '../contexts/PrivyContext.js';

const {
  authenticated,
  walletAddress,
  walletBalance,
  connectWallet: privyConnect,
  disconnectWallet: privyDisconnect
} = usePrivy();

const isConnecting = ref(false);

// 格式化地址显示
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 连接钱包
const connectWallet = async () => {
  isConnecting.value = true;
  try {
    await privyConnect();
  } catch (error) {
    console.error('连接钱包失败:', error);
    alert('连接钱包失败，请重试');
  } finally {
    isConnecting.value = false;
  }
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

onMounted(() => {
  console.log('Privy钱包组件已加载');
});
</script>

<style scoped>
.privy-wallet {
  max-width: 320px;
  margin: 0 auto;
}

.connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.wallet-info {
  border: 1px solid #374151;
}

.wallet-actions button {
  transition: all 0.2s ease;
}

.wallet-actions button:hover {
  transform: translateY(-1px);
}
</style>