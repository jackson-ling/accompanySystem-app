const { changePassword } = require('../../utils/api.js')

Page({
  data: {
    // 旧密码
    oldPassword: '',
    
    // 新密码
    newPassword: '',
    
    // 确认密码
    confirmPassword: '',
    
    // 加载状态
    loading: false,
    
    // 翻译文本
    translations: {
      title: '',
      oldPassword: '',
      oldPasswordPlaceholder: '',
      newPassword: '',
      newPasswordPlaceholder: '',
      confirmPassword: '',
      confirmPasswordPlaceholder: '',
      submit: '',
      oldPasswordRequired: '',
      newPasswordRequired: '',
      confirmPasswordRequired: '',
      passwordMismatch: '',
      passwordLength: '',
      passwordChangeSuccess: '',
      passwordChangeFailed: '',
      commonError: ''
    }
  },

  onLoad(options) {
    this.updateTranslations()
  },

  onShow() {
    this.updateTranslations()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('changePassword.title'),
        oldPassword: app.t('changePassword.oldPassword'),
        oldPasswordPlaceholder: app.t('changePassword.oldPasswordPlaceholder'),
        newPassword: app.t('changePassword.newPassword'),
        newPasswordPlaceholder: app.t('changePassword.newPasswordPlaceholder'),
        confirmPassword: app.t('changePassword.confirmPassword'),
        confirmPasswordPlaceholder: app.t('changePassword.confirmPasswordPlaceholder'),
        submit: app.t('changePassword.submit'),
        oldPasswordRequired: app.t('changePassword.oldPasswordRequired'),
        newPasswordRequired: app.t('changePassword.newPasswordRequired'),
        confirmPasswordRequired: app.t('changePassword.confirmPasswordRequired'),
        passwordMismatch: app.t('changePassword.passwordMismatch'),
        passwordLength: app.t('changePassword.passwordLength'),
        passwordChangeSuccess: app.t('changePassword.passwordChangeSuccess'),
        passwordChangeFailed: app.t('changePassword.passwordChangeFailed'),
        commonError: app.t('common.error')
      }
    })
  },

  // 旧密码输入
  onOldPasswordChange(e) {
    this.setData({
      oldPassword: e.detail
    })
  },

  // 新密码输入
  onNewPasswordChange(e) {
    this.setData({
      newPassword: e.detail
    })
  },

  // 确认密码输入
  onConfirmPasswordChange(e) {
    this.setData({
      confirmPassword: e.detail
    })
  },

  // 提交密码修改
  async submitPasswordChange() {
    const { oldPassword, newPassword, confirmPassword, translations } = this.data
    
    // 验证旧密码
    if (!oldPassword || !oldPassword.trim()) {
      wx.showToast({
        title: translations.oldPasswordRequired,
        icon: 'none'
      })
      return
    }
    
    // 验证新密码
    if (!newPassword || !newPassword.trim()) {
      wx.showToast({
        title: translations.newPasswordRequired,
        icon: 'none'
      })
      return
    }
    
    // 验证密码长度
    if (newPassword.length < 6 || newPassword.length > 20) {
      wx.showToast({
        title: translations.passwordLength,
        icon: 'none'
      })
      return
    }
    
    // 验证确认密码
    if (!confirmPassword || !confirmPassword.trim()) {
      wx.showToast({
        title: translations.confirmPasswordRequired,
        icon: 'none'
      })
      return
    }
    
    // 验证两次密码是否一致
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: translations.passwordMismatch,
        icon: 'none'
      })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      // 调用后端修改密码API
      await changePassword({
        oldPassword: oldPassword,
        newPassword: newPassword
      })
      
      this.setData({ loading: false })
      
      wx.showToast({
        title: translations.passwordChangeSuccess,
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      
    } catch (error) {
      this.setData({ loading: false })
      
      wx.showToast({
        title: error.message || translations.passwordChangeFailed,
        icon: 'none'
      })
    }
  }
})