const mock = require('../../mock/index.js')

Page({
  data: {
    // 申请表单数据
    formData: {
      name: '',
      phone: '',
      gender: 'male',
      age: '',
      experience: '',
      tags: [],
      intro: '',
      services: []
    },
    
    // 可选标签
    availableTags: [
      { id: 1, name: '内科', selected: false },
      { id: 2, name: '外科', selected: false },
      { id: 3, name: '儿科', selected: false },
      { id: 4, name: '妇产科', selected: false },
      { id: 5, name: '骨科', selected: false },
      { id: 6, name: '神经科', selected: false },
      { id: 7, name: '呼吸科', selected: false },
      { id: 8, name: '心脏科', selected: false }
    ],
    
    // 可选服务
    availableServices: [
      { id: 1, name: '门诊陪诊', selected: false },
      { id: 2, name: '住院陪护', selected: false },
      { id: 3, name: '代取药品', selected: false },
      { id: 4, name: '代取报告', selected: false },
      { id: 5, name: '代缴费', selected: false },
      { id: 6, name: '代预约', selected: false },
      { id: 7, name: '代问诊', selected: false },
      { id: 8, name: '代办业务', selected: false }
    ],
    
    // 提交状态
    submitting: false,
    
    // 头像上传
    avatar: '',
    
    // 证件照上传
    idCardFront: '',
    idCardBack: '',
    
    // 健康证上传
    healthCertificate: '',
    
    // 翻译文本
    translations: {
      title: '',
      basicInfo: '',
      name: '',
      namePlaceholder: '',
      phone: '',
      phonePlaceholder: '',
      gender: '',
      male: '',
      female: '',
      age: '',
      agePlaceholder: '',
      experience: '',
      experiencePlaceholder: '',
      tags: '',
      services: '',
      intro: '',
      introPlaceholder: '',
      uploadAvatar: '',
      uploadIdCard: '',
      uploadHealthCert: '',
      submit: '',
      submitting: '',
      success: '',
      failed: '',
      confirm: '',
      confirmSubmit: '',
      cancel: '',
      requiredFields: ''
    }
  },

  onLoad(options) {
    console.log('申请成为陪诊师页面加载', options)
    this.loadUserInfo()
    this.updateTranslations()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: app.t('applyCompanion.title') || '申请成为陪诊师'
    })
    
    this.setData({
      translations: {
        title: app.t('applyCompanion.title'),
        basicInfo: app.t('applyCompanion.basicInfo'),
        name: app.t('applyCompanion.name'),
        namePlaceholder: app.t('applyCompanion.namePlaceholder'),
        phone: app.t('applyCompanion.phone'),
        phonePlaceholder: app.t('applyCompanion.phonePlaceholder'),
        gender: app.t('applyCompanion.gender'),
        male: app.t('applyCompanion.male'),
        female: app.t('applyCompanion.female'),
        age: app.t('applyCompanion.age'),
        agePlaceholder: app.t('applyCompanion.agePlaceholder'),
        experience: app.t('applyCompanion.experience'),
        experiencePlaceholder: app.t('applyCompanion.experiencePlaceholder'),
        tags: app.t('applyCompanion.tags'),
        services: app.t('applyCompanion.services'),
        intro: app.t('applyCompanion.intro'),
        introPlaceholder: app.t('applyCompanion.introPlaceholder'),
        uploadAvatar: app.t('applyCompanion.uploadAvatar'),
        uploadIdCard: app.t('applyCompanion.uploadIdCard'),
        uploadHealthCert: app.t('applyCompanion.uploadHealthCert'),
        submit: app.t('applyCompanion.submit'),
        submitting: app.t('applyCompanion.submitting'),
        success: app.t('applyCompanion.success'),
        failed: app.t('applyCompanion.failed'),
        confirm: app.t('common.confirm'),
        confirmSubmit: app.t('applyCompanion.confirmSubmit'),
        cancel: app.t('common.cancel'),
        requiredFields: app.t('applyCompanion.requiredFields')
      }
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        'formData.name': app.globalData.userInfo.nickname || '',
        'formData.phone': app.globalData.userInfo.phone || ''
      })
    }
  },

  // 输入框变化
  handleNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
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

  handleIntroInput(e) {
    this.setData({
      'formData.intro': e.detail.value
    })
  },

  // 性别选择
  handleGenderSelect(e) {
    const gender = e.currentTarget.dataset.value
    this.setData({
      'formData.gender': gender
    })
  },

  // 标签选择
  handleTagSelect(e) {
    const index = e.currentTarget.dataset.index
    const tag = `availableTags[${index}].selected`
    const currentSelected = this.data.availableTags[index].selected
    this.setData({
      [tag]: !currentSelected
    })
  },

  // 服务选择
  handleServiceSelect(e) {
    const index = e.currentTarget.dataset.index
    const service = `availableServices[${index}].selected`
    const currentSelected = this.data.availableServices[index].selected
    this.setData({
      [service]: !currentSelected
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

  // 身份证正面上传
  handleIdCardFrontUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          idCardFront: tempFilePaths[0]
        })
      }
    })
  },

  // 身份证背面上传
  handleIdCardBackUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          idCardBack: tempFilePaths[0]
        })
      }
    })
  },

  // 健康证上传
  handleHealthCertificateUpload() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          healthCertificate: tempFilePaths[0]
        })
      }
    })
  },

  // 验证表单
  validateForm() {
    const { formData, avatar, idCardFront, idCardBack, healthCertificate } = this.data
    
    // 验证姓名
    if (!formData.name || formData.name.trim() === '') {
      this.scrollToField('name-field')
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      })
      return false
    }
    
    // 验证手机号
    if (!formData.phone || formData.phone.trim() === '') {
      this.scrollToField('phone-field')
      wx.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
      return false
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      this.scrollToField('phone-field')
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return false
    }
    
    // 验证年龄
    const ageNum = parseInt(formData.age)
    if (!formData.age || formData.age.trim() === '') {
      this.scrollToField('age-field')
      wx.showToast({
        title: '请填写年龄',
        icon: 'none'
      })
      return false
    }
    
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      this.scrollToField('age-field')
      wx.showToast({
        title: '年龄必须在18-65岁之间',
        icon: 'none'
      })
      return false
    }
    
    // 验证工作经验
    if (!formData.experience || formData.experience.trim() === '') {
      this.scrollToField('experience-field')
      wx.showToast({
        title: '请填写工作经验',
        icon: 'none'
      })
      return false
    }
    
    // 验证头像
    if (!avatar) {
      this.scrollToField('avatar-field')
      wx.showToast({
        title: '请上传头像',
        icon: 'none'
      })
      return false
    }
    
    // 验证身份证
    if (!idCardFront) {
      this.scrollToField('idcard-front-field')
      wx.showToast({
        title: '请上传身份证正面',
        icon: 'none'
      })
      return false
    }
    
    if (!idCardBack) {
      this.scrollToField('idcard-back-field')
      wx.showToast({
        title: '请上传身份证背面',
        icon: 'none'
      })
      return false
    }
    
    // 验证健康证
    if (!healthCertificate) {
      this.scrollToField('health-cert-field')
      wx.showToast({
        title: '请上传健康证',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 滚动到指定字段
  scrollToField(fieldId) {
    wx.createSelectorQuery().select(`#${fieldId}`).boundingClientRect((rect) => {
      if (rect) {
        wx.pageScrollTo({
          scrollTop: rect.top - 100,
          duration: 300
        })
      }
    }).exec()
  },

  // 提交申请
  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    wx.showModal({
      title: this.data.translations.confirm,
      content: this.data.translations.confirmSubmit,
      confirmText: this.data.translations.confirm,
      cancelText: this.data.translations.cancel,
      success: async (res) => {
        if (res.confirm) {
          await this.performSubmit()
        }
      }
    })
  },

  // 执行提交
  async performSubmit() {
    this.setData({ submitting: true })
    
    wx.showLoading({
      title: this.data.translations.submitting
    })
    
    try {
      // 模拟网络延迟
      await mock.delay(2000)
      
      // 获取选中的标签和服务
      const selectedTags = this.data.availableTags
        .filter(tag => tag.selected)
        .map(tag => tag.id)
      
      const selectedServices = this.data.availableServices
        .filter(service => service.selected)
        .map(service => service.id)
      
      // 更新用户信息，设置为陪诊师
      const app = getApp()
      if (app.globalData.userInfo) {
        app.globalData.userInfo.isCompanion = true
        app.globalData.userInfo.companionInfo = {
          id: Date.now(),
          name: this.data.formData.name,
          avatar: this.data.avatar,
          gender: this.data.formData.gender,
          age: parseInt(this.data.formData.age),
          score: 5.0,
          orders: 0,
          comments: 0,
          certified: true,
          qualified: true,
          experience: this.data.formData.experience,
          tags: selectedTags,
          services: selectedServices,
          intro: this.data.formData.intro
        }
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        console.log('陪诊师申请成功，用户信息已更新:', app.globalData.userInfo)
      }

      wx.hideLoading()
      wx.showToast({
        title: this.data.translations.success,
        icon: 'success'
      })

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    } catch (error) {
      wx.hideLoading()
      console.error('申请失败:', error)
      wx.showToast({
        title: this.data.translations.failed,
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  })