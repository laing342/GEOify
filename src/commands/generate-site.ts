// ============================================================
// src/commands/generate-site.ts
// 静态 Demo 站生成器 — 核心文件
// 输入：config.ts 中的站点配置
// 输出：完整的静态 HTML 站（含 robots.txt, sitemap.xml, llms.txt, JSON-LD）
// ============================================================

import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { siteConfig } from './config.js'
import { writeLlmsTxt } from './llms-generator.js'
import { generateFaqJsonLd, generateOrganizationJsonLd } from './jsonld-injector.js'

// ============================================================
// HTML 模板函数
// ============================================================

function head(title: string, extraMeta = ''): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${siteConfig.brand.name}</title>
  <meta name="description" content="${siteConfig.brand.tagline}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://${siteConfig.brand.domain}/${title === siteConfig.brand.name ? '' : slugify(title)}.html">
  ${extraMeta}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; line-height: 1.8; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    header { border-bottom: 2px solid #6c5ce7; padding-bottom: 20px; margin-bottom: 30px; }
    header h1 { font-size: 28px; color: #6c5ce7; }
    header p { color: #666; margin-top: 8px; }
    nav { margin: 20px 0; }
    nav a { margin-right: 20px; color: #6c5ce7; text-decoration: none; font-weight: 500; }
    nav a:hover { text-decoration: underline; }
    h2 { font-size: 20px; margin: 30px 0 15px; color: #2d3436; }
    h3 { font-size: 16px; margin: 20px 0 10px; color: #636e72; }
    .faq-item { margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .faq-item .q { font-weight: 600; color: #6c5ce7; margin-bottom: 8px; }
    .faq-item .a { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #6c5ce7; color: white; }
    .trust-layer { margin-bottom: 15px; padding: 12px; border-left: 4px solid #6c5ce7; background: #f8f9fa; }
    .trust-layer .level { font-weight: 600; color: #6c5ce7; }
    .highlight { display: inline-block; background: #6c5ce7; color: white; padding: 2px 10px; border-radius: 12px; font-size: 13px; margin: 3px; }
    footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 13px; }
    footer a { color: #6c5ce7; }
  </style>
</head>`
}

function nav(): string {
  return `<nav>
  <a href="/">首页</a>
  <a href="/faq.html">常见问题</a>
  <a href="/trust.html">安全体系</a>
  <a href="/cities/nanjing.html">南京</a>
  <a href="/cities/xuzhou.html">徐州</a>
  <a href="/cities/suzhou.html">苏州</a>
</nav>`
}

function footer(): string {
  return `<footer>
  <div class="container">
    <p>${siteConfig.brand.name} · ${siteConfig.brand.tagline}</p>
    <p><a href="/llms.txt">llms.txt</a> · <a href="/sitemap.xml">sitemap.xml</a> · <a href="/robots.txt">robots.txt</a></p>
    <p>本页面包含 [示例]/[假设]/[待核实] 标记的数据 | 无绝对化用语</p>
  </div>
</footer>`
}

function slugify(title: string): string {
  const map: Record<string, string> = {
    '轻遇星': '',
    '常见问题': 'faq',
    '安全体系': 'trust',
  }
  return map[title] || title.toLowerCase()
}

// ============================================================
// 页面生成函数
// ============================================================

function generateIndex(): string {
  const { brand, faqs } = siteConfig
  return `${head(brand.name)}
<body>
  <div class="container">
    ${nav()}
    <header>
      <h1>${brand.name}</h1>
      <p>${brand.tagline}</p>
    </header>
    <h2>我们的服务</h2>
    <p>轻遇星通过AI匹配，连接城市中想出门的人和想带人出门的人。三大AI核心能力：达人数字分身、灵魂契合推荐、AI获客助理。</p>
    <h2>快速了解</h2>
    ${faqs.slice(0, 3).map((f) => `<div class="faq-item"><div class="q">${f.question}</div><div class="a">${f.answer}</div></div>`).join('')}
    <p style="margin-top:20px"><a href="/faq.html">查看全部 6 个常见问题 →</a></p>
  </div>
  ${footer()}
  <script type="application/ld+json">
${generateOrganizationJsonLd()}
  </script>
</body>
</html>`
}

function generateFaq(): string {
  const { faqs, brand } = siteConfig
  return `${head('常见问题', `<script type="application/ld+json">
${generateFaqJsonLd()}
  </script>`)}
<body>
  <div class="container">
    ${nav()}
    <header>
      <h1>常见问题</h1>
      <p>关于${brand.name}的六个最常见问题</p>
    </header>
    ${faqs.map((f) => `<div class="faq-item"><div class="q">Q: ${f.question}</div><div class="a">${f.answer}</div></div>`).join('')}
  </div>
  ${footer()}
</body>
</html>`
}

function generateCity(city: typeof siteConfig.cities[0]): string {
  return `${head(city.title)}
<body>
  <div class="container">
    ${nav()}
    <header>
      <h1>${city.title}</h1>
      <p>${city.subtitle}</p>
    </header>
    <h2>亮点推荐</h2>
    <p>${city.highlights.map((h) => `<span class="highlight">${h}</span>`).join(' ')}</p>
    <h2>服务与价格</h2>
    <table>
      <tr><th>服务</th><th>价格</th><th>时长</th><th>说明</th></tr>
      ${city.services.map((s) => `<tr><td>${s.name}</td><td>${s.price}</td><td>${s.duration}</td><td>${s.tip}</td></tr>`).join('')}
    </table>
    <p style="color:#999; font-size:13px; margin-top:10px">[示例数据] 以上价格为参考区间，实际以达人定价为准。</p>
  </div>
  ${footer()}
</body>
</html>`
}

function generateTrust(): string {
  const { trust, brand } = siteConfig
  return `${head('安全体系')}
<body>
  <div class="container">
    ${nav()}
    <header>
      <h1>${brand.name}安全体系</h1>
      <p>五层防线 — 阳光陪伴，全程可追溯</p>
    </header>
    ${trust.layers.map((l) => `<div class="trust-layer"><span class="level">${l.level}</span><p>${l.desc}</p></div>`).join('')}
    <p style="margin-top:20px; padding:15px; background:#e8f5e9; border-radius:8px; font-weight:500">${trust.bottomLine}</p>
  </div>
  ${footer()}
</body>
</html>`
}

// ============================================================
// 系统文件生成
// ============================================================

function generateRobotsTxt(): string {
  return `# robots.txt for ${siteConfig.brand.domain}
# Allow: Baidu, Shenma, ByteDance, Bing, and AI crawlers
User-agent: Baiduspider
Allow: /
User-agent: YisouSpider
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Bingbot
Allow: /
User-agent: GPTBot
Allow: /
User-agent: CCBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Diffbot
Allow: /
User-agent: *
Allow: /
Sitemap: https://${siteConfig.brand.domain}/sitemap.xml
`
}

function generateSitemap(): string {
  const { brand } = siteConfig
  const pages = [
    '',
    'faq.html',
    'trust.html',
    'cities/nanjing.html',
    'cities/xuzhou.html',
    'cities/suzhou.html',
  ]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>https://${brand.domain}/${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`
}

// ============================================================
// 城市 slug 映射
// ============================================================

const citySlugMap: Record<string, string> = {
  '南京': 'nanjing',
  '徐州': 'xuzhou',
  '苏州': 'suzhou',
}

// ============================================================
// 主入口函数
// ============================================================

export function generateSite(outDir: string): void {
  console.log(chalk.cyan('\n========================================'))
  console.log(chalk.cyan('  Geoify Site Generator (Forked)'))
  console.log(chalk.cyan('  Generating:'), siteConfig.brand.name, 'Demo Site')
  console.log(chalk.cyan('========================================\n'))

  fs.ensureDirSync(path.join(outDir, 'cities'))

  // 1. 首页
  fs.writeFileSync(path.join(outDir, 'index.html'), generateIndex(), 'utf-8')
  console.log(chalk.green('  [OK]'), 'index.html')

  // 2. FAQ 页（含 JSON-LD）
  fs.writeFileSync(path.join(outDir, 'faq.html'), generateFaq(), 'utf-8')
  console.log(chalk.green('  [OK]'), 'faq.html (with FAQPage JSON-LD)')

  // 3. 城市指南页
  for (const city of siteConfig.cities) {
    const slug = citySlugMap[city.name]
    if (!slug) {
      console.log(chalk.yellow('  [SKIP]'), `Unknown city: ${city.name}`)
      continue
    }
    fs.writeFileSync(path.join(outDir, `cities/${slug}.html`), generateCity(city), 'utf-8')
    console.log(chalk.green('  [OK]'), `cities/${slug}.html`)
  }

  // 4. 安全体系页
  fs.writeFileSync(path.join(outDir, 'trust.html'), generateTrust(), 'utf-8')
  console.log(chalk.green('  [OK]'), 'trust.html')

  // 5. 系统文件
  fs.writeFileSync(path.join(outDir, 'robots.txt'), generateRobotsTxt(), 'utf-8')
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), generateSitemap(), 'utf-8')
  console.log(chalk.green('  [OK]'), 'robots.txt')
  console.log(chalk.green('  [OK]'), 'sitemap.xml')

  // 6. llms.txt（调用独立模块）
  writeLlmsTxt(outDir)

  console.log(chalk.cyan('\n========================================'))
  console.log(chalk.green('  All files generated successfully!'))
  console.log(chalk.cyan('  Output:'), outDir)
  console.log(chalk.cyan('  Pages:'), 'index.html, faq.html, trust.html')
  console.log(chalk.cyan('  Cities:'), 'nanjing.html, xuzhou.html, suzhou.html')
  console.log(chalk.cyan('  Meta:'), 'robots.txt, sitemap.xml, llms.txt')
  console.log(chalk.cyan('========================================\n'))
}