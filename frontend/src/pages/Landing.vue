<template>
  <div class="landing-page">
    <div class="bg-grid"></div>
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>

    <header class="landing-header">
      <div class="header-inner">
        <div class="brand" @click="router.push('/')">
          <span class="brand-icon">◆</span>
          <span class="brand-name">心镜</span>
        </div>
        <nav class="header-nav">
          <button class="nav-btn" @click="goLogin">开始测试</button>
        </nav>
      </div>
    </header>

    <main class="landing-main">
      <section class="hero">
        <div class="hero-left">
          <div class="hero-tag">心镜 · 人脸情绪 · 智能识别</div>
          <h1 class="hero-title">心镜</h1>
          <p class="hero-desc">
            基于 RAF-DB 数据集训练的深度学习模型，支持图片与视频的人脸情绪识别。
            涵盖 7 种基本情绪分类，提供可视化分析与心理健康建议，助力情绪洞察与科研学习。
          </p>

          <div class="hero-actions">
            <button class="btn-primary" @click="goLogin">
              <el-icon><User /></el-icon>
              登录并开始
            </button>
            <button class="btn-secondary" @click="goRegister">
              <el-icon><UserFilled /></el-icon>
              注册账号
            </button>
          </div>

          <div class="feature-cards">
            <div
              v-for="item in features"
              :key="item.title"
              class="feature-card"
            >
              <div class="feature-icon-wrap" :class="item.colorClass">
                <el-icon class="feature-icon" :size="20">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="feature-text">
                <div class="feature-title">{{ item.title }}</div>
                <div class="feature-sub">{{ item.sub }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="preview-card">
            <div class="preview-sidebar">
              <div
                v-for="item in sidebarItems"
                :key="item.label"
                class="sidebar-item"
                :class="{ active: item.active }"
              >
                <span class="sidebar-label">{{ item.label }}</span>
              </div>
            </div>

            <div class="preview-content">
              <div class="stat-row">
                <div class="stat-card">
                  <div class="stat-label">识别次数</div>
                  <div class="stat-value">3.6k+</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">平均准确率</div>
                  <div class="stat-value accent">83.7%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">情绪类别</div>
                  <div class="stat-value">7种</div>
                </div>
              </div>

              <div class="chart-area">
                <div class="chart-title">情绪分布 · 近7日</div>
                <div class="chart-body">
                  <div ref="pieChartRef" class="pie-chart"></div>
                  <div class="chart-legend">
                    <div
                      v-for="item in pieLegend"
                      :key="item.name"
                      class="legend-item"
                    >
                      <span class="legend-dot" :style="{ background: item.color }"></span>
                      <span class="legend-name">{{ item.name }}</span>
                      <span class="legend-value">{{ item.value }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="preview-hint">悬停预览可交互</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, h, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { User, UserFilled, Camera, VideoCamera } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const HeartIcon = {
  render() {
    return h('span', { class: 'heart-icon' }, '♥')
  }
}

const router = useRouter()
const pieChartRef = ref(null)
let pieChart = null

const features = [
  {
    icon: Camera,
    title: '图片识别',
    sub: '上传图片快速分析识别表情情绪',
    colorClass: 'icon-purple'
  },
  {
    icon: VideoCamera,
    title: '视频分析',
    sub: '逐帧追踪情绪变化分析情绪趋势',
    colorClass: 'icon-blue'
  },
  {
    icon: HeartIcon,
    title: '健康建议',
    sub: '个性化心理建议关注心理健康',
    colorClass: 'icon-green'
  }
]

const sidebarItems = [
  { label: '总览', active: true },
  { label: '图片识别', active: false },
  { label: '视频分析', active: false },
  { label: '历史记录', active: false }
]

const pieLegend = [
  { name: '开心', value: 22, color: '#667eea' },
  { name: '平静', value: 18, color: '#79bbff' },
  { name: '惊讶', value: 15, color: '#b37feb' },
  { name: '悲伤', value: 14, color: '#8b5cf6' },
  { name: '生气', value: 12, color: '#c4b5fd' },
  { name: '害怕', value: 10, color: '#a78bfa' },
  { name: '厌恶', value: 9, color: '#95a5ff' }
]

const goLogin = () => {
  router.push('/login')
}

const goRegister = () => {
  router.push({ path: '/login', query: { mode: 'register' } })
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        labelLine: { show: false },
        data: pieLegend.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  })
}

