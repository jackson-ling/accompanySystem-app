const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { 
  getCompanionOrders, 
  startService, 
  completeService,
  updateOrderStatus 
} = require('../../utils/api.js')

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
      // 调用后端API获取陪诊师订单
      const result = await getCompanionOrders({ 
        status: this.data.activeTab === 'pending' ? 2 : 4 
      })
      
      // 处理字段映射
      const orders = (result.list || []).map(order => ({
        ...order,
        image: order.serviceImage || order.image,
        price: order.actualAmount || order.amount
      }))
      
      this.setData({
        orders,
        loading: false
      })
    } catch (error) {
      console.error('加载订单失败:', error)
      // 如果API调用失败，使用mock数据
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
  async handleStartService(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('serviceOrders.confirmStartService'),
      content: i18n.t('serviceOrders.startServiceConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: async (res) => {
        if (res.confirm) {
          try {
            await startService(order.id)
            wx.showToast({
              title: i18n.t('serviceOrders.serviceStarted'),
              icon: 'success'
            })
            this.loadOrders()
          } catch (error) {
            console.error('开始服务失败:', error)
            wx.showToast({
              title: error.message || i18n.t('common.error'),
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 完成服务
  async handleCompleteService(e) {
    const order = e.currentTarget.dataset.order
    wx.showModal({
      title: i18n.t('serviceOrders.confirmCompleteService'),
      content: i18n.t('serviceOrders.completeServiceConfirm'),
      confirmText: i18n.t('common.confirm'),
      cancelText: i18n.t('common.cancel'),
      success: async (res) => {
        if (res.confirm) {
          try {
            await completeService(order.id)
            wx.showToast({
              title: i18n.t('serviceOrders.serviceCompleted'),
              icon: 'success'
            })
            this.loadOrders()
          } catch (error) {
            console.error('完成服务失败:', error)
            wx.showToast({
              title: error.message || i18n.t('common.error'),
              icon: 'none'
            })
          }
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

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})