<template>
  <div class="history-page">
    <div class="history-panel">
      <!-- 页头 -->
      <header class="page-header">
        <div class="header-icon">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div>
          <h1 class="page-title">识别历史记录</h1>
          <p class="page-subtitle">查看和管理历史情绪识别结果</p>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">全部识别</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.today }}</span>
            <span class="stat-label">今日识别</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.avgConfidence }}%</span>
            <span class="stat-label">平均置信度</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ storageDisplay }}</span>
            <span class="stat-label">存储占用</span>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label>情绪</label>
          <el-select v-model="searchForm.emotion" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option
              v-for="item in emotionOptions"
              :key="item.en"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <label>模型</label>
          <el-select v-model="searchForm.model" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="CNN" value="CNN" />
            <el-option label="VGG" value="VGG" />
            <el-option label="SE81" value="SE81" />
            <el-option label="SE83" value="SE83" />
          </el-select>
        </div>
        <div class="filter-item filter-date">
          <label>时间范围</label>
          <el-config-provider :locale="zhCn">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-config-provider>
        </div>
        <div class="filter-actions">
          <button class="btn-search" @click="search">
            <el-icon><Search /></el-icon>
            搜索
          </button>
          <button class="btn-reset" @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <button class="btn-action" @click="analyzeStorage">
          <el-icon><DataAnalysis /></el-icon>
          分析存储空间
        </button>
        <button class="btn-action danger-text" @click="cleanupStorage">
          <el-icon><MagicStick /></el-icon>
          清理存储空间
        </button>
        <button
          class="btn-action btn-batch-delete"
          :disabled="selectedRecords.length === 0"
          @click="batchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedRecords.length }})
        </button>
      </div>

      <!-- 数据表格 -->
      <div v-if="filteredPredictions.length > 0" class="table-wrap">
        <el-table
          :data="paginatedPredictions"
          class="history-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column label="情绪" min-width="130">
            <template #default="{ row }">
              <span class="emotion-badge" :style="getEmotionBadgeStyle(row.emotion)">
                <span class="emotion-badge-emoji">{{ getEmotionEmoji(row.emotion) }}</span>
                {{ row.emotion_cn }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="置信度" min-width="160">
            <template #default="{ row }">
              <div class="confidence-cell">
                <div class="confidence-bar">
                  <div
                    class="confidence-fill"
                    :style="{
                      width: `${Math.round(row.confidence * 100)}%`,
                      background: getProgressColor(row.confidence)
                    }"
                  ></div>
                </div>
                <span class="confidence-text">{{ Math.round(row.confidence * 100) }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="模型" min-width="90">
            <template #default="{ row }">
              <span class="model-tag">{{ formatModel(row.model_used) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="来源" min-width="130">
            <template #default="{ row }">
              <span v-if="row.source === 'video'" class="source-tag video">
                🎬 视频帧 #{{ row.frame_number }}
              </span>
              <span v-else class="source-tag image">
                <el-icon><Picture /></el-icon>
                图片识别
              </span>
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="170">
            <template #default="{ row }">{{ formatFullTime(row.timestamp) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <button class="link-btn primary" @click="viewDetails(row)">查看详情</button>
              <span class="link-divider">|</span>
              <button class="link-btn danger" @click="deleteRecord(row)">删除</button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-bar">
          <span class="total-text">共 {{ filteredPredictions.length }} 条</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredPredictions.length"
            layout="prev, pager, next, sizes"
            background
            @size-change="handlePageSizeChange"
          />
        </div>
      </div>

      <el-empty v-else :description="isSearching ? '未找到符合条件的记录' : '暂无识别记录'" />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetailDialog" title="识别详情" width="900px" :close-on-click-modal="false">
      <div v-if="selectedPrediction" class="result-content">
        <div class="image-compare" v-if="selectedPrediction.imageUrl || selectedPrediction.preprocessed_image">
          <div class="image-box">
            <div class="image-title">{{ selectedPrediction.source === 'video' ? '视频原始帧' : '原始图片' }}</div>
            <img v-if="selectedPrediction.imageUrl" :src="selectedPrediction.imageUrl" alt="原始图" />
            <div v-else class="no-image">无原始图片</div>
          </div>
          <div class="image-box">
            <div class="image-title">{{ selectedPrediction.source === 'video' ? '检测到的人脸' : '人脸区域' }}</div>
            <img v-if="selectedPrediction.preprocessed_image" :src="selectedPrediction.preprocessed_image" alt="检测到的人脸" />
            <div v-else class="no-image">无人脸区域数据</div>
          </div>
        </div>

        <div class="main-emotion">
          <div class="emotion-icon">{{ getEmotionEmoji(selectedPrediction.emotion) }}</div>
          <div class="emotion-info">
            <h2>{{ selectedPrediction.emotion_cn }}</h2>
            <p class="emotion-en">{{ selectedPrediction.emotion }}</p>
            <el-progress
              :percentage="Math.round(selectedPrediction.confidence * 100)"
              :color="getProgressColor(selectedPrediction.confidence)"
              :stroke-width="20"
            />
            <p class="confidence-text">置信度: {{ (selectedPrediction.confidence * 100).toFixed(2) }}%</p>
          </div>
        </div>

        <el-divider>详细概率分布</el-divider>
        <div class="probability-list" v-if="selectedPrediction.probabilities_cn || selectedPrediction.probabilities">
          <div
            v-for="(prob, emotion) in (selectedPrediction.probabilities_cn || selectedPrediction.probabilities)"
            :key="emotion"
            class="probability-item"
          >
            <div class="prob-label">
              <span class="prob-emoji">{{ getEmotionEmoji(getEnglishEmotion(emotion)) }}</span>
              <span>{{ emotion }}</span>
            </div>
            <el-progress :percentage="Math.round(prob * 100)" :show-text="true" :stroke-width="12" />
          </div>
        </div>

        <div class="meta-info">
          <el-tag>模型: {{ selectedPrediction.model_used }}</el-tag>
          <el-tag type="info">时间: {{ formatFullTime(selectedPrediction.timestamp) }}</el-tag>
          <el-tag v-if="selectedPrediction.id" type="warning">编号: {{ selectedPrediction.id }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="closeDetailDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmotionStore } from '../stores/emotion'
import { useVideoStore } from '../stores/video'
import { ElMessage, ElMessageBox, ElConfigProvider } from 'element-plus'
import {
  Document,
  Folder,
  Calendar,
  TrendCharts,
  Coin,
  Search,
  Refresh,
  DataAnalysis,
  MagicStick,
  Delete,
  Picture
} from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { printStorageReport, analyzeIndexedDB } from '../utils/storageAnalyzer'
import dbHelper, { STORES } from '../utils/indexedDB'

const emotionStore = useEmotionStore()
const videoStore = useVideoStore()

const currentPage = ref(1)
const pageSize = ref(10)
const storageUsedMB = ref(0)

onMounted(async () => {
  if (emotionStore.predictions.length === 0) {
    await emotionStore.loadFromStorage()
  }
  await loadStorageSize()
})

const loadStorageSize = async () => {
  try {
    const report = await analyzeIndexedDB()
    storageUsedMB.value = Number(report.totalMB || 0)
  } catch {
    storageUsedMB.value = 0
  }
}

const storageDisplay = computed(() => {
  if (storageUsedMB.value >= 1024) {
    return `${(storageUsedMB.value / 1024).toFixed(1)} GB`
  }
  if (storageUsedMB.value > 0) {
    return `${storageUsedMB.value.toFixed(1)} MB`
  }
  return '0 MB'
})

const allHistoryRecords = computed(() => {
  const imagePredictions = (emotionStore.predictions || []).map(pred => ({
    ...pred,
    imageUrl: pred.original_image || pred.image,
    preprocessed_image: pred.face_image,
    model_used: pred.model || pred.model_used,
    source: 'image'
  }))

  const videoPredictions = []
  if (videoStore.videoHistory && Array.isArray(videoStore.videoHistory)) {
    videoStore.videoHistory.forEach(video => {
      if (video.results?.timeline && Array.isArray(video.results.timeline)) {
        video.results.timeline.forEach(frame => {
          videoPredictions.push({
            emotion: frame.emotion,
            emotion_cn: frame.emotion_cn,
            confidence: frame.confidence,
            timestamp: video.timestamp,
            video_time: frame.time_formatted,
            time_formatted: frame.time_formatted,
            model_used: video.model || 'CNN',
            source: 'video',
            video_id: video.video_id,
            frame_number: frame.frame_number || frame.frame_index,
            imageUrl: frame.original_frame,
            preprocessed_image: frame.face_image,
            probabilities_cn: frame.probabilities_cn,
            probabilities: frame.probabilities
          })
        })
      }
    })
  }

  return [...imagePredictions, ...videoPredictions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )
})

const showDetailDialog = ref(false)
const selectedPrediction = ref(null)

const searchForm = ref({
  emotion: '',
  model: '',
  dateRange: []
})
const isSearching = ref(false)
const selectedRecords = ref([])

const filteredPredictions = computed(() => {
  if (!isSearching.value) {
    return allHistoryRecords.value
  }

  return allHistoryRecords.value.filter(prediction => {
    if (searchForm.value.emotion) {
      const hasMatch =
        (prediction.emotion_cn && prediction.emotion_cn === searchForm.value.emotion) ||
        (prediction.emotion && cnToEnMap[searchForm.value.emotion] === prediction.emotion)
      if (!hasMatch) return false
    }

    if (searchForm.value.model && !String(prediction.model_used || '').includes(searchForm.value.model)) {
      return false
    }

    if (searchForm.value.dateRange?.length === 2) {
      const [startDate, endDate] = searchForm.value.dateRange
      const predictionDate = new Date(prediction.timestamp).toISOString().split('T')[0]
      if (predictionDate < startDate || predictionDate > endDate) return false
    }

    return true
  })
})

const paginatedPredictions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPredictions.value.slice(start, start + pageSize.value)
})

const stats = computed(() => {
  const records = allHistoryRecords.value
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter(r =>
    new Date(r.timestamp).toISOString().split('T')[0] === todayStr
  )
  const avg = records.length
    ? records.reduce((sum, r) => sum + (r.confidence || 0), 0) / records.length
    : 0

  return {
    total: records.length,
    today: todayRecords.length,
    avgConfidence: records.length ? (avg * 100).toFixed(1) : '0.0'
  }
})

watch(filteredPredictions, () => {
  const maxPage = Math.max(1, Math.ceil(filteredPredictions.value.length / pageSize.value))
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

function handlePageSizeChange() {
  currentPage.value = 1
}

function search() {
  isSearching.value = true
  currentPage.value = 1
}

function resetSearch() {
  searchForm.value = { emotion: '', model: '', dateRange: [] }
  isSearching.value = false
  currentPage.value = 1
}

async function cleanupStorage() {
  ElMessageBox.confirm(
    '此操作将清理历史记录中的图片数据以释放存储空间，但会保留情绪分析结果和统计信息。是否继续？',
    '清理存储空间',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      let username = 'guest'
      if (emotionStore.getCurrentUsername) {
        try {
          const u = await emotionStore.getCurrentUsername()
          if (u) username = u
        } catch {}
      }

      const videoHistory = await dbHelper.getByIndex(STORES.VIDEO_HISTORY, 'username', username)
      if (videoHistory?.length) {
        for (const item of videoHistory) {
          const cleanedItem = {
            ...item,
            results: {
              ...item.results,
              timeline: item.results?.timeline?.map(frame => ({
                frame_number: frame.frame_number,
                frame_index: frame.frame_index,
                timestamp: frame.timestamp,
                time_formatted: frame.time_formatted,
                emotion: frame.emotion,
                emotion_cn: frame.emotion_cn,
                confidence: frame.confidence,
                probabilities: frame.probabilities,
                probabilities_cn: frame.probabilities_cn
              })) || []
            }
          }
          await dbHelper.put(STORES.VIDEO_HISTORY, cleanedItem)
        }
      }

      const currentAnalysis = await dbHelper.get(STORES.VIDEO_ANALYSIS, username)
      if (currentAnalysis) {
        const cleanedAnalysis = {
          ...currentAnalysis,
          analysisResults: {
            ...currentAnalysis.analysisResults,
            timeline: currentAnalysis.analysisResults?.timeline?.map(frame => ({
              frame_number: frame.frame_number,
              frame_index: frame.frame_index,
              timestamp: frame.timestamp,
              time_formatted: frame.time_formatted,
              emotion: frame.emotion,
              emotion_cn: frame.emotion_cn,
              confidence: frame.confidence,
              probabilities: frame.probabilities,
              probabilities_cn: frame.probabilities_cn
            })) || []
          }
        }
        await dbHelper.put(STORES.VIDEO_ANALYSIS, cleanedAnalysis)
      }

      await emotionStore.cleanupImageData?.()
      ElMessage.success('存储空间清理完成！已移除所有历史记录中的图片数据')
      await emotionStore.loadFromStorage?.()
      await videoStore.loadFromStorage?.()
      await loadStorageSize()
    } catch (error) {
      ElMessage.error('清理失败：' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消清理')
  })
}

async function analyzeStorage() {
  try {
    ElMessage.info('正在分析 IndexedDB 存储空间，请查看控制台...')
    const report = await printStorageReport()

    let message = `📊 IndexedDB 存储空间分析\n\n`
    message += `总使用: ${report.indexedDB.totalMB} MB (${report.indexedDB.percentage}%)\n`
    message += `存储限制: ${(report.indexedDB.limit / 1024 / 1024).toFixed(2)} MB\n`
    message += `可用空间: ${((report.indexedDB.limit - report.indexedDB.total) / 1024 / 1024).toFixed(2)} MB\n\n`
    message += `视频历史: ${report.indexedDB.stores.VIDEO_HISTORY?.count || 0} 条\n`
    message += `图片预测: ${report.indexedDB.stores.IMAGE_PREDICTIONS?.count || 0} 条\n`

    ElMessageBox.alert(message, 'IndexedDB 存储空间分析', {
      confirmButtonText: '确定',
      type: report.indexedDB.percentage > 80 ? 'warning' : 'info'
    })
    await loadStorageSize()
  } catch (error) {
    ElMessage.error('分析失败：' + error.message)
  }
}

const emotionEmojiMap = {
  anger: '😠',
  disgust: '🤢',
  fear: '😨',
  happy: '😊',
  normal: '😐',
  sad: '😢',
  surprised: '😲'
}

// RAF-DB 标准 7 类情绪（与后端 EMOTION_LABELS_CN 一致）
const emotionOptions = [
  { label: '生气', en: 'anger' },
  { label: '厌恶', en: 'disgust' },
  { label: '害怕', en: 'fear' },
  { label: '高兴', en: 'happy' },
  { label: '平静', en: 'normal' },
  { label: '悲伤', en: 'sad' },
  { label: '惊讶', en: 'surprised' }
]

const cnToEnMap = Object.fromEntries(emotionOptions.map(item => [item.label, item.en]))

const emotionBadgeColors = {
  anger: { bg: '#fee2e2', color: '#dc2626' },
  disgust: { bg: '#d1fae5', color: '#059669' },
  fear: { bg: '#ede9fe', color: '#7c3aed' },
  happy: { bg: '#fef3c7', color: '#d97706' },
  normal: { bg: '#e2e8f0', color: '#475569' },
  sad: { bg: '#dbeafe', color: '#2563eb' },
  surprised: { bg: '#fce7f3', color: '#db2777' }
}

function getEmotionEmoji(emotion) {
  return emotionEmojiMap[emotion] || '😐'
}

function getEnglishEmotion(cnEmotion) {
  return cnToEnMap[cnEmotion] || 'normal'
}

function getEmotionBadgeStyle(emotion) {
  const style = emotionBadgeColors[emotion] || emotionBadgeColors.normal
  return { background: style.bg, color: style.color }
}

function getProgressColor(confidence) {
  if (confidence >= 0.8) return '#22c55e'
  if (confidence >= 0.6) return '#f59e0b'
  return '#ef4444'
}

function formatModel(model) {
  if (!model) return '-'
  const upper = String(model).toUpperCase()
  if (upper.includes('SE') && upper.includes('81')) return 'SE81'
  if (upper.includes('SE') && upper.includes('83')) return 'SE83'
  if (upper.includes('VGG')) return 'VGG'
  if (upper.includes('CNN')) return 'CNN'
  return model
}

function formatFullTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function viewDetails(row) {
  selectedPrediction.value = JSON.parse(JSON.stringify(row))
  showDetailDialog.value = true
}

function closeDetailDialog() {
  showDetailDialog.value = false
  selectedPrediction.value = null
}

function deleteRecord(row) {
  ElMessageBox.confirm(
    `确定要删除这条${row.source === 'video' ? '视频帧' : '图片识别'}记录吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    if (row.source === 'video') {
      const video = videoStore.videoHistory.find(v => v.video_id === row.video_id)
      if (video) {
        videoStore.deleteHistoryItem(video.id)
        ElMessage.success('已删除该视频的所有帧记录')
      }
    } else if (row.id) {
      emotionStore.deletePrediction(row.id)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('无法删除：记录缺少 ID')
    }
    loadStorageSize()
  }).catch(() => {})
}

function handleSelectionChange(selection) {
  selectedRecords.value = selection
}

function batchDelete() {
  const count = selectedRecords.value.length
  if (count === 0) return

  ElMessageBox.confirm(
    `确定要删除选中的 ${count} 条记录吗？此操作不可恢复！`,
    '批量删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    let successCount = 0
    let failCount = 0

    const imageRecords = selectedRecords.value.filter(r => r.source === 'image')
    const videoIds = new Set(selectedRecords.value.filter(r => r.source === 'video').map(r => r.video_id))

    imageRecords.forEach(record => {
      try {
        if (record.id) {
          emotionStore.deletePrediction(record.id)
          successCount++
        }
      } catch {
        failCount++
      }
    })

    videoIds.forEach(videoId => {
      try {
        const video = videoStore.videoHistory.find(v => v.video_id === videoId)
        if (video) {
          videoStore.deleteHistoryItem(video.id)
          successCount++
        }
      } catch {
        failCount++
      }
    })

    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }

    selectedRecords.value = []
    loadStorageSize()
  }).catch(() => {})
}
</script>

<style scoped>
.history-page {
  width: 100%;
}

.history-panel {
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.08);
  border: 1px solid #f1f5f9;
}

/* 页头 */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ede9fe, #e0e7ff);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.stat-icon.purple { background: #ede9fe; color: #7c3aed; }
.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #ffedd5; color: #ea580c; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  padding: 1.1rem;
  background: #f8fafc;
  border-radius: 14px;
  margin-bottom: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-item label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.filter-item :deep(.el-select) {
  width: 120px;
}

.filter-date :deep(.el-date-editor) {
  width: 260px;
}

.filter-actions {
  display: flex;
  gap: 0.65rem;
  margin-left: auto;
}

.btn-search,
.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-search {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
}

.btn-search:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.btn-reset {
  background: #fff;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-reset:hover {
  border-color: #c7d2fe;
  color: #6366f1;
}

/* 操作栏 */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition: all 0.2s;
}

.btn-action:hover:not(:disabled) {
  border-color: #c7d2fe;
  color: #6366f1;
}

.btn-action.danger-text {
  color: #ef4444;
}

.btn-action.danger-text:hover {
  border-color: #fecaca;
  color: #dc2626;
}

.btn-batch-delete {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-batch-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 表格 */
.table-wrap {
  overflow: hidden;
}

.history-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
}

.history-table :deep(.el-table__row) {
  font-size: 0.9rem;
}

.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.emotion-badge-emoji {
  font-size: 1rem;
}

.confidence-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.confidence-bar {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  max-width: 100px;
}

.confidence-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.confidence-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  min-width: 36px;
}

.model-tag {
  font-weight: 600;
  color: #334155;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #64748b;
}

.source-tag.image {
  color: #6366f1;
}

.link-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
}

.link-btn.primary {
  color: #6366f1;
}

.link-btn.primary:hover {
  color: #4f46e5;
}

.link-btn.danger {
  color: #ef4444;
}

.link-btn.danger:hover {
  color: #dc2626;
}

.link-divider {
  color: #e2e8f0;
  margin: 0 0.4rem;
}

/* 分页 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.total-text {
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-bar :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #6366f1;
}

/* 详情弹窗 */
.result-content {
  padding: 10px 0;
}

.image-compare {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.image-box {
  text-align: center;
  margin-bottom: 20px;
  width: 300px;
}

.image-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.image-box img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.no-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  color: #909399;
}

.main-emotion {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0;
  padding: 20px;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  border-radius: 16px;
  color: white;
}

.emotion-icon {
  font-size: 6rem;
  margin-right: 30px;
}

.emotion-info {
  flex: 1;
  text-align: left;
}

.emotion-info h2 {
  margin: 0 0 10px;
  font-size: 2rem;
}

.emotion-en {
  margin: 0 0 20px;
  opacity: 0.8;
  font-size: 1.1rem;
}

.confidence-text {
  margin: 10px 0 0;
  font-size: 1rem;
  font-weight: bold;
}

.probability-list {
  margin-bottom: 30px;
}

.probability-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.prob-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.prob-emoji {
  font-size: 1.5rem;
  margin-right: 10px;
}

.meta-info {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .history-panel {
    padding: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
  }

  .pagination-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .main-emotion {
    flex-direction: column;
    text-align: center;
  }

  .emotion-icon {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .emotion-info {
    text-align: center;
  }
}
</style>
