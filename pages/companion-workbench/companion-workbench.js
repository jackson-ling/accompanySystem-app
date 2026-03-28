const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 陪诊师信息
    companionInfo: null,
    
    // 在线状态
    isOnline: true,
    
    // 统计数据
    statistics: {
      todayIncome: 0,
      todayOrders: 0,
      rating: 5.0,
      followers: 0,
      totalOrders: 0,
      workDays: 0
    },
    
    // 待处理订单
    pendingOrders: [],
    
    // 翻译文本
    translations: {
      title: '',
      online: '',
      offline: '',
      startWork: '',
      endWork: '',
      todayIncome: '',
      todayOrders: '',
      rating: '',
      followers: '',
      totalOrders: '',
      workDays: '',
      incomeDetails: '',
      orderHall: '',
      allOrders: '',
      pendingOrders: '',
      viewAll: '',
      contactCustomer: '',
      rejectOrder: '',
      acceptOrder: '',
      serviceItem: '',
      serviceTime: '',
      patientName: '',
      phone: '',
      serviceLocation: '',
      noOrders: '',
      editProfile: '',
      clickToEdit: '',
      phoneNotSet: '',
      experienceUnknown: ''
    }
  },

  onLoad(options) {
    this.loadData()
    this.updateTranslations()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  onShow() {
    // 重新加载数据
    this.loadData()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('workbench.title'),
        online: i18n.t('workbench.online'),
        offline: i18n.t('workbench.offline'),
        startWork: i18n.t('workbench.startWork'),
        endWork: i18n.t('workbench.endWork'),
        todayIncome: i18n.t('workbench.todayIncome'),
        todayOrders: i18n.t('workbench.todayOrders'),
        rating: i18n.t('workbench.rating'),
        followers: i18n.t('workbench.followers'),
        totalOrders: i18n.t('workbench.totalOrders'),
        workDays: i18n.t('workbench.workDays'),
        incomeDetails: i18n.t('workbench.incomeDetails'),
        orderHall: i18n.t('workbench.orderHall'),
        allOrders: i18n.t('workbench.allOrders'),
        pendingOrders: i18n.t('workbench.pendingOrders'),
        viewAll: i18n.t('workbench.viewAll'),
        contactCustomer: i18n.t('workbench.contactCustomer'),
        rejectOrder: i18n.t('workbench.rejectOrder'),
        acceptOrder: i18n.t('workbench.acceptOrder'),
        serviceItem: i18n.t('workbench.serviceItem'),
        serviceTime: i18n.t('workbench.serviceTime'),
        patientName: i18n.t('workbench.patientName'),
        phone: i18n.t('workbench.phone'),
        serviceLocation: i18n.t('workbench.serviceLocation'),
        noOrders: i18n.t('workbench.emptyTip'),
        editProfile: i18n.t('workbench.editProfile'),
        clickToEdit: i18n.t('workbench.clickToEdit'),
        phoneNotSet: i18n.t('workbench.phoneNotSet'),
experienceUnknown: i18n.t('workbench.experienceUnknown'),
        dayUnit: i18n.t('common.dayUnit'),
        yearUnit: i18n.t('common.yearUnit'),
        companionName: i18n.t('workbench.companionName'),
        notSet: i18n.t('workbench.notSet')
      }
    })
  },

  // 加载数据
  loadData() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    
    if (userInfo && userInfo.isCompanion && userInfo.companionInfo) {
      this.setData({
        companionInfo: userInfo.companionInfo,
        statistics: {
          todayIncome: 0,
          todayOrders: 0,
          rating: userInfo.companionInfo.rating || 5.0,
          followers: 0,
          totalOrders: userInfo.companionInfo.orders || 0,
          workDays: 0
        },
        pendingOrders: []
      })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 切换在线状态
  toggleStatus() {
    const newStatus = !this.data.isOnline
    this.setData({
      isOnline: newStatus
    })
    
    wx.showToast({
      title: newStatus ? i18n.t('workbench.serviceStarted') : i18n.t('workbench.serviceStopped'),
      icon: 'success'
    })
  },

  // 编辑资料
  handleEditProfile() {
    wx.navigateTo({
      url: '/pages/companion-profile-edit/companion-profile-edit'
    })
  },

  // 收入明细
  handleIncomeDetails() {
    wx.navigateTo({
      url: '/pages/income-details/income-details'
    })
  },

  // 抢单大厅
  handleOrderHall() {
    wx.navigateTo({
      url: '/pages/order-hall/order-hall'
    })
  },

  // 全部订单
  handleAllOrders() {
    wx.navigateTo({
      url: '/pages/service-orders/service-orders'
    })
  },

  // 联系客户
  handleContactCustomer(e) {
    const order = e.currentTarget.dataset.order
    if (order && order.phone) {
      wx.showModal({
        title: i18n.t('workbench.contactCustomer'),
        content: `${i18n.t('workbench.callNumber')}${order.phone}`,
        confirmText: i18n.t('workbench.call'),
        cancelText: i18n.t('common.cancel'),
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: order.phone
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: i18n.t('workbench.noPhone'),
        icon: 'none'
      })
    }
  },

  // 拒单
  handleReject(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('workbench.confirmReject'),
      content: i18n.t('workbench.rejectOrderConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: i18n.t('workbench.orderRejected'),
            icon: 'success'
          })
          // 从待处理列表中移除
          const pendingOrders = this.data.pendingOrders.filter(item => item.id !== order.id)
          this.setData({ pendingOrders })
        }
      }
    })
  },

  // 接单
  handleAccept(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('workbench.confirmAccept'),
      content: i18n.t('workbench.acceptOrderConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: i18n.t('workbench.orderAccepted'),
            icon: 'success'
          })
          // 从待处理列表中移除
          const pendingOrders = this.data.pendingOrders.filter(item => item.id !== order.id)
          this.setData({ pendingOrders })
          
          // 更新统计数据
          const statistics = this.data.statistics
          statistics.todayOrders++
          statistics.totalOrders++
          this.setData({ statistics })
        }
      }
    })
  }
})