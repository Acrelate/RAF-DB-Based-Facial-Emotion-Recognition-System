<template>
  <div class="admin-view">
    <!-- 页面标题 -->
    <div class="admin-page-header">
      <div class="admin-header-main">
        <div class="admin-header-icon-wrap">
          <el-icon :size="22"><Setting /></el-icon>
        </div>
        <div class="admin-header-text">
          <h1>管理员面板</h1>
          <p>系统管理和用户管理功能</p>
        </div>
      </div>
      <div class="admin-permission-badge">
        <el-icon :size="14"><Lock /></el-icon>
        <span>管理员权限</span>
      </div>
      <div class="admin-header-deco" aria-hidden="true">
        <span class="deco-blob deco-blob-1"></span>
        <span class="deco-blob deco-blob-2"></span>
        <span class="deco-leaf">🌿</span>
      </div>
    </div>

    <!-- 统计数据卡片 -->
    <div class="admin-stats-grid">
      <div class="admin-stat-card">
        <div class="admin-stat-icon admin-stat-icon-blue">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="admin-stat-body">
          <div class="admin-stat-value">{{ systemStats.total_users || 0 }}</div>
          <div class="admin-stat-label">总用户数</div>
          <div class="admin-stat-trend trend-neutral">
            <span class="trend-mark">—</span>
            <span>无变化</span>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-icon admin-stat-icon-green">
          <el-icon :size="24"><UserFilled /></el-icon>
        </div>
        <div class="admin-stat-body">
          <div class="admin-stat-value">{{ systemStats.active_users || 0 }}</div>
          <div class="admin-stat-label">活跃用户</div>
          <div class="admin-stat-trend trend-active">
            <span class="trend-mark">●</span>
            <span>{{ activeUserRate }}% 活跃率</span>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-icon admin-stat-icon-orange">
          <el-icon :size="24"><Warning /></el-icon>
        </div>
        <div class="admin-stat-body">
          <div class="admin-stat-value">{{ systemStats.inactive_users || 0 }}</div>
          <div class="admin-stat-label">非活跃用户</div>
          <div class="admin-stat-trend trend-neutral">
            <span class="trend-mark">—</span>
            <span>无变化</span>
          </div>
        </div>
      </div>

      <div class="admin-stat-card">
        <div class="admin-stat-icon admin-stat-icon-purple">
          <el-icon :size="24"><Star /></el-icon>
        </div>
        <div class="admin-stat-body">
          <div class="admin-stat-value">{{ systemStats.admin_count || 0 }}</div>
          <div class="admin-stat-label">管理员</div>
          <div class="admin-stat-trend trend-neutral">
            <span class="trend-mark">—</span>
            <span>无变化</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统状态与数据管理 -->
    <div class="admin-workspace">
      <div class="system-status-bar">
        <div class="status-item status-ok">
          <span class="status-dot"></span>
          <span>系统运行正常</span>
        </div>
        <span class="status-divider"></span>
        <div class="status-item">
          <el-icon class="status-icon"><Lock /></el-icon>
          <span>API 正常</span>
        </div>
        <span class="status-divider"></span>
        <div class="status-item">
          <el-icon class="status-icon"><Coin /></el-icon>
          <span>数据库正常</span>
        </div>
        <span class="status-divider"></span>
        <div class="status-item status-storage">
          <el-icon class="status-icon"><Monitor /></el-icon>
          <span>存储空间 {{ storagePercent }}%</span>
          <div class="storage-progress">
            <div class="storage-progress-fill" :style="{ width: `${storagePercent}%` }"></div>
          </div>
        </div>
        <span class="status-divider"></span>
        <div class="status-item status-time">
          <el-icon class="status-icon"><Clock /></el-icon>
          <span>最后检查 {{ lastCheckTime }}</span>
        </div>
      </div>

      <div class="admin-tabs-panel">
        <el-tabs v-model="activeTab" class="admin-data-tabs">
        <!-- 用户管理标签页 -->
        <el-tab-pane name="users">
          <template #label>
            <span class="admin-tab-label"><el-icon><User /></el-icon>用户管理</span>
          </template>

          <div class="admin-user-panel">
            <div class="admin-panel-header">
              <div class="admin-panel-title">
                <span class="admin-panel-title-icon">
                  <el-icon :size="18"><UserFilled /></el-icon>
                </span>
                <h3>用户管理</h3>
              </div>
              <div class="admin-panel-actions">
                <button
                  class="btn-batch-delete"
                  type="button"
                  :disabled="selectedUsers.length === 0"
                  @click="batchDeleteUsers"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除
                </button>
                <button class="btn-add-user" type="button" @click="openCreateDialog">
                  + 新增用户
                </button>
                <button
                  class="btn-refresh-outline"
                  type="button"
                  :disabled="loading"
                  @click="refreshUsers"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新
                </button>
              </div>
            </div>

            <div class="admin-search-bar">
              <el-input
                v-model="userSearchText"
                placeholder="搜索用户名、邮箱、角色..."
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-table
              :data="paginatedUsers"
              v-loading="loading"
              class="admin-user-table"
              @selection-change="handleUserSelectionChange"
            >
              <el-table-column type="selection" width="48" :selectable="canSelectUser" />
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="username" label="用户名" width="110" />
              <el-table-column prop="email" label="邮箱" min-width="200" />
              <el-table-column prop="role" label="角色" width="110">
                <template #default="{ row }">
                  <span
                    class="role-tag"
                    :class="row.role === 'admin' ? 'role-tag-admin' : 'role-tag-user'"
                  >
                    {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="is_active" label="状态" width="100">
                <template #default="{ row }">
                  <span class="status-cell" :class="row.is_active ? 'is-active' : 'is-inactive'">
                    <span class="status-cell-dot"></span>
                    {{ row.is_active ? '活跃' : '禁用' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="is_verified" label="验证" width="90">
                <template #default="{ row }">
                  <span
                    class="verify-text"
                    :class="row.is_verified ? 'verify-ok' : 'verify-pending'"
                  >
                    {{ row.is_verified ? '已验证' : '未验证' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="注册时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <button class="btn-row-edit" type="button" @click="openEditDialog(row)">编辑</button>
                    <button
                      class="btn-row-disable"
                      type="button"
                      @click="toggleUserStatus(row)"
                      :disabled="row.id === userStore.userInfo?.id"
                    >
                      {{ row.is_active ? '禁用' : '启用' }}
                    </button>
                    <el-dropdown
                      trigger="click"
                      @command="(command) => handleUserRowCommand(command, row)"
                    >
                      <button class="btn-row-more" type="button">...</button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            command="delete"
                            :disabled="row.role === 'admin'"
                          >
                            删除
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="admin-table-footer">
              <span class="table-total">共 {{ filteredUsers.length }} 条</span>
              <el-pagination
                v-model:current-page="userPage"
                v-model:page-size="userPageSize"
                :page-sizes="[10, 20, 50]"
                :total="filteredUsers.length"
                layout="prev, pager, next, sizes"
                background
                small
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 预测历史记录标签页 -->
        <el-tab-pane name="histories">
          <template #label>
            <span class="admin-tab-label"><el-icon><Document /></el-icon>预测历史</span>
          </template>
    <el-card class="histories-card users-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📜 预测历史记录</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteHistories" :disabled="selectedHistories.length === 0">
              批量删除 ({{ selectedHistories.length }})
            </el-button>
            <el-button type="primary" @click="refreshHistories" :loading="histLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="historySearchText" 
          placeholder="搜索用户名、情绪、模型..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredHistories" 
        v-loading="histLoading" 
        stripe
        @selection-change="handleHistorySelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column label="用户名" width="140">
          <template #default="{ row }">
            <span>{{ getHistoryUsername(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="emotion_cn" label="情绪" width="120">
          <template #default="{ row }">{{ row.emotion_cn || row.prediction || row.label || '-' }}</template>
        </el-table-column>

        <el-table-column prop="confidence" label="置信度" width="120">
          <template #default="{ row }">{{ row.confidence ? (row.confidence * 100).toFixed(1) + '%' : '-' }}</template>
        </el-table-column>

        <el-table-column prop="model_used" label="模型" width="120">
          <template #default="{ row }">{{ row.model_used || row.model || '-' }}</template>
        </el-table-column>

        <el-table-column label="输入类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getInputTypeTag(row)">
              {{ getInputTypeLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="视频信息" width="140">
          <template #default="{ row }">
            <span v-if="row.input_type === 'video'">
              帧 {{ row.frame_index !== null && row.frame_index !== undefined ? row.frame_index + 1 : '-' }} | 
              {{ formatVideoTimestamp(row.frame_timestamp) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at || row.timestamp) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewImageDetail(row)" v-if="getPreviewSrc(row)">
              <el-icon><Picture /></el-icon>
              查看图片
            </el-button>
            <el-button size="small" type="danger" @click="deleteHistory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>

        <!-- 情绪日记记录标签页 -->
        <el-tab-pane name="journals">
          <template #label>
            <span class="admin-tab-label"><el-icon><Notebook /></el-icon>情绪日记</span>
          </template>

    <!-- 情绪日记记录 -->
    <el-card class="journals-card users-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📔 情绪日记记录</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteJournals" :disabled="selectedJournals.length === 0">
              批量删除 ({{ selectedJournals.length }})
            </el-button>
            <el-button type="primary" @click="refreshJournals" :loading="journalLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="journalSearchText" 
          placeholder="搜索用户名、情绪、内容..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredJournals" 
        v-loading="journalLoading" 
        stripe
        @selection-change="handleJournalSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="emotion_cn" label="情绪" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.emotion_cn" :type="getEmotionTagType(row.emotion)">
              {{ row.emotion_cn }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="日记内容" min-width="300">
          <template #default="{ row }">
            <div class="journal-content-preview">
              {{ truncateText(row.content, 100) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewJournalDetail(row)">
              查看详情
            </el-button>
            <el-button size="small" type="danger" @click="deleteJournalRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>

        <!-- 感恩记录标签页 -->
        <el-tab-pane name="gratitudes">
          <template #label>
            <span class="admin-tab-label"><el-icon><Star /></el-icon>感恩记录</span>
          </template>

    <!-- 感恩记录 -->
    <el-card class="gratitudes-card users-card" shadow="hover" style="margin-top:20px">
      <template #header>
        <div class="card-header">
          <span>🙏 感恩记录</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteGratitudes" :disabled="selectedGratitudes.length === 0">
              批量删除 ({{ selectedGratitudes.length }})
            </el-button>
            <el-button type="primary" @click="refreshGratitudes" :loading="gratitudeLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="gratitudeSearchText" 
          placeholder="搜索用户名、感恩事项..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredGratitudes" 
        v-loading="gratitudeLoading" 
        stripe
        @selection-change="handleGratitudeSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="items" label="感恩事项" min-width="400">
          <template #default="{ row }">
            <div class="gratitude-items">
              <el-tag 
                v-for="(item, index) in row.items" 
                :key="index"
                style="margin-right: 8px; margin-bottom: 8px;"
                type="success"
              >
                {{ item }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteGratitudeRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>

        <!-- 用户情绪汇总标签页 -->
        <el-tab-pane name="summaries">
          <template #label>
            <span class="admin-tab-label"><el-icon><TrendCharts /></el-icon>情绪汇总</span>
          </template>

    <!-- 情绪汇总记录 -->
    <el-card class="emotion-summary-card users-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📊 用户情绪汇总</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteEmotionSummaries" :disabled="selectedEmotionSummaries.length === 0">
              批量删除 ({{ selectedEmotionSummaries.length }})
            </el-button>
            <el-button type="primary" @click="refreshEmotionSummaries" :loading="emotionSummaryLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="emotionSummarySearchText" 
          placeholder="搜索用户名、主导情绪..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredEmotionSummaries" 
        v-loading="emotionSummaryLoading" 
        stripe
        @selection-change="handleEmotionSummarySelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="summary_date" label="日期" width="120">
          <template #default="{ row }">{{ formatDateOnly(row.summary_date) }}</template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">{{ formatDate(row.updated_at) }}</template>
        </el-table-column>
        <el-table-column prop="total_predictions" label="识别次数" width="100" />
        <el-table-column prop="dominant_emotion_cn" label="主导情绪" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.dominant_emotion_cn" :type="getEmotionTagType(row.dominant_emotion)">
              {{ row.dominant_emotion_cn }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="positive_count" label="积极" width="80" />
        <el-table-column prop="negative_count" label="消极" width="80" />
        <el-table-column prop="neutral_count" label="中性" width="80" />
        <el-table-column label="情绪分布" min-width="200">
          <template #default="{ row }">
            <div v-if="row.emotion_counts" class="emotion-counts">
              <el-tag 
                v-for="(count, emotion) in row.emotion_counts" 
                :key="emotion"
                size="small"
                style="margin-right: 5px;"
              >
                {{ emotion }}: {{ count }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="deleteEmotionSummary(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>

        <!-- 健康评估记录标签页 -->
        <el-tab-pane name="assessments">
          <template #label>
            <span class="admin-tab-label"><el-icon><DocumentCopy /></el-icon>健康评估</span>
          </template>

    <!-- 健康评估记录 -->
    <el-card class="health-assessment-card users-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🏥 健康评估记录</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteHealthAssessments" :disabled="selectedHealthAssessments.length === 0">
              批量删除 ({{ selectedHealthAssessments.length }})
            </el-button>
            <el-button type="primary" @click="refreshHealthAssessments" :loading="healthAssessmentLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="healthAssessmentSearchText" 
          placeholder="搜索用户名、健康评分、风险等级..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredHealthAssessments" 
        v-loading="healthAssessmentLoading" 
        stripe
        @selection-change="handleHealthAssessmentSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="assessment_date" label="评估日期" width="120">
          <template #default="{ row }">{{ formatDateOnly(row.assessment_date) }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="评估时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column prop="health_score" label="健康分数" width="100">
          <template #default="{ row }">
            <el-tag :type="getHealthScoreType(row.health_score)">
              {{ row.health_score || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="risk_level_cn" label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getRiskLevelType(row.risk_level)">
              {{ row.risk_level_cn || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="positive_rate" label="积极率" width="100">
          <template #default="{ row }">{{ row.positive_rate ? (row.positive_rate * 100).toFixed(1) + '%' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="negative_rate" label="消极率" width="100">
          <template #default="{ row }">{{ row.negative_rate ? (row.negative_rate * 100).toFixed(1) + '%' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="emotion_stability" label="情绪稳定性" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewAssessmentDetail(row)">查看详情</el-button>
            <el-button size="small" type="danger" @click="deleteHealthAssessment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>

        <!-- 视频分析结果标签页 -->
        <el-tab-pane name="videos">
          <template #label>
            <span class="admin-tab-label"><el-icon><Film /></el-icon>视频分析</span>
          </template>

    <!-- 视频分析结果 -->
    <el-card class="video-analysis-card users-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🎬 视频分析结果</span>
          <div style="display:flex;gap:8px">
            <el-button type="danger" @click="batchDeleteVideoAnalyses" :disabled="selectedVideoAnalyses.length === 0">
              批量删除 ({{ selectedVideoAnalyses.length }})
            </el-button>
            <el-button type="primary" @click="refreshVideoAnalyses" :loading="videoAnalysisLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input 
          v-model="videoAnalysisSearchText" 
          placeholder="搜索用户名、视频ID、主导情绪..." 
          clearable
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table 
        :data="filteredVideoAnalyses" 
        v-loading="videoAnalysisLoading" 
        stripe
        @selection-change="handleVideoAnalysisSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="video_id" label="视频ID" width="200" show-overflow-tooltip />
        <el-table-column prop="total_frames" label="总帧数" width="100" />
        <el-table-column prop="duration_seconds" label="时长(秒)" width="100" />
        <el-table-column prop="dominant_emotion_cn" label="主导情绪" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.dominant_emotion_cn" :type="getEmotionTagType(row.dominant_emotion)">
              {{ row.dominant_emotion_cn }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avg_confidence" label="平均置信度" width="120">
          <template #default="{ row }">{{ row.avg_confidence ? (row.avg_confidence * 100).toFixed(1) + '%' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="分析时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewVideoAnalysisDetail(row)">查看详情</el-button>
            <el-button size="small" type="danger" @click="deleteVideoAnalysis(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
        </el-tab-pane>
      </el-tabs>
      </div>
    </div>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="showImageDialog"
      :title="previewImageTitle"
      width="80%"
      :close-on-click-modal="true"
      center
    >
      <div class="image-preview-container">
        <img 
          :src="previewImageUrl" 
          class="preview-image"
          @error="handleImageError"
          @load="handleImageLoad"
        />
        <div v-if="imageLoadError" class="image-error">
          <el-icon :size="60" color="#909399"><Picture /></el-icon>
          <p>图片加载失败</p>
          <p class="error-detail">{{ imageErrorMessage }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showImageDialog = false">关闭</el-button>
        <el-button type="primary" @click="downloadImage" :disabled="imageLoadError">下载图片</el-button>
      </template>
    </el-dialog>

    <!-- 新增用户对话框 -->
    <el-dialog title="新增用户" v-model="showCreateDialog">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="createForm.password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="createForm.role" placeholder="选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createUser">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog title="编辑用户" v-model="showEditDialog">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" placeholder="选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否激活">
          <el-switch v-model="editForm.is_active" active-text="活跃" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 视频分析详情对话框 -->
    <el-dialog
      v-model="showVideoAnalysisDialog"
      title="视频分析详情"
      width="60%"
      :close-on-click-modal="true"
    >
      <div v-if="selectedVideoAnalysis" class="video-analysis-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedVideoAnalysis.username }}</el-descriptions-item>
          <el-descriptions-item label="视频ID">{{ selectedVideoAnalysis.video_id }}</el-descriptions-item>
          <el-descriptions-item label="总帧数">{{ selectedVideoAnalysis.total_frames }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ selectedVideoAnalysis.duration_seconds }}秒</el-descriptions-item>
          <el-descriptions-item label="主导情绪">
            <el-tag :type="getEmotionTagType(selectedVideoAnalysis.dominant_emotion)">
              {{ selectedVideoAnalysis.dominant_emotion_cn }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="平均置信度">{{ (selectedVideoAnalysis.avg_confidence * 100).toFixed(1) }}%</el-descriptions-item>
          <el-descriptions-item label="分析时间" :span="2">{{ formatDate(selectedVideoAnalysis.created_at) }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div v-if="selectedVideoAnalysis.emotion_distribution" class="emotion-distribution">
          <h4>情绪分布:</h4>
          <el-tag 
            v-for="(count, emotion) in selectedVideoAnalysis.emotion_distribution" 
            :key="emotion"
            style="margin-right: 10px; margin-bottom: 10px;"
          >
            {{ emotion }}: {{ count }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="showVideoAnalysisDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 健康评估详情对话框 -->
    <el-dialog
      v-model="showAssessmentDialog"
      title="健康评估详情"
      width="60%"
      :close-on-click-modal="true"
    >
      <div v-if="selectedAssessment" class="assessment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedAssessment.username }}</el-descriptions-item>
          <el-descriptions-item label="评估日期">{{ formatDateOnly(selectedAssessment.assessment_date) }}</el-descriptions-item>
          <el-descriptions-item label="健康分数">
            <el-tag :type="getHealthScoreType(selectedAssessment.health_score)">
              {{ selectedAssessment.health_score }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getRiskLevelType(selectedAssessment.risk_level)">
              {{ selectedAssessment.risk_level_cn }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="积极率">{{ (selectedAssessment.positive_rate * 100).toFixed(1) }}%</el-descriptions-item>
          <el-descriptions-item label="消极率">{{ (selectedAssessment.negative_rate * 100).toFixed(1) }}%</el-descriptions-item>
          <el-descriptions-item label="情绪稳定性" :span="2">{{ selectedAssessment.emotion_stability }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div v-if="selectedAssessment.suggestions" class="assessment-suggestions">
          <h4>健康建议:</h4>
          <p>{{ selectedAssessment.suggestions }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAssessmentDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 日记详情对话框 -->
    <el-dialog
      v-model="showJournalDialog"
      title="日记详情"
      width="60%"
      :close-on-click-modal="true"
    >
      <div v-if="selectedJournal" class="journal-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedJournal.username }}</el-descriptions-item>
          <el-descriptions-item label="情绪">
            <el-tag v-if="selectedJournal.emotion_cn" :type="getEmotionTagType(selectedJournal.emotion)">
              {{ selectedJournal.emotion_cn }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(selectedJournal.created_at) }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div class="journal-content">
          <h4>日记内容:</h4>
          <p>{{ selectedJournal.content }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showJournalDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 系统设置 -->
    <div class="admin-bottom-panels">
      <div class="admin-info-panel">
        <div class="admin-panel-head">
          <span class="admin-panel-head-icon">
            <el-icon :size="18"><TrendCharts /></el-icon>
          </span>
          <h3>系统信息</h3>
        </div>
        <div class="system-info-list">
          <div class="system-info-row">
            <div class="system-info-label">
              <el-icon><Document /></el-icon>
              <span>系统版本</span>
            </div>
            <span class="info-badge info-badge-blue">v2.0.0</span>
          </div>
          <div class="system-info-row">
            <div class="system-info-label">
              <el-icon><Document /></el-icon>
              <span>API版本</span>
            </div>
            <span class="info-badge info-badge-green">v1.0.0</span>
          </div>
          <div class="system-info-row">
            <div class="system-info-label">
              <el-icon><Document /></el-icon>
              <span>运行时间</span>
            </div>
            <span class="info-badge info-badge-orange">{{ systemUptime }}</span>
          </div>
          <div class="system-info-row">
            <div class="system-info-label">
              <el-icon><Document /></el-icon>
              <span>最后更新</span>
            </div>
            <span class="info-value-text">{{ lastSystemUpdate }}</span>
          </div>
        </div>
        <div class="system-status-banner">
          <el-icon><CircleCheck /></el-icon>
          <span>系统运行正常</span>
        </div>
      </div>

      <div class="admin-quick-panel">
        <div class="admin-panel-head">
          <span class="admin-panel-head-icon">
            <el-icon :size="18"><Setting /></el-icon>
          </span>
          <h3>快速操作</h3>
        </div>
        <div class="quick-action-list">
          <div class="quick-action-item" @click="exportSystemData">
            <div class="quick-action-icon quick-action-icon-blue">
              <el-icon :size="20"><Download /></el-icon>
            </div>
            <div class="quick-action-content">
              <div class="quick-action-title">导出系统数据</div>
              <div class="quick-action-desc">导出用户和系统数据</div>
            </div>
            <span class="quick-action-arrow">›</span>
          </div>
          <div class="quick-action-item" @click="clearSystemCache">
            <div class="quick-action-icon quick-action-icon-orange">
              <el-icon :size="20"><Delete /></el-icon>
            </div>
            <div class="quick-action-content">
              <div class="quick-action-title">清理系统缓存</div>
              <div class="quick-action-desc">清除临时文件和缓存</div>
            </div>
            <span class="quick-action-arrow">›</span>
          </div>
          <div class="quick-action-item" @click="viewSystemLogs">
            <div class="quick-action-icon quick-action-icon-purple">
              <el-icon :size="20"><Document /></el-icon>
            </div>
            <div class="quick-action-content">
              <div class="quick-action-title">查看系统日志</div>
              <div class="quick-action-desc">查看系统运行日志</div>
            </div>
            <span class="quick-action-arrow">›</span>
          </div>
          <div class="quick-action-item" @click="refreshUsers(true)">
            <div class="quick-action-icon quick-action-icon-green">
              <el-icon :size="20"><Refresh /></el-icon>
            </div>
            <div class="quick-action-content">
              <div class="quick-action-title">刷新用户数据</div>
              <div class="quick-action-desc">重新加载用户列表</div>
            </div>
            <span class="quick-action-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api/client'
import {
  User,
  UserFilled,
  Warning,
  Star,
  Refresh,
  Download,
  Delete,
  Document,
  Picture,
  Search,
  Notebook,
  TrendCharts,
  DocumentCopy,
  Film,
  Setting,
  Lock,
  Coin,
  Monitor,
  Clock,
  CircleCheck
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

// 当前激活的标签页
const activeTab = ref('users')

// 响应式数据
const users = ref([])
const systemStats = ref({})
const loading = ref(false)
const storagePercent = ref(68)
const lastCheckTime = ref('--:--:--')
const userPage = ref(1)
const userPageSize = ref(10)

const activeUserRate = computed(() => {
  const total = systemStats.value.total_users || 0
  const active = systemStats.value.active_users || 0
  if (!total) return 0
  return Math.round((active / total) * 100)
})
const histories = ref([])
const histLoading = ref(false)
const showCreateDialog = ref(false)
const createForm = reactive({ username: '', email: '', password: '', role: 'user' })
const showEditDialog = ref(false)
const editForm = reactive({ id: null, email: '', role: 'user', is_active: true })

// 情绪日记相关
const journals = ref([])
const journalLoading = ref(false)
const showJournalDialog = ref(false)
const selectedJournal = ref(null)

// 感恩记录相关
const gratitudes = ref([])
const gratitudeLoading = ref(false)

// 情绪汇总相关
const emotionSummaries = ref([])
const emotionSummaryLoading = ref(false)

// 健康评估相关
const healthAssessments = ref([])
const healthAssessmentLoading = ref(false)
const showAssessmentDialog = ref(false)
const selectedAssessment = ref(null)

// 视频分析相关
const videoAnalyses = ref([])
const videoAnalysisLoading = ref(false)
const showVideoAnalysisDialog = ref(false)
const selectedVideoAnalysis = ref(null)

// 搜索文本
const userSearchText = ref('')
const historySearchText = ref('')
const journalSearchText = ref('')
const gratitudeSearchText = ref('')
const emotionSummarySearchText = ref('')
const healthAssessmentSearchText = ref('')
const videoAnalysisSearchText = ref('')

// 选中项数组
const selectedUsers = ref([])
const selectedHistories = ref([])
const selectedJournals = ref([])
const selectedGratitudes = ref([])
const selectedEmotionSummaries = ref([])
const selectedHealthAssessments = ref([])
const selectedVideoAnalyses = ref([])

// 计算属性
const systemUptime = computed(() => {
  return '2天 15小时 30分钟'
})

const lastSystemUpdate = ref('')

function updateLastSystemUpdate() {
  lastSystemUpdate.value = formatDate(new Date())
}

// 过滤后的数据
const filteredUsers = computed(() => {
  if (!userSearchText.value) return users.value
  const search = userSearchText.value.toLowerCase()
  return users.value.filter(u => 
    u.username?.toLowerCase().includes(search) ||
    u.email?.toLowerCase().includes(search) ||
    (u.role === 'admin' ? '管理员' : '普通用户').includes(search)
  )
})

const paginatedUsers = computed(() => {
  const start = (userPage.value - 1) * userPageSize.value
  return filteredUsers.value.slice(start, start + userPageSize.value)
})

watch(userSearchText, () => {
  userPage.value = 1
})

watch(userPageSize, () => {
  userPage.value = 1
})

function updateLastCheckTime() {
  const now = new Date()
  lastCheckTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

function handleUserRowCommand(command, row) {
  if (command === 'delete') {
    deleteUser(row)
  }
}

const filteredHistories = computed(() => {
  if (!historySearchText.value) return histories.value
  const search = historySearchText.value.toLowerCase()
  return histories.value.filter(h => 
    h.username?.toLowerCase().includes(search) ||
    h.emotion_cn?.toLowerCase().includes(search) ||
    h.model_used?.toLowerCase().includes(search)
  )
})

const filteredJournals = computed(() => {
  if (!journalSearchText.value) return journals.value
  const search = journalSearchText.value.toLowerCase()
  return journals.value.filter(j => 
    j.username?.toLowerCase().includes(search) ||
    j.emotion_cn?.toLowerCase().includes(search) ||
    j.content?.toLowerCase().includes(search)
  )
})

const filteredGratitudes = computed(() => {
  if (!gratitudeSearchText.value) return gratitudes.value
  const search = gratitudeSearchText.value.toLowerCase()
  return gratitudes.value.filter(g => 
    g.username?.toLowerCase().includes(search) ||
    g.items?.some(item => item.toLowerCase().includes(search))
  )
})

const filteredEmotionSummaries = computed(() => {
  if (!emotionSummarySearchText.value) return emotionSummaries.value
  const search = emotionSummarySearchText.value.toLowerCase()
  return emotionSummaries.value.filter(e => 
    e.username?.toLowerCase().includes(search) ||
    e.dominant_emotion_cn?.toLowerCase().includes(search)
  )
})

const filteredHealthAssessments = computed(() => {
  if (!healthAssessmentSearchText.value) return healthAssessments.value
  const search = healthAssessmentSearchText.value.toLowerCase()
  return healthAssessments.value.filter(h => 
    h.username?.toLowerCase().includes(search) ||
    h.risk_level?.toLowerCase().includes(search) ||
    h.health_score?.toString().includes(search)
  )
})

const filteredVideoAnalyses = computed(() => {
  if (!videoAnalysisSearchText.value) return videoAnalyses.value
  const search = videoAnalysisSearchText.value.toLowerCase()
  return videoAnalyses.value.filter(v => 
    v.username?.toLowerCase().includes(search) ||
    v.video_id?.toLowerCase().includes(search) ||
    v.dominant_emotion_cn?.toLowerCase().includes(search)
  )
})

// 获取系统统计信息
const fetchSystemStats = async () => {
  try {
    const response = await api.get('/auth/admin/system-stats')
    systemStats.value = response.data.stats
    updateLastCheckTime()
  } catch (error) {
    console.error('获取系统统计失败:', error)
    ElMessage.error('获取系统统计失败')
  }
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/auth/admin/users')
    users.value = response.data.users
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 获取历史记录（管理员）
const fetchHistories = async () => {
  histLoading.value = true
  try {
    const res = await api.get('/admin/histories')
    histories.value = res.data.histories
    
    // 🐛 调试：检查视频记录的 username 字段
    const videoRecords = res.data.histories.filter(h => h.input_type === 'video')
    console.log('📹 [Admin] 视频记录数量:', videoRecords.length)
    if (videoRecords.length > 0) {
      console.log('📹 [Admin] 第一条视频记录:', videoRecords[0])
      console.log('📹 [Admin] 视频记录的 username:', videoRecords.map(v => ({ id: v.id, username: v.username, input_type: v.input_type })))
    }
  } catch (err) {
    console.error('获取历史记录失败:', err)
    ElMessage.error('获取历史记录失败')
  } finally {
    histLoading.value = false
  }
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要${user.is_active ? '禁用' : '启用'}用户 "${user.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await api.put(`/auth/admin/users/${user.id}/toggle-status`)
    ElMessage.success(`用户 ${user.username} 已${user.is_active ? '禁用' : '启用'}`)
    fetchUsers() // 刷新用户列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 刷新用户列表
const refreshUsers = (scrollToPanel = false) => {
  if (scrollToPanel) {
    activeTab.value = 'users'
  }
  fetchUsers()
  fetchSystemStats()
  if (scrollToPanel) {
    nextTick(() => {
      document.querySelector('.admin-tabs-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

function downloadJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function sanitizeUserRecord(user) {
  const { password, password_hash, ...safeUser } = user
  return safeUser
}

// 导出系统数据
const exportSystemData = async () => {
  try {
    if (!users.value.length) {
      await fetchUsers()
    }
    if (!Object.keys(systemStats.value).length) {
      await fetchSystemStats()
    }

    const exportPayload = {
      exported_at: new Date().toISOString(),
      system_stats: systemStats.value,
      users: users.value.map(sanitizeUserRecord),
      records_summary: {
        prediction_histories: histories.value.length,
        emotion_journals: journals.value.length,
        gratitude_records: gratitudes.value.length,
        emotion_summaries: emotionSummaries.value.length,
        health_assessments: healthAssessments.value.length,
        video_analyses: videoAnalyses.value.length
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadJsonFile(exportPayload, `system-export-${timestamp}.json`)
    updateLastSystemUpdate()
    ElMessage.success('系统数据已导出')
  } catch (error) {
    console.error('导出系统数据失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

// 清理系统缓存
const clearSystemCache = async () => {
  try {
    await ElMessageBox.confirm(
      '将清理浏览器中的本地缓存（日记、感恩记录等备份），不会删除服务器数据。是否继续？',
      '清理系统缓存',
      { type: 'warning', confirmButtonText: '清理', cancelButtonText: '取消' }
    )
    ;['groundingRecords', 'journals', 'gratitudes'].forEach((key) => {
      localStorage.removeItem(key)
    })
    ElMessage.success('本地缓存已清理')
  } catch {
    // 用户取消
  }
}

// 查看系统日志
const viewSystemLogs = () => {
  activeTab.value = 'histories'
  if (!histories.value.length) {
    fetchHistories()
  }
  nextTick(() => {
    document.querySelector('.admin-tabs-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const refreshHistories = () => {
  fetchHistories()
}

const openCreateDialog = () => {
  createForm.username = ''
  createForm.email = ''
  createForm.password = ''
  createForm.role = 'user'
  showCreateDialog.value = true
}

const createUser = async () => {
  try {
    const payload = {
      username: createForm.username,
      email: createForm.email,
      password: createForm.password,
      role: createForm.role
    }
    const resp = await api.post('/auth/admin/users', payload)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    refreshUsers()
  } catch (err) {
    console.error('创建用户失败:', err)
    ElMessage.error('创建用户失败')
  }
}

const openEditDialog = (row) => {
  editForm.id = row.id
  editForm.email = row.email || ''
  editForm.role = row.role || 'user'
  editForm.is_active = !!row.is_active
  showEditDialog.value = true
}

const saveEditUser = async () => {
  try {
    const id = editForm.id
    await api.put(`/auth/admin/users/${id}`, {
      email: editForm.email,
      role: editForm.role,
      is_active: editForm.is_active
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    refreshUsers()
  } catch (err) {
    console.error('保存用户失败:', err)
    ElMessage.error('保存失败')
  }
}

const deleteUser = async (row) => {
  // 防止删除管理员
  if (row.role === 'admin') {
    ElMessage.warning('不能删除管理员账户！')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} ?`, '确认删除', { type: 'warning' })
    await api.delete(`/auth/admin/users/${row.id}`)
    ElMessage.success('删除成功')
    refreshUsers()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除用户失败:', err)
      ElMessage.error('删除用户失败')
    }
  }
}

// 判断用户是否可以被选中（管理员不能被选中）
const canSelectUser = (row) => {
  return row.role !== 'admin'
}

// 选择变化处理
const handleUserSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 批量删除用户
const batchDeleteUsers = async () => {
  const count = selectedUsers.value.length
  if (count === 0) return
  
  // 再次检查是否有管理员（理论上不应该有）
  const hasAdmin = selectedUsers.value.some(u => u.role === 'admin')
  if (hasAdmin) {
    ElMessage.error('选中的用户中包含管理员，无法删除！')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 个用户吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const user of selectedUsers.value) {
      try {
        await api.delete(`/auth/admin/users/${user.id}`)
        successCount++
      } catch (err) {
        console.error(`删除用户 ${user.username} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 个用户${failCount > 0 ? `，失败 ${failCount} 个` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedUsers.value = []
    refreshUsers()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// 格式化日期时间
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  })
}

// 格式化日期（只显示年月日）
const formatDateOnly = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  })
}

// 格式化视频时间戳
const formatVideoTimestamp = (seconds) => {
  if (seconds === null || seconds === undefined) return '-'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取输入类型标签
const getInputTypeLabel = (row) => {
  const type = row.input_type || row.media_type || (row.video ? 'video' : 'image')
  return type === 'video' ? '视频' : '图片'
}

// 获取输入类型标签样式
const getInputTypeTag = (row) => {
  const type = row.input_type || row.media_type || (row.video ? 'video' : 'image')
  return type === 'video' ? 'warning' : 'success'
}

// 根据记录生成可用的预览图片地址（支持后端返回的 base64、url、文件路径字段）
const getPreviewSrc = (row) => {
  if (!row) return null
  
  // 优先检查文件路径字段（新版：存文件路径而非 base64）
  // 视频帧优先使用 preprocessed_image_path
  if (row.preprocessed_image_path) {
    // 将服务器文件路径转换为可访问的 URL
    // 移除开头的 'uploads/' 并规范化路径分隔符
    let path = row.preprocessed_image_path.replace(/\\/g, '/')
    // 如果路径以 uploads/ 开头，去掉它（因为 API 端点已包含）
    if (path.startsWith('uploads/')) {
      path = path.substring(8)
    }
    return `http://localhost:5000/api/uploads/${path}`
  }
  if (row.original_image_path) {
    let path = row.original_image_path.replace(/\\/g, '/')
    if (path.startsWith('uploads/')) {
      path = path.substring(8)
    }
    return `http://localhost:5000/api/uploads/${path}`
  }
  if (row.thumbnail_path) {
    let path = row.thumbnail_path.replace(/\\/g, '/')
    if (path.startsWith('uploads/')) {
      path = path.substring(8)
    }
    return `http://localhost:5000/api/uploads/${path}`
  }
  
  // 兼容旧版：base64 或 URL 字段
  if (row.thumbnail) return row.thumbnail
  if (row.preview) return row.preview
  if (row.image) return row.image
  if (row.image_base64) {
    return row.image_base64.startsWith('data:') ? row.image_base64 : `data:image/jpeg;base64,${row.image_base64}`
  }
  if (row.frame_base64) return row.frame_base64.startsWith('data:') ? row.frame_base64 : `data:image/jpeg;base64,${row.frame_base64}`
  if (row.frame) return row.frame
  if (row.face_image) return row.face_image  // 视频帧人脸图片
  
  // 如果都没有，返回占位图标（至少显示按钮）
  return 'placeholder'
}

// 点击缩略图时在新标签打开大图
const viewImage = (row) => {
  const src = getPreviewSrc(row)
  if (!src) {
    ElMessage.info('无可预览的图片')
    return
  }
  // 打开新窗口预览（大部分浏览器支持 data url）
  window.open(src, '_blank')
}

// 从多种来源解析并返回历史记录对应的用户名（兼容后端是否返回 user 对象）
const getHistoryUsername = (row) => {
  if (!row) return '-'
  // 常见后端返回方式优先级
  // 1. 完整的 user 对象
  if (row.user) {
    // 如果后端返回的是对象
    if (typeof row.user === 'object') {
      if (row.user.username) return row.user.username
      if (row.user.name) return row.user.name
    } else {
      // 如果后端直接返回 user 为 id（数字或字符串），尝试匹配 users 列表
      const idVal = row.user
      const match = users.value.find(u => String(u.id) === String(idVal) || u.id === idVal)
      if (match) return match.username || match.email || String(match.id)
      return String(idVal)
    }
  }
  // 2. 直接在记录里包含 username / user_name
  if (row.username) return row.username
  if (row.user_name) return row.user_name

  // 3. 检查可能的 id 字段（user_id / userId）并在已加载的 users 列表中查找
  const idCandidates = [row.user_id, row.userId, row.uid]
  for (const idc of idCandidates) {
    if (!idc && idc !== 0) continue
    const match = users.value.find(u => String(u.id) === String(idc) || u.id === idc)
    if (match) return match.username || match.email || String(match.id)
    // 没找到但有 id，返回 id 字符串以示区别
    return String(idc)
  }

  // 4. 如果记录包含 email，可以展示为替代
  if (row.user_email || row.email) return row.user_email || row.email

  return '-'
}

// 删除历史记录
const deleteHistory = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除历史记录 ${row.id} ?`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/histories/${row.id}`)
    ElMessage.success('删除成功')
    refreshHistories()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除历史失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleHistorySelectionChange = (selection) => {
  selectedHistories.value = selection
}

// 批量删除历史记录
const batchDeleteHistories = async () => {
  const count = selectedHistories.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条历史记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedHistories.value) {
      try {
        await api.delete(`/admin/histories/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除记录 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedHistories.value = []
    refreshHistories()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// ========================================
// 情绪日记管理
// ========================================

// 获取所有用户的情绪日记
const fetchJournals = async () => {
  journalLoading.value = true
  try {
    const response = await api.get('/admin/journals')
    journals.value = response.data.journals || []
  } catch (error) {
    console.error('获取情绪日记失败:', error)
    ElMessage.error('获取情绪日记失败')
  } finally {
    journalLoading.value = false
  }
}

// 刷新日记列表
const refreshJournals = () => {
  fetchJournals()
}

// 查看日记详情
const viewJournalDetail = (row) => {
  selectedJournal.value = row
  showJournalDialog.value = true
}

// 删除日记记录
const deleteJournalRecord = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} 的日记记录吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/journals/${row.id}`)
    ElMessage.success('删除成功')
    refreshJournals()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除日记失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleJournalSelectionChange = (selection) => {
  selectedJournals.value = selection
}

// 批量删除日记
const batchDeleteJournals = async () => {
  const count = selectedJournals.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条日记记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedJournals.value) {
      try {
        await api.delete(`/admin/journals/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除日记 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedJournals.value = []
    refreshJournals()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// ========================================
// 感恩记录管理
// ========================================

// 获取所有用户的感恩记录
const fetchGratitudes = async () => {
  gratitudeLoading.value = true
  try {
    const response = await api.get('/admin/gratitudes')
    gratitudes.value = response.data.gratitudes || []
  } catch (error) {
    console.error('获取感恩记录失败:', error)
    ElMessage.error('获取感恩记录失败')
  } finally {
    gratitudeLoading.value = false
  }
}

// 刷新感恩记录列表
const refreshGratitudes = () => {
  fetchGratitudes()
}

// 删除感恩记录
const deleteGratitudeRecord = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} 的感恩记录吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/gratitudes/${row.id}`)
    ElMessage.success('删除成功')
    refreshGratitudes()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除感恩记录失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleGratitudeSelectionChange = (selection) => {
  selectedGratitudes.value = selection
}

// 批量删除感恩记录
const batchDeleteGratitudes = async () => {
  const count = selectedGratitudes.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条感恩记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedGratitudes.value) {
      try {
        await api.delete(`/admin/gratitudes/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除感恩记录 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedGratitudes.value = []
    refreshGratitudes()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// ========================================
// 辅助函数
// ========================================

// 获取情绪标签类型
const getEmotionTagType = (emotion) => {
  const emotionMap = {
    'happy': 'success',
    'surprised': 'success',
    'normal': 'info',
    'sad': 'warning',
    'anger': 'danger',
    'disgust': 'danger',
    'fear': 'warning'
  }
  return emotionMap[emotion] || 'info'
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ========================================
// 情绪汇总管理
// ========================================

const fetchEmotionSummaries = async () => {
  emotionSummaryLoading.value = true
  try {
    const response = await api.get('/admin/emotion-summaries')
    emotionSummaries.value = response.data.summaries || []
  } catch (error) {
    console.error('获取情绪汇总失败:', error)
    ElMessage.error('获取情绪汇总失败')
  } finally {
    emotionSummaryLoading.value = false
  }
}

const refreshEmotionSummaries = () => {
  fetchEmotionSummaries()
}

const deleteEmotionSummary = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} 在 ${formatDate(row.summary_date)} 的情绪汇总吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/emotion-summaries/${row.id}`)
    ElMessage.success('删除成功')
    refreshEmotionSummaries()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除情绪汇总失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleEmotionSummarySelectionChange = (selection) => {
  selectedEmotionSummaries.value = selection
}

// 批量删除情绪汇总
const batchDeleteEmotionSummaries = async () => {
  const count = selectedEmotionSummaries.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条情绪汇总记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedEmotionSummaries.value) {
      try {
        await api.delete(`/admin/emotion-summaries/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除情绪汇总 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedEmotionSummaries.value = []
    refreshEmotionSummaries()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// ========================================
// 健康评估管理
// ========================================

const fetchHealthAssessments = async () => {
  healthAssessmentLoading.value = true
  try {
    const response = await api.get('/admin/health-assessments')
    healthAssessments.value = response.data.assessments || []
  } catch (error) {
    console.error('获取健康评估失败:', error)
    ElMessage.error('获取健康评估失败')
  } finally {
    healthAssessmentLoading.value = false
  }
}

const refreshHealthAssessments = () => {
  fetchHealthAssessments()
}

const viewAssessmentDetail = (row) => {
  selectedAssessment.value = row
  showAssessmentDialog.value = true
}

const deleteHealthAssessment = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} 的健康评估记录吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/health-assessments/${row.id}`)
    ElMessage.success('删除成功')
    refreshHealthAssessments()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除健康评估失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleHealthAssessmentSelectionChange = (selection) => {
  selectedHealthAssessments.value = selection
}

// 批量删除健康评估
const batchDeleteHealthAssessments = async () => {
  const count = selectedHealthAssessments.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条健康评估记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedHealthAssessments.value) {
      try {
        await api.delete(`/admin/health-assessments/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除健康评估 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedHealthAssessments.value = []
    refreshHealthAssessments()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

const getHealthScoreType = (score) => {
  if (!score) return 'info'
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const getRiskLevelType = (level) => {
  const levelMap = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }
  return levelMap[level] || 'info'
}

// ========================================
// 视频分析管理
// ========================================

const fetchVideoAnalyses = async () => {
  videoAnalysisLoading.value = true
  try {
    const response = await api.get('/admin/video-analyses')
    videoAnalyses.value = response.data.analyses || []
  } catch (error) {
    console.error('获取视频分析失败:', error)
    ElMessage.error('获取视频分析失败')
  } finally {
    videoAnalysisLoading.value = false
  }
}

const refreshVideoAnalyses = () => {
  fetchVideoAnalyses()
}

const viewVideoAnalysisDetail = (row) => {
  selectedVideoAnalysis.value = row
  showVideoAnalysisDialog.value = true
}

const deleteVideoAnalysis = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username} 的视频分析记录吗？`, '确认删除', { type: 'warning' })
    await api.delete(`/admin/video-analyses/${row.id}`)
    ElMessage.success('删除成功')
    refreshVideoAnalyses()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除视频分析失败:', err)
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化处理
const handleVideoAnalysisSelectionChange = (selection) => {
  selectedVideoAnalyses.value = selection
}

// 批量删除视频分析
const batchDeleteVideoAnalyses = async () => {
  const count = selectedVideoAnalyses.value.length
  if (count === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${count} 条视频分析记录吗？此操作不可恢复！`,
      '批量删除',
      { type: 'warning' }
    )
    
    let successCount = 0
    let failCount = 0
    
    for (const item of selectedVideoAnalyses.value) {
      try {
        await api.delete(`/admin/video-analyses/${item.id}`)
        successCount++
      } catch (err) {
        console.error(`删除视频分析 ${item.id} 失败:`, err)
        failCount++
      }
    }
    
    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录${failCount > 0 ? `，失败 ${failCount} 条` : ''}`)
    } else {
      ElMessage.error('删除失败')
    }
    
    selectedVideoAnalyses.value = []
    refreshVideoAnalyses()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('批量删除失败:', err)
    }
  }
}

// 图片预览对话框
const showImageDialog = ref(false)
const previewImageUrl = ref('')
const previewImageTitle = ref('')
const imageLoadError = ref(false)
const imageErrorMessage = ref('')

// 查看图片详情
const viewImageDetail = (row) => {
  const src = getPreviewSrc(row)
  if (!src || src === 'placeholder') {
    ElMessage.warning('该记录没有保存图片数据')
    return
  }
  previewImageUrl.value = src
  
  // 生成标题，包含视频信息
  let title = `${getHistoryUsername(row)} - ${row.emotion_cn || '情绪识别'}`
  if (row.input_type === 'video') {
    const frameInfo = row.frame_index !== null && row.frame_index !== undefined 
      ? `帧 ${row.frame_index + 1}` 
      : '视频帧'
    const timeInfo = formatVideoTimestamp(row.frame_timestamp)
    title += ` (${frameInfo} @ ${timeInfo})`
  }
  title += ` - ${formatDate(row.created_at || row.timestamp)}`
  
  previewImageTitle.value = title
  imageLoadError.value = false
  imageErrorMessage.value = ''
  showImageDialog.value = true
  
  console.log('🖼️ 加载图片:', src)
}

// 图片加载成功
const handleImageLoad = () => {
  imageLoadError.value = false
  console.log('✅ 图片加载成功')
}

// 图片加载失败
const handleImageError = (event) => {
  imageLoadError.value = true
  imageErrorMessage.value = `无法加载图片: ${previewImageUrl.value}`
  console.error('❌ 图片加载失败:', previewImageUrl.value)
  ElMessage.error('图片加载失败，请检查文件是否存在')
}

// 下载图片
const downloadImage = () => {
  if (!previewImageUrl.value) return
  
  // 创建一个临时 a 标签下载图片
  const link = document.createElement('a')
  link.href = previewImageUrl.value
  link.download = `emotion_${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('图片下载已开始')
}

// 组件挂载时获取数据
onMounted(async () => {
  // 检查管理员权限
  if (!userStore.isAdmin) {
    ElMessage.error('权限不足，只有管理员可以访问此页面')
    // 延迟跳转，避免组件渲染问题
    setTimeout(() => {
      router.push('/app')
    }, 1000)
    return
  }

  // 为了确保历史记录能正确映射到用户名，先加载用户列表，再加载历史
  try {
    await fetchUsers()
    updateLastCheckTime()
    updateLastSystemUpdate()
  } catch (e) {
    // fetchUsers 内部有错误处理并会设置 loading，因此这里只捕获以保证后续继续
    console.warn('加载用户列表时发生错误:', e)
  }

  try {
    await fetchHistories()
  } catch (e) {
    console.warn('加载历史记录时发生错误:', e)
  }

  // 加载情绪日记
  try {
    await fetchJournals()
  } catch (e) {
    console.warn('加载情绪日记时发生错误:', e)
  }

  // 加载感恩记录
  try {
    await fetchGratitudes()
  } catch (e) {
    console.warn('加载感恩记录时发生错误:', e)
  }

  // 加载情绪汇总
  try {
    await fetchEmotionSummaries()
  } catch (e) {
    console.warn('加载情绪汇总时发生错误:', e)
  }

  // 加载健康评估
  try {
    await fetchHealthAssessments()
  } catch (e) {
    console.warn('加载健康评估时发生错误:', e)
  }

  // 加载视频分析
  try {
    await fetchVideoAnalyses()
  } catch (e) {
    console.warn('加载视频分析时发生错误:', e)
  }

  // 系统统计可以并行加载
  fetchSystemStats()
})
</script>

<style scoped>
.admin-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

/* 管理页顶部 */
.admin-page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.5rem 1.75rem;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(241, 245, 249, 0.9);
  box-shadow: 0 4px 24px rgba(124, 77, 255, 0.08);
  overflow: hidden;
}

.admin-header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.admin-header-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(237, 233, 254, 0.45) 70%, rgba(245, 243, 255, 0.8) 100%);
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-header-text h1 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.35rem;
}

.admin-header-text p {
  font-size: 0.92rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.admin-permission-badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid #ddd6fe;
  background: #f5f3ff;
  color: #7c3aed;
  font-size: 0.82rem;
  font-weight: 600;
  flex-shrink: 0;
}

.admin-header-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.deco-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.45;
}

.deco-blob-1 {
  width: 180px;
  height: 180px;
  right: 8%;
  top: -40%;
  background: radial-gradient(circle, rgba(196, 181, 253, 0.35) 0%, transparent 70%);
}

.deco-blob-2 {
  width: 140px;
  height: 140px;
  right: 22%;
  bottom: -55%;
  background: radial-gradient(circle, rgba(221, 214, 254, 0.4) 0%, transparent 70%);
}

.deco-leaf {
  position: absolute;
  right: 1.5rem;
  bottom: 0.5rem;
  font-size: 2.5rem;
  opacity: 0.12;
  transform: rotate(-15deg);
}

.admin-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.admin-stat-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.1rem 1.15rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 12px rgba(124, 77, 255, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.admin-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(124, 77, 255, 0.08);
}

.admin-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.admin-stat-icon-blue {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.admin-stat-icon-green {
  background: linear-gradient(135deg, #6ee7a0, #34d399);
}

.admin-stat-icon-orange {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.admin-stat-icon-purple {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}

.admin-stat-body {
  flex: 1;
  min-width: 0;
}

.admin-stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
  margin-bottom: 0.2rem;
}

.admin-stat-label {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.45rem;
}

.admin-stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-mark {
  font-size: 0.7rem;
  line-height: 1;
}

.trend-active {
  color: #16a34a;
}

.trend-neutral {
  color: #94a3b8;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left h1 {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-left p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-right .el-tag {
  font-size: 16px;
  padding: 12px 20px;
}

/* 统计数据行 */
.stats-row {
  margin-bottom: 2rem;
}

/* 搜索栏样式 */
.search-bar {
  margin-bottom: 16px;
  padding: 0 20px;
}

/* 统计卡片样式 */
.stat-card {
  margin-bottom: 1.5rem;
  transition: all 0.3s;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 10px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.stat-icon-success {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.stat-icon-warning {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.stat-icon-danger {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: bold;
  color: #303133;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: #909399;
  font-size: 1rem;
  font-weight: 500;
}

/* 用户管理卡片 */
.users-card {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 系统信息与快速操作 */
.admin-bottom-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.admin-info-panel,
.admin-quick-panel {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-panel-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 1.15rem 1.25rem 0.85rem;
}

.admin-panel-head-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f5f3ff;
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-panel-head h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
}

.system-info-list {
  padding: 0 1.25rem;
}

.system-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.system-info-row:last-child {
  border-bottom: none;
}

.system-info-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
}

.system-info-label .el-icon {
  color: #94a3b8;
  font-size: 1rem;
}

.info-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.info-badge-blue {
  background: #eff6ff;
  color: #3b82f6;
}

.info-badge-green {
  background: #ecfdf5;
  color: #16a34a;
}

.info-badge-orange {
  background: #fff7ed;
  color: #ea580c;
}

.info-value-text {
  font-size: 0.85rem;
  color: #334155;
  font-weight: 500;
}

.system-status-banner {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.85rem 1.25rem 1.15rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #ecfdf5;
  color: #16a34a;
  font-size: 0.88rem;
  font-weight: 600;
}

.system-status-banner .el-icon {
  font-size: 1.1rem;
}

.quick-action-list {
  padding: 0 1.25rem 1.15rem;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.quick-action-item:last-child {
  border-bottom: none;
}

.quick-action-item:hover {
  background: #faf9ff;
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 10px;
}

.quick-action-item:hover .quick-action-arrow {
  color: #7c3aed;
}

.quick-action-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.quick-action-icon-blue {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.quick-action-icon-orange {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.quick-action-icon-purple {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
}

.quick-action-icon-green {
  background: linear-gradient(135deg, #6ee7a0, #34d399);
}

.quick-action-content {
  flex: 1;
  min-width: 0;
}

.quick-action-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.15rem;
}

.quick-action-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.45;
}

.quick-action-arrow {
  font-size: 1.1rem;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: color 0.2s;
}

/* 系统设置卡片（遗留） */
.settings-card {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.settings-card h4 {
  color: #303133;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.desc-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.action-button:hover {
  background: #ffffff;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #e4e7ed;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-icon-blue {
  background: linear-gradient(135deg, #88c8f5 0%, #5ea9db 100%);
}

.action-icon-orange {
  background: linear-gradient(135deg, #f5b88c 0%, #db9770 100%);
}

.action-icon-purple {
  background: linear-gradient(135deg, #b8a5f5 0%, #9785db 100%);
}

.action-icon-green {
  background: linear-gradient(135deg, #a5d4a5 0%, #85b685 100%);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #909399;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  font-weight: 600;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-view {
    padding: 10px;
  }

  .admin-page-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .admin-stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .status-time {
    margin-left: 0;
    width: 100%;
  }

  .admin-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-bottom-panels {
    grid-template-columns: 1fr;
  }

  .admin-header-deco {
    display: none;
  }

  .page-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left h1 {
    font-size: 1.8rem;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-tag {
    width: 100%;
    justify-content: center;
  }
  
  .stat-content {
    gap: 1rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
  }

  .stat-value {
    font-size: 1.8rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-button {
    padding: 16px;
  }

  .action-icon {
    width: 45px;
    height: 45px;
  }

  .action-title {
    font-size: 15px;
  }

  .action-desc {
    font-size: 12px;
  }
}

/* 图片预览对话框样式 */
.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.preview-image:hover {
  transform: scale(1.02);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  text-align: center;
}

.image-error p {
  margin: 10px 0;
  font-size: 16px;
}

.image-error .error-detail {
  font-size: 12px;
  color: #c0c4cc;
  word-break: break-all;
  max-width: 500px;
}

/* 日记和感恩记录样式 */
.journal-content-preview {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

.journal-detail .journal-content {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;
}

.journal-detail .journal-content h4 {
  margin-bottom: 12px;
  color: #303133;
}

.journal-detail .journal-content p {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

.gratitude-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.journals-card,
.gratitudes-card {
  margin-top: 20px;
}

/* 深色模式支持 */
.dark .admin-page-header {
  background: rgba(44, 44, 44, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .admin-header-text h1 {
  color: #e0e0e0;
}

.dark .admin-header-text p {
  color: #b0b0b0;
}

.dark .admin-permission-badge {
  background: rgba(124, 58, 237, 0.15);
  border-color: rgba(167, 139, 250, 0.35);
  color: #c4b5fd;
}

.dark .admin-stat-card {
  background: rgba(44, 44, 44, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .admin-stat-value {
  color: #e0e0e0;
}

.dark .admin-stat-label {
  color: #b0b0b0;
}

.dark .system-status-bar,
.dark .admin-tabs-panel {
  background: rgba(44, 44, 44, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .admin-panel-title h3,
.dark .status-item.status-ok {
  color: #e0e0e0;
}

.dark .admin-user-table :deep(.el-table__header th) {
  background: rgba(255, 255, 255, 0.04);
  color: #b0b0b0;
}

.dark .admin-info-panel,
.dark .admin-quick-panel {
  background: rgba(44, 44, 44, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .admin-panel-head h3,
.dark .quick-action-title,
.dark .info-value-text {
  color: #e0e0e0;
}

.dark .system-info-row,
.dark .quick-action-item {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.dark .page-header {
  background: rgba(44, 44, 44, 0.95);
}

.dark .page-header h1 {
  color: #e0e0e0;
}

.dark .page-header p {
  color: #b0b0b0;
}

.dark .stat-value {
  color: #e0e0e0;
}

.dark .settings-card h4 {
  color: #e0e0e0;
}

.dark .image-preview-container {
  background-color: #2c2c2c;
}

/* 系统状态与标签页 */
.admin-workspace {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.system-status-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem 0;
  padding: 0.85rem 1.15rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 2px 12px rgba(124, 77, 255, 0.04);
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #64748b;
  white-space: nowrap;
}

.status-item.status-ok {
  color: #475569;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.status-icon {
  color: #7c3aed;
  font-size: 0.95rem;
}

.status-divider {
  width: 1px;
  height: 14px;
  background: #e2e8f0;
  margin: 0 0.5rem;
}

.status-storage {
  gap: 0.55rem;
}

.storage-progress {
  width: 72px;
  height: 6px;
  background: #eef2f6;
  border-radius: 999px;
  overflow: hidden;
}

.storage-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  border-radius: 999px;
}

.status-time {
  margin-left: auto;
}

.admin-tabs-panel {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 20px rgba(124, 77, 255, 0.05);
  overflow: hidden;
}

.admin-data-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}

.admin-data-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.admin-data-tabs :deep(.el-tabs__item) {
  height: 52px;
  padding: 0 1.1rem;
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}

.admin-data-tabs :deep(.el-tabs__item.is-active) {
  color: #7c3aed;
  font-weight: 700;
}

.admin-data-tabs :deep(.el-tabs__active-bar) {
  background: #7c3aed;
  height: 3px;
  border-radius: 3px 3px 0 0;
}

.admin-data-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.admin-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.admin-user-panel {
  padding: 1.25rem 1.35rem 1.1rem;
}

.admin-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.admin-panel-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.admin-panel-title-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f5f3ff;
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-panel-title h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
}

.admin-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.btn-batch-delete,
.btn-add-user,
.btn-refresh-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch-delete {
  border: 1px solid #fecaca;
  background: #fff;
  color: #ef4444;
}

.btn-batch-delete:hover:not(:disabled) {
  background: #fef2f2;
}

.btn-batch-delete:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-add-user {
  border: none;
  background: #7c3aed;
  color: #fff;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.22);
}

.btn-add-user:hover {
  background: #6d28d9;
}

.btn-refresh-outline {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
}

.btn-refresh-outline:hover:not(:disabled) {
  border-color: #ddd6fe;
  color: #7c3aed;
}

.admin-search-bar {
  margin-bottom: 1rem;
}

.admin-search-bar :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #eef2f6 inset;
}

.admin-user-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.82rem;
}

.admin-user-table :deep(.el-table__body td) {
  font-size: 0.88rem;
  color: #334155;
}

.admin-user-table :deep(.el-table__row:hover > td) {
  background: #faf9ff !important;
}

.role-tag {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.role-tag-user {
  background: #eff6ff;
  color: #3b82f6;
}

.role-tag-admin {
  background: #fef2f2;
  color: #ef4444;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.status-cell-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-cell.is-active {
  color: #16a34a;
}

.status-cell.is-active .status-cell-dot {
  background: #22c55e;
}

.status-cell.is-inactive {
  color: #ef4444;
}

.status-cell.is-inactive .status-cell-dot {
  background: #ef4444;
}

.verify-text {
  font-size: 0.85rem;
  font-weight: 500;
}

.verify-ok {
  color: #16a34a;
}

.verify-pending {
  color: #f59e0b;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-row-edit,
.btn-row-disable,
.btn-row-more {
  padding: 0.28rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.btn-row-edit {
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-row-edit:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.btn-row-disable {
  border: 1px solid #fdba74;
  color: #ea580c;
}

.btn-row-disable:hover:not(:disabled) {
  background: #fff7ed;
}

.btn-row-disable:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-row-more {
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  padding: 0.28rem 0.55rem;
  line-height: 1;
}

.btn-row-more:hover {
  color: #64748b;
  border-color: #cbd5e1;
}

.admin-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #f1f5f9;
}

.table-total {
  font-size: 0.85rem;
  color: #94a3b8;
}

.admin-table-footer :deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #7c3aed;
}

/* 数据管理标签页样式 */
.data-tabs-card {
  margin-top: 20px;
}

.data-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.data-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
}

.data-tabs :deep(.el-tabs__item .el-icon) {
  margin-right: 6px;
}

.data-tabs :deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: 600;
}

.data-tabs :deep(.el-tabs__content) {
  padding: 0;
}

/* 标签页内的卡片样式调整 */
.data-tabs .users-card,
.data-tabs .histories-card,
.admin-data-tabs .histories-card,
.admin-data-tabs .journals-card,
.admin-data-tabs .gratitudes-card,
.admin-data-tabs .emotion-summary-card,
.admin-data-tabs .health-assessment-card,
.admin-data-tabs .video-analysis-card,
.data-tabs .emotion-summary-card,
.data-tabs .health-assessment-card,
.data-tabs .video-analysis-card {
  margin: 1rem 1.25rem 1.25rem !important;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: none;
}

.data-tabs .users-card :deep(.el-card__header),
.data-tabs .histories-card :deep(.el-card__header),
.admin-data-tabs .histories-card :deep(.el-card__header),
.admin-data-tabs .journals-card :deep(.el-card__header),
.admin-data-tabs .gratitudes-card :deep(.el-card__header),
.admin-data-tabs .emotion-summary-card :deep(.el-card__header),
.admin-data-tabs .health-assessment-card :deep(.el-card__header),
.admin-data-tabs .video-analysis-card :deep(.el-card__header),
.data-tabs .emotion-summary-card :deep(.el-card__header),
.data-tabs .health-assessment-card :deep(.el-card__header),
.data-tabs .video-analysis-card :deep(.el-card__header) {
  border-bottom: 1px solid #f1f5f9;
  padding: 1rem 1.15rem;
}
</style>