const handleResize = () => {
  pieChart?.resize()
}

onMounted(() => {
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #f3edff 0%, #ebe4fb 45%, #e6e9fb 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(102, 126, 234, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.035) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.blob-1 {
  width: 420px;
  height: 420px;
  background: rgba(102, 126, 234, 0.14);
  top: -120px;
  right: -60px;
}

.blob-2 {
  width: 360px;
  height: 360px;
  background: rgba(118, 75, 162, 0.1);
  bottom: -100px;
  left: -80px;
}

.landing-header {
  position: relative;
  z-index: 10;
  padding: 22px 72px;
}

.header-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #6366f1;
}

.header-nav {
  display: flex;
  align-items: center;
}

.nav-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 15px;
  font-weight: 600;
  padding: 11px 24px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.28);
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.34);
}

.landing-main {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 20px 32px 48px;
  display: flex;
  justify-content: center;
}

.hero {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
}

.hero-left {
  flex: 0 1 460px;
  max-width: 460px;
  padding-top: 12px;
}

.hero-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.75);
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 999px;
  margin-bottom: 22px;
  border: 1px solid rgba(102, 126, 234, 0.12);
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
  margin-bottom: 22px;
  letter-spacing: -0.02em;
}

.hero-desc {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.9;
  margin-bottom: 34px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 10px 28px rgba(102, 126, 234, 0.28);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(102, 126, 234, 0.34);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  padding: 18px 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  min-height: 120px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(102, 126, 234, 0.12);
}

.feature-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.icon-purple {
  background: rgba(102, 126, 234, 0.12);
  color: #606266;
}

.icon-blue {
  background: rgba(102, 126, 234, 0.12);
  color: #8b5cf6;
}

.icon-green {
  background: rgba(103, 194, 58, 0.14);
  color: #67c23a;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon :deep(.heart-icon) {
  font-size: 18px;
  color: #67c23a;
  line-height: 1;
}

.feature-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.feature-sub {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}

.hero-right {
  flex: 0 1 520px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.preview-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(102, 126, 234, 0.16);
  display: flex;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.3s, box-shadow 0.3s;
}

.preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 72px rgba(102, 126, 234, 0.2);
}

.preview-sidebar {
  width: 96px;
  background: #f7f8fc;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #eef0f6;
}

.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  color: #9ca3af;
  font-size: 13px;
  border-left: 3px solid transparent;
}

.sidebar-item.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.06);
  border-left-color: #667eea;
  font-weight: 600;
}

.sidebar-label {
  text-align: center;
  line-height: 1.3;
}

.preview-content {
  flex: 1;
  padding: 24px;
  min-width: 0;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.stat-card {
  background: #f8f9fc;
  border-radius: 14px;
  padding: 14px;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.stat-value.accent {
  color: #667eea;
}

.chart-area {
  background: #f8f9fc;
  border-radius: 16px;
  padding: 16px;
}

.chart-title {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 12px;
  font-weight: 600;
}

.chart-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pie-chart {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  color: #6b7280;
  flex: 1;
}

.legend-value {
  color: #374151;
  font-weight: 600;
}

.preview-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 14px;
}

@media (max-width: 1100px) {
  .hero {
    flex-direction: column;
  }

  .hero-left,
  .hero-right {
    max-width: 100%;
    width: 100%;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .landing-header,
  .landing-main {
    padding-left: 24px;
    padding-right: 24px;
  }

  .hero-title {
    font-size: 40px;
  }

  .preview-sidebar {
    display: none;
  }

  .chart-body {
    flex-direction: column;
  }

  .pie-chart {
    width: 160px;
    height: 160px;
  }
}
</style>
