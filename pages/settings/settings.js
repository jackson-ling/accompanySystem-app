Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 当前语言
    currentLanguage: 'zh-CN',
    
    // 语言选择器显示状态
    showLanguagePicker: false,
    
    // 语言选项
    languageOptions: [],
    
    // 昵称修改弹窗显示状态
    showNicknameDialog: false,
    
    // 新昵称
    newNickname: '',
    
    // 翻译文本
    translations: {
      title: '',
      changeAvatar: '',
      changeNickname: '',
      changePassword: '',
      languageSwitch: '',
      chinese: '',
      english: '',
      about: '',
      logout: '',
      deleteAccount: '',
      commonCancel: '',
      commonConfirm: '',
      nicknamePlaceholder: ''
    }
  },

  onLoad(options) {
    console.log('设置页面加载', options)
    this.updateTranslations()
    this.loadUserInfo()
    this.loadLanguage()
  },

  onShow() {
    // 重新加载用户信息
    this.loadUserInfo()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    this.loadLanguage()
    // 重新渲染页面
    this.setData({
      currentLanguage: getApp().getCurrentLanguage()
    })
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('settings.title'),
        changeAvatar: app.t('settings.changeAvatar'),
        changeNickname: app.t('settings.changeNickname'),
        changePassword: app.t('settings.changePassword'),
        languageSwitch: app.t('settings.languageSwitch'),
        chinese: app.t('settings.chinese'),
        english: app.t('settings.english'),
        about: app.t('settings.about'),
        logout: app.t('settings.logout'),
        deleteAccount: app.t('settings.deleteAccount'),
        commonCancel: app.t('common.cancel'),
        commonConfirm: app.t('common.confirm'),
        nicknamePlaceholder: app.t('settings.nicknamePlaceholder')
      },
      languageOptions: [
        { name: app.t('settings.chinese'), value: 'zh-CN' },
        { name: app.t('settings.english'), value: 'en-US' }
      ]
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  // 加载当前语言
  loadLanguage() {
    const currentLanguage = getApp().getCurrentLanguage()
    
    this.setData({
      currentLanguage
    })
  },

  // 修改头像
  handleChangeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 简单的文件大小检查
        wx.getFileInfo({
          filePath: tempFilePath,
          success: (fileInfo) => {
            if (fileInfo.size > 2 * 1024 * 1024) {
              wx.showToast({
                title: this.getApp().t('settings.avatarSizeError'),
                icon: 'none'
              })
              return
            }
            
            // 更新头像
            this.updateAvatar(tempFilePath)
          }
        })
      }
    })
  },

  // 更新头像
  async updateAvatar(avatar) {
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新用户信息
      const app = getApp()
      if (app.globalData.userInfo) {
        app.globalData.userInfo.avatar = avatar
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        
        this.setData({
          userInfo: app.globalData.userInfo
        })
      }
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('settings.avatarUpdated'),
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('settings.avatarUpdateFailed'),
        icon: 'none'
      })
    }
  },

  // 修改昵称
  handleChangeNickname() {
    const app = getApp()
    this.setData({
      newNickname: app.globalData.userInfo?.nickname || '',
      showNicknameDialog: true
    })
  },

  // 昵称输入
  handleNicknameInput(e) {
    const value = e.detail.value !== undefined ? e.detail.value : e.detail
    this.setData({
      newNickname: value
    })
  },

  // 提交昵称修改
  async submitNicknameChange() {
    const { newNickname } = this.data
    
    if (!newNickname || !newNickname.trim()) {
      wx.showToast({
        title: this.getApp().t('settings.nicknameEmpty'),
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新用户信息
      const app = getApp()
      if (app.globalData.userInfo) {
        app.globalData.userInfo.nickname = newNickname
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        
        this.setData({
          userInfo: app.globalData.userInfo
        })
      }
      
      this.setData({ showNicknameDialog: false })
      
      wx.hideLoading()
      wx.showToast({
        title: `${this.getApp().t('settings.nicknameUpdated')} ${newNickname}`,
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.error'),
        icon: 'none'
      })
    }
  },

  // 关闭昵称修改弹窗
  handleNicknameDialogCancel() {
    this.setData({
      showNicknameDialog: false
    })
  },

  // 修改密码
  handleChangePassword() {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    })
  },

  // 切换语言
  handleLanguage() {
    this.setData({
      showLanguagePicker: true
    })
  },

  // 选择语言
  onLanguageSelect(e) {
    const selectedOption = e.detail
    const languageValue = selectedOption.value || selectedOption
    
    this.setData({
      currentLanguage: languageValue,
      showLanguagePicker: false
    })
    
    // 调用app的切换语言方法
    getApp().switchLanguage(languageValue)
    
    // 更新翻译文本
    this.updateTranslations()
    
    wx.showToast({
      title: getApp().t('common.languageChanged'),
      icon: 'success'
    })
  },

  // 关闭语言选择器
  onLanguageCancel() {
    this.setData({
      showLanguagePicker: false
    })
  },

  // 关于我们
  handleAbout() {
    wx.showModal({
      title: this.getApp().t('settings.about'),
      content: this.getApp().t('settings.aboutContent'),
      showCancel: false,
      confirmText: this.getApp().t('common.confirm')
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: this.getApp().t('common.confirm'),
      content: this.getApp().t('settings.logoutConfirm'),
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.logout()
          
          wx.showToast({
            title: this.getApp().t('profile.loggedOut'),
            icon: 'success'
          })
        }
      }
    })
  },

  // 注销账号
  handleDeleteAccount() {
    wx.showModal({
      title: this.getApp().t('settings.about'),
      content: this.getApp().t('settings.deleteAccountWarning'),
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          // 模拟注销
          setTimeout(() => {
            const app = getApp()
            app.logout()
            
            wx.showToast({
              title: this.getApp().t('settings.accountDeleted'),
              icon: 'success'
            })
          }, 1000)
        }
      }
    })
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})