// pages/register/register.js
const mock = require('../../mock/index.js')

Page({
  data: {
    // 手机号
    phone: '',
    
    // 验证码
    verifyCode: '',
    
    // 密码
    password: '',
    
    // 确认密码
    confirmPassword: '',
    
    // 是否显示密码
    showPassword: false,
    showConfirmPassword: false,
    
    // 验证码倒计时
    countdown: 0,
    
    // 协议
    agreed: false,
    
    // 是否可以注册
    canRegister: false,
    
    // 是否可以发送验证码
    canSendCode: true,
    
    // 验证码按钮文字
    codeButtonText: '获取验证码'
  },

  onLoad(options) {
    console.log('注册页面加载', options)
    // 初始化检查
    this.checkCanRegister()
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
    this.checkCanRegister()
    this.checkCanSendCode()
  },

  // 验证码输入
  onVerifyCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    })
    this.checkCanRegister()
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
    this.checkCanRegister()
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
    this.checkCanRegister()
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 切换确认密码显示
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },

  // 检查是否可以发送验证码
  checkCanSendCode() {
    const phoneReg = /^1[3-9]\d{9}$/
    this.setData({
      canSendCode: phoneReg.test(this.data.phone) && this.data.countdown === 0
    })
  },

  // 发送验证码
  async sendVerifyCode() {
    if (!this.data.canSendCode) return

    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    try {
      // 模拟发送验证码
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 开始倒计时
      this.setData({
        countdown: 60,
        codeButtonText: '60s后重试',
        canSendCode: false
      })

      const timer = setInterval(() => {
        if (this.data.countdown <= 0) {
          clearInterval(timer)
          this.setData({
            codeButtonText: '获取验证码',
            canSendCode: true
          })
          this.checkCanSendCode()
        } else {
          this.setData({
            countdown: this.data.countdown - 1,
            codeButtonText: `${this.data.countdown}s后重试`
          })
        }
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败:', error)
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      })
    }
  },

  // 检查是否可以注册
  checkCanRegister() {
    const phoneReg = /^1[3-9]\d{9}$/
    const passwordReg = /^.{6,20}$/
    
    const canRegister = 
      phoneReg.test(this.data.phone) &&
      this.data.verifyCode.length === 6 &&
      passwordReg.test(this.data.password) &&
      this.data.password === this.data.confirmPassword

    this.setData({
      canRegister
    })
  },

  // 切换协议
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 注册
  async handleRegister() {
    // 检查表单信息
    const phoneReg = /^1[3-9]\d{9}$/
    const passwordReg = /^.{6,20}$/
    
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    if (this.data.verifyCode.length !== 6) {
      wx.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      })
      return
    }
    
    if (!passwordReg.test(this.data.password)) {
      wx.showToast({
        title: '密码长度为6-20位',
        icon: 'none'
      })
      return
    }
    
    if (this.data.password !== this.data.confirmPassword) {
      wx.showToast({
        title: '两次输入密码不一致',
        icon: 'none'
      })
      return
    }

    // 检查协议
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先阅读并同意用户协议',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({
        title: '注册中...'
      })

      // 模拟注册请求
      await mock.delay(1000)

      // 更新用户信息
      const app = getApp()
      app.globalData.isLogin = true
      app.globalData.userInfo = {
        id: Date.now(),
        nickname: this.data.phone.slice(-4),
        phone: this.data.phone,
        avatar: '',
        balance: 0,
        createTime: new Date().toISOString().split('T')[0]
      }

      wx.hideLoading()
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (error) {
      console.error('注册失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '注册失败，请重试',
        icon: 'none'
      })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 跳转登录
  goToLogin() {
    wx.navigateBack()
  },

  // 打开用户协议
  openAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false
    })
  },

  // 打开隐私政策
  openPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false
    })
  },

  // 点击协议文字
  handleAgreementClick() {
    if (!this.data.agreed) {
      this.openAgreement()
    }
  }
})