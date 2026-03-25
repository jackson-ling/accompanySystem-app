// pages/login/login.js
const mock = require('../../mock/index.js')

Page({
  data: {
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
    agreed: false
  },

  onLoad(options) {
    console.log('登录页加载', options)
    
    // 检查是否已登录
    const app = getApp()
    if (app.globalData.isLogin) {
      wx.navigateBack()
      return
    }
    
    // 初始化检查是否可以登录（不依赖协议）
    this.checkCanLogin()
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
      loginButtonText: canLogin ? '登录' : '请完善信息'
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
        title: '请输入正确的手机号',
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
          codeButtonText: '获取验证码'
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
      title: '验证码已发送',
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
        title: '请先阅读并同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({
      loading: true,
      loginButtonText: '登录中...'
    })
    
    try {
      await mock.delay(1000)
      
      // 模拟登录成功
      const app = getApp()
      const userInfo = {
        id: 1,
        nickname: '测试用户',
        avatar: '',
        phone: this.data.phone,
        balance: 1000.00
      }
      
      app.setLoginInfo('mock_token_' + Date.now(), userInfo)
      
      wx.showToast({
        title: '登录成功',
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
        title: '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({
        loading: false,
        loginButtonText: '登录'
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
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 微信登录
  handleWechatLogin() {
    wx.showToast({
      title: '微信登录开发中',
      icon: 'none'
    })
  },

  // 打开用户协议
  openAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里显示用户协议内容...',
      showCancel: false
    })
  },

  // 打开隐私政策
  openPrivacy() {
    wx.showModal({
      title: '隐私政策',
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
  }
})