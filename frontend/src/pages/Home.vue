<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">心镜</h1>
        <p class="hero-subtitle">基于深度学习的人脸情绪分析平台</p>
        <p class="hero-description">利用先进的卷积神经网络技术，准确识别 7 种基本情绪表情</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="goToImageAnalysis">
            <el-icon><Camera /></el-icon>
            开始图片识别
          </button>
          <button class="btn-outline" @click="goToVideoAnalysis">
            <el-icon><VideoCamera /></el-icon>
            视频情绪分析
          </button>
        </div>
      </div>

      <div class="hero-emotion-card">
        <h3 class="emotion-card-title">情绪识别类型</h3>
        <div class="emotion-showcase">
          <div class="emotion-showcase-row">
            <div
              v-for="(emotion, index) in emotions.slice(0, 3)"
              :key="index"
              class="emotion-item"
            >
              <span class="emotion-circle" :style="{ background: emotion.bg }">
                <span class="emotion-emoji">{{ emotion.emoji }}</span>
              </span>
              <span class="emotion-name">{{ emotion.name }}</span>
            </div>
          </div>
          <div class="emotion-showcase-row">
            <div
              v-for="(emotion, index) in emotions.slice(3)"
              :key="index + 3"
              class="emotion-item"
            >
              <span class="emotion-circle" :style="{ background: emotion.bg }">
                <span class="emotion-emoji">{{ emotion.emoji }}</span>
              </span>
              <span class="emotion-name">{{ emotion.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section class="features-section">
      <h2 class="section-title">
        <span class="title-spark">✨</span>
        核心功能
      </h2>
      <div class="features-grid">
        <div
          v-for="feature in visibleFeatures"
          :key="feature.title"
          class="feature-card"
          @click="handleFeatureClick(feature.route)"
        >
          <div class="feature-icon" :style="{ background: feature.color }">
            {{ feature.icon }}
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.description }}</p>
          <span class="feature-arrow" :style="{ color: feature.arrowColor }">
            <el-icon><ArrowRight /></el-icon>
          </span>
        </div>
      </div>
    </section>

    <!-- AI 模型介绍 -->
    <section class="models-section">
      <h2 class="section-title">
        <span class="title-spark">🧠</span>
        AI 模型
      </h2>
      <div class="models-grid">
        <div v-for="model in models" :key="model.name" class="model-card">
          <div v-if="model.recommended" class="model-badge">⭐ 推荐</div>
          <div class="model-name">{{ model.name }}</div>
          <div class="model-accuracy">
            <el-progress
              type="circle"
              :percentage="model.accuracy"
              :width="80"
              :color="model.color"
            />
          </div>
          <div class="model-features">
            <el-tag v-for="tag in model.tags" :key="tag" size="small" class="model-tag">
              {{ tag }}
            </el-tag>
          </div>
          <p class="model-desc">{{ model.description }}</p>
        </div>
      </div>
    </section>

    <!-- 快速开始指南 -->
    <section class="quick-start-section">
      <div class="quick-start-card">
        <h2 class="section-title section-title-left">
          <span class="title-spark">🚀</span>
          快速开始
        </h2>
        <el-steps :active="0" align-center>
          <el-step title="上传图片" description="支持 JPG/PNG 格式" icon="Upload" />
          <el-step title="选择模型" description="4 种 AI 模型可选" icon="Setting" />
          <el-step title="开始识别" description="快速分析情绪" icon="View" />
          <el-step title="查看结果" description="详细情绪报告" icon="Document" />
        </el-steps>
        <div class="quick-start-actions">
          <button class="btn-primary" @click="goToImageAnalysis">
            立即体验
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
      </div>
    </section>

    <!-- 最近识别历史 -->
    <section v-if="emotionStore.predictions.length > 0" class="recent-section">
      <h2 class="section-title">
        <span class="title-spark">🕐</span>
        最近识别
      </h2>
      <div class="recent-grid">
        <div
          v-for="(pred, index) in recentPredictions"
          :key="index"
          class="recent-card"
          @click="viewPrediction(pred)"
        >
          <div class="recent-image">
            <img :src="pred.preprocessed_image || pred.image" alt="识别图片" />
            <div class="recent-overlay">
              <span class="recent-emotion">{{ pred.emotion_cn }}</span>
            </div>
          </div>
          <div class="recent-info">
            <el-tag :type="getConfidenceType(pred.confidence)">
              {{ (pred.confidence * 100).toFixed(1) }}%
            </el-tag>
            <span class="recent-time">{{ formatTime(pred.timestamp) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmotionStore } from '../stores/emotion'
import { useUserStore } from '../stores/user'
import { Camera, VideoCamera, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const emotionStore = useEmotionStore()
const userStore = useUserStore()

const emotions = [
  { emoji: '😊', name: '开心', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { emoji: '😢', name: '悲伤', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
  { emoji: '😱', name: '惊讶', bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
  { emoji: '😠', name: '愤怒', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
  { emoji: '😰', name: '恐惧', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
  { emoji: '🤢', name: '厌恶', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
  { emoji: '😐', name: '平静', bg: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }
]

const features = [
  {
    icon: '📷',
    title: '图片识别',
    description: '上传图片快速识别情绪',
    route: '/app/image-analysis',
    color: 'linear-gradient(135deg, #818cf8, #6366f1)',
    arrowColor: '#6366f1'
  },
  {
    icon: '🎬',
    title: '视频分析',
    description: '逐帧分析视频情绪变化',
    route: '/app/video',
    color: 'linear-gradient(135deg, #c084fc, #a855f7)',
    arrowColor: '#a855f7'
  },
  {
    icon: '📊',
    title: '数据分析',
    description: '可视化情绪统计图表',
    route: '/app/data-analysis',
    color: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    arrowColor: '#3b82f6'
  },
  {
    icon: '💚',
    title: '心理健康',
    description: '个性化心理健康建议',
    route: '/app/health',
    color: 'linear-gradient(135deg, #34d399, #10b981)',
    arrowColor: '#10b981'
  },
  {
    icon: '📜',
    title: '历史记录',
    description: '查看所有识别历史',
    route: '/app/history',
    color: 'linear-gradient(135deg, #f472b6, #ec4899)',
    arrowColor: '#ec4899'
  },
  {
    icon: '👤',
    title: '个人中心',
    description: '管理个人信息和设置',
    route: '/app/user',
    color: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    arrowColor: '#06b6d4'
  },
  {
    icon: '⚙️',
    title: '系统管理',
    description: '用户和权限管理',
    route: '/app/admin',
    color: 'linear-gradient(135deg, #fb923c, #f97316)',
    arrowColor: '#f97316',
    adminOnly: true
  },
  {
    icon: '❓',
    title: '关于系统',
    description: '了解系统详细信息',
    route: '/app/about',
    color: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    arrowColor: '#8b5cf6'
  }
]

const models = [
  {
    name: 'CNN',
    accuracy: 83.77,
    color: '#6366f1',
    recommended: true,
    tags: ['快速', '准确'],
    description: '经典卷积神经网络，平衡速度与精度'
  },
  {
    name: 'VGG16',
    accuracy: 80,
    color: '#a855f7',
    recommended: false,
    tags: ['稳定', '可靠'],
    description: '深度网络结构，特征提取能力强'
  },
  {
    name: 'SE-Net 81',
    accuracy: 81,
    color: '#3b82f6',
    recommended: false,
    tags: ['注意力', '高效'],
    description: '通道注意力机制，提升关键特征'
  },
  {
    name: 'SE-Net 83',
    accuracy: 83,
    color: '#10b981',
    recommended: true,
    tags: ['最优', '精确'],
    description: '优化版 SE 网络，最佳识别效果'
  }
]

const visibleFeatures = computed(() =>
  features.filter(f => !f.adminOnly || userStore.isAdmin)
)

const recentPredictions = computed(() => emotionStore.predictions.slice(0, 4))

const handleFeatureClick = (route) => {
  if (route) router.push(route)
}

const goToImageAnalysis = () => router.push('/app/image-analysis')
const goToVideoAnalysis = () => router.push('/app/video')

const viewPrediction = (pred) => {
  emotionStore.currentPrediction = pred
  router.push('/app/image-analysis')
  ElMessage.info('已加载识别记录')
}

const getConfidenceType = (confidence) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'info'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

onMounted(() => {})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Hero */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding: 3rem;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(237, 233, 254, 0.9) 0%, rgba(224, 231, 255, 0.75) 50%, rgba(245, 243, 255, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
}

.hero-content {
  flex: 1;
  max-width: 560px;
}

.hero-title {
  font-size: 3.25rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.15;
}

.hero-subtitle {
  font-size: 1.35rem;
  color: #475569;
  margin: 0 0 0.5rem;
  font-weight: 600;
}

.hero-description {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 1.75rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.btn-outline {
  background: #fff;
  color: #6366f1;
  border: 1.5px solid #c7d2fe;
}

.btn-outline:hover {
  background: #f5f3ff;
  border-color: #a5b4fc;
}

/* Emotion card */
.hero-emotion-card {
  flex: 0 1 420px;
  background: #fff;
  border-radius: 20px;
  padding: 1.75rem 1.5rem;
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.9);
}

.emotion-card-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 1.5rem;
}

.emotion-showcase {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.emotion-showcase-row {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
}

.emotion-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.emotion-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.emotion-item:hover .emotion-circle {
  transform: scale(1.08);
}

.emotion-emoji {
  font-size: 2rem;
}

.emotion-name {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

/* Section titles */
.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.75rem;
}

.section-title-left {
  justify-content: flex-start;
}

.title-spark {
  font-size: 1.25rem;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.feature-card {
  position: relative;
  background: #fff;
  border-radius: 18px;
  padding: 1.5rem 1.25rem 2.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.06);
  cursor: pointer;
  transition: all 0.25s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
  border-color: #e0e7ff;
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.4rem;
}

.feature-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.feature-arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.feature-card:hover .feature-arrow {
  background: #eef2ff;
}

/* Models */
.models-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.model-card {
  position: relative;
  background: #fff;
  border-radius: 18px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.06);
  transition: all 0.25s;
}

.model-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
}

.model-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #fde68a, #fbbf24);
  color: #78350f;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.model-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.model-accuracy {
  margin-bottom: 1rem;
}

.model-features {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.model-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

/* Quick start */
.quick-start-card {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.06);
}

.quick-start-actions {
  text-align: center;
  margin-top: 2rem;
}

/* Recent */
.recent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.recent-card {
  background: #fff;
  border-radius: 16px;
  padding: 0.75rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.06);
  cursor: pointer;
  transition: all 0.25s;
  overflow: hidden;
}

.recent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.12);
}

.recent-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.recent-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.recent-card:hover .recent-image img {
  transform: scale(1.06);
}

.recent-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
  padding: 0.6rem 0.75rem;
}

.recent-emotion {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
}

.recent-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.25rem;
}

.recent-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 1200px) {
  .features-grid,
  .models-grid,
  .recent-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-emotion-card {
    flex: none;
    width: 100%;
    max-width: 420px;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .features-grid,
  .models-grid,
  .recent-grid {
    grid-template-columns: 1fr;
  }

  .emotion-showcase-row {
    gap: 0.75rem;
  }

  .emotion-circle {
    width: 52px;
    height: 52px;
  }

  .emotion-emoji {
    font-size: 1.5rem;
  }
}
</style>
