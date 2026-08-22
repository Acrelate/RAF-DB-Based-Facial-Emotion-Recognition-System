<template>
  <div class="user-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-wave header-wave-1"></div>
      <div class="header-wave header-wave-2"></div>
      <span class="header-spark spark-1">✦</span>
      <span class="header-spark spark-2">✦</span>
      <div class="header-content">
        <div class="header-text">
          <div class="header-title-row">
            <span class="header-icon-badge">
              <el-icon :size="20"><UserFilled /></el-icon>
            </span>
            <h1>个人中心</h1>
          </div>
          <p>管理您的个人信息和偏好设置</p>
        </div>
        <p class="header-quote">"关心自己的内心，是一件很重要的事"</p>
      </div>
    </div>

    <div class="user-layout">
      <!-- 左侧：用户信息 -->
      <aside class="user-sidebar">
        <el-card class="profile-card user-panel" shadow="hover">
          <div class="profile-header">
            <div class="avatar-wrap" @click="viewAvatar">
              <el-avatar :size="100" :src="userInfo.avatar" class="profile-avatar">
                <el-icon :size="44"><UserFilled /></el-icon>
              </el-avatar>
            </div>
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-change="handleAvatarChange"
              accept="image/*"
              :auto-upload="false"
            >
              <el-button class="avatar-upload" size="small" circle>
                <el-icon><Camera /></el-icon>
              </el-button>
            </el-upload>
          </div>
          
          <div class="profile-info">
            <p class="user-email">{{ displayEmail }}</p>
            <span :class="['role-badge', { admin: isAdminUser }]">
              <span v-if="isAdminUser" class="role-crown">👑</span>
              {{ roleBadgeText }}
            </span>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ totalRecognitions }}</div>
              <div class="stat-label">总识别次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ activeDays }}</div>
              <div class="stat-label">活跃天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ displayMemberDays }}</div>
              <div class="stat-label">会员天数</div>
            </div>
          </div>

          <nav class="profile-menu">
            <button
              v-for="item in profileMenuItems"
              :key="item.key"
              type="button"
              class="profile-menu-item"
              @click="handleProfileMenu(item)"
            >
              <span class="menu-item-left">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </span>
              <el-icon class="menu-arrow"><ArrowRight /></el-icon>
            </button>
          </nav>

          <div class="profile-actions">
            <el-button type="primary" class="btn-edit-profile" @click="editProfileDialog = true" block>
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
            <el-button class="btn-change-password" @click="changePasswordDialog = true" block>
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
          </div>
        </el-card>

        <!-- 快速操作 -->
        <el-card class="quick-actions-card user-panel user-panel-fill" shadow="hover">
          <template #header>
            <span>⚡ 快速操作</span>
          </template>
          <div class="quick-actions">
            <el-upload
              class="upload-full-width"
              :show-file-list="false"
              :before-upload="beforeImportData"
              :on-change="handleImportData"
              accept=".json"
              :auto-upload="false"
            >
              <el-button class="action-btn">
                <el-icon><upload /></el-icon>
                <span>导入数据备份</span>
              </el-button>
            </el-upload>
            <el-button @click="exportAllData" class="action-btn">
              <el-icon><download /></el-icon>
              <span>导出所有数据</span>
            </el-button>
            <el-button @click="clearHistory" class="action-btn">
              <el-icon><delete /></el-icon>
              <span>清空历史记录</span>
            </el-button>
            <el-button @click="syncToCloud" class="action-btn">
              <el-icon><upload-filled /></el-icon>
              <span>同步到云端</span>
            </el-button>
          </div>
        </el-card>
      </aside>

      <!-- 右侧：成就与统计 -->
      <section class="user-main">
        <el-card class="achievements-card user-panel" shadow="hover">
          <template #header>
            <div class="achievements-header">
              <div class="achievements-title-group">
                <span class="achievements-trophy">🏆</span>
                <div>
                  <div class="achievements-title">成就徽章</div>
                  <div class="achievements-subtitle">记录您的情绪成长历程</div>
                </div>
              </div>
              <span class="achievements-count">已解锁 {{ unlockedCount }}/{{ totalAchievements }}</span>
            </div>
          </template>
          <div class="achievements-grid">
            <div
              v-for="achievement in achievements"
              :key="achievement.id"
              :class="['achievement-item', { unlocked: achievement.unlocked, locked: !achievement.unlocked }]"
              @click="showAchievementDetail(achievement)"
            >
              <span v-if="achievement.unlocked" class="achievement-check">✓</span>
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.desc }}</div>
                <template v-if="!achievement.unlocked">
                  <div class="achievement-progress-row">
                    <el-progress
                      :percentage="getAchievementProgress(achievement)"
                      :stroke-width="6"
                      :show-text="false"
                      class="achievement-progress-bar"
                    />
                    <span class="achievement-progress-text">{{ getAchievementProgressText(achievement) }}</span>
                  </div>
                </template>
                <div v-else class="achievement-unlocked">
                  ✅ 已解锁 · {{ formatDate(achievement.unlockedAt) }}
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 使用统计 -->
        <el-card class="stats-card user-panel" shadow="hover">
          <template #header>
            <span>📊 使用统计</span>
          </template>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-box-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                📅
              </div>
              <div class="stat-box-content">
                <div class="stat-box-value">{{ consecutiveDays }}</div>
                <div class="stat-box-label">连续使用天数</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-box-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                ⚡
              </div>
              <div class="stat-box-content">
                <div class="stat-box-value">{{ todayCount }}</div>
                <div class="stat-box-label">今日识别次数</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-box-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                🎯
              </div>
              <div class="stat-box-content">
                <div class="stat-box-value">{{ userLevel }}</div>
                <div class="stat-box-label">当前等级</div>
              </div>
            </div>
          </div>
          <el-divider />
          <div class="level-progress">
            <div class="level-info">
              <span>等级进度</span>
              <span>{{ experiencePoints }}/{{ nextLevelExp }} EXP</span>
            </div>
            <el-progress
              :percentage="levelProgress"
              :stroke-width="12"
              :color="getLevelColor()"
            >
              <template #default="{ percentage }">
                <span style="font-weight: bold">{{ percentage }}%</span>
              </template>
            </el-progress>
          </div>
        </el-card>

        <!-- 小贴士 -->
        <div class="tip-banner user-panel">
          <div class="tip-content">
            <span class="tip-icon">💜</span>
            <span class="tip-text">
              <strong>小贴士</strong>
              持续记录情绪，探索内心世界，你已经做得很棒了！
            </span>
          </div>
          <button type="button" class="tip-action" @click="goToAnalysis">
            去数据分析 →
          </button>
        </div>
      </section>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editProfileDialog" title="编辑资料" width="500px">
      <el-form :model="userInfo" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userInfo.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userInfo.email" type="email" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="userInfo.phone" />
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="userInfo.birthday" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="userInfo.bio" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editProfileDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="changePasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 头像裁剪对话框 -->
    <el-dialog v-model="avatarCropDialog" title="裁剪头像" width="600px">
      <div class="avatar-crop-container">
        <div class="crop-preview">
          <div class="avatar-crop-frame">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview" 
              ref="cropImage"
              @mousedown="startDrag"
              :style="{
                transform: `scale(${cropZoom}) translate(${cropPosition.x}px, ${cropPosition.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'transform 0.1s ease'
              }"
              style="display: block;"
            />
          </div>
          <!-- 裁剪框指示 -->
          <div class="crop-mask">
            <div class="crop-indicator"></div>
          </div>
        </div>
        <div class="crop-controls">
          <el-slider v-model="cropZoom" :min="0.1" :max="3" :step="0.05" style="margin: 1rem 0">
            <template #label>
              缩放: {{ cropZoom.toFixed(2) }}x
            </template>
          </el-slider>
          <div class="crop-instructions">
            <el-icon><info-filled /></el-icon>
            拖动图片调整位置，使用滑块调整缩放比例
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="avatarCropDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAvatar">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 查看头像大图对话框 -->
    <el-dialog v-model="viewAvatarDialog" title="查看头像" width="400px">
      <div class="avatar-view-container">
        <img :src="largeAvatarUrl" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" />
      </div>
      <template #footer>
        <el-button @click="viewAvatarDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成就详情对话框 -->
    <el-dialog v-model="achievementDetailDialog" title="成就详情" width="500px">
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="achievement-detail-icon">{{ selectedAchievement.icon }}</div>
        <h3>{{ selectedAchievement.name }}</h3>
        <p class="achievement-detail-desc">{{ selectedAchievement.desc }}</p>
        <el-divider />
        <div class="achievement-detail-info">
          <div class="info-item">
            <span class="label">奖励经验:</span>
            <span class="value">{{ selectedAchievement.exp }} EXP</span>
          </div>
          <div class="info-item">
            <span class="label">解锁条件:</span>
            <span class="value">{{ selectedAchievement.condition }}</span>
          </div>
          <div v-if="!selectedAchievement.unlocked" class="info-item">
            <span class="label">完成进度:</span>
            <el-progress :percentage="getAchievementProgress(selectedAchievement)" />
          </div>
          <div v-else class="info-item">
            <span class="label">解锁时间:</span>
            <span class="value">{{ formatDateTime(selectedAchievement.unlockedAt) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEmotionStore } from '../stores/emotion'
import { useVideoStore } from '../stores/video'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UserFilled,
  Camera,
  Download,
  Delete,
  Upload,
  UploadFilled,
  InfoFilled,
  Edit,
  Lock,
  ArrowRight,
  Setting
} from '@element-plus/icons-vue'

const emotionStore = useEmotionStore()
const videoStore = useVideoStore()
const userStore = useUserStore()
const router = useRouter()

// 用于防止初始化时触发 watch 保存
const isInitialized = ref(false)

// 从 localStorage 加载用户信息，如果没有则使用默认值
const loadUserInfo = () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      // 将日期字符串转换回 Date 对象
      if (data.birthday && typeof data.birthday === 'string') {
        data.birthday = new Date(data.birthday)
      }
      if (data.joinDate && typeof data.joinDate === 'string') {
        data.joinDate = new Date(data.joinDate)
      }
      return data
    } catch (e) {
      console.warn('解析用户信息失败，使用默认值', e)
    }
  }
  return {
    name: '情绪识别用户',
    email: 'user@emotion-ai.com',
    phone: '138-0000-0000',
    birthday: new Date('1995-01-01'),
    bio: '关注心理健康，享受美好生活',
    avatar: '',
    role: '普通用户',
    joinDate: new Date('2025-01-01')
  }
}

// 用户信息
const userInfo = ref(loadUserInfo())

// 计算总识别次数（图片 + 视频）
const totalRecognitions = computed(() => {
  return emotionStore.predictions.length + videoStore.videoHistory.length
})

// 计算活跃天数
const activeDays = computed(() => {
  if (emotionStore.predictions.length === 0 && videoStore.videoHistory.length === 0) return 0
  
  const dates = new Set()
  // 添加图片识别的日期
  emotionStore.predictions.forEach(pred => {
    const date = new Date(pred.timestamp).toDateString()
    dates.add(date)
  })
  // 添加视频识别的日期
  videoStore.videoHistory.forEach(video => {
    const date = new Date(video.timestamp).toDateString()
    dates.add(date)
  })
  
  return dates.size
})

// 计算会员天数
const memberDays = computed(() => {
  const join = userInfo.value.joinDate ? new Date(userInfo.value.joinDate) : null
  if (!join || Number.isNaN(join.getTime())) return null
  const now = new Date()
  const diff = now - join
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days >= 0 ? days : null
})

const displayMemberDays = computed(() => {
  const days = memberDays.value
  return days === null ? '—' : days
})

const displayEmail = computed(() => {
  return userStore.userInfo?.email || userInfo.value.email
})

const isAdminUser = computed(() => {
  return userStore.isAdmin || userInfo.value.role === '管理员' || userInfo.value.role === 'admin'
})

const roleBadgeText = computed(() => {
  if (isAdminUser.value) {
    const name = userStore.userInfo?.username || userInfo.value.name || 'admin'
    return `${name} 管理员`
  }
  return userInfo.value.role || '普通用户'
})

const profileMenuItems = [
  { key: 'profile', label: '个人信息', icon: UserFilled, action: 'dialog', target: 'profile' },
  { key: 'security', label: '账户安全', icon: Lock, action: 'dialog', target: 'password' },
  { key: 'settings', label: '设置', icon: Setting, action: 'route', target: '/app/settings' }
]

function handleProfileMenu(item) {
  if (item.action === 'dialog') {
    if (item.target === 'profile') editProfileDialog.value = true
    if (item.target === 'password') changePasswordDialog.value = true
    return
  }
  if (item.action === 'route') {
    router.push(item.target)
  }
}

function goToAnalysis() {
  router.push('/app/data-analysis')
}

// 对话框
const editProfileDialog = ref(false)
const changePasswordDialog = ref(false)
const achievementDetailDialog = ref(false)
const avatarCropDialog = ref(false)
const selectedAchievement = ref(null)

// 头像相关
const avatarPreview = ref('')
const cropZoom = ref(1)
const avatarFile = ref(null)
const cropPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const viewAvatarDialog = ref(false)
const largeAvatarUrl = ref('')

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 从 localStorage 加载成就，如果没有则使用默认值
const loadAchievements = () => {
  const saved = localStorage.getItem('achievements')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.warn('解析成就失败，使用默认值')
    }
  }
  return [
    {
      id: 1,
      name: '初次尝试',
      desc: '完成第一次情绪识别',
      icon: '🎯',
      exp: 10,
      condition: '完成1次识别',
      requirement: { type: 'count', value: 1 },
      unlocked: false,
      unlockedAt: null
    },
  {
    id: 2,
    name: '情绪探索者',
    desc: '累计识别10次情绪',
    icon: '🔍',
    exp: 50,
    condition: '完成10次识别',
    requirement: { type: 'count', value: 10 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 3,
    name: '坚持不懈',
    desc: '连续使用7天',
    icon: '💪',
    exp: 100,
    condition: '连续使用7天',
    requirement: { type: 'consecutive', value: 7 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 4,
    name: '情绪大师',
    desc: '累计识别50次情绪',
    icon: '🏆',
    exp: 200,
    condition: '完成50次识别',
    requirement: { type: 'count', value: 50 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 5,
    name: '快乐使者',
    desc: '识别到10次高兴情绪',
    icon: '😊',
    exp: 80,
    condition: '识别10次高兴情绪',
    requirement: { type: 'emotion', emotion: 'happy', value: 10 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 6,
    name: '数据分析师',
    desc: '导出分析报告5次',
    icon: '📊',
    exp: 150,
    condition: '导出5次报告',
    requirement: { type: 'export', value: 5 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 7,
    name: '长期用户',
    desc: '使用系统30天',
    icon: '⭐',
    exp: 300,
    condition: '使用30天',
    requirement: { type: 'days', value: 30 },
    unlocked: false,
    unlockedAt: null
  },
  {
    id: 8,
    name: '情绪专家',
    desc: '累计识别100次情绪',
    icon: '👑',
    exp: 500,
    condition: '完成100次识别',
    requirement: { type: 'count', value: 100 },
    unlocked: false,
    unlockedAt: null
  }
  ]
}

// 成就系统
const achievements = ref(loadAchievements())

// 计算已解锁成就数量
const unlockedCount = computed(() => {
  return achievements.value.filter(a => a.unlocked).length
})

const totalAchievements = computed(() => achievements.value.length)

// 从 localStorage 加载经验值和导出次数
const loadExperiencePoints = () => {
  const saved = localStorage.getItem('experiencePoints')
  return saved ? parseInt(saved) || 0 : 0
}

const loadExportCount = () => {
  const saved = localStorage.getItem('exportCount')
  return saved ? parseInt(saved) || 0 : 0
}

// 经验值和等级系统
const experiencePoints = ref(loadExperiencePoints())
const exportCount = ref(loadExportCount()) // 导出次数

const userLevel = computed(() => {
  return Math.floor(experiencePoints.value / 100) + 1
})

const nextLevelExp = computed(() => {
  return userLevel.value * 100
})

const levelProgress = computed(() => {
  const currentLevelExp = experiencePoints.value % 100
  return Math.round((currentLevelExp / 100) * 100)
})

// 连续使用天数
const consecutiveDays = computed(() => {
  // 简化版：假设每天都使用
  return activeDays.value
})

// 今日识别次数
const todayCount = computed(() => {
  const today = new Date().toDateString()
  return emotionStore.predictions.filter(pred => {
    return new Date(pred.timestamp).toDateString() === today
  }).length
})

// 保存资料
function saveProfile() {
  console.log('💾 手动保存用户资料:', userInfo.value)
  const saved = JSON.stringify(userInfo.value)
  localStorage.setItem('userInfo', saved)
  console.log('✅ 已保存到 localStorage:', saved)
  
  // 验证保存
  const verified = localStorage.getItem('userInfo')
  console.log('🔍 验证保存的数据:', verified)
  
  editProfileDialog.value = false
  ElMessage.success('资料已更新')
}

// 修改密码
function changePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('密码长度至少6位')
    return
  }
  
  // 模拟密码修改
  changePasswordDialog.value = false
  ElMessage.success('密码修改成功')
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 成就系统相关函数
function getAchievementCurrentValue(achievement) {
  const req = achievement.requirement
  let current = 0

  switch (req.type) {
    case 'count':
      current = totalRecognitions.value
      break
    case 'consecutive':
      current = consecutiveDays.value
      break
    case 'emotion':
      current = emotionStore.predictions.filter(p => p.emotion === req.emotion).length
      break
    case 'export':
      current = exportCount.value
      break
    case 'days':
      current = activeDays.value
      break
  }

  return Math.min(current, req.value)
}

function getAchievementProgressText(achievement) {
  const req = achievement.requirement
  return `${getAchievementCurrentValue(achievement)}/${req.value}`
}

function getAchievementProgress(achievement) {
  if (achievement.unlocked) return 100
  
  const req = achievement.requirement
  const current = getAchievementCurrentValue(achievement)
  return Math.min(100, Math.round((current / req.value) * 100))
}

function showAchievementDetail(achievement) {
  selectedAchievement.value = achievement
  achievementDetailDialog.value = true
}

function checkAndUnlockAchievements() {
  achievements.value.forEach(achievement => {
    if (!achievement.unlocked) {
      const progress = getAchievementProgress(achievement)
      if (progress >= 100) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date()
        experiencePoints.value += achievement.exp
        ElMessage.success({
          message: `🎉 解锁成就：${achievement.name}！获得 ${achievement.exp} EXP`,
          duration: 3000
        })
      }
    }
  })
  saveAchievements()
}

function saveAchievements() {
  localStorage.setItem('achievements', JSON.stringify(achievements.value))
  localStorage.setItem('experiencePoints', experiencePoints.value.toString())
  localStorage.setItem('exportCount', exportCount.value.toString())
}

function getLevelColor() {
  const colors = ['#67c23a', '#409eff', '#e6a23c', '#f56c6c', '#909399']
  return colors[(userLevel.value - 1) % colors.length]
}

// 日期格式化
function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 头像上传相关函数
function beforeAvatarUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

function handleAvatarChange(file) {
  avatarFile.value = file.raw
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
    // 重置剪裁参数
    cropZoom.value = 1
    cropPosition.value = { x: 0, y: 0 }
    avatarCropDialog.value = true
    
    // 延迟执行以确保图片已加载
    setTimeout(() => {
      const imageElement = document.querySelector('.avatar-crop-frame img')
      if (imageElement && imageElement.complete) {
        const container = imageElement.parentElement
        const containerWidth = container.clientWidth // 400px
        const containerHeight = container.clientHeight // 400px
        const imageWidth = imageElement.naturalWidth
        const imageHeight = imageElement.naturalHeight
        
        console.log('图片尺寸:', imageWidth, 'x', imageHeight)
        console.log('容器尺寸:', containerWidth, 'x', containerHeight)
        
        // 计算初始缩放，确保图片能完整显示在容器中
        const scaleX = containerWidth / imageWidth
        const scaleY = containerHeight / imageHeight
        // 使用较小的缩放比例，确保图片完整显示
        const initialScale = Math.max(0.1, Math.min(scaleX, scaleY))
        
        cropZoom.value = initialScale
        console.log('初始缩放:', initialScale)
      }
    }, 200)
  }
  reader.readAsDataURL(file.raw)
}

// 处理图片拖拽移动
function handleImageDrag(event) {
  if (!isDragging.value) return
  
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  
  cropPosition.value.x += dx / cropZoom.value
  cropPosition.value.y += dy / cropZoom.value
  
  dragStart.value = { x: event.clientX, y: event.clientY }
}

function startDrag(event) {
  isDragging.value = true
  dragStart.value = { x: event.clientX, y: event.clientY }
  document.addEventListener('mousemove', handleImageDrag)
  document.addEventListener('mouseup', stopDrag)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleImageDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 实现真正的头像剪裁功能
function confirmAvatar() {
  // 使用document.querySelector直接获取图片元素，避免ref引用问题
  const imageElement = document.querySelector('.avatar-crop-frame img')
  
  if (!avatarPreview.value || !imageElement) {
    ElMessage.warning('请先上传图片')
    return
  }
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  // 设置画布大小为头像尺寸 (200x200)
  canvas.width = 200
  canvas.height = 200
  
  try {
    // 获取原始图片尺寸
    const imageWidth = imageElement.naturalWidth
    const imageHeight = imageElement.naturalHeight
    
    // 获取裁剪框容器尺寸
    const container = imageElement.parentElement
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    // 计算图片在容器中的缩放比例和位置
    const scale = cropZoom.value
    
    // 计算要从原图中截取的区域
    // 确保截取区域始终在图片范围内
    const sourceX = Math.max(0, Math.min(imageWidth - canvas.width/scale, 
                     (containerWidth/2 - cropPosition.value.x)/scale - canvas.width/(2*scale)))
    const sourceY = Math.max(0, Math.min(imageHeight - canvas.height/scale, 
                     (containerHeight/2 - cropPosition.value.y)/scale - canvas.height/(2*scale)))
    const sourceWidth = canvas.width/scale
    const sourceHeight = canvas.height/scale
    
    // 绘制剪裁后的图像
    context.drawImage(
      imageElement,
      sourceX, sourceY,
      sourceWidth, sourceHeight,
      0, 0,
      canvas.width, canvas.height
    )
    
    // 获取剪裁后的图像数据
    const croppedImage = canvas.toDataURL('image/png')
    
    // 更新用户头像
    userInfo.value.avatar = croppedImage
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    avatarCropDialog.value = false
    ElMessage.success('头像更新成功')
    
    // 增加经验值
    experiencePoints.value += 10
    saveAchievements()
  } catch (error) {
    console.error('头像剪裁失败:', error)
    ElMessage.error('头像剪裁失败，请重试')
  }
}

// 查看头像大图
function viewAvatar() {
  if (userInfo.value.avatar) {
    largeAvatarUrl.value = userInfo.value.avatar
    viewAvatarDialog.value = true
  }
}

// 数据导入相关函数
function beforeImportData(file) {
  const isJSON = file.type === 'application/json' || file.name.endsWith('.json')
  if (!isJSON) {
    ElMessage.error('只能上传 JSON 文件！')
    return false
  }
  return true
}

function handleImportData(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      ElMessageBox.confirm(
        '导入数据将覆盖当前所有数据，是否继续？',
        '确认导入',
        {
          confirmButtonText: '确定导入',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 导入用户信息
        if (data.userInfo) {
          userInfo.value = data.userInfo
          localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        }
        
        // 导入设置
        if (data.settings) {
          localStorage.setItem('userSettings', JSON.stringify(data.settings))
        }
        
        // 导入预测数据
        if (data.predictions) {
          emotionStore.predictions = data.predictions
          // 使用正确的 localStorage 键
          const emotionData = {
            predictions: data.predictions,
            currentPrediction: data.currentPrediction || null,
            currentModel: emotionStore.currentModel,
            timestamp: new Date().toISOString()
          }
          localStorage.setItem('emotion_predictions', JSON.stringify(emotionData))
          console.log('✅ 已导入图片识别历史:', data.predictions.length, '条')
        }
        
        // 导入视频历史数据
        if (data.videoHistory) {
          videoStore.videoHistory = data.videoHistory
          localStorage.setItem('video_history', JSON.stringify(data.videoHistory))
          console.log('✅ 已导入视频识别历史:', data.videoHistory.length, '条')
        }
        
        // 导入成就
        if (data.achievements) {
          achievements.value = data.achievements
          localStorage.setItem('achievements', JSON.stringify(data.achievements))
        }
        
        // 导入经验值
        if (data.experiencePoints !== undefined) {
          experiencePoints.value = data.experiencePoints
          localStorage.setItem('experiencePoints', data.experiencePoints.toString())
        }
        
        // 导入其他数据
        if (data.gratitudes) {
          localStorage.setItem('gratitudes', JSON.stringify(data.gratitudes))
        }
        if (data.journals) {
          localStorage.setItem('journals', JSON.stringify(data.journals))
        }
        
        ElMessage.success('数据导入成功！')
        
        // 刷新页面以显示新数据
        setTimeout(() => {
          location.reload()
        }, 1000)
      }).catch(() => {
        ElMessage.info('已取消导入')
      })
    } catch (error) {
      console.error('数据导入失败:', error)
      ElMessage.error('数据格式错误，导入失败')
    }
  }
  reader.readAsText(file.raw)
}

// 同步到云端
function syncToCloud() {
  ElMessageBox.confirm(
    '云端同步功能需要登录账号，是否继续？',
    '提示',
    {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.info('云端同步功能开发中...')
  }).catch(() => {})
}

// 导出所有数据
function exportAllData() {
  exportCount.value++
  checkAndUnlockAchievements() // 检查导出相关成就
  
  const data = {
    userInfo: userInfo.value,
    settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
    predictions: emotionStore.predictions,
    videoHistory: videoStore.videoHistory,
    achievements: achievements.value,
    experiencePoints: experiencePoints.value,
    exportCount: exportCount.value,
    gratitudes: JSON.parse(localStorage.getItem('gratitudes') || '[]'),
    journals: JSON.parse(localStorage.getItem('journals') || '[]'),
    exportDate: new Date().toISOString(),
    version: '2.0.0'
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `情绪识别数据备份_${new Date().toLocaleDateString()}.json`
  link.click()
  
  ElMessage.success('数据导出成功')
}

// 清空历史记录
function clearHistory() {
  ElMessageBox.confirm('确定要清空所有历史记录吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定清空',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    console.log('🗑️ 开始清空历史记录...')
    
    // 清空图片识别历史
    emotionStore.predictions = []
    emotionStore.currentPrediction = null
    // 删除正确的 localStorage 键
    localStorage.removeItem('emotion_predictions')
    console.log('✅ 已清空图片识别历史')
    
    // 清空视频识别历史
    videoStore.videoHistory = []
    videoStore.currentVideo = null
    videoStore.analysisResults = null
    localStorage.removeItem('video_history')
    localStorage.removeItem('video_current_analysis')
    console.log('✅ 已清空视频识别历史')
    
    ElMessage.success('所有历史记录已清空')
  }).catch(() => {})
}

// 监听识别数据变化，自动检查成就
watch(() => emotionStore.predictions.length, () => {
  checkAndUnlockAchievements()
}, { immediate: false })

// 监听视频历史变化，自动检查成就
watch(() => videoStore.videoHistory.length, () => {
  checkAndUnlockAchievements()
}, { immediate: false })

// 创建节流保存函数，避免频繁写入 localStorage
let userInfoSaveTimer = null
watch(userInfo, (newUserInfo) => {
  if (!isInitialized.value) return
  if (userInfoSaveTimer) clearTimeout(userInfoSaveTimer)
  userInfoSaveTimer = setTimeout(() => {
    console.log('💾 自动保存用户信息:', newUserInfo)
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
  }, 500)
}, { deep: true })

let achievementsSaveTimer = null

// 监听成就变化，自动保存（节流500ms）
watch(achievements, (newAchievements) => {
  if (!isInitialized.value) return
  if (achievementsSaveTimer) clearTimeout(achievementsSaveTimer)
  achievementsSaveTimer = setTimeout(() => {
    console.log('💾 自动保存成就')
    localStorage.setItem('achievements', JSON.stringify(newAchievements))
  }, 500)
}, { deep: true })

// 监听经验值变化，自动保存（立即）
watch(experiencePoints, (newExp) => {
  if (!isInitialized.value) return
  console.log('💾 自动保存经验值:', newExp)
  localStorage.setItem('experiencePoints', newExp.toString())
})

// 监听导出次数变化，自动保存（立即）
watch(exportCount, (newCount) => {
  if (!isInitialized.value) return
  console.log('💾 自动保存导出次数:', newCount)
  localStorage.setItem('exportCount', newCount.toString())
})

onMounted(() => {
  try {
    console.log('🚀 个人中心初始化...')
    console.log('📦 加载的用户信息:', userInfo.value)

    if (userStore.userInfo) {
      if (userStore.userInfo.email) userInfo.value.email = userStore.userInfo.email
      if (userStore.userInfo.username) userInfo.value.name = userStore.userInfo.username
      if (userStore.userInfo.role) {
        userInfo.value.role = userStore.userInfo.role === 'admin' ? '管理员' : '普通用户'
      }
      if (userStore.userInfo.created_at && !userInfo.value.joinDate) {
        userInfo.value.joinDate = new Date(userStore.userInfo.created_at)
      }
    }
    
    // 添加窗口关闭前的保存处理
    const handleBeforeUnload = () => {
      console.log('🔄 窗口关闭前保存所有数据...')
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      localStorage.setItem('achievements', JSON.stringify(achievements.value))
      localStorage.setItem('experiencePoints', experiencePoints.value.toString())
      localStorage.setItem('exportCount', exportCount.value.toString())
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    setTimeout(() => {
      setTimeout(checkAndUnlockAchievements, 100)
      
      setTimeout(() => {
        isInitialized.value = true
        console.log('✅ 初始化完成，开始监听数据变化')
      }, 200)
    }, 50)
  } catch (error) {
    console.error('初始化时出错:', error)
  }
})

// 在组件卸载前保存所有待保存的数据
onBeforeUnmount(() => {
  console.log('🔄 组件卸载前保存所有数据...')
  
  // 清除所有定时器并立即保存
  if (userInfoSaveTimer) {
    clearTimeout(userInfoSaveTimer)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    console.log('💾 卸载时保存用户信息')
  }
  
  if (achievementsSaveTimer) {
    clearTimeout(achievementsSaveTimer)
    localStorage.setItem('achievements', JSON.stringify(achievements.value))
    console.log('💾 卸载时保存成就')
  }
  
  console.log('✅ 所有数据已保存')
})
</script>

<style scoped>
.user-view {
  --panel-gap: 1.25rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--panel-gap);
}

.user-layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 2fr);
  gap: var(--panel-gap);
  align-items: stretch;
}

.user-sidebar,
.user-main {
  display: flex;
  flex-direction: column;
  gap: var(--panel-gap);
  min-width: 0;
}

.user-panel {
  margin-bottom: 0 !important;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.06);
}

.user-panel :deep(.el-card__header) {
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.user-panel :deep(.el-card__body) {
  padding: 1.25rem;
}

.user-panel-fill {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-panel-fill :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-main .tip-banner {
  margin-top: auto;
}

.page-header {
  position: relative;
  overflow: hidden;
  margin-bottom: 0;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 45%, #e0e7ff 100%);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(196, 181, 253, 0.35);
}

.header-wave {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.header-wave-1 {
  width: 180px;
  height: 180px;
  top: -60px;
  right: 18%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%);
}

.header-wave-2 {
  width: 120px;
  height: 120px;
  bottom: -40px;
  left: 35%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%);
}

.header-spark {
  position: absolute;
  color: rgba(124, 77, 255, 0.35);
  font-size: 0.75rem;
  pointer-events: none;
}

.spark-1 { top: 1.2rem; right: 28%; }
.spark-2 { bottom: 1rem; right: 12%; }

.header-content {
  position: relative;
  z-index: 1;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-text p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.header-quote {
  margin: 0;
  font-size: 0.9rem;
  font-style: italic;
  color: #6366f1;
  max-width: 280px;
  text-align: right;
  line-height: 1.5;
}

.profile-card {
  flex-shrink: 0;
}

.profile-card :deep(.el-card__body) {
  padding: 1.5rem 1.25rem;
}

.profile-header {
  text-align: center;
  position: relative;
  padding: 0.5rem 0 1rem;
}

.avatar-wrap {
  display: inline-block;
  cursor: pointer;
}

.profile-avatar {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%) !important;
  color: #fff;
}

.avatar-upload {
  position: absolute;
  bottom: 0.75rem;
  right: calc(50% - 58px);
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.profile-info {
  text-align: center;
  margin: 0.75rem 0 1.25rem;
}

.user-email {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.65rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.role-badge.admin {
  color: #047857;
  background: #d1fae5;
}

.role-crown {
  font-size: 0.75rem;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 0.85rem 0.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(199, 210, 254, 0.5);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.2rem;
  line-height: 1.2;
}

.stat-label {
  color: #64748b;
  font-size: 0.75rem;
}

.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #475569;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.profile-menu-item:hover {
  background: #f8fafc;
  color: #6366f1;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.menu-arrow {
  color: #cbd5e1;
  font-size: 0.85rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.btn-edit-profile {
  background: linear-gradient(135deg, #7c77ff 0%, #6366f1 100%) !important;
  border: none !important;
  height: 42px;
  font-weight: 500;
}

.btn-edit-profile :deep(.el-button__content) {
  gap: 0.4rem;
}

.btn-change-password {
  height: 42px;
  border-color: #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 500;
}

.btn-change-password :deep(.el-button__content) {
  gap: 0.4rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.upload-full-width {
  width: 100%;
  display: block;
  margin: 0;
  padding: 0;
}

.upload-full-width :deep(.el-upload) {
  width: 100%;
  display: block;
  margin: 0;
  padding: 0;
}

/* 快速操作按钮样式 */
.action-btn {
  justify-content: flex-start !important;
  width: 100% !important;
  padding: 10px 16px !important;
  height: 40px !important;
  text-align: left;
  margin: 0 !important;
  box-sizing: border-box !important;
}

/* 按钮内部容器 */
.action-btn :deep(.el-button__content) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
}

/* 按钮图标 */
.action-btn :deep(.el-icon) {
  font-size: 16px;
  margin: 0 !important;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 按钮文字 */
.action-btn :deep(span:not(.el-icon)) {
  flex: 1;
  line-height: 1.5;
  text-align: left;
}

.settings-card {
  margin-bottom: 1.5rem;
}

.form-item-tip {
  margin-left: 1rem;
  color: #909399;
  font-size: 0.875rem;
}

.save-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 2rem 0;
}

/* 成就系统样式 */
.achievements-card :deep(.el-card__header) {
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
}

.achievements-title-group {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.achievements-trophy {
  font-size: 1.35rem;
  line-height: 1.2;
}

.achievements-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.achievements-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.achievements-count {
  flex-shrink: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.card-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
  align-items: stretch;
}

.achievement-item {
  position: relative;
  display: flex;
  gap: 0.85rem;
  padding: 1rem;
  height: 100%;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  transition: all 0.25s;
}

.achievement-item.unlocked {
  border-color: #93c5fd;
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.achievement-item.locked {
  background: #fafbfc;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.1);
}

.achievement-check {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
  line-height: 1;
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
  color: #1e293b;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.55rem;
  line-height: 1.4;
}

.achievement-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.achievement-progress-bar {
  flex: 1;
}

.achievement-progress-bar :deep(.el-progress-bar__outer) {
  background: #e2e8f0;
}

.achievement-progress-bar :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}

.achievement-progress-text {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
  white-space: nowrap;
}

.achievement-unlocked {
  font-size: 0.78rem;
  color: #059669;
  font-weight: 500;
}

/* 使用统计样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f7;
  box-shadow: none;
}

.stat-box-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-box-content {
  flex: 1;
}

.stat-box-value {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
}

.stat-box-label {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 0.25rem;
}

.level-progress {
  margin-top: 1rem;
}

.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #606266;
}

.tip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0;
  padding: 1rem 1.25rem;
  min-height: 56px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-radius: 16px;
  border: 1px solid rgba(196, 181, 253, 0.45);
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.06);
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.tip-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.tip-text {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
}

.tip-text strong {
  color: #6366f1;
  margin-right: 0.35rem;
}

.tip-action {
  flex-shrink: 0;
  padding: 0.45rem 1rem;
  border: 1px solid rgba(196, 181, 253, 0.6);
  border-radius: 999px;
  background: #fff;
  color: #6366f1;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tip-action:hover {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

/* 成就详情对话框样式 */
.achievement-detail {
  text-align: center;
  padding: 1rem 0;
}

.achievement-detail-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.achievement-detail h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #303133;
}

.achievement-detail-desc {
  color: #606266;
  margin-bottom: 1.5rem;
}

.achievement-detail-info {
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e4e7ed;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
}

.info-item .value {
  color: #303133;
}

/* 头像裁剪样式 */
.avatar-crop-container {
  padding: 1rem 0;
}

.crop-preview {
  width: 100%;
  height: 500px; /* 增加高度以容纳更大的图片 */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
}

.avatar-crop-frame {
  width: 400px; /* 增加裁剪框大小 */
  height: 400px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-crop-frame img {
  max-width: none; /* 允许图片超出容器 */
  max-height: none;
  display: block;
}

.crop-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.crop-indicator {
  width: 300px; /* 增大裁剪指示框 */
  height: 300px;
  border: 2px dashed #fff;
  background: transparent;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.crop-controls {
  padding: 0 1rem;
}

.crop-instructions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #606266;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #ecf5ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.avatar-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

@media (max-width: 992px) {
  .user-layout {
    grid-template-columns: 1fr;
  }

  .user-main .tip-banner {
    margin-top: 0;
  }

  .user-panel-fill {
    flex: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-quote {
    text-align: left;
    max-width: none;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }
  
  .profile-stats {
    flex-direction: row;
  }
  
  .save-actions {
    flex-direction: column;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }

  .tip-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .tip-action {
    width: 100%;
    text-align: center;
  }
  
  .stat-box {
    flex-direction: column;
    text-align: center;
  }
}

/* 动画效果样式 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade {
  animation: fadeIn 0.3s ease-in-out;
}

.card-hover-animation {
  transition: all 0.3s ease;
}

.card-hover-animation:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* 深色模式样式 */
.dark {
  background-color: #1a1a1a !important;
  color: #e0e0e0 !important;
}

.dark .el-card {
  background-color: #2c2c2c !important;
  border-color: #404040 !important;
  color: #e0e0e0 !important;
}

.dark .el-card__header {
  background-color: #333333 !important;
  border-bottom: 1px solid #404040 !important;
}

.dark .el-input__wrapper {
  background-color: #333333 !important;
  border-color: #404040 !important;
}

.dark .el-input__inner {
  color: #e0e0e0 !important;
}

.dark .el-switch__core {
  background-color: #555555 !important;
}

.dark .el-switch__core.is-checked {
  background-color: #667eea !important;
}

.dark .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: #667eea !important;
  border-color: #667eea !important;
}

.dark .el-select {
  color: #e0e0e0 !important;
}

.dark .el-dropdown-menu {
  background-color: #2c2c2c !important;
  border-color: #404040 !important;
}

.dark .el-dropdown-menu__item {
  color: #e0e0e0 !important;
}

.dark .el-dropdown-menu__item:hover {
  background-color: #333333 !important;
}

.dark .el-dialog {
  background-color: #2c2c2c !important;
  border-color: #404040 !important;
}

.dark .el-dialog__header {
  background-color: #333333 !important;
  border-bottom: 1px solid #404040 !important;
}

.dark .el-dialog__title {
  color: #e0e0e0 !important;
}

.dark .profile-info h3 {
  color: #e0e0e0 !important;
}

.dark .stat-value {
  color: #8c9eff !important;
}

.dark .achievement-name {
  color: #e0e0e0 !important;
}

.dark .achievement-detail h3 {
  color: #e0e0e0 !important;
}

.dark .info-item .value {
  color: #e0e0e0 !important;
}

.dark .crop-preview {
  background: #2c2c2c !important;
}

.dark .crop-instructions {
  background: #2c3e50 !important;
  color: #e0e0e0 !important;
  border-left-color: #667eea !important;
}

/* 无动画模式 */
.no-animations {
  --el-transition-duration: 0ms !important;
}

.no-animations * {
  transition: none !important;
  animation: none !important;
}
</style>
