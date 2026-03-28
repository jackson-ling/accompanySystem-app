const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 当前标签
    activeTab: 'pending',
    
    // 订单列表
    orders: [],
    
    // 加载状态
    loading: false,
    
    // 翻译文本
    translations: {
      title: '',
      pendingOrders: '',
      completedOrders: '',
      noOrders: '',
      contactCustomer: '',
      startService: '',
      completeService: '',
      viewDetail: '',
      serviceName: '',
      time: '',
      location: '',
      patient: '',
      status: '',
      loading: ''
    }
  },

  onLoad(options) {
    this.loadOrders()
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
    // 重新加载订单
    this.loadOrders()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('serviceOrders.title'),
        pendingOrders: i18n.t('serviceOrders.pendingOrders'),
        completedOrders: i18n.t('serviceOrders.completedOrders'),
        noOrders: i18n.t('serviceOrders.noOrders'),
        contactCustomer: i18n.t('serviceOrders.contactCustomer'),
        startService: i18n.t('serviceOrders.startService'),
        completeService: i18n.t('serviceOrders.completeService'),
        viewDetail: i18n.t('serviceOrders.viewDetail'),
        serviceName: i18n.t('serviceOrders.serviceName'),
        time: i18n.t('serviceOrders.time'),
        location: i18n.t('serviceOrders.location'),
        patient: i18n.t('serviceOrders.patient'),
        status: i18n.t('serviceOrders.status'),
        loading: i18n.t('common.loading'),
        pending: i18n.t('serviceOrders.pending'),
        process: i18n.t('serviceOrders.process'),
        completed: i18n.t('serviceOrders.completed')
      }
    })
  },

  // 加载订单
  async loadOrders() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取当前陪诊师的订单
      const companionId = getApp().globalData.userInfo?.companionInfo?.id
      
      // 获取待服务订单（状态为2）和已完成订单（状态为4）
      let orders = []
      if (this.data.activeTab === 'pending') {
        orders = mock.orders.filter(order => order.status === 2)
      } else {
        orders = mock.orders.filter(order => order.status === 4)
      }
      
      this.setData({
        orders,
        loading: false
      })
    } catch (error) {
      console.error('加载订单失败:', error)
      this.setData({
        orders: [],
        loading: false
      })
    }
  },

  // 切换标签
  handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    this.loadOrders()
  },

  // 联系客户
  handleContactCustomer(e) {
    const order = e.currentTarget.dataset.order
    if (order && order.phone) {
      wx.showModal({
        title: i18n.t('serviceOrders.contactCustomer'),
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
        title: i18n.t('serviceOrders.noPhone'),
        icon: 'none'
      })
    }
  },

  // 开始服务
  handleStartService(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('serviceOrders.confirmStartService'),
      content: i18n.t('serviceOrders.startServiceConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          // 更新订单状态为服务中
          const orderIndex = mock.orders.findIndex(o => o.id === order.id)
          if (orderIndex > -1) {
            mock.orders[orderIndex].status = 3
          }
          
          wx.showToast({
            title: i18n.t('serviceOrders.serviceStarted'),
            icon: 'success'
          })
          this.loadOrders()
        }
      }
    })
  },

  // 完成服务
  handleCompleteService(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('serviceOrders.confirmCompleteService'),
      content: i18n.t('serviceOrders.completeServiceConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          // 更新订单状态为已完成
          const orderIndex = mock.orders.findIndex(o => o.id === order.id)
          if (orderIndex > -1) {
            mock.orders[orderIndex].status = 4
          }
          
          wx.showToast({
            title: i18n.t('serviceOrders.serviceCompleted'),
            icon: 'success'
          })
          this.loadOrders()
        }
      }
    })
  },

  // 查看详情
  handleViewDetail(e) {
    const order = e.currentTarget.dataset.order
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${order.id}`
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})