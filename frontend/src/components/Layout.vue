<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <el-button
            class="sidebar-toggle"
            text
            @click="toggleSidebar"
          >
            <el-icon :size="20"><operation /></el-icon>
          </el-button>
          <span class="logo-icon">◆</span>
          <span class="logo-text">心镜</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/app" class="nav-item" exact-active-class="router-link-active">
            <el-icon><home-filled /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/app/data-analysis" class="nav-item" exact-active-class="router-link-active">
            <el-icon><data-analysis /></el-icon>
            <span>数据分析</span>
          </router-link>
          <router-link to="/app/health" class="nav-item" exact-active-class="router-link-active">
            <el-icon><medal /></el-icon>
            <span>心理健康</span>
          </router-link>
          <router-link to="/app/history" class="nav-item" exact-active-class="router-link-active">
            <el-icon><clock /></el-icon>
            <span>历史记录</span>
          </router-link>
          <router-link v-if="userStore.isAdmin" to="/app/admin" class="nav-item" exact-active-class="router-link-active">
            <el-icon><setting /></el-icon>
            <span>管理</span>
          </router-link>
        </nav>
        
        <div class="header-actions">
          <el-switch
            v-model="isDark"
            inline-prompt
            active-icon="Moon"
            inactive-icon="Sunny"
            @change="toggleTheme"
          />
          <el-dropdown
            trigger="click"
            @command="handleNotificationCommand"
            @visible-change="handleNotificationVisible"
            class="notification-dropdown"
          >
            <el-badge :value="unreadNotificationCount" :hidden="unreadNotificationCount === 0" class="notification-badge">
              <el-button circle>
                <el-icon><bell /></el-icon>
              </el-button>
            </el-badge>
            <template #dropdown>
              <el-dropdown-menu class="notification-menu">
                <el-dropdown-item disabled class="notification-header-item">
                  最近识别
                </el-dropdown-item>
                <template v-if="recentNotifications.length > 0">
                  <el-dropdown-item
                    v-for="item in recentNotifications"
                    :key="item.id"
                    :command="item"
                  >
                    <div class="notification-item">
                      <span class="notification-type">{{ item.typeLabel }}</span>
                      <span class="notification-title">{{ item.title }}</span>
                      <span class="notification-time">{{ item.timeText }}</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="view-all">
                    查看全部历史
                  </el-dropdown-item>
                </template>
                <el-dropdown-item v-else disabled>
                  暂无识别记录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 用户信息下拉菜单 -->
          <el-dropdown @command="handleUserCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                <el-icon><user /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
              <el-icon><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><user /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><setting /></el-icon>
                  账户设置
                </el-dropdown-item>
                <el-dropdown-item command="help" divided>
                  <el-icon><question-filled /></el-icon>
                  帮助中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><switch-button /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 侧边栏 -->
    <aside :class="['sidebar', { 'sidebar-collapsed': !sidebarExpanded }]">
      <div class="sidebar-header">
        <div v-if="sidebarExpanded" class="sidebar-section-title">
          <span class="sidebar-title-spacer" aria-hidden="true"></span>
          <span>智能分析</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/app/image-analysis" class="sidebar-item" exact-active-class="router-link-active" title="图片识别">
          <el-icon><camera /></el-icon>
          <span v-if="sidebarExpanded">图片识别</span>
        </router-link>
        <router-link to="/app/video" class="sidebar-item" exact-active-class="router-link-active" title="视频分析">
          <el-icon><video-camera /></el-icon>
          <span v-if="sidebarExpanded">视频分析</span>
        </router-link>
        <el-divider v-if="sidebarExpanded" />
        <router-link to="/app/user" class="sidebar-item" exact-active-class="router-link-active" title="个人中心">
          <el-icon><user /></el-icon>
          <span v-if="sidebarExpanded">个人中心</span>
        </router-link>
        <router-link to="/app/about" class="sidebar-item" exact-active-class="router-link-active" title="关于系统">
          <el-icon><info-filled /></el-icon>
          <span v-if="sidebarExpanded">关于系统</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main :class="['main-content', { 'sidebar-collapsed': !sidebarExpanded }]">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>

    <!-- 底部 -->
    <footer :class="['footer', { 'sidebar-collapsed': !sidebarExpanded }]">
      <div class="footer-content">
        <div class="footer-section">
          <h4>关于系统</h4>
          <p>基于深度学习的人脸情绪识别系统</p>
          <p>支持7种情绪分类识别</p>
        </div>
        <div class="footer-section">
          <h4>快速链接</h4>
          <router-link to="/app/about">关于我们</router-link>
          <router-link to="/app/help">帮助中心</router-link>
          <a href="#" @click.prevent="showPrivacy">隐私政策</a>
        </div>
        <div class="footer-section">
          <h4>联系我们</h4>
          <p>📧 support@emotion-ai.com</p>
          <p>📱 +86 138-0000-0000</p>
        </div>
        <div class="footer-section">
          <h4>技术栈</h4>
          <p>Vue 3 + Element Plus</p>
          <p>Flask + TensorFlow</p>
          <p>CNN + VGG16 + SE-Net</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 心镜 · 情绪识别系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmotionStore } from '../stores/emotion'
