# -*- coding: utf-8 -*-
"""批量替换 Analysis.vue 中的 emotionStore.predictions 为 allPredictions.value"""

import re

file_path = r"frontend\src\views\Analysis.vue"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有 emotionStore.predictions 为 allPredictions.value
# 但要避免替换已经在 allPredictions 计算属性定义中的部分
content = re.sub(
    r'emotionStore\.predictions\.forEach',
    r'allPredictions.value.forEach',
    content
)

content = re.sub(
    r'emotionStore\.predictions\.length',
    r'allPredictions.value.length',
    content
)

content = re.sub(
    r'emotionStore\.predictions\.filter',
    r'allPredictions.value.filter',
    content
)

content = re.sub(
    r'emotionStore\.predictions\.map',
    r'allPredictions.value.map',
    content
)

content = re.sub(
    r'emotionStore\.predictions\.some',
    r'allPredictions.value.some',
    content
)

content = re.sub(
    r'emotionStore\.predictions\.every',
    r'allPredictions.value.every',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Analysis.vue 已更新完成！")
print("已将所有 emotionStore.predictions 替换为 allPredictions.value")
