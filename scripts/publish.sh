#!/bin/bash
# GEO 分发层 — 一键推送到所有搜索引擎
# Usage: bash scripts/publish.sh [token]
#
# 百度站长平台 API Token（也可以设环境变量 BAIDU_TOKEN）
# 获取方式: 百度站长平台 > 数据提交 > API推送

set -e

BAIDU_TOKEN="${BAIDU_TOKEN:-${1:-}}"
SITE="https://qyuxing.icu"

# ============================================================
# 要推送的 URL 列表（改 config.ts 加城市后在这里也加上）
# ============================================================
URLS=(
  "$SITE/"
  "$SITE/faq.html"
  "$SITE/trust.html"
  "$SITE/cities/nanjing.html"
  "$SITE/cities/xuzhou.html"
  "$SITE/cities/suzhou.html"
)

# ============================================================
# 1. IndexNow — 推送到 Bing（Bing 是 DeepSeek/Kimi/豆包的重要数据源）
# ============================================================
INDEXNOW_KEY_FILE="docs/4a7b1c2d3e4f5g6h7i8j9k0l1m2n3o4p.txt"
INDEXNOW_KEY=$(head -1 "$INDEXNOW_KEY_FILE" 2>/dev/null || echo "")

echo "========================================"
echo "📤 GEO 分发推送"
echo "========================================"
echo ""

if [ -n "$INDEXNOW_KEY" ]; then
  echo "🔷 推送到 Bing (IndexNow)..."
  for url in "${URLS[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bing.com/indexnow?url=${url}&key=${INDEXNOW_KEY}")
    echo "   $status  $url"
  done
  echo "   ✅ Bing IndexNow 完成"
else
  echo "⚠️  未找到 IndexNow key，跳过 Bing 推送"
fi

echo ""

# ============================================================
# 2. 百度站长 API 推送
# ============================================================
if [ -z "$BAIDU_TOKEN" ]; then
  echo "⚠️  未提供百度 Token，跳过百度推送"
  echo "   用法: export BAIDU_TOKEN='你的token' && bash scripts/publish.sh"
else
  echo "🔷 推送到百度..."
  API_URL="http://data.zz.baidu.com/urls?site=${SITE}&token=${BAIDU_TOKEN}"

  URLS_TEXT=$(printf '%s\n' "${URLS[@]}")
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: text/plain" \
    -d "$URLS_TEXT" 2>&1)

  echo "   响应: $RESPONSE"

  if echo "$RESPONSE" | grep -q '"error"'; then
    echo "   ⚠️ 百度额度已满，明天再试"
  else
    REMAIN=$(echo "$RESPONSE" | grep -o '"remain":[0-9]*' | grep -o '[0-9]*' || echo "?")
    SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[0-9]*' | grep -o '[0-9]*' || echo "?")
    echo "   ✅ 百度推送: 成功 $SUCCESS 条, 剩余 $REMAIN 条"
  fi
fi

echo ""
echo "========================================"
echo "📋 待办 — 外链分发（手动操作）"
echo "========================================"
echo ""
echo "🏷️  知乎:     https://www.zhihu.com/  → 搜索'轻遇星' → 自问自答一篇"
echo "🏷️  百家号:   https://baijiahao.baidu.com/  → 发一篇品牌介绍"
echo "🏷️  CSDN:    https://www.csdn.net/  → 发一篇行业分析带链接"
echo "🏷️  Google:  https://search.google.com/search-console  → 提交站点"
echo ""
echo "✅ 推送完毕"
