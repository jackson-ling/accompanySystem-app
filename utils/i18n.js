// i18n 工具函数
const zhCN = require('../i18n/zh-CN.js')
const enUS = require('../i18n/en-US.js')

// 支持的语言
const SUPPORTED_LANGUAGES = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// 当前语言（默认中文）
let currentLanguage = 'zh-CN'

// 从本地存储加载语言偏好
function loadLanguage() {
  try {
    const savedLanguage = wx.getStorageSync('language')
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      currentLanguage = savedLanguage
    }
  } catch (e) {
    console.error('Failed to load language preference:', e)
  }
}

// 保存语言偏好到本地存储
function saveLanguage(language) {
  try {
    wx.setStorageSync('language', language)
  } catch (e) {
    console.error('Failed to save language preference:', e)
  }
}

// 获取当前语言
function getCurrentLanguage() {
  return currentLanguage
}

// 切换语言
function switchLanguage(language) {
  if (SUPPORTED_LANGUAGES[language]) {
    currentLanguage = language
    saveLanguage(language)
    return true
  }
  return false
}

// 获取翻译文本
function t(key, params = {}) {
  const keys = key.split('.')
  let value = SUPPORTED_LANGUAGES[currentLanguage]
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k]
    } else {
      console.warn(`Translation not found for key: ${key}`)
      return key
    }
  }
  
  // 如果结果是函数，执行它（支持动态翻译）
  if (typeof value === 'function') {
    return value(params)
  }
  
  // 如果结果是字符串，支持参数替换
  if (typeof value === 'string') {
    Object.keys(params).forEach(param => {
      value = value.replace(`{${param}}`, params[param])
    })
  }
  
  return value
}

// 初始化
loadLanguage()

module.exports = {
  getCurrentLanguage,
  switchLanguage,
  t,
  SUPPORTED_LANGUAGES
}