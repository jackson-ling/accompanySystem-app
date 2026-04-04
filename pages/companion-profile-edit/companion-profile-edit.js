const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getCompanionProfile, updateCompanionProfile } = require('../../utils/api.js')

Page({
  data: {
    // 表单数据
    formData: {
      nickname: '',
      phone: '',
      age: '',
      experience: '',
      introduction: ''
    },
    
    // 头像
    avatar: '',
    
    // 保存状态
    saving: false,
    
    // 翻译文本
    translations: {
      title: '',
      save: '',
      avatarTip: '',
      nickname: '',
      phone: '',
      age: '',
      experience: '',
      introduction: '',
      introductionPlaceholder: '',
      nicknamePlaceholder: '',
      phonePlaceholder: '',
      agePlaceholder: '',
      experiencePlaceholder: '',
      wordCount: '',
      saveSuccess: '',
      saveFailed: '',
      saving: ''
    }
  },

  onLoad(options) {
    this.loadCompanionProfile()
    this.updateTranslations()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('companionProfileEdit.title'),
        save: i18n.t('companionProfileEdit.save'),
        avatarTip: i18n.t('companionProfileEdit.avatarTip'),
        nickname: i18n.t('companionProfileEdit.nickname'),
        phone: i18n.t('companionProfileEdit.phone'),
        age: i18n.t('companionProfileEdit.age'),
        experience: i18n.t('companionProfileEdit.experience'),
        introduction: i18n.t('companionProfileEdit.introduction'),
        introductionPlaceholder: i18n.t('companionProfileEdit.introductionPlaceholder'),
        nicknamePlaceholder: i18n.t('companionProfileEdit.nicknamePlaceholder'),
        phonePlaceholder: i18n.t('companionProfileEdit.phonePlaceholder'),
        agePlaceholder: i18n.t('companionProfileEdit.agePlaceholder'),
        experiencePlaceholder: i18n.t('companionProfileEdit.experiencePlaceholder'),
        wordCount: i18n.t('companionProfileEdit.wordCount'),
        saveSuccess: i18n.t('companionProfileEdit.saveSuccess'),
        saveFailed: i18n.t('companionProfileEdit.saveFailed'),
        saving: i18n.t('companionProfileEdit.saving')
      }
    })
  },

  // 加载陪诊师资料
  async loadCompanionProfile() {
    try {
      const profile = await getCompanionProfile()
      
      if (profile) {
        this.setData({
          avatar: profile.avatar || '',
          formData: {
            nickname: profile.name || '',
            phone: profile.phone || '',
            age: profile.age ? profile.age.toString() : '',
            experience: profile.experience || '',
            introduction: profile.intro || ''
          }
        })
      }
    } catch (error) {
      console.error('加载陪诊师资料失败:', error)
      // 如果API调用失败，尝试使用本地数据
      const app = getApp()
      const companionInfo = app.globalData.userInfo?.companionInfo
      
      if (companionInfo) {
        this.setData({
          avatar: companionInfo.avatar || '',
          formData: {
            nickname: companionInfo.name || '',
            phone: companionInfo.phone || '',
            age: companionInfo.age ? companionInfo.age.toString() : '',
            experience: companionInfo.experience || '',
            introduction: companionInfo.intro || ''
          }
        })
      }
    }
  },

  // 输入处理
  handleNicknameInput(e) {
    this.setData({
      'formData.nickname': e.detail.value
    })
  },

  handlePhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    })
  },

  handleAgeInput(e) {
    this.setData({
      'formData.age': e.detail.value
    })
  },

  handleExperienceInput(e) {
    this.setData({
      'formData.experience': e.detail.value
    })
  },

  handleIntroductionInput(e) {
    this.setData({
      'formData.introduction': e.detail.value
    })
  },

  // 头像上传
  handleAvatarUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          avatar: tempFilePaths[0]
        })
      }
    })
  },

  // 保存
  async handleSave() {
    const { formData, avatar } = this.data
    
    // 验证表单
    if (!formData.nickname || formData.nickname.trim() === '') {
      wx.showToast({
        title: i18n.t('companionProfileEdit.enterNickname'),
        icon: 'none'
      })
      return
    }
    
    if (!formData.phone || formData.phone.trim() === '') {
      wx.showToast({
        title: i18n.t('companionProfileEdit.enterPhone'),
        icon: 'none'
      })
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      wx.showToast({
        title: i18n.t('companionProfileEdit.phoneFormatError'),
        icon: 'none'
      })
      return
    }
    
    if (!formData.age || formData.age.trim() === '') {
      wx.showToast({
        title: i18n.t('companionProfileEdit.enterAge'),
        icon: 'none'
      })
      return
    }
    
    this.setData({ saving: true })
    wx.showLoading({
      title: this.data.translations.saving
    })
    
    try {
      // 调用后端API更新陪诊师信息
      await updateCompanionProfile({
        name: formData.nickname,
        avatar: avatar,
        phone: formData.phone,
        age: parseInt(formData.age),
        experience: formData.experience,
        intro: formData.introduction
      })
      
      // 更新本地用户信息
      const app = getApp()
      if (app.globalData.userInfo && app.globalData.userInfo.companionInfo) {
        app.globalData.userInfo.companionInfo = {
          ...app.globalData.userInfo.companionInfo,
          name: formData.nickname,
          avatar: avatar,
          phone: formData.phone,
          age: parseInt(formData.age),
          experience: formData.experience,
          intro: formData.introduction
        }
        wx.setStorageSync('userInfo', app.globalData.userInfo)
      }
      
      wx.hideLoading()
      wx.showToast({
        title: this.data.translations.saveSuccess,
        icon: 'success'
      })
      
      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      wx.hideLoading()
      console.error('保存失败:', error)
      wx.showToast({
        title: error.message || this.data.translations.saveFailed,
        icon: 'none'
      })
    } finally {
      this.setData({ saving: false })
    }
  },

  })