// app.js
const i18n = require('./utils/i18n.js')

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: '',
    baseUrl: 'https://api.example.com', // 后端API地址
    mockMode: true, // 是否使用模拟数据
    currentLanguage: 'zh-CN', // 当前语言
    languageChangeListeners: [] // 语言变化监听器列表
  },

  onLaunch(options) {
    console.log('小程序启动', options)
    // 检查登录状态
    this.checkLogin()
    // 初始化语言
    this.globalData.currentLanguage = i18n.getCurrentLanguage()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误', msg)
  },

  // 注册语言变化监听器
  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.globalData.languageChangeListeners.push(callback)
      // 立即调用一次，确保页面初始化时能获取正确的语言
      callback()
    }
  },

  // 注销语言变化监听器
  offLanguageChange(callback) {
    const index = this.globalData.languageChangeListeners.indexOf(callback)
    if (index > -1) {
      this.globalData.languageChangeListeners.splice(index, 1)
    }
  },

  // 通知所有监听器语言已更改
  notifyLanguageChange() {
    this.globalData.languageChangeListeners.forEach(callback => {
      if (typeof callback === 'function') {
        try {
          callback()
        } catch (error) {
          console.error('Language change callback error:', error)
        }
      }
    })
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.isLogin = true
    }
  },

  // 设置登录信息
  setLoginInfo(token, userInfo) {
    this.globalData.token = token
    this.globalData.userInfo = userInfo
    this.globalData.isLogin = true
    
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
  },

  // 退出登录
  logout() {
    this.globalData.token = ''
    this.globalData.userInfo = null
    this.globalData.isLogin = false
    
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  // 切换语言
  switchLanguage(language) {
    const success = i18n.switchLanguage(language)
    if (success) {
      this.globalData.currentLanguage = language
      // 通知所有页面语言已更改
      this.notifyLanguageChange()
    }
    return success
  },

  // 获取当前语言
  getCurrentLanguage() {
    return this.globalData.currentLanguage
  },

  // 获取翻译文本
  t(key, params) {
    return i18n.t(key, params)
  }
})