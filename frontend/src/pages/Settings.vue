<template>
  <div class="settings-view">
    <div class="page-header">
      <div class="header-wave header-wave-1"></div>
      <div class="header-wave header-wave-2"></div>
      <div class="header-content">
        <div class="header-left">
          <button type="button" class="back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回个人中心
          </button>
          <div class="header-text">
            <div class="header-title-row">
              <span class="header-icon-badge">
                <el-icon :size="20"><Setting /></el-icon>
              </span>
              <h1>设置</h1>
            </div>
            <p>管理通知、隐私、显示与模型偏好</p>
          </div>
        </div>
      </div>
    </div>

    <el-card class="settings-card" shadow="hover">
      <template #header>
        <span>🔔 通知设置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="情绪提醒">
          <el-switch v-model="settings.emotionReminder" />
          <span class="form-item-tip">当检测到消极情绪时提醒</span>
        </el-form-item>
        <el-form-item label="每日总结">
          <el-switch v-model="settings.dailySummary" />
          <span class="form-item-tip">每天发送情绪统计摘要</span>
        </el-form-item>
        <el-form-item label="健康建议">
          <el-switch v-model="settings.healthAdvice" />
          <span class="form-item-tip">定期推送心理健康建议</span>
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="settings.emailNotification" />
          <span class="form-item-tip">接收邮件通知</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" shadow="hover">
      <template #header>
        <span>🔒 隐私设置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="数据收集">
          <el-switch v-model="settings.dataCollection" />
          <span class="form-item-tip">允许收集使用数据以改进服务</span>
        </el-form-item>
        <el-form-item label="保存图片">
          <el-switch v-model="settings.saveImages" />
          <span class="form-item-tip">保存上传的图片用于历史记录</span>
        </el-form-item>
        <el-form-item label="匿名分析">
          <el-switch v-model="settings.anonymousAnalysis" />
          <span class="form-item-tip">数据以匿名方式参与统计分析</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" shadow="hover">
      <template #header>
        <span>🎨 显示设置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="主题模式">
          <el-radio-group v-model="settings.theme" size="large">
            <el-radio-button label="light">浅色</el-radio-button>
            <el-radio-button label="dark">深色</el-radio-button>
            <el-radio-button label="auto">跟随系统</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="语言">
          <el-select v-model="settings.language">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
            <el-option label="日本語" value="ja-JP" />
          </el-select>
        </el-form-item>
        <el-form-item label="动画效果">
          <el-switch v-model="settings.animations" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" shadow="hover">
      <template #header>
        <span>🤖 模型偏好</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="默认模型">
          <el-select v-model="settings.defaultModel">
            <el-option label="CNN (83.77%)" value="cnn" />
            <el-option label="VGG16 (80%)" value="vgg" />
            <el-option label="SE-Net-81 (81%)" value="se81" />
            <el-option label="SE-Net-83 (83%)" value="se83" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动人脸检测">
          <el-switch v-model="settings.autoFaceDetect" />
          <span class="form-item-tip">上传图片时自动进行人脸检测</span>
        </el-form-item>
        <el-form-item label="显示性能统计">
          <el-switch v-model="settings.showPerformance" />
        </el-form-item>
        <el-form-item label="显示质量评估">
          <el-switch v-model="settings.showQuality" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="save-actions">
      <el-button type="primary" size="large" @click="saveSettings">
        <el-icon><Check /></el-icon>
        保存设置
      </el-button>
      <el-button size="large" @click="resetSettings">
        <el-icon><Refresh /></el-icon>
        恢复默认
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Setting, Check, Refresh } from '@element-plus/icons-vue'
import { useUserSettings } from '../composables/useUserSettings'

const router = useRouter()
const { settings, saveSettings, resetSettings, initSettings } = useUserSettings()

function goBack() {
  router.push('/app/user')
}

onMounted(() => {
  initSettings()
})
</script>

<style scoped>
.settings-view {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.25rem;
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
  width: 160px;
  height: 160px;
  top: -50px;
  right: 10%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%);
}

.header-wave-2 {
  width: 100px;
  height: 100px;
  bottom: -30px;
  left: 20%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%);
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: none;
  background: none;
  color: #6366f1;
  font-size: 0.88rem;
  cursor: pointer;
  width: fit-content;
}

.back-btn:hover {
  color: #4f46e5;
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

.settings-card {
  margin-bottom: 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
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
  padding: 1.5rem 0 2rem;
}

@media (max-width: 768px) {
  .save-actions {
    flex-direction: column;
  }
}
</style>