import { useVideoStore } from '../stores/video'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  DataAnalysis,
  Medal,
  Clock,
  User,
  InfoFilled,
  Bell,
  ArrowDown,
  Setting,
  QuestionFilled,
  SwitchButton,
  Tools,
  VideoCamera,
  Camera,
  Operation
} from '@element-plus/icons-vue'

const router = useRouter()
const emotionStore = useEmotionStore()
const videoStore = useVideoStore()
const userStore = useUserStore()
const isDark = ref(false)
const sidebarExpanded = ref(true)
const lastReadAt = ref(0)

const getNotificationReadKey = () => {
  const username = userStore.userInfo?.username || 'guest'
  return `notification_read_${username}`
}

const loadLastReadAt = () => {
  const saved = localStorage.getItem(getNotificationReadKey())
  lastReadAt.value = saved ? Number(saved) : 0
}

const markNotificationsAsRead = () => {
  lastReadAt.value = Date.now()
  localStorage.setItem(getNotificationReadKey(), String(lastReadAt.value))
}

const getItemTimestamp = (item, type) => {
  if (type === 'image') {
    return new Date(item.timestamp || item.id).getTime()
  }
  return new Date(item.timestamp).getTime()
}

const unreadNotificationCount = computed(() => {
  let count = 0

  emotionStore.predictions.forEach(pred => {
    if (getItemTimestamp(pred, 'image') > lastReadAt.value) count++
  })

  videoStore.videoHistory.forEach(item => {
    if (getItemTimestamp(item, 'video') > lastReadAt.value) count++
  })

  return count
})

const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  return `${Math.floor(diff / 86400000)} 天前`
}

const recentNotifications = computed(() => {
  const imageItems = emotionStore.predictions.map(pred => ({
    id: `image-${pred.id}`,
    type: 'image',
    typeLabel: '图片',
    title: pred.emotion_cn || pred.emotion || '情绪识别',
    timeText: formatNotificationTime(pred.timestamp || pred.id),
    raw: pred
  }))

  const videoItems = videoStore.videoHistory.map(item => ({
    id: `video-${item.id}`,
    type: 'video',
    typeLabel: '视频',
    title: item.video_info?.filename || '视频分析',
    timeText: formatNotificationTime(item.timestamp),
    raw: item
  }))

  return [...imageItems, ...videoItems]
    .sort((a, b) => {
      const timeA = a.type === 'image'
        ? (a.raw.timestamp || a.raw.id)
        : a.raw.timestamp
      const timeB = b.type === 'image'
        ? (b.raw.timestamp || b.raw.id)
        : b.raw.timestamp
      return new Date(timeB) - new Date(timeA)
    })
    .slice(0, 5)
})

const handleNotificationVisible = (visible) => {
  if (visible) {
    markNotificationsAsRead()
  }
}

const handleNotificationCommand = (command) => {
  markNotificationsAsRead()

  if (command === 'view-all') {
    router.push('/app/history')
    return
  }

  if (command.type === 'image') {
    emotionStore.currentPrediction = command.raw
    router.push('/app/image-analysis')
    return
  }

  if (command.type === 'video') {
    router.push('/app/video')
  }
}

const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value
  localStorage.setItem('sidebarExpanded', sidebarExpanded.value)
}

// 初始化侧边栏状态
onMounted(() => {
  loadLastReadAt()

  const savedSidebarState = localStorage.getItem('sidebarExpanded')
  if (savedSidebarState !== null) {
    sidebarExpanded.value = savedSidebarState === 'true'
  }
})

watch(
  () => userStore.userInfo?.username,
  () => {
    loadLastReadAt()
  }
)

const toggleTheme = (value) => {
  if (value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
    // 更新User.vue中的settings
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
    if (userSettings) {
      userSettings.theme = 'dark'
      localStorage.setItem('userSettings', JSON.stringify(userSettings))
    }
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
    // 更新User.vue中的settings
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
    if (userSettings) {
      userSettings.theme = 'light'
      localStorage.setItem('userSettings', JSON.stringify(userSettings))
    }
  }
}

