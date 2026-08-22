<template>
  <div class="analysis-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <div class="header-title-row">
            <span class="header-icon-badge">
              <el-icon :size="20"><DataLine /></el-icon>
            </span>
            <h1>数据分析中心</h1>
          </div>
          <p>深入了解您的情绪模式和变化趋势</p>
        </div>
        <button class="btn-export" @click="exportPDFReport" :disabled="isExporting">
          <el-icon><Document /></el-icon>
          {{ isExporting ? '导出中...' : '导出分析报告' }}
        </button>
      </div>
    </div>

    <!-- 空状态提示 -->
    <el-card class="empty-state-card" shadow="hover" v-if="totalPredictions === 0">
      <el-empty description="还没有数据">
        <template #image>
          <div style="font-size: 80px;">📊</div>
        </template>
        <p style="color: #909399; margin-bottom: 1rem;">
          请先在首页上传照片进行情绪识别，系统会为您生成详细的数据分析
        </p>
        <el-button type="primary" @click="$router.push('/app')">
          前往首页识别
        </el-button>
      </el-empty>
      <el-divider />
      <div style="color: #606266; line-height: 1.8;">
        <h3 style="margin-bottom: 1rem;">📈 数据分析功能预览:</h3>
        <ul style="padding-left: 2rem;">
          <li>情绪分布饼图 - 直观展示各种情绪占比</li>
          <li>情绪趋势折线图 - 追踪情绪随时间的变化</li>
          <li>置信度分布统计 - 了解识别准确度分布</li>
          <li>24小时活动分析 - 发现情绪规律</li>
          <li>日历热力图 - GitHub风格的活跃度展示</li>
          <li>详细数据表格 - 支持搜索、导出、删除</li>
        </ul>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-grid" v-else>
      <div class="kpi-card">
        <div class="kpi-icon purple">
          <el-icon :size="22"><DataLine /></el-icon>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">总识别次数</span>
          <span class="kpi-value">{{ totalPredictions }}</span>
          <span class="kpi-trend" :class="totalWeekTrend.type">
            <span class="trend-arrow">{{ totalWeekTrend.arrow }}</span>
            {{ totalWeekTrend.text }}
          </span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon pink">
          <span class="kpi-emoji">{{ dominantEmotionEmoji }}</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">主导情绪</span>
          <span class="kpi-value kpi-value-text">{{ dominantEmotion }}</span>
          <span class="kpi-trend neutral">
            占比 {{ dominantEmotionRatio }}%
            <span class="dominant-bar" :style="{ width: `${dominantEmotionRatio}%` }"></span>
          </span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon blue">
          <el-icon :size="22"><CircleCheck /></el-icon>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">平均置信度</span>
          <span class="kpi-value">{{ avgConfidence }}%</span>
          <span class="kpi-trend" :class="[confidenceWeekTrend.type, confidenceWeekTrend.type === 'up' ? 'blue' : '']">
            <span class="trend-arrow">{{ confidenceWeekTrend.arrow }}</span>
            {{ confidenceWeekTrend.text }}
          </span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon green">
          <el-icon :size="22"><Calendar /></el-icon>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">活跃天数</span>
          <span class="kpi-value">{{ activeDays }}</span>
          <span class="kpi-trend" :class="activeDaysTrend.type">
            {{ activeDaysTrend.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- 中间分析区：数据来源 + 情绪分布 + 健康评分 -->
    <div class="middle-section" v-if="totalPredictions > 0">
      <div class="middle-row">
        <!-- 数据来源分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon-badge purple">
              <el-icon :size="16"><DataLine /></el-icon>
            </span>
            <span class="panel-title">数据来源分布</span>
          </div>
          <div class="source-panel-body">
            <div class="source-donut-wrap">
              <div ref="dataSourceDonutChart" class="source-donut"></div>
              <div class="source-donut-center">
                <span class="donut-percent">{{ dominantSourcePercent }}%</span>
                <span class="donut-label">{{ dominantSourceLabel }}</span>
              </div>
            </div>
            <div class="source-legend">
              <div
                v-for="item in dataSourceStats"
                :key="item.label"
                class="legend-item"
              >
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
                <div class="legend-bar-track">
                  <div
                    class="legend-bar-fill"
                    :style="{ width: `${item.percent}%`, background: item.color }"
                  ></div>
                </div>
                <span class="legend-value">{{ item.count }} ({{ item.percent }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 情绪分布 -->
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-icon-badge pink">🎯</span>
            <span class="panel-title">情绪分布</span>
          </div>
          <div class="emotion-bars">
            <div
              v-for="item in emotionDistributionPreview"
              :key="item.name"
              class="emotion-bar-row"
            >
              <span class="emotion-emoji">{{ item.emoji }}</span>
              <span class="emotion-name">{{ item.name }}</span>
              <div class="emotion-bar-track">
                <div
                  class="emotion-bar-fill"
                  :style="{ width: `${item.percent}%`, background: item.color }"
                ></div>
              </div>
              <span class="emotion-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 情绪健康评分 -->
      <div class="panel-card health-panel">
        <div class="panel-header">
          <span class="panel-icon-badge green">💚</span>
          <span class="panel-title">情绪健康评分</span>
        </div>
        <div class="health-panel-body">
          <div class="health-gauge-section">
            <div class="health-ring-wrap">
              <svg class="health-ring-svg" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="healthRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#60a5fa" />
                    <stop offset="100%" stop-color="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" stroke-width="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#healthRingGradient)"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${healthRingDash} 327`"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="health-ring-center">
                <span class="ring-score">{{ healthScore.score }}</span>
                <span class="ring-max">/ 100</span>
              </div>
            </div>
            <span class="health-level-badge" :class="healthScore.level">{{ healthScore.level_text }}</span>
          </div>

          <div class="health-middle">
            <p class="health-desc">{{ healthScore.summary }}</p>
            <div class="health-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-icon-wrap positive">😊</span>
                <div class="breakdown-text">
                  <span class="breakdown-label">积极情绪占比</span>
                  <span class="breakdown-value positive">{{ healthScore.positive_rate }}%</span>
                </div>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-icon-wrap neutral">😐</span>
                <div class="breakdown-text">
                  <span class="breakdown-label">中性情绪占比</span>
                  <span class="breakdown-value neutral">{{ healthScore.neutral_rate }}%</span>
                </div>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-icon-wrap negative">😠</span>
                <div class="breakdown-text">
                  <span class="breakdown-label">消极情绪占比</span>
                  <span class="breakdown-value negative">{{ healthScore.negative_rate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="health-advice-box">
            <h4 class="advice-title">
              <span class="advice-title-icon">💡</span>
              健康建议
            </h4>
            <ul class="advice-list">
              <li v-for="(item, index) in healthAdviceList" :key="index" class="advice-item">
                <span class="advice-icon" :style="{ background: item.bg }">{{ item.icon }}</span>
                <span class="advice-text">{{ item.text }}</span>
              </li>
            </ul>
            <span class="advice-decoration" aria-hidden="true">🌿</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频情绪变化分析 -->
    <el-card class="video-analysis-card" shadow="hover" v-if="videoStore.videoHistory.length > 0">
      <template #header>
        <div class="card-header">
          <span>🎬 视频情绪变化趋势</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <el-select 
              v-model="selectedVideoId" 
              placeholder="选择视频" 
              size="small" 
              style="width: 280px"
              filterable
              clearable
              @clear="selectedVideoId = null"
            >
              <el-option
                v-for="video in videoStore.videoHistory"
                :key="video.video_id"
                :label="`${video.video_id} (${video.results?.total_frames || 0}帧)`"
                :value="video.video_id"
              >
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>{{ video.video_id.slice(0, 20) }}{{ video.video_id.length > 20 ? '...' : '' }}</span>
                  <el-tag size="small" type="info">{{ video.results?.total_frames || 0 }}帧</el-tag>
                </div>
              </el-option>
            </el-select>
            <el-button 
              v-if="selectedVideoId" 
              size="small" 
              type="danger" 
              @click="deleteSelectedVideo"
              :icon="Delete"
            >
              删除此视频
            </el-button>
            <el-tag v-if="videoStore.videoHistory.length > 0" type="info" size="small">
              共 {{ videoStore.videoHistory.length }} 个视频
            </el-tag>
          </div>
        </div>
      </template>
      
      <!-- 视频快速选择列表 -->
      <div v-if="videoStore.videoHistory.length > 1" class="video-quick-list">
        <el-scrollbar max-height="120px">
          <div class="video-list-container">
            <div 
              v-for="video in videoStore.videoHistory" 
              :key="video.video_id"
              class="video-item"
              :class="{ active: selectedVideoId === video.video_id }"
              @click="selectedVideoId = video.video_id"
            >
              <div class="video-item-content">
                <div class="video-item-icon">🎬</div>
                <div class="video-item-info">
                  <div class="video-item-name">{{ video.video_id.slice(0, 25) }}{{ video.video_id.length > 25 ? '...' : '' }}</div>
                  <div class="video-item-meta">
                    <el-tag size="small" type="info">{{ video.results?.total_frames || 0 }}帧</el-tag>
                    <span class="video-item-time">{{ formatTime(video.timestamp) }}</span>
                  </div>
                </div>
                <el-button 
                  size="small" 
                  type="danger" 
                  :icon="Delete"
                  circle
                  @click.stop="deleteVideo(video)"
                />
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      
      <div v-if="selectedVideoData">
        <div class="video-summary">
          <el-row :gutter="16">
            <el-col :xs="12" :sm="6">
              <div class="summary-item">
                <div class="summary-label">总帧数</div>
                <div class="summary-value">{{ selectedVideoData.total_frames }}</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="summary-item">
                <div class="summary-label">主要情绪</div>
                <div class="summary-value">{{ selectedVideoData.dominant_emotion }}</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="summary-item">
                <div class="summary-label">平均置信度</div>
                <div class="summary-value">{{ selectedVideoData.avg_confidence }}%</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6">
              <div class="summary-item">
                <div class="summary-label">情绪稳定性</div>
                <div class="summary-value">{{ selectedVideoData.stability }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div ref="videoEmotionChart" class="chart-container" style="margin-top: 20px;"></div>
        <div class="video-insights">
          <el-alert :title="selectedVideoData.insight_title" :type="selectedVideoData.insight_type" :closable="false">
            <p>{{ selectedVideoData.insight_description }}</p>
          </el-alert>
        </div>
      </div>
      <el-empty v-else description="请选择一个视频查看详细分析" />
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" v-if="totalPredictions > 0">
      <!-- 情绪分布饼图 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📊 情绪分布</span>
              <el-tag>总计 {{ totalPredictions }} 次</el-tag>
            </div>
          </template>
          <div ref="emotionPieChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 情绪趋势折线图 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📈 情绪趋势</span>
              <el-select v-model="trendPeriod" size="small" @change="updateTrendChart">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="全部" value="all" />
              </el-select>
            </div>
          </template>
          <div ref="emotionTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 置信度分布 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎯 置信度分布</span>
            </div>
          </template>
          <div ref="confidenceChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 时段分析 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🕐 时段分析</span>
            </div>
          </template>
          <div ref="timeAnalysisChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 情绪日历热力图 -->
    <el-card class="chart-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📅 情绪日历</span>
          <el-tag>{{ currentYear }}年</el-tag>
        </div>
      </template>
      <div ref="emotionCalendarChart" class="calendar-chart-container"></div>
    </el-card>

    <!-- 周期对比分析 -->
    <el-card class="chart-card" shadow="hover" v-if="totalPredictions > 0">
      <template #header>
        <div class="card-header">
          <span>📊 周期对比分析</span>
          <el-radio-group v-model="comparisonPeriod" size="small" @change="updateComparisonChart">
            <el-radio-button label="week">本周 vs 上周</el-radio-button>
            <el-radio-button label="month">本月 vs 上月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="comparisonChart" class="chart-container"></div>
      <div class="comparison-summary">
        <el-alert :title="comparisonSummary.title" :type="comparisonSummary.type" :closable="false">
          <p>{{ comparisonSummary.description }}</p>
        </el-alert>
      </div>
    </el-card>




  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useEmotionStore } from '../stores/emotion'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine,
  CircleCheck,
  Calendar,
  Document,
  Delete
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useVideoStore } from '../stores/video'

const emotionStore = useEmotionStore()
const videoStore = useVideoStore()

// 导出相关
const isExporting = ref(false)

// 合并图片识别和视频分析的数据
const allPredictions = computed(() => {
  const imagePredictions = emotionStore.predictions || []
  const videoPredictions = []
  
  console.log('📊 [Analysis] 合并数据:', {
    imageCount: imagePredictions.length,
    videoHistoryCount: videoStore.videoHistory?.length || 0,
    videoHistory: videoStore.videoHistory
  })
  
  // 从视频历史记录中提取所有帧的预测结果
  if (videoStore.videoHistory && Array.isArray(videoStore.videoHistory)) {
    videoStore.videoHistory.forEach(video => {
      const timeline = video.results?.timeline
      console.log('🎬 [Analysis] 处理视频:', {
        video_id: video.video_id,
        hasResults: !!video.results,
        hasTimeline: !!timeline,
        timelineIsArray: Array.isArray(timeline),
        timelineType: typeof timeline,
        timelineLength: Array.isArray(timeline) ? timeline.length : 'N/A'
      })
      
      if (video.results && video.results.timeline && Array.isArray(video.results.timeline)) {
        video.results.timeline.forEach(frame => {
          videoPredictions.push({
            emotion: frame.emotion,
            emotion_cn: frame.emotion_cn,
            confidence: frame.confidence,
            timestamp: frame.timestamp || video.timestamp,
            model_used: video.model || 'CNN',
            source: 'video',
            video_id: video.video_id,
            frame_number: frame.frame_number
          })
        })
      }
    })
  }
  
  console.log('📊 [Analysis] 合并结果:', {
    imageCount: imagePredictions.length,
    videoCount: videoPredictions.length,
    total: imagePredictions.length + videoPredictions.length
  })
  
  return [...imagePredictions, ...videoPredictions]
})

// 数据来源统计
const imageCount = computed(() => {
  return allPredictions.value.filter(p => p.source !== 'video').length
})

const videoCount = computed(() => {
  return allPredictions.value.filter(p => p.source === 'video').length
})

const videoFileCount = computed(() => videoStore.videoHistory?.length || 0)

const dataSourceStats = computed(() => {
  const predTotal = totalPredictions.value || 1
  const img = imageCount.value
  const vid = videoCount.value
  const files = videoFileCount.value
  const filePercent = files === 0 ? 0 : Math.round((files / Math.max(files + img + vid, 1)) * 100)

  return [
    { label: '图片识别', count: img, percent: Math.round((img / predTotal) * 100), color: '#8b5cf6' },
    { label: '视频分析', count: vid, percent: Math.round((vid / predTotal) * 100), color: '#3b82f6' },
    { label: '视频文件', count: files, percent: filePercent, color: '#10b981' }
  ]
})

const dominantSourceLabel = computed(() => {
  const stats = dataSourceStats.value.filter(s => s.label !== '视频文件')
  const top = stats.reduce((max, item) => (item.count > max.count ? item : max), stats[0])
  if (!top || top.count === 0) return '暂无数据'
  return top.label
})

const dominantSourcePercent = computed(() => {
  const stats = dataSourceStats.value.filter(s => s.label !== '视频文件')
  const top = stats.reduce((max, item) => (item.count > max.count ? item : max), stats[0])
  return top?.percent || 0
})

const RAF_EMOTIONS = ['生气', '厌恶', '害怕', '高兴', '平静', '悲伤', '惊讶']

const emotionBarColors = {
  '生气': '#f472b6',
  '厌恶': '#a78bfa',
  '害怕': '#fb923c',
  '高兴': '#34d399',
  '平静': '#fbbf24',
  '悲伤': '#60a5fa',
  '惊讶': '#c084fc'
}

const EMOTION_PREVIEW_NAMES = ['生气', '悲伤', '平静', '高兴']

const emotionDistribution = computed(() => {
  const total = totalPredictions.value || 1
  const counts = {}
  allPredictions.value.forEach(pred => {
    counts[pred.emotion_cn] = (counts[pred.emotion_cn] || 0) + 1
  })

  return RAF_EMOTIONS.map(name => ({
    name,
    emoji: cnEmotionEmojiMap[name] || '😐',
    count: counts[name] || 0,
    percent: Math.round(((counts[name] || 0) / total) * 100),
    color: emotionBarColors[name] || '#94a3b8'
  }))
})

const emotionDistributionPreview = computed(() => {
  const map = Object.fromEntries(emotionDistribution.value.map(item => [item.name, item]))
  return EMOTION_PREVIEW_NAMES.map(name => map[name] || {
    name,
    emoji: cnEmotionEmojiMap[name] || '😐',
    count: 0,
    percent: 0,
    color: emotionBarColors[name] || '#94a3b8'
  })
})

const healthAdviceList = computed(() => {
  const score = healthScore.value.score
  if (score >= 85) {
    return [
      { icon: '🌟', bg: '#fef9c3', text: '保持当前良好状态，继续规律作息' },
      { icon: '😊', bg: '#dcfce7', text: '多参与社交活动，分享积极情绪' },
      { icon: '🏃', bg: '#ffedd5', text: '坚持适度运动，增强身心活力' },
      { icon: '📖', bg: '#ede9fe', text: '培养兴趣爱好，丰富精神生活' }
    ]
  }
  if (score >= 70) {
    return [
      { icon: '🧘', bg: '#fce7f3', text: '继续保持良好心态，适当放松' },
      { icon: '🌙', bg: '#fef9c3', text: '保持规律作息，保证充足睡眠' },
      { icon: '💬', bg: '#dbeafe', text: '与亲友沟通，分享您的感受' },
      { icon: '🏃', bg: '#ffedd5', text: '适当进行运动，释放压力' }
    ]
  }
  return [
    { icon: '🧠', bg: '#fce7f3', text: '尝试进行深呼吸或冥想练习' },
    { icon: '🌙', bg: '#fef9c3', text: '保持规律作息，保证充足睡眠' },
    { icon: '💬', bg: '#dbeafe', text: '与亲友沟通，分享您的感受' },
    { icon: '🏃', bg: '#ffedd5', text: '适当进行运动，释放压力' }
  ]
})

// 统计数据
const totalPredictions = computed(() => allPredictions.value.length)

const dominantEmotion = computed(() => {
  if (allPredictions.value.length === 0) return '-'
  
  const emotionCounts = {}
  allPredictions.value.forEach(pred => {
    emotionCounts[pred.emotion_cn] = (emotionCounts[pred.emotion_cn] || 0) + 1
  })
  
  let maxEmotion = ''
  let maxCount = 0
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count
      maxEmotion = emotion
    }
  }
  
  return maxEmotion
})

const avgConfidence = computed(() => {
  if (allPredictions.value.length === 0) return 0
  
  const sum = allPredictions.value.reduce((acc, pred) => acc + pred.confidence, 0)
  return (sum / allPredictions.value.length * 100).toFixed(1)
})

const activeDays = computed(() => {
  if (allPredictions.value.length === 0) return 0
  
  const dates = new Set()
  allPredictions.value.forEach(pred => {
    const date = new Date(pred.timestamp).toDateString()
    dates.add(date)
  })
  
  return dates.size
})

const emotionEmojiMap = {
  anger: '😠',
  disgust: '🤢',
  fear: '😨',
  happy: '😊',
  normal: '😐',
  sad: '😢',
  surprised: '😲'
}

const cnEmotionEmojiMap = {
  '生气': '😠',
  '厌恶': '🤢',
  '害怕': '😨',
  '高兴': '😊',
  '平静': '😐',
  '悲伤': '😢',
  '惊讶': '😲'
}

const dominantEmotionRatio = computed(() => {
  if (allPredictions.value.length === 0 || dominantEmotion.value === '-') return 0
  const count = allPredictions.value.filter(p => p.emotion_cn === dominantEmotion.value).length
  return Math.round((count / allPredictions.value.length) * 100)
})

const dominantEmotionEmoji = computed(() => {
  if (dominantEmotion.value === '-') return '😐'
  const pred = allPredictions.value.find(p => p.emotion_cn === dominantEmotion.value)
  if (pred?.emotion) return emotionEmojiMap[pred.emotion] || '😐'
  return cnEmotionEmojiMap[dominantEmotion.value] || '😐'
})

const filterPredictionsByDaysAgo = (minDays, maxDays) => {
  const now = new Date()
  return allPredictions.value.filter(pred => {
    const diffDays = Math.floor((now - new Date(pred.timestamp)) / 86400000)
    return diffDays >= minDays && diffDays <= maxDays
  })
}

const thisWeekPredictions = computed(() => filterPredictionsByDaysAgo(0, 6))
const lastWeekPredictions = computed(() => filterPredictionsByDaysAgo(7, 13))

const calcAvgConfidence = (predictions) => {
  if (!predictions.length) return null
  const sum = predictions.reduce((acc, pred) => acc + pred.confidence, 0)
  return (sum / predictions.length) * 100
}

const countActiveDaysIn = (predictions) => {
  const dates = new Set(predictions.map(p => new Date(p.timestamp).toDateString()))
  return dates.size
}

const totalWeekTrend = computed(() => {
  const curr = thisWeekPredictions.value.length
  const prev = lastWeekPredictions.value.length
  if (prev === 0 && curr === 0) {
    return { type: 'flat', arrow: '—', text: '与上周持平' }
  }
  if (prev === 0) {
    return { type: 'up', arrow: '↑', text: `+100% 较上周` }
  }
  const change = ((curr - prev) / prev) * 100
  if (Math.abs(change) < 0.5) {
    return { type: 'flat', arrow: '—', text: '与上周持平' }
  }
  const sign = change > 0 ? '+' : ''
  return {
    type: change >= 0 ? 'up' : 'down',
    arrow: change >= 0 ? '↑' : '↓',
    text: `${sign}${change.toFixed(0)}% 较上周`
  }
})

const confidenceWeekTrend = computed(() => {
  const curr = calcAvgConfidence(thisWeekPredictions.value)
  const prev = calcAvgConfidence(lastWeekPredictions.value)
  if (curr === null || prev === null) {
    return { type: 'flat', arrow: '—', text: '与上周持平' }
  }
  const change = curr - prev
  if (Math.abs(change) < 0.1) {
    return { type: 'flat', arrow: '—', text: '与上周持平' }
  }
  const sign = change > 0 ? '+' : ''
  return {
    type: change >= 0 ? 'up' : 'down',
    arrow: change >= 0 ? '↑' : '↓',
    text: `${sign}${change.toFixed(1)}% 较上周`
  }
})

const activeDaysTrend = computed(() => {
  const curr = countActiveDaysIn(thisWeekPredictions.value)
  const prev = countActiveDaysIn(lastWeekPredictions.value)
  const diff = curr - prev
  if (diff === 0) {
    return { type: 'flat', text: '— 与上周持平' }
  }
  const sign = diff > 0 ? '+' : ''
  return {
    type: diff > 0 ? 'up' : 'down',
    text: `${sign}${diff} 天 较上周`
  }
})

// 情绪健康评分
const healthScore = computed(() => {
  if (allPredictions.value.length === 0) {
    return {
      score: 0,
      level: 'normal',
      level_text: '暂无数据',
      tagType: 'info',
      positive_rate: 0,
      neutral_rate: 0,
      negative_rate: 0,
      stability: 0,
      advice: '请先进行情绪识别以获取健康评分',
      summary: '请先进行情绪识别以获取健康评分'
    }
  }

  // 积极情绪：happy
  // 中性情绪：normal, surprised
  // 消极情绪：anger, sad, fear, disgust
  let positiveCount = 0
  let neutralCount = 0
  let negativeCount = 0
  const emotionValues = []
  const emotionMap = { anger: 1, disgust: 2, fear: 3, sad: 4, normal: 5, surprised: 6, happy: 7 }

  allPredictions.value.forEach(pred => {
    if (pred.emotion === 'happy') {
      positiveCount++
    } else if (pred.emotion === 'normal' || pred.emotion === 'surprised') {
      neutralCount++
    } else if (['anger', 'sad', 'fear', 'disgust'].includes(pred.emotion)) {
      negativeCount++
    }
    emotionValues.push(emotionMap[pred.emotion] || 5)
  })

  const total = allPredictions.value.length
  const positiveRate = Math.round((positiveCount / total) * 100)
  const neutralRate = Math.round((neutralCount / total) * 100)
  const negativeRate = Math.round((negativeCount / total) * 100)

  // 计算情绪波动（使用标准差的倒数作为稳定性指标）
  const mean = emotionValues.reduce((a, b) => a + b, 0) / emotionValues.length
  const variance = emotionValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / emotionValues.length
  const stdDev = Math.sqrt(variance)
  const stability = Math.max(0, Math.min(100, 100 - stdDev * 20)) // 标准差越小越稳定

  // 计算总分（积极占比40%，消极占比的反向30%，稳定性30%）
  const score = Math.round(positiveRate * 0.4 + (100 - negativeRate) * 0.3 + stability * 0.3)

  let level, level_text, tagType, advice, summary
  if (score >= 85) {
    level = 'excellent'
    level_text = '优秀'
    tagType = 'success'
    advice = '您的情绪状态非常健康！保持积极乐观的心态，继续加油！'
    summary = '您的情绪健康状态优秀，积极情绪占比较高，请继续保持良好的生活习惯。'
  } else if (score >= 70) {
    level = 'good'
    level_text = '良好'
    tagType = 'success'
    advice = '您的情绪状态良好，继续保持规律作息和适度运动。'
    summary = '您的情绪健康状态良好，整体情绪较为稳定，建议继续保持。'
  } else if (score >= 55) {
    level = 'normal'
    level_text = '一般'
    tagType = 'warning'
    advice = '建议多参与社交活动，尝试放松技巧，如冥想、瑜伽等。'
    summary = '您的情绪健康评分一般，建议适当关注情绪变化，保持积极生活方式。'
  } else if (score >= 40) {
    level = 'low'
    level_text = '偏低'
    tagType = 'danger'
    advice = '您的情绪波动较大，建议关注情绪状态，适当放松心情。'
    summary = '您的情绪健康评分偏低，建议关注情绪状态，适当放松心情，保持积极的生活方式。'
  } else {
    level = 'need-attention'
    level_text = '偏低'
    tagType = 'danger'
    advice = '您的情绪波动较大，建议咨询专业心理咨询师，及时调整心态。'
    summary = '您的情绪健康评分偏低，建议关注情绪状态，适当放松心情，保持积极的生活方式。'
  }

  return {
    score,
    level,
    level_text,
    tagType,
    positive_rate: positiveRate,
    neutral_rate: neutralRate,
    negative_rate: negativeRate,
    stability: Math.round(stability),
    advice,
    summary
  }
})

const healthRingDash = computed(() => (healthScore.value.score / 100) * 327)

function getStabilityColor(stability) {
  if (stability >= 70) return '#67c23a'
  if (stability >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 周期对比分析
const comparisonPeriod = ref('week')
const comparisonSummary = ref({
  title: '对比分析',
  type: 'info',
  description: '暂无对比数据'
})

const emotionCnMap = {
  anger: '生气',
  disgust: '厌恶',
  fear: '害怕',
  happy: '高兴',
  normal: '平静',
  sad: '悲伤',
  surprised: '惊讶'
}

function getEmotionEmoji(emotion) {
  return emotionEmojiMap[emotion] || '😐'
}

// ===== 视频分析相关 =====
const selectedVideoId = ref(null)
const videoEmotionChart = ref(null)

// 选中视频的详细数据分析
const selectedVideoData = computed(() => {
  if (!selectedVideoId.value) return null
  
  const video = videoStore.videoHistory.find(v => v.video_id === selectedVideoId.value)
  if (!video || !video.results || !video.results.timeline) return null
  
  const timeline = video.results.timeline
  
  // 检查 timeline 是否是数组
  if (!Array.isArray(timeline) || timeline.length === 0) {
    console.warn('⚠️ [Analysis] timeline 不是数组或为空:', timeline)
    return null
  }
  
  const totalFrames = timeline.length
  
  // 计算主要情绪
  const emotionCounts = {}
  timeline.forEach(frame => {
    emotionCounts[frame.emotion_cn] = (emotionCounts[frame.emotion_cn] || 0) + 1
  })
  
  let dominantEmotion = ''
  let maxCount = 0
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count
      dominantEmotion = emotion
    }
  }
  
  // 计算平均置信度
  const avgConfidence = (timeline.reduce((sum, frame) => sum + frame.confidence, 0) / totalFrames * 100).toFixed(1)
  
  // 计算情绪稳定性（情绪变化次数越少越稳定）
  let emotionChanges = 0
  for (let i = 1; i < timeline.length; i++) {
    if (timeline[i].emotion !== timeline[i-1].emotion) {
      emotionChanges++
    }
  }
  const stabilityRate = Math.max(0, 100 - (emotionChanges / totalFrames * 100))
  let stability = stabilityRate >= 70 ? '稳定' : stabilityRate >= 40 ? '一般' : '波动较大'
  
  // 生成分析洞察
  let insightTitle = ''
  let insightType = 'info'
  let insightDescription = ''
  
  const dominantRate = (maxCount / totalFrames * 100).toFixed(1)
  
  if (stabilityRate >= 70) {
    insightTitle = '情绪状态稳定'
    insightType = 'success'
    insightDescription = `视频中 ${dominantRate}% 的时间保持${dominantEmotion}状态，情绪变化平稳，心理状态良好。`
  } else if (stabilityRate >= 40) {
    insightTitle = '情绪有所波动'
    insightType = 'warning'
    insightDescription = `视频中情绪出现 ${emotionChanges} 次变化，建议关注情绪管理，保持心态平和。`
  } else {
    insightTitle = '情绪波动明显'
    insightType = 'error'
    insightDescription = `视频中情绪频繁变化（${emotionChanges} 次），可能处于压力或焦虑状态，建议进行放松调节。`
  }
  
  return {
    video_id: video.video_id,
    total_frames: totalFrames,
    dominant_emotion: dominantEmotion,
    avg_confidence: avgConfidence,
    stability,
    stability_rate: stabilityRate.toFixed(1),
    emotion_changes: emotionChanges,
    timeline,
    insight_title: insightTitle,
    insight_type: insightType,
    insight_description: insightDescription
  }
})

// 监听视频选择变化，更新图表
watch(selectedVideoData, (newData) => {
  if (newData) {
    nextTick(() => {
      updateVideoEmotionChart()
    })
  }
})

// 初始化时选择第一个视频
onMounted(() => {
  if (videoStore.videoHistory.length > 0) {
    selectedVideoId.value = videoStore.videoHistory[0].video_id
  }
})

// 监听视频历史记录变化
watch(() => videoStore.videoHistory.length, (newLength, oldLength) => {
  // 如果视频被删除了
  if (newLength < oldLength) {
    // 如果当前选中的视频被删除，自动选择第一个视频
    if (selectedVideoId.value && !videoStore.videoHistory.find(v => v.video_id === selectedVideoId.value)) {
      selectedVideoId.value = videoStore.videoHistory.length > 0 ? videoStore.videoHistory[0].video_id : null
    }
  }
})

// 删除选中的视频
function deleteSelectedVideo() {
  if (!selectedVideoId.value) return
  
  const video = videoStore.videoHistory.find(v => v.video_id === selectedVideoId.value)
  if (!video) return
  
  deleteVideo(video)
}

// 删除视频（通用函数）
function deleteVideo(video) {
  ElMessageBox.confirm(
    `确定要删除视频 "${video.video_id}" 及其所有帧记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      distinguishCancelAndClose: true
    }
  ).then(() => {
    // 删除视频
    videoStore.deleteHistoryItem(video.id)
    ElMessage.success('视频已删除')
    
    // 自动选择下一个视频
    if (videoStore.videoHistory.length > 0) {
      selectedVideoId.value = videoStore.videoHistory[0].video_id
    } else {
      selectedVideoId.value = null
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getEmotionTagType(emotion) {
  const typeMap = {
    happy: 'success',
    normal: 'info',
    sad: 'warning',
    anger: 'danger',
    fear: 'warning',
    disgust: 'danger',
    surprised: 'primary'
  }
  return typeMap[emotion] || 'info'
}

function getProgressColor(confidence) {
  if (confidence >= 0.8) return '#67c23a'
  if (confidence >= 0.6) return '#e6a23c'
  return '#f56c6c'
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 图表
const dataSourceDonutChart = ref(null)
const emotionPieChart = ref(null)
const emotionTrendChart = ref(null)
const confidenceChart = ref(null)
const timeAnalysisChart = ref(null)
const emotionCalendarChart = ref(null)

const trendPeriod = ref('7d')
const currentYear = ref(new Date().getFullYear())

let dataSourceChartInstance = null

function initDataSourceDonutChart() {
  if (!dataSourceDonutChart.value || totalPredictions.value === 0) return

  if (dataSourceChartInstance) {
    dataSourceChartInstance.dispose()
  }
  dataSourceChartInstance = echarts.init(dataSourceDonutChart.value)

  const chartData = [
    { value: imageCount.value, name: '图片识别', itemStyle: { color: '#8b5cf6' } },
    { value: videoCount.value, name: '视频分析', itemStyle: { color: '#3b82f6' } }
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    chartData.push({ value: 1, name: '暂无', itemStyle: { color: '#e2e8f0' } })
  }

  dataSourceChartInstance.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 次 ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['62%', '82%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      data: chartData
    }]
  }, true)
}

function updateMiddleSectionCharts() {
  nextTick(() => {
    initDataSourceDonutChart()
  })
}

// 初始化饼图
function initPieChart() {
  if (!emotionPieChart.value) return
  
  const chart = echarts.init(emotionPieChart.value)
  
  // 统计情绪分布
  const emotionCounts = {}
  allPredictions.value.forEach(pred => {
    const cn = pred.emotion_cn
    emotionCounts[cn] = (emotionCounts[cn] || 0) + 1
  })
  
  const data = Object.entries(emotionCounts).map(([name, value]) => ({
    name,
    value
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 次 ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [
      {
        name: '情绪分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ],
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
  }
  
  chart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => chart.resize())
}

// 初始化趋势图
function initTrendChart() {
  updateTrendChart()
}

function updateTrendChart() {
  if (!emotionTrendChart.value) return
  
  const chart = echarts.init(emotionTrendChart.value)
  
  // 获取时间范围
  let days = 7
  if (trendPeriod.value === '30d') days = 30
  else if (trendPeriod.value === 'all') days = 365
  
  // 按日期分组
  const dateMap = {}
  const now = new Date()
  
  allPredictions.value.forEach(pred => {
    const date = new Date(pred.timestamp)
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays < days) {
      const dateStr = date.toLocaleDateString('zh-CN')
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {}
      }
      const emotion = pred.emotion_cn
      dateMap[dateStr][emotion] = (dateMap[dateStr][emotion] || 0) + 1
    }
  })
  
  // 准备数据
  const dates = Object.keys(dateMap).sort()
  const emotions = ['生气', '厌恶', '害怕', '高兴', '平静', '悲伤', '惊讶']
  const series = emotions.map(emotion => ({
    name: emotion,
    type: 'line',
    smooth: true,
    data: dates.map(date => dateMap[date][emotion] || 0)
  }))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: emotions,
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: series
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化置信度分布图
function initConfidenceChart() {
  if (!confidenceChart.value) return
  
  const chart = echarts.init(confidenceChart.value)
  
  // 按区间统计
  const ranges = [
    { name: '0-60%', min: 0, max: 0.6, count: 0 },
    { name: '60-70%', min: 0.6, max: 0.7, count: 0 },
    { name: '70-80%', min: 0.7, max: 0.8, count: 0 },
    { name: '80-90%', min: 0.8, max: 0.9, count: 0 },
    { name: '90-100%', min: 0.9, max: 1.0, count: 0 }
  ]
  
  allPredictions.value.forEach(pred => {
    const conf = pred.confidence
    for (const range of ranges) {
      if (conf >= range.min && conf <= range.max) {
        range.count++
        break
      }
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ranges.map(r => r.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '次数',
        type: 'bar',
        data: ranges.map(r => r.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化时段分析图
function initTimeAnalysisChart() {
  if (!timeAnalysisChart.value) return
  
  const chart = echarts.init(timeAnalysisChart.value)
  
  // 按小时统计
  const hourCounts = Array(24).fill(0)
  
  allPredictions.value.forEach(pred => {
    const hour = new Date(pred.timestamp).getHours()
    hourCounts[hour]++
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '识别次数',
        type: 'bar',
        data: hourCounts,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fbc2eb' },
            { offset: 1, color: '#a6c1ee' }
          ])
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化日历热力图
function initCalendarChart() {
  if (!emotionCalendarChart.value) return
  
  const chart = echarts.init(emotionCalendarChart.value)
  
  // 准备日历数据
  const dateMap = {}
  allPredictions.value.forEach(pred => {
    const date = new Date(pred.timestamp)
    const dateStr = date.toISOString().split('T')[0]
    dateMap[dateStr] = (dateMap[dateStr] || 0) + 1
  })
  
  const data = Object.entries(dateMap).map(([date, count]) => [date, count])
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        return `${params.data[0]}<br/>识别次数: ${params.data[1]}`
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...Object.values(dateMap)),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
      inRange: {
        color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
      }
    },
    calendar: {
      top: 80,
      left: 50,
      right: 50,
      cellSize: ['auto', 15],
      range: currentYear.value,
      itemStyle: {
        borderWidth: 0.5
      },
      yearLabel: { show: false }
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}



// 初始化对比图表
const comparisonChart = ref(null)

function initComparisonChart() {
  updateComparisonChart()
}

function updateComparisonChart() {
  if (!comparisonChart.value) return
  
  const chart = echarts.init(comparisonChart.value)
  const now = new Date()
  let currentData = {}
  let previousData = {}
  let currentLabel = ''
  let previousLabel = ''
  
  if (comparisonPeriod.value === 'week') {
    // 本周 vs 上周
    currentLabel = '本周'
    previousLabel = '上周'
    
    allPredictions.value.forEach(pred => {
      const date = new Date(pred.timestamp)
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      const emotion = pred.emotion_cn
      
      if (diffDays < 7) {
        currentData[emotion] = (currentData[emotion] || 0) + 1
      } else if (diffDays >= 7 && diffDays < 14) {
        previousData[emotion] = (previousData[emotion] || 0) + 1
      }
    })
  } else {
    // 本月 vs 上月
    currentLabel = '本月'
    previousLabel = '上月'
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    allPredictions.value.forEach(pred => {
      const date = new Date(pred.timestamp)
      const emotion = pred.emotion_cn
      
      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        currentData[emotion] = (currentData[emotion] || 0) + 1
      } else if (date.getFullYear() === currentYear && date.getMonth() === currentMonth - 1) {
        previousData[emotion] = (previousData[emotion] || 0) + 1
      } else if (currentMonth === 0 && date.getFullYear() === currentYear - 1 && date.getMonth() === 11) {
        previousData[emotion] = (previousData[emotion] || 0) + 1
      }
    })
  }
  
  const emotions = ['生气', '厌恶', '害怕', '高兴', '平静', '悲伤', '惊讶']
  const currentValues = emotions.map(e => currentData[e] || 0)
  const previousValues = emotions.map(e => previousData[e] || 0)
  
  // 计算总数和变化
  const currentTotal = currentValues.reduce((a, b) => a + b, 0)
  const previousTotal = previousValues.reduce((a, b) => a + b, 0)
  const currentPositive = (currentData['高兴'] || 0) + (currentData['平静'] || 0)
  const previousPositive = (previousData['高兴'] || 0) + (previousData['平静'] || 0)
  
  // 更新对比总结
  if (currentTotal > 0 && previousTotal > 0) {
    const change = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1)
    const positiveChange = currentPositive - previousPositive
    
    if (positiveChange > 0) {
      comparisonSummary.value = {
        title: '积极变化 📈',
        type: 'success',
        description: `${currentLabel}相比${previousLabel}，识别次数${change > 0 ? '增加' : '减少'}了${Math.abs(change)}%，积极情绪增加了${positiveChange}次。继续保持！`
      }
    } else if (positiveChange < 0) {
      comparisonSummary.value = {
        title: '需要关注 ⚠️',
        type: 'warning',
        description: `${currentLabel}相比${previousLabel}，积极情绪减少了${Math.abs(positiveChange)}次。建议多参与放松活动，调整心态。`
      }
    } else {
      comparisonSummary.value = {
        title: '保持稳定 ✨',
        type: 'info',
        description: `${currentLabel}相比${previousLabel}，情绪状态保持稳定。`
      }
    }
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [currentLabel, previousLabel],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: emotions
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: previousLabel,
        type: 'bar',
        data: previousValues,
        itemStyle: {
          color: '#91cc75',
          opacity: 0.6
        }
      },
      {
        name: currentLabel,
        type: 'bar',
        data: currentValues,
        itemStyle: {
          color: '#5470c6'
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 视频情绪变化图表
function updateVideoEmotionChart() {
  if (!videoEmotionChart.value || !selectedVideoData.value) return
  
  const chart = echarts.init(videoEmotionChart.value)
  const timeline = selectedVideoData.value.timeline
  
  // 准备数据
  const frameNumbers = timeline.map((_, index) => `帧${index + 1}`)
  const emotionValues = timeline.map(frame => {
    const emotionMap = { anger: 1, disgust: 2, fear: 3, sad: 4, normal: 5, surprised: 6, happy: 7 }
    return emotionMap[frame.emotion] || 5
  })
  const confidenceValues = timeline.map(frame => (frame.confidence * 100).toFixed(1))
  
  // 情绪标签映射
  const emotionLabels = ['', '愤怒', '厌恶', '恐惧', '悲伤', '平静', '惊讶', '开心']
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const frameIndex = params[0].dataIndex
        const frame = timeline[frameIndex]
        return `帧 ${frameIndex + 1}<br/>
                情绪: ${frame.emotion_cn}<br/>
                置信度: ${(frame.confidence * 100).toFixed(1)}%`
      }
    },
    legend: {
      data: ['情绪变化', '置信度'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: frameNumbers,
      axisLabel: {
        interval: Math.floor(timeline.length / 10) || 0,
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '情绪',
        min: 0,
        max: 8,
        interval: 1,
        axisLabel: {
          formatter: (value) => emotionLabels[value] || ''
        }
      },
      {
        type: 'value',
        name: '置信度(%)',
        min: 0,
        max: 100,
        position: 'right'
      }
    ],
    dataZoom: [
      {
        type: 'slider',
        show: timeline.length > 20,
        start: 0,
        end: Math.min(100, (20 / timeline.length) * 100),
        height: 20,
        bottom: 40
      },
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '情绪变化',
        type: 'line',
        data: emotionValues,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#667eea'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
            ]
          }
        }
      },
      {
        name: '置信度',
        type: 'line',
        data: confidenceValues,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#43e97b'
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 导出PDF报告 - 完全基于html2canvas渲染解决中文乱码问题
async function exportPDFReport() {
  try {
    isExporting.value = true
    ElMessage.info('正在生成报告，请稍候...')
    
    // 动态导入库
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')
    
    // 创建PDF实例
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // 创建一个临时DOM元素来渲染所有需要导出的内容
    // 这样可以确保所有中文都能正确显示，而不是直接使用pdf.text()
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'fixed'
    tempContainer.style.top = '0'
    tempContainer.style.left = '-9999px' // 移出可视区域
    tempContainer.style.width = '794px' // A4宽度 (72dpi)
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.padding = '20px'
    tempContainer.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif'
    document.body.appendChild(tempContainer)
    
    // 添加标题
    const title = document.createElement('h1')
    title.style.textAlign = 'center'
    title.style.fontSize = '24px'
    title.style.marginBottom = '10px'
    title.textContent = '情绪识别分析报告'
    tempContainer.appendChild(title)
    
    // 添加生成日期
    const date = document.createElement('p')
    date.style.textAlign = 'center'
    date.style.fontSize = '14px'
    date.style.marginBottom = '20px'
    const formattedDate = `${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN')}`
    date.textContent = `生成日期: ${formattedDate}`
    tempContainer.appendChild(date)
    
    // 添加数据统计部分
    const statsSection = document.createElement('div')
    statsSection.style.marginBottom = '20px'
    
    const statsTitle = document.createElement('h2')
    statsTitle.style.fontSize = '18px'
    statsTitle.style.marginBottom = '10px'
    statsTitle.textContent = '📊 数据统计'
    statsSection.appendChild(statsTitle)
    
    const statsList = document.createElement('ul')
    statsList.style.listStyleType = 'none'
    statsList.style.paddingLeft = '20px'
    
    const statsItems = [
      `总识别次数: ${totalPredictions.value}`,
      `主导情绪: ${dominantEmotion.value}`,
      `平均置信度: ${avgConfidence.value}%`,
      `活跃天数: ${activeDays.value}`
    ]
    
    statsItems.forEach(item => {
      const li = document.createElement('li')
      li.style.fontSize = '14px'
      li.style.marginBottom = '8px'
      li.textContent = item
      statsList.appendChild(li)
    })
    
    statsSection.appendChild(statsList)
    tempContainer.appendChild(statsSection)
    
    // 添加健康评分部分
    const healthSection = document.createElement('div')
    healthSection.style.marginBottom = '20px'
    
    const healthTitle = document.createElement('h2')
    healthTitle.style.fontSize = '18px'
    healthTitle.style.marginBottom = '10px'
    healthTitle.textContent = '💚 情绪健康评分'
    healthSection.appendChild(healthTitle)
    
    const healthList = document.createElement('ul')
    healthList.style.listStyleType = 'none'
    healthList.style.paddingLeft = '20px'
    
    const healthItems = [
      `评分: ${healthScore.value.score}/100 (${healthScore.value.level_text})`,
      `积极情绪占比: ${healthScore.value.positive_rate}%`,
      `消极情绪占比: ${healthScore.value.negative_rate}%`,
      `情绪稳定性: ${healthScore.value.stability}%`
    ]
    
    healthItems.forEach(item => {
      const li = document.createElement('li')
      li.style.fontSize = '14px'
      li.style.marginBottom = '8px'
      li.textContent = item
      healthList.appendChild(li)
    })
    
    healthSection.appendChild(healthList)
    
    // 添加建议
    const adviceTitle = document.createElement('h3')
    adviceTitle.style.fontSize = '16px'
    adviceTitle.style.marginTop = '15px'
    adviceTitle.style.marginBottom = '10px'
    adviceTitle.textContent = '健康建议:'
    healthSection.appendChild(adviceTitle)
    
    const advicePara = document.createElement('p')
    advicePara.style.fontSize = '14px'
    advicePara.style.lineHeight = '1.6'
    advicePara.style.paddingLeft = '20px'
    advicePara.textContent = healthScore.value.advice
    healthSection.appendChild(advicePara)
    
    tempContainer.appendChild(healthSection)
    
    // 等待DOM渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 使用html2canvas渲染整个内容
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // 提高清晰度
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      letterRendering: true, // 确保字体平滑渲染
      timeout: 30000,
      allowTaint: true // 允许加载跨域图像
    })
    
    // 移除临时容器
    document.body.removeChild(tempContainer)
    
    // 计算图像在PDF中的尺寸
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // 如果内容超过一页，需要分割
    let heightLeft = imgHeight
    let position = 0
    let pageNum = 1
    const totalPages = Math.ceil(imgHeight / pageHeight)
    
    // 添加第一页
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // 添加剩余页面（如果需要）
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      pageNum++
    }
    
    // 添加页码
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      // 使用英文页码避免乱码问题
      pdf.text(
        `Page ${i} / Total ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }
    
    // 保存PDF - 使用英文文件名避免编码问题
    const fileName = `emotion_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    ElMessage.success('报告导出成功！')
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('报告导出失败: ' + error.message)
  } finally {
    isExporting.value = false
  }
}

// 初始化所有图表
function initAllCharts() {
  nextTick(() => {
    initDataSourceDonutChart()
    initPieChart()
    initTrendChart()
    initConfidenceChart()
    initTimeAnalysisChart()
    initCalendarChart()
    initComparisonChart()
  })
}

watch(
  () => [totalPredictions.value, imageCount.value, videoCount.value],
  () => updateMiddleSectionCharts()
)

onMounted(() => {
  initAllCharts()
})
</script>

<style scoped>
.analysis-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.25rem;
  padding: 1.5rem 1.75rem;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(241, 245, 249, 0.9);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 0.35rem;
}

.header-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text h1 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-text p {
  color: #94a3b8;
  font-size: 0.88rem;
  margin: 0;
  padding-left: calc(36px + 0.65rem);
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.35rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(124, 77, 255, 0.28);
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
}

.btn-export:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-text p {
    padding-left: 0;
  }
}

/* KPI 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.35rem 1.25rem;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(241, 245, 249, 0.9);
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.06);
}

.kpi-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.kpi-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.kpi-icon.pink { background: linear-gradient(135deg, #f472b6, #fb7185); }
.kpi-icon.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
.kpi-icon.green { background: linear-gradient(135deg, #34d399, #10b981); }

.kpi-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.kpi-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.kpi-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.kpi-value-text {
  font-size: 1.5rem;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  margin-top: 0.35rem;
  position: relative;
}

.kpi-trend.up { color: #22c55e; }
.kpi-trend.up.blue { color: #3b82f6; }
.kpi-trend.down { color: #ef4444; }
.kpi-trend.flat,
.kpi-trend.neutral { color: #94a3b8; }

.trend-arrow {
  font-weight: 700;
}

.kpi-trend.neutral {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.dominant-bar {
  display: block;
  width: 100%;
  max-width: 120px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f472b6, #fb7185);
  transition: width 0.3s;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  margin-bottom: 1rem;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #909399;
  font-size: 0.9rem;
}

/* 中间分析区 */
.middle-section {
  margin-bottom: 1.5rem;
}

.middle-row {
  display: grid;
  grid-template-columns: 0.42fr 0.58fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.panel-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(241, 245, 249, 0.9);
  box-shadow: 0 4px 24px rgba(124, 77, 255, 0.06);
  padding: 1.35rem 1.5rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.35rem;
}

.panel-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  color: #fff;
}

.panel-icon-badge.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.panel-icon-badge.pink { background: linear-gradient(135deg, #f472b6, #fb7185); color: #fff; }
.panel-icon-badge.green { background: linear-gradient(135deg, #34d399, #10b981); }

.panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

/* 数据来源分布 */
.source-panel-body {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.source-donut-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.source-donut {
  width: 100%;
  height: 100%;
}

.source-donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-percent {
  font-size: 1.65rem;
  font-weight: 700;
  color: #7c3aed;
  line-height: 1.2;
}

.donut-label {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.source-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.legend-item {
  display: grid;
  grid-template-columns: 10px auto 1fr auto;
  align-items: center;
  gap: 0.5rem 0.65rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
}

.legend-bar-track {
  height: 5px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.legend-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.legend-value {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
}

/* 情绪分布 */
.emotion-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.15rem;
}

.emotion-bar-row {
  display: grid;
  grid-template-columns: 24px 40px 1fr 38px;
  align-items: center;
  gap: 0.45rem;
}

.emotion-emoji {
  font-size: 1rem;
  text-align: center;
}

.emotion-name {
  font-size: 0.82rem;
  color: #64748b;
}

.emotion-bar-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.emotion-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.emotion-percent {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  text-align: right;
}

/* 情绪健康评分 */
.health-panel {
  padding-bottom: 1.5rem;
}

.health-panel-body {
  display: grid;
  grid-template-columns: minmax(130px, 0.7fr) minmax(220px, 1fr) minmax(340px, 1.45fr);
  gap: 1.25rem;
  align-items: stretch;
}

.health-gauge-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
}

.health-ring-wrap {
  position: relative;
  width: 150px;
  height: 150px;
}

.health-ring-svg {
  width: 100%;
  height: 100%;
}

.health-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ring-score {
  font-size: 2.25rem;
  font-weight: 700;
  color: #6d28d9;
  line-height: 1;
}

.ring-max {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.health-level-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.28rem 0.95rem;
  border-radius: 999px;
}

.health-level-badge.excellent,
.health-level-badge.good {
  color: #16a34a;
  background: #f0fdf4;
}

.health-level-badge.normal {
  color: #d97706;
  background: #fffbeb;
}

.health-level-badge.low,
.health-level-badge.need-attention {
  color: #ef4444;
  background: #fef2f2;
}

.health-middle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding-right: 0.5rem;
}

.health-desc {
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.75;
  margin: 0;
}

.health-breakdown {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 0.85rem;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(124, 77, 255, 0.04);
}

.breakdown-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.breakdown-icon-wrap.positive { background: #f0fdf4; }
.breakdown-icon-wrap.neutral { background: #fffbeb; }
.breakdown-icon-wrap.negative { background: #fef2f2; }

.breakdown-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.breakdown-label {
  font-size: 0.82rem;
  color: #94a3b8;
}

.breakdown-value {
  font-size: 1rem;
  font-weight: 700;
}

.breakdown-value.positive { color: #22c55e; }
.breakdown-value.neutral { color: #f59e0b; }
.breakdown-value.negative { color: #ef4444; }

.health-advice-box {
  position: relative;
  background: linear-gradient(145deg, #f5f3ff 0%, #eef2ff 55%, #f0f9ff 100%);
  border-radius: 16px;
  padding: 1.35rem 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.14);
  height: 100%;
  min-height: 240px;
}

.advice-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
}

.advice-title-icon {
  font-size: 1rem;
}

.advice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  position: relative;
  z-index: 1;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.advice-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.advice-text {
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.55;
  padding-top: 0.15rem;
}

.advice-decoration {
  position: absolute;
  bottom: -12px;
  right: 4px;
  font-size: 4rem;
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
  transform: rotate(-15deg);
}

@media (max-width: 1100px) {
  .middle-row {
    grid-template-columns: 1fr;
  }

  .health-panel-body {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .health-gauge-section {
    padding-top: 0.5rem;
  }

  .health-breakdown {
    gap: 0.65rem;
  }

  .breakdown-item {
    min-width: calc(50% - 0.35rem);
  }
}

@media (max-width: 640px) {
  .source-panel-body {
    flex-direction: column;
  }

  .legend-item {
    grid-template-columns: 10px auto 1fr auto;
  }

  .health-breakdown {
    flex-direction: column;
    gap: 0.85rem;
  }
}

.chart-card {
  margin-bottom: 1.25rem;
  border-radius: 20px !important;
  border: 1px solid rgba(241, 245, 249, 0.9) !important;
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.06) !important;
}

.chart-card :deep(.el-card__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 1rem 1.25rem;
}

.chart-card :deep(.el-card__body) {
  padding: 1rem 1.25rem 1.25rem;
}

.video-analysis-card {
  margin-bottom: 1.25rem;
  border-radius: 20px !important;
  border: 1px solid rgba(241, 245, 249, 0.9) !important;
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.06) !important;
}

.video-analysis-card :deep(.el-card__header) {
  border-bottom: 1px solid #f1f5f9;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.calendar-chart-container {
  width: 100%;
  height: 250px;
}

/* 视频分析卡片 */
.video-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
}

.summary-item {
  text-align: center;
  padding: 15px;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.video-insights {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .stat-content {
    gap: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 300px;
  }
}

/* 对比分析样式 */
.comparison-summary {
  margin-top: 1rem;
}

/* 视频快速选择列表样式 */
.video-quick-list {
  margin-bottom: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  padding: 10px;
}

.video-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-item {
  background: white;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.video-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.video-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-item-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.video-item-info {
  flex: 1;
  min-width: 0;
}

.video-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-item-time {
  font-size: 12px;
  color: #909399;
}
</style>
