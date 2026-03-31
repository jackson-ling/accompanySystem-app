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
    languageChangeListeners: [], // 语言变化监听器列表
    isNavigatingToLogin: false // 是否正在跳转到登录页，防止重复跳转
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
    
    // 检查当前页面是否为登录相关页面，如果是则重置标志
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const route = currentPage.route || ''
      
      // 如果当前页面是登录、注册或忘记密码页面，重置跳转标志
      if (route.includes('/login/') || route.includes('/register/') || route.includes('/forgot-password/')) {
        console.log('当前在登录相关页面，重置跳转标志')
        this.globalData.isNavigatingToLogin = false
        this._loginNavigateLock = false
      }
    }
  },

  onHide() {
    console.log('小程序隐藏')
    // 小程序隐藏时重置跳转标志，确保下次启动时标志是正确的
    this.globalData.isNavigatingToLogin = false
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

  // 要求登录（防重复跳转）
  requireLogin() {
    // 如果已登录，返回 true
    if (this.globalData.isLogin) {
      return true
    }

    // 如果正在跳转到登录页，不再重复跳转
    if (this.globalData.isNavigatingToLogin) {
      console.log('正在跳转到登录页，忽略重复请求')
      return false
    }

    // 检查时间戳锁，防止短时间内多次调用
    const now = Date.now()
    if (this._lastLoginCheckTime && (now - this._lastLoginCheckTime < 1000)) {
      console.log('距离上次检查不到1秒，忽略重复请求')
      return false
    }
    this._lastLoginCheckTime = now

    // 立即标记正在跳转，阻止所有后续请求
    this.globalData.isNavigatingToLogin = true
    console.log('开始跳转到登录页，已设置标志，阻止所有后续请求')

    // 立即显示 loading，防止用户继续操作
    wx.showLoading({
      title: '跳转中...',
      mask: true
    })

    // 立即开始跳转，不延迟
    wx.navigateTo({
      url: '/pages/login/login',
      success: () => {
        console.log('登录页跳转成功，5秒后重置标志')
        // 登录页跳转成功后，延迟一段时间重置标志
        // 给页面足够的时间加载
        setTimeout(() => {
          this.globalData.isNavigatingToLogin = false
          this._loginNavigateLock = false
          wx.hideLoading()
          console.log('登录页跳转标志已重置')
        }, 5000)
      },
      fail: (err) => {
        console.log('登录页跳转失败，立即重置标志', err)
        // 跳转失败立即重置标志
        this.globalData.isNavigatingToLogin = false
        this._loginNavigateLock = false
        wx.hideLoading()
      }
    })

    return false
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