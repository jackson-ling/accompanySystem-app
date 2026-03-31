// pages/forgot-password/forgot-password.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 当前语言
    currentLang: 'zh-CN',

    // 手机号
    phone: '',
    
    // 验证码
    verifyCode: '',
    
    // 新密码
    newPassword: '',
    
    // 确认密码
    confirmPassword: '',
    
    // 是否显示密码
    showPassword: false,
    showConfirmPassword: false,
    
    // 验证码倒计时
    countdown: 0,
    
    // 是否可以发送验证码
    canSendCode: true,
    
    // 验证码按钮文字
    codeButtonText: '获取验证码',
    
    // 是否可以提交
    canSubmit: false,
    
    // 加载状态
    loading: false,
    
    // 翻译文本
    translations: {
      title: '',
      phoneNumber: '',
      phonePlaceholder: '',
      verifyCode: '',
      codePlaceholder: '',
      newPassword: '',
      passwordPlaceholder: '',
      confirmPassword: '',
      confirmPasswordPlaceholder: '',
      submit: '',
      submitting: '',
      rememberPassword: '',
      backToLogin: '',
      phoneFormatError: '',
      codeLengthError: '',
      passwordLengthError: '',
      passwordMismatchError: '',
      submitSuccess: '',
      submitFailed: '',
      agreeFirst: '',
      codeSent: ''
    }
  },

  onLoad(options) {
    console.log('忘记密码页面加载', options)
    const app = getApp()
    
    // 隐藏 loading
    wx.hideLoading()
    
    // 立即重置跳转标志
    app.globalData.isNavigatingToLogin = false
    console.log('忘记密码页面加载时已重置跳转标志')
    
    this.setData({
      currentLang: app.globalData.currentLanguage || 'zh-CN'
    })
    this.updateTranslations()
    // 初始化检查
    this.checkCanSubmit()
  },

  onShow() {
    console.log('忘记密码页面显示')
    const app = getApp()
    // 重置跳转标志
    app.globalData.isNavigatingToLogin = false
    console.log('忘记密码页面显示时已重置跳转标志')
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
        title: i18n.t('forgotPassword.title') || '忘记密码',
        phoneNumber: i18n.t('forgotPassword.phoneNumber') || '手机号码',
        phonePlaceholder: i18n.t('forgotPassword.phonePlaceholder') || '请输入注册手机号',
        verifyCode: i18n.t('forgotPassword.verifyCode') || '验证码',
        codePlaceholder: i18n.t('forgotPassword.codePlaceholder') || '请输入验证码',
        newPassword: i18n.t('forgotPassword.newPassword') || '新密码',
        passwordPlaceholder: i18n.t('forgotPassword.passwordPlaceholder') || '设置新密码(6-20位)',
        confirmPassword: i18n.t('forgotPassword.confirmPassword') || '确认密码',
        confirmPasswordPlaceholder: i18n.t('forgotPassword.confirmPasswordPlaceholder') || '请再次输入新密码',
        submit: i18n.t('forgotPassword.submit') || '确认修改',
        submitting: i18n.t('forgotPassword.submitting') || '提交中...',
        rememberPassword: i18n.t('forgotPassword.rememberPassword') || '想起密码了?',
        backToLogin: i18n.t('forgotPassword.backToLogin') || '返回登录',
        phoneFormatError: i18n.t('forgotPassword.phoneFormatError') || '手机号格式不正确',
        codeLengthError: i18n.t('forgotPassword.codeLengthError') || '请输入6位验证码',
        passwordLengthError: i18n.t('forgotPassword.passwordLengthError') || '密码长度为6-20位',
        passwordMismatchError: i18n.t('forgotPassword.passwordMismatchError') || '两次输入密码不一致',
        submitSuccess: i18n.t('forgotPassword.submitSuccess') || '密码修改成功',
        submitFailed: i18n.t('forgotPassword.submitFailed') || '密码修改失败',
        agreeFirst: i18n.t('forgotPassword.agreeFirst') || '请先获取验证码',
        codeSent: i18n.t('forgotPassword.codeSent') || '验证码已发送'
      },
      codeButtonText: i18n.t('forgotPassword.getCode') || '获取验证码'
    })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
    this.checkCanSubmit()
    this.checkCanSendCode()
  },

  // 验证码输入
  onVerifyCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 新密码输入
  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
    this.checkCanSubmit()
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
        title: this.data.translations.phoneFormatError,
        icon: 'none'
      })
      return
    }

    try {
      // 模拟发送验证码
      wx.showToast({
        title: this.data.translations.codeSent,
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

  // 检查是否可以提交
  checkCanSubmit() {
    const phoneReg = /^1[3-9]\d{9}$/
    const passwordReg = /^.{6,20}$/
    
    const canSubmit = 
      phoneReg.test(this.data.phone) &&
      this.data.verifyCode.length === 6 &&
      passwordReg.test(this.data.newPassword) &&
      this.data.newPassword === this.data.confirmPassword

    this.setData({
      canSubmit
    })
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
      this.checkCanSubmit()
      this.checkCanSendCode()
      
      wx.showToast({
        title: '获取成功',
        icon: 'success',
        duration: 1500
      })
    }, 1000)
  },

  // 提交重置密码
  async handleSubmit() {
    if (!this.data.canSubmit || this.data.loading) {
      return
    }

    const { phone, verifyCode, newPassword, confirmPassword, translations } = this.data
    
    // 验证手机号
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: translations.phoneFormatError,
        icon: 'none'
      })
      return
    }
    
    // 验证验证码
    if (verifyCode.length !== 6) {
      wx.showToast({
        title: translations.codeLengthError,
        icon: 'none'
      })
      return
    }
    
    // 验证密码长度
    const passwordReg = /^.{6,20}$/
    if (!passwordReg.test(newPassword)) {
      wx.showToast({
        title: translations.passwordLengthError,
        icon: 'none'
      })
      return
    }
    
    // 验证两次密码是否一致
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: translations.passwordMismatchError,
        icon: 'none'
      })
      return
    }

    this.setData({
      loading: true
    })
    
    try {
      await mock.delay(1000)
      
      // 重置跳转标志
      const app = getApp()
      app.globalData.isNavigatingToLogin = false
      
      // 模拟重置密码成功
      wx.showToast({
        title: translations.submitSuccess,
        icon: 'success'
      })
      
      // 延迟跳转到登录页
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }, 1500)
      
    } catch (error) {
      console.error('重置密码失败:', error)
      wx.showToast({
        title: translations.submitFailed,
        icon: 'none'
      })
    } finally {
      this.setData({
        loading: false
      })
    }
  },

  // 跳转到登录页
  goToLogin() {
    wx.redirectTo({
      url: '/pages/login/login'
    })
  }
})