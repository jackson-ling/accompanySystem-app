// pages/login/login.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { login } = require('../../utils/api.js')

Page({
  data: {
    // 当前语言
    currentLang: 'zh-CN',

    // 登录类型：phone-手机号登录, verify-验证码登录
    loginType: 'phone',
    
    // 表单数据
    phone: '',
    password: '',
    verifyCode: '',
    
    // 是否显示密码
    showPassword: false,
    
    // 验证码
    canSendCode: true,
    codeCountdown: 60,
    codeButtonText: '获取验证码',
    codeTimer: null,
    
    // 登录按钮
    canLogin: false,
    loginButtonText: '登录',
    loading: false,
    
    // 协议
    agreed: false,
    
    // 翻译文本
    translations: {
      platformTitle: '',
      phoneNumber: '',
      pleaseEnterPhone: '',
      password: '',
      pleaseEnterPassword: '',
      forgotPassword: '',
      loginButton: '',
      noAccount: '',
      registerNow: '',
      haveReadAgreed: '',
      userAgreement: '',
      and: '',
      privacyPolicy: '',
      getCode: '',
      resend: '',
      verifyCodeSent: '',
      pleaseEnterPhone: '',
      loginNow: '',
      perfectInfo: '',
      loggingIn: '',
      loginSuccess: '',
      loginFailed: '',
      agreeFirst: '',
      featureInDev: '',
      wechatLoginInDev: ''
    }
  },

  onLoad(options) {
    console.log('登录页加载', options)
    const app = getApp()
    
    // 隐藏 loading
    wx.hideLoading()
    
    // 立即重置跳转标志
    app.globalData.isNavigatingToLogin = false
    console.log('登录页加载时已重置跳转标志')
    
    this.setData({
      currentLang: app.globalData.currentLanguage || 'zh-CN'
    })
    this.updateTranslations()
    
    // 检查是否已登录
    if (app.globalData.isLogin) {
      wx.navigateBack()
      return
    }
    
    // 初始化检查是否可以登录（不依赖协议）
    this.checkCanLogin()
    
    // 监听语言变化
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        const app = getApp()
        this.setData({
          currentLang: app.globalData.currentLanguage || 'zh-CN'
        })
        this.updateTranslations()
      })
    }
  },

  onShow() {
    console.log('登录页显示')
    const app = getApp()
    // 重置跳转标志，确保登录页显示时标志被重置
    app.globalData.isNavigatingToLogin = false
    console.log('登录页显示时已重置跳转标志')
  },

  // 切换语言
  switchLanguage() {
    const app = getApp()
    const newLang = this.data.currentLang === 'zh-CN' ? 'en-US' : 'zh-CN'
    app.switchLanguage(newLang)
    this.setData({
      currentLang: newLang
    })
    this.updateTranslations()
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        platformTitle: i18n.t('login.platformTitle'),
        phoneNumber: i18n.t('login.phoneNumber'),
        pleaseEnterPhone: i18n.t('login.pleaseEnterPhone'),
        password: i18n.t('login.password'),
        pleaseEnterPassword: i18n.t('login.pleaseEnterPassword'),
        forgotPassword: i18n.t('login.forgotPassword'),
        loginButton: i18n.t('login.loginBtn'),
        noAccount: i18n.t('login.noAccount'),
        registerNow: i18n.t('login.registerNow'),
        haveReadAgreed: i18n.t('login.haveReadAgreed'),
        userAgreement: i18n.t('login.userAgreement'),
        and: i18n.t('login.and') || '和',
        privacyPolicy: i18n.t('login.privacyPolicy'),
        getCode: i18n.t('login.getCode') || 'Get Code',
        resend: i18n.t('login.resend') || 'Resend',
        verifyCodeSent: i18n.t('login.verifyCodeSent') || 'Verification code sent',
        pleaseEnterPhone: i18n.t('login.pleaseEnterPhone'),
        loginNow: i18n.t('login.loginNow') || 'Login',
        perfectInfo: i18n.t('login.perfectInfo'),
        loggingIn: i18n.t('login.loggingIn'),
        loginSuccess: i18n.t('login.loginSuccess'),
        loginFailed: i18n.t('login.loginFailed'),
        agreeFirst: i18n.t('login.agreeFirst'),
        featureInDev: i18n.t('common.featureInDev') || 'Feature under development',
        wechatLoginInDev: i18n.t('login.wechatLoginInDev') || 'WeChat login under development'
      },
      codeButtonText: i18n.t('login.getCode') || 'Get Code'
    })
  },

  onUnload() {
    // 清除定时器
    if (this.data.codeTimer) {
      clearInterval(this.data.codeTimer)
    }
  },

  // 切换登录类型
  switchLoginType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      loginType: type,
      password: '',
      verifyCode: ''
    })
    this.checkCanLogin()
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
    this.checkCanLogin()
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
    this.checkCanLogin()
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 验证码输入
  onVerifyCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    })
    this.checkCanLogin()
  },

  // 检查是否可以登录
  checkCanLogin() {
    const { loginType, phone, password, verifyCode } = this.data
    
    let canLogin = false
    
    if (loginType === 'phone') {
      canLogin = phone.length === 11 && password.length > 0
    } else {
      canLogin = phone.length === 11 && verifyCode.length === 6
    }
    
    this.setData({
      canLogin,
      loginButtonText: canLogin ? this.data.translations.loginButton : this.data.translations.perfectInfo
    })
  },

  // 发送验证码
  sendVerifyCode() {
    if (!this.data.canSendCode) {
      return
    }
    
    const phone = this.data.phone
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: this.data.translations.pleaseEnterPhone,
        icon: 'none'
      })
      return
    }
    
    // 开始倒计时
    this.setData({
      canSendCode: false,
      codeCountdown: 60,
      codeButtonText: '60s后重发'
    })
    
    this.data.codeTimer = setInterval(() => {
      const count = this.data.codeCountdown - 1
      
      if (count <= 0) {
        clearInterval(this.data.codeTimer)
        this.setData({
          canSendCode: true,
          codeButtonText: this.data.translations.getCode
        })
      } else {
        this.setData({
          codeCountdown: count,
          codeButtonText: `${count}s后重发`
        })
      }
    }, 1000)
    
    // 模拟发送验证码
    wx.showToast({
      title: this.data.translations.verifyCodeSent,
      icon: 'success'
    })
    
    // 开发环境下自动填充验证码
    // this.setData({
    //   verifyCode: '123456'
    // })
    // this.checkCanLogin()
  },

  // 登录
  async handleLogin() {
    if (!this.data.canLogin || this.data.loading) {
      return
    }

    // 检查协议
    if (!this.data.agreed) {
      wx.showToast({
        title: this.data.translations.agreeFirst,
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({
      loading: true,
      loginButtonText: this.data.translations.loggingIn
    })
    
    try {
      const app = getApp()
      const { loginType, phone, password, verifyCode } = this.data
      
      // 调用后端登录API
      const result = await login({
        phone: phone,
        password: password
      })
      
      // 登录成功，保存用户信息和token
      const userInfo = {
        id: result.userId,
        nickname: result.nickname,
        avatar: result.avatar,
        phone: result.phone,
        userType: result.userType
      }
      
      app.setLoginInfo(result.token, userInfo)
      
      // 重置跳转标志
      app.globalData.isNavigatingToLogin = false
      
      wx.showToast({
        title: this.data.translations.loginSuccess,
        icon: 'success'
      })
      
      // 延迟跳转
      setTimeout(() => {
        // 检查是否有重定向页面
        const pages = getCurrentPages()
        if (pages.length > 1) {
          wx.navigateBack()
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }, 1500)
      
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: error.message || this.data.translations.loginFailed,
        icon: 'none'
      })
    } finally {
      this.setData({
        loading: false,
        loginButtonText: this.data.translations.loginButton
      })
    }
  },

  // 切换协议
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 跳转到注册
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  // 忘记密码
  goToForgotPassword() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    })
  },

  // 微信登录
  handleWechatLogin() {
    wx.showToast({
      title: this.data.translations.wechatLoginInDev,
      icon: 'none'
    })
  },

  // 打开用户协议
  openAgreement() {
    wx.showModal({
      title: this.data.translations.userAgreement,
      content: '这里显示用户协议内容...',
      showCancel: false
    })
  },

  // 打开隐私政策
  openPrivacy() {
    wx.showModal({
      title: this.data.translations.privacyPolicy,
      content: '这里显示隐私政策内容...',
      showCancel: false
    })
  },

  // 点击协议文字
  handleAgreementClick() {
    if (!this.data.agreed) {
      // 如果未勾选，点击协议文字时可以显示协议内容或引导用户勾选
      this.openAgreement()
    }
  },

  // 点击电话图标获取手机号
  getPhoneNumber(e) {
    console.log('获取手机号', e)
    
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      // 用户拒绝授权
      wx.showToast({
        title: '您已取消授权',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 用户同意授权，获取到加密数据
    const { encryptedData, iv } = e.detail
    
    // 这里应该调用后端接口解密获取手机号
    // 暂时模拟获取到手机号
    wx.showLoading({
      title: '获取中...'
    })

    // 模拟请求后端解密
    setTimeout(() => {
      wx.hideLoading()
      
      // 模拟获取到的手机号（实际应该从后端接口返回）
      const mockPhone = '13800138000'
      
      this.setData({
        phone: mockPhone
      })
      this.checkCanLogin()
      
      wx.showToast({
        title: '获取成功',
        icon: 'success',
        duration: 1500
      })
    }, 1000)
  }
})