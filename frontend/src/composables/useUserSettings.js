import { ref, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const DEFAULT_SETTINGS = {
  emotionReminder: true,
  dailySummary: false,
  healthAdvice: true,
  emailNotification: false,
  dataCollection: true,
  saveImages: true,
  anonymousAnalysis: true,
  theme: 'light',
  language: 'zh-CN',
  animations: true,
  defaultModel: 'cnn',
  autoFaceDetect: true,
  showPerformance: true,
  showQuality: true
}

export function loadUserSettings() {
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch (e) {
      console.warn('解析设置失败，使用默认值')
    }
  }
  return { ...DEFAULT_SETTINGS }
}

let themeChangeListener = null

export function applyTheme(theme) {
  try {
    if (window._themeTimeout) {
      clearTimeout(window._themeTimeout)
    }

    window._themeTimeout = setTimeout(() => {
      if (themeChangeListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', themeChangeListener)
        themeChangeListener = null
      }

      let shouldBeDark = false

      if (theme === 'auto') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        themeChangeListener = (e) => {
          const currentSettings = loadUserSettings()
          if (currentSettings.theme === 'auto') {
            document.documentElement.classList.toggle('dark', e.matches)
          }
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChangeListener)
      } else if (theme === 'dark') {
        shouldBeDark = true
      }

      document.documentElement.classList.toggle('dark', shouldBeDark)
      localStorage.setItem('theme', theme)
    }, 100)
  } catch (error) {
    console.error('应用主题时出错:', error)
  }
}

export function applyAnimations(enable) {
  if (enable) {
    document.documentElement.classList.remove('no-animations')
    document.body.classList.add('animate-fade')
    document.querySelectorAll('.el-card').forEach(card => {
      card.classList.add('card-hover-animation')
    })
  } else {
    document.documentElement.classList.add('no-animations')
    document.body.classList.remove('animate-fade')
    document.querySelectorAll('.el-card').forEach(card => {
      card.classList.remove('card-hover-animation')
    })
  }
  localStorage.setItem('animations', enable.toString())
}

export function applyLanguage(lang) {
  document.documentElement.lang = lang
  localStorage.setItem('language', lang)
}

export function useUserSettings() {
  const settings = ref(loadUserSettings())
  const isInitialized = ref(false)
  let settingsSaveTimer = null

  function persistSettings() {
    localStorage.setItem('userSettings', JSON.stringify(settings.value))
  }

  function saveSettings() {
    try {
      setTimeout(persistSettings, 0)
      applyTheme(settings.value.theme)
      applyAnimations(settings.value.animations)
      applyLanguage(settings.value.language)
      setTimeout(() => {
        ElMessage.success('设置已保存')
      }, 0)
    } catch (error) {
      console.error('保存设置时出错:', error)
      ElMessage.error('保存设置失败，请重试')
    }
  }

  function resetSettings() {
    ElMessageBox.confirm('确定要恢复默认设置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      settings.value = { ...DEFAULT_SETTINGS }
      saveSettings()
    }).catch(() => {})
  }

  watch(() => settings.value.theme, (newTheme) => {
    applyTheme(newTheme)
  })

  watch(settings, (newSettings) => {
    if (!isInitialized.value) return
    if (settingsSaveTimer) clearTimeout(settingsSaveTimer)
    settingsSaveTimer = setTimeout(() => {
      localStorage.setItem('userSettings', JSON.stringify(newSettings))
    }, 500)
  }, { deep: true })

  onBeforeUnmount(() => {
    if (settingsSaveTimer) {
      clearTimeout(settingsSaveTimer)
      persistSettings()
    }
  })

  function initSettings() {
    setTimeout(() => {
      applyTheme(settings.value.theme)
      applyAnimations(settings.value.animations)
      applyLanguage(settings.value.language)
      setTimeout(() => {
        isInitialized.value = true
      }, 200)
    }, 50)
  }

  return {
    settings,
    saveSettings,
    resetSettings,
    initSettings
  }
}
