<template>
  <div class="ethereum-transaction-button">
    <!-- 基础交易按钮 -->
    <button 
      v-if="type === 'basic'"
      @click="openTransactionModal"
      :class="buttonClass"
      :disabled="disabled"
    >
      {{ buttonText }}
    </button>
    
    <!-- 买入/卖出按钮组 -->
    <div v-else-if="type === 'pair'" class="flex space-x-2">
      <button 
        @click="openTransactionModal('buy')"
        :class="buyButtonClass"
        :disabled="disabled"
      >
        {{ buyText }}
      </button>
      <button 
        @click="openTransactionModal('sell')"
        :class="sellButtonClass"
        :disabled="disabled"
      >
        {{ sellText }}
      </button>
    </div>
    
    <!-- 快速交易按钮 -->
    <button 
      v-else-if="type === 'quick'"
      @click="executeQuickTransaction"
      :class="quickButtonClass"
      :disabled="disabled || isLoading"
    >
      {{ isLoading ? '处理中...' : buttonText }}
    </button>
    
    <!-- 交易模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <EthereumTransaction 
            :initial-params="transactionParams"
            @transaction-sent="handleTransactionSent"
            @transaction-failed="handleTransactionFailed"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EthereumTransaction from './EthereumTransaction.vue'

export default {
  name: 'EthereumTransactionButton',
  components: {
    EthereumTransaction
  },
  props: {
    type: {
      type: String,
      default: 'basic', // 'basic', 'pair', 'quick'
      validator: (value) => ['basic', 'pair', 'quick'].includes(value)
    },
    buttonText: {
      type: String,
      default: '以太坊交易'
    },
    buyText: {
      type: String,
      default: '链上买入'
    },
    sellText: {
      type: String,
      default: '链上卖出'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 交易参数
    transactionType: {
      type: String,
      default: 'eth' // 'eth' or 'token'
    },
    amount: {
      type: [String, Number],
      default: ''
    },
    toAddress: {
      type: String,
      default: ''
    },
    tokenType: {
      type: String,
      default: 'USDT'
    },
    // 样式配置
    buttonClass: {
      type: String,
      default: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
    },
    buyButtonClass: {
      type: String,
      default: 'flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors'
    },
    sellButtonClass: {
      type: String,
      default: 'flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors'
    },
    quickButtonClass: {
      type: String,
      default: 'bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors'
    }
  },
  data() {
    return {
      showModal: false,
      isLoading: false,
      transactionParams: null
    }
  },
  computed: {
    modalTitle() {
      if (this.transactionParams?.type === 'buy') {
        return '链上买入'
      } else if (this.transactionParams?.type === 'sell') {
        return '链上卖出'
      }
      return '以太坊交易'
    }
  },
  methods: {
    openTransactionModal(transactionType = null) {
      // 构建交易参数
      this.transactionParams = {
        type: transactionType,
        transactionType: this.transactionType,
        amount: this.amount,
        toAddress: this.toAddress,
        tokenType: this.tokenType
      };
      
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.transactionParams = null;
    },
    
    async executeQuickTransaction() {
      this.isLoading = true;
      
      try {
        // 这里可以实现快速交易逻辑
        // 例如直接调用预填充的交易参数
        this.openTransactionModal('buy'); // 或者根据配置决定买入还是卖出
      } catch (error) {
        console.error('快速交易失败:', error);
        this.$emit('transaction-failed', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleTransactionSent(result) {
      this.$emit('transaction-sent', result);
      this.closeModal();
    },
    
    handleTransactionFailed(error) {
      this.$emit('transaction-failed', error);
      this.closeModal();
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 20px;
}
</style>