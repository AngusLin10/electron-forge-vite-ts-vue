<template>
  <div class="stock-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>台股K線圖查詢</h2>
        </div>
      </template>
      
      <el-form :model="searchForm" class="search-form" label-width="100px">
        <el-form-item label="股票代碼">
          <el-input 
            v-model="searchForm.symbol" 
            placeholder="請輸入股票代碼，例如：2330.TW"
            :disabled="loading"
          >
            <template #append>
              <span>.TW</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="時間範圍">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            :disabled="loading"
            :default-value="defaultDateRange"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="fetchStockData" 
            :loading="loading"
          >
            <el-icon v-if="!loading"><Search /></el-icon>
            {{ loading ? '查詢中...' : '查詢' }}
          </el-button>
          <el-button @click="resetForm" :disabled="loading">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div v-if="error" class="error-message">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>

      <div v-if="chartData.length > 0" class="chart-info">
        <el-tag type="success">股票代碼: {{ currentSymbol }}</el-tag>
        <el-tag type="info" style="margin-left: 10px;">數據點數: {{ chartData.length }}</el-tag>
      </div>

      <div 
        ref="chartRef" 
        class="chart-container"
        v-loading="loading"
        element-loading-text="載入中..."
      ></div>

      <div v-if="!chartData.length && !loading && !error" class="empty-state">
        <el-empty description="請輸入股票代碼並選擇時間範圍進行查詢" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface SearchForm {
  symbol: string
  dateRange: [string, string] | null
}

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const searchForm = ref<SearchForm>({
  symbol: '2330',
  dateRange: null
})

const loading = ref(false)
const error = ref('')
const chartData = ref<StockData[]>([])
const currentSymbol = ref('')

const getDefaultDateRange = (): [string, string] => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 3)
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  return [formatDate(start), formatDate(end)]
}

const defaultDateRange = getDefaultDateRange()

const fetchStockData = async () => {
  if (!searchForm.value.symbol.trim()) {
    ElMessage.warning('請輸入股票代碼')
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const symbol = searchForm.value.symbol.trim().toUpperCase()
    const fullSymbol = symbol.includes('.TW') ? symbol : `${symbol}.TW`
    
    const dateRange = searchForm.value.dateRange || defaultDateRange
    const [startDate, endDate] = dateRange
    
    const response = await axios.get(`http://localhost:3000/api/stock/${fullSymbol}`, {
      params: {
        startDate,
        endDate
      }
    })
    
    if (response.data && response.data.data) {
      chartData.value = response.data.data
      currentSymbol.value = response.data.symbol
      renderChart()
      ElMessage.success('數據載入成功')
    } else {
      throw new Error('無效的數據格式')
    }
  } catch (err: any) {
    console.error('Error fetching stock data:', err)
    error.value = err.response?.data?.error || err.message || '獲取股票數據失敗，請檢查股票代碼是否正確'
    ElMessage.error(error.value)
    chartData.value = []
  } finally {
    loading.value = false
  }
}

const renderChart = () => {
  if (!chartRef.value || chartData.value.length === 0) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const dates = chartData.value.map(item => item.date)
  const values = chartData.value.map(item => [
    item.open,
    item.close,
    item.low,
    item.high
  ])
  const volumes = chartData.value.map(item => item.volume)

  const option = {
    title: {
      text: `${currentSymbol.value} K線圖`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        const data = params[0]
        const index = data.dataIndex
        const stockData = chartData.value[index]
        return `
          日期: ${stockData.date}<br/>
          開盤: ${stockData.open.toFixed(2)}<br/>
          收盤: ${stockData.close.toFixed(2)}<br/>
          最高: ${stockData.high.toFixed(2)}<br/>
          最低: ${stockData.low.toFixed(2)}<br/>
          成交量: ${stockData.volume.toLocaleString()}
        `
      }
    },
    grid: [
      {
        left: '10%',
        right: '10%',
        top: '15%',
        height: '50%'
      },
      {
        left: '10%',
        right: '10%',
        top: '70%',
        height: '15%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '90%',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'K線',
        type: 'candlestick',
        data: values,
        itemStyle: {
          color: '#ef232a',
          color0: '#14b143',
          borderColor: '#ef232a',
          borderColor0: '#14b143'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            const index = params.dataIndex
            if (index === 0) return '#7fbe9e'
            const current = chartData.value[index]
            const previous = chartData.value[index - 1]
            return current.close >= previous.close ? '#ef232a' : '#14b143'
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const resetForm = () => {
  searchForm.value = {
    symbol: '2330',
    dateRange: null
  }
  chartData.value = []
  currentSymbol.value = ''
  error.value = ''
  if (chartInstance) {
    chartInstance.clear()
  }
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.stock-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 600px;
  margin-top: 20px;
}

.error-message {
  margin-bottom: 20px;
}

.chart-info {
  margin-bottom: 10px;
}

.empty-state {
  margin-top: 40px;
  text-align: center;
}
</style>