const showPrivacy = () => {
  ElMessage.info('隐私政策页面开发中...')
}

// 处理用户下拉菜单命令
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/app/user')
      break
    case 'settings':
      router.push('/app/settings')
      break
    case 'help':
      ElMessage.info('帮助中心页面开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认退出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userStore.logout()
    router.push('/')
  } catch (error) {
    // 用户取消登出
  }
}

// 保存Layout中的主题变化监听器引用
let layoutThemeListener = null

onMounted(() => {
  // 检查本地存储的主题设置
  const savedTheme = localStorage.getItem('theme')
  const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
  
  // 优先使用userSettings中的主题设置
  if (userSettings && userSettings.theme) {
    if (userSettings.theme === 'dark') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    } else if (userSettings.theme === 'auto') {
      // 跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
      document.documentElement.classList.toggle('dark', prefersDark)
      
      // 移除之前可能存在的监听器
      if (layoutThemeListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', layoutThemeListener)
      }
      
      // 创建并添加新的监听器
      layoutThemeListener = (e) => {
        // 重新获取最新的userSettings，确保使用最新的主题设置
        const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
        if (currentSettings && currentSettings.theme === 'auto') {
          isDark.value = e.matches
          document.documentElement.classList.toggle('dark', e.matches)
        }
      }
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', layoutThemeListener)
    }
  } else if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (layoutThemeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', layoutThemeListener)
    layoutThemeListener = null
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #f5f3ff 0%, #ede9fe 35%, #f0f4ff 100%);
  background-attachment: fixed;
}

/* 顶部导航 */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: none;
  width: 100%;
  margin: 0;
  padding: 0 2rem 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #6366f1;
  margin-left: 0;
  flex-shrink: 0;
}

.sidebar-toggle {
  color: #6366f1;
  font-size: 1.2rem;
  padding: 0.25rem;
  margin-left: -0.15rem;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
  font-size: 1rem;
  margin-right: 0;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: #606266;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}

.nav-item.router-link-active {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
  box-shadow: none;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-badge {
  cursor: pointer;
}

.notification-dropdown {
  cursor: pointer;
}

:deep(.notification-menu) {
  min-width: 280px;
  max-width: 320px;
}

.notification-header-item {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b !important;
  cursor: default;
}

.notification-header-item.is-disabled {
  opacity: 1;
}

.notification-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  line-height: 1.4;
}

.notification-type {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
}

.notification-title {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 500;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* 用户下拉菜单样式 */
.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(99, 102, 241, 0.08);
}

.username {
  font-weight: 500;
  color: #606266;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0;
  width: 240px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 0.75rem 0.5rem 0.5rem;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #303133;
}

.sidebar-title-spacer {
  width: 1.25rem;
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #606266;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.sidebar-nav :deep(.el-divider) {
  margin: 0.5rem 1rem;
}

.sidebar-collapsed .sidebar-item {
  justify-content: center;
  padding: 0.875rem;
}

.sidebar-collapsed .sidebar-item span {
  display: none;
}

.sidebar-item:hover {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}

.sidebar-item.router-link-active {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.sidebar-item .el-icon {
  font-size: 1.25rem;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 2rem 0 4rem 0;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - 70px);
}

.main-content.sidebar-collapsed {
  margin-left: 64px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

/* 底部 */
.footer {
  background: rgba(255, 255, 255, 0.95);
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  backdrop-filter: blur(10px);
  margin-top: 4rem;
  padding: 3rem 0 1rem;
}

.footer.sidebar-collapsed {
  margin-left: 64px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: #303133;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-section p,
.footer-section a {
  color: #606266;
  margin: 0.5rem 0;
  text-decoration: none;
  display: block;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #6366f1;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e4e7ed;
  color: #909399;
}

/* 响应式 */
@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
  }
  
  .sidebar-header span {
    display: none;
  }
  
  .sidebar-item {
    justify-content: center;
    padding: 0.875rem;
  }
  
  .sidebar-item span {
    display: none;
  }
  
  .main-content {
    margin-left: 64px;
  }
  
  .footer {
    margin-left: 64px;
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .content-wrapper {
    padding: 0 1rem 2rem 1rem;
  }
  
  .sidebar {
    width: 0;
    overflow: hidden;
  }
  
  .sidebar.sidebar-expanded-mobile {
    width: 240px;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .footer {
    margin-left: 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}
</style>
