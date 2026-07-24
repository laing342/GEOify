// ============================================================
// src/commands/jsonld-injector.ts
// 为 FAQ 页注入 FAQPage JSON-LD（schema.org）
// ============================================================

import { siteConfig } from './config.js'

/**
 * 生成 FAQPage JSON-LD
 * 严格遵守 schema.org 规范，标记文字与可见文字完全一致
 */
export function generateFaqJsonLd(): string {
  const { faqs, brand } = siteConfig

  const mainEntities = faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: mainEntities,
    about: {
      '@type': 'Organization',
      name: brand.name,
      description: brand.tagline,
    },
  }

  return JSON.stringify(jsonLd, null, 2)
}

/**
 * 生成 Organization JSON-LD
 */
export function generateOrganizationJsonLd(): string {
  const { brand } = siteConfig

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    alternateName: brand.englishName,
    description: brand.tagline,
    url: `https://${brand.domain}`,
  }

  return JSON.stringify(jsonLd, null, 2)
}