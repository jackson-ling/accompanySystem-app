// pages/profile/profile.js
const mock = require('../../mock/index.js')
const { getUserProfile } = require('../../utils/api.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLogin: false,
    
    // 待服务订单数
    pendingServiceCount: 0,
    
    // 是否是陪诊师
    isCompanion: false,
    
    // 翻译文本
    translations: {
      loginPrompt: '',
      loginDesc: '',
      accountBalance: '',
      recharge: '',
      myOrders: '',
      allOrders: '',
      pendingService: '',
      inService: '',
      completed: '',
      refund: '',
      commonFunctions: '',
      patientManagement: '',
      myFavorites: '',
      workbench: '',
      contactService: '',
      feedback: '',
      applyCompanion: '',
      apply: '',
      applyCompanionRequired: ''
    }
  },

  onLoad(options) {
    console.log('个人中心加载', options)
    this.updateTranslations()
    this.checkLogin()
    this.loadUserData()
  },

// 显示页面
  onShow() {
    console.log('个人中心显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
    this.checkLogin()
    this.loadUserData()
    this.updateTranslations()
    
    const app = getApp()
    console.log('当前用户信息:', app.globalData.userInfo)
    console.log('是否是陪诊师:', app.globalData.userInfo?.isCompanion)
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    // 重新渲染页面
    this.checkLogin()
    this.loadUserData()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        loginPrompt: app.t('profile.loginPrompt'),
        loginDesc: app.t('profile.loginDesc'),
        accountBalance: app.t('profile.accountBalance'),
        recharge: app.t('profile.recharge'),
        myOrders: app.t('profile.myOrders'),
        allOrders: app.t('profile.allOrders'),
        pendingService: app.t('order.pendingService'),
        inService: app.t('order.inService'),
        completed: app.t('order.completed'),
        refund: app.t('order.refund'),
        commonFunctions: app.t('profile.commonFunctions'),
        patientManagement: app.t('profile.patientManagement'),
        myFavorites: app.t('profile.myFavorites'),
        workbench: app.t('profile.workbench'),
        contactService: app.t('profile.contactService'),
        feedback: app.t('profile.feedback'),
        applyCompanion: app.t('profile.applyCompanion'),
        apply: app.t('profile.apply'),
        applyCompanionRequired: app.t('profile.applyCompanionRequired')
      },
      isCompanion: app.globalData.userInfo?.isCompanion || false
    })
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo,
      isCompanion: app.globalData.userInfo?.isCompanion || false
    })
  },

  // 加载用户数据
  async loadUserData() {
    const app = getApp()
    
    if (app.globalData.isLogin) {
      try {
        // 获取用户信息（getUserProfile已经包含了balance字段）
        const userInfo = await getUserProfile()
        
        // 更新用户信息
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...userInfo
        }
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        
        // 计算待服务订单数
        const pendingOrders = mock.orders.filter(
          order => order.status === 2
        )
        
        this.setData({
          userInfo: app.globalData.userInfo,
          pendingServiceCount: pendingOrders.length,
          isCompanion: app.globalData.userInfo?.isCompanion || false
        })
      } catch (error) {
        console.error('加载用户数据失败:', error)
        // 如果API调用失败，使用本地缓存的用户信息
        this.setData({
          userInfo: app.globalData.userInfo
        })
      }
    }
  },

  // 点击用户信息
  handleUserInfoClick() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
  },

  // 充值
  handleRecharge() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    })
  },

  // 跳转到订单列表
  goToOrderList(e) {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    const status = e.currentTarget.dataset.status
    let url = '/pages/order-list/order-list'
    
    if (status) {
      url += `?status=${status}`
    }
    
    wx.navigateTo({
      url: url
    })
  },

  // 就诊人管理
  handlePatientManagement() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    wx.navigateTo({
      url: '/pages/patient-list/patient-list'
    })
  },

  // 我的收藏
  handleFavorites() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 陪诊师工作台
  handleWorkbench() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    const userInfo = app.globalData.userInfo
    
    // 检查是否是陪诊师
    if (!userInfo || !userInfo.isCompanion) {
      wx.showModal({
        title: app.t('common.confirm'),
        content: app.t('profile.applyCompanionRequired'),
        confirmText: app.t('profile.apply'),
        cancelText: app.t('common.cancel'),
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/apply-companion/apply-companion'
            })
          }
        }
      })
      return
    }
    
    // 跳转到陪诊师工作台页面（如果存在）
    wx.navigateTo({
      url: '/pages/companion-workbench/companion-workbench'
    })
  },

  // 联系客服
  handleContactService() {
    const t = this.getApp().t
    
    wx.showModal({
      title: t('customerService.title'),
      content: `${t('customerService.phone')}: ${t('customerService.phoneValue')}\n${t('customerService.workTime')}: ${t('customerService.workTimeValue')}`,
      showCancel: true,
      cancelText: t('customerService.cancel'),
      confirmText: t('customerService.call'),
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: t('customerService.phoneValue')
          })
        }
      }
    })
  },

  // 意见反馈
  handleFeedback() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: this.getApp().t('common.loading'),
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 设置
  handleSettings() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})