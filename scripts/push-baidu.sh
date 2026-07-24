#!/bin/bash
# Baidu URL submission script
# Usage: bash scripts/push-baidu.sh [token] [urls_file]

# 百度站长平台 API Token
# 设置方式: export BAIDU_TOKEN="your_token"
# 获取方式: 百度站长平台 > 数据提交 > API推送
BAIDU_TOKEN="${BAIDU_TOKEN:-}"
SITE="https://qyuxing.icu"
API_URL="http://data.zz.baidu.com/urls?site=${SITE}&token=${BAIDU_TOKEN}"

# 要推送的 URL 列表
URLS=(
  "https://qyuxing.icu/"
  "https://qyuxing.icu/faq.html"
  "https://qyuxing.icu/trust.html"
  "https://qyuxing.icu/cities/nanjing.html"
  "https://qyuxing.icu/cities/xuzhou.html"
  "https://qyuxing.icu/cities/suzhou.html"
)

if [ -z "$BAIDU_TOKEN" ]; then
  echo "❌ 请提供百度站长平台 API Token"
  echo "用法: bash scripts/push-baidu.sh <token>"
  echo ""
  echo "获取 Token: 百度站长平台 > 数据引入 > 链接提交 > API推送"
  exit 1
fi

# 生成 URL 列表（每行一个）
URLS_TEXT=$(printf '%s\n' "${URLS[@]}")

echo "📤 正在推送 ${#URLS[@]} 个 URL 到百度..."
echo "========================================"
printf '%s\n' "${URLS[@]}"
echo "========================================"

# 发送请求
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: text/plain" \
  -d "$URLS_TEXT" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容: $BODY"

# 解析结果
if [ "$HTTP_CODE" = "200" ]; then
  REMAIN=$(echo "$BODY" | grep -o '"remain":[0-9]*' | grep -o '[0-9]*')
  SUCCESS=$(echo "$BODY" | grep -o '"success":[0-9]*' | grep -o '[0-9]*')
  echo ""
  echo "✅ 推送成功!"
  echo "   成功: $SUCCESS 条"
  echo "   剩余额度: $REMAIN 条"
else
  echo ""
  echo "❌ 推送失败，请检查 Token 是否正确"
fi
