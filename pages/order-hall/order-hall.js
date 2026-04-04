const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getAvailableOrders, acceptOrder } = require('../../utils/api.js')

Page({
  data: {
    // 可接订单列表
    availableOrders: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      noOrders: '',
      grabOrder: '',
      grabSuccess: '',
      grabFailed: '',
      confirmGrab: '',
      cancel: '',
      confirm: '',
      serviceName: '',
      patient: '',
      location: '',
      time: '',
      price: '',
      grabNow: ''
    }
  },

  onLoad(options) {
    this.loadAvailableOrders()
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
    this.loadAvailableOrders()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('orderHall.title'),
        noOrders: i18n.t('orderHall.noOrders'),
        grabOrder: i18n.t('orderHall.grabOrder'),
        grabSuccess: i18n.t('orderHall.grabSuccess'),
        grabFailed: i18n.t('orderHall.grabFailed'),
        confirmGrab: i18n.t('orderHall.confirmGrab'),
        cancel: i18n.t('common.cancel'),
        confirm: i18n.t('common.confirm'),
        serviceName: i18n.t('orderHall.serviceName'),
        patient: i18n.t('orderHall.patient'),
        location: i18n.t('orderHall.location'),
        time: i18n.t('orderHall.time'),
        price: i18n.t('orderHall.price'),
        grabNow: i18n.t('orderHall.grabNow'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载可接订单
  async loadAvailableOrders() {
    this.setData({ loading: true })
    
    try {
      // 调用后端API获取可接订单
      const orders = await getAvailableOrders()
      
      // 为每个订单添加唯一标识（防止动画问题）
      const ordersWithUnique = (orders || []).map(order => ({
        ...order,
        _uniqueId: `${order.id}_${Date.now()}`
      }))
      
      this.setData({
        availableOrders: ordersWithUnique,
        loading: false,
        isEmpty: ordersWithUnique.length === 0
      })
    } catch (error) {
      console.error('加载订单失败:', error)
      // 如果API调用失败，使用mock数据
      const availableOrders = mock.orders.filter(order => order.status === 1)
      const ordersWithUnique = availableOrders.map(order => ({
        ...order,
        _uniqueId: `${order.id}_${Date.now()}`
      }))
      
      this.setData({
        availableOrders: ordersWithUnique,
        loading: false,
        isEmpty: ordersWithUnique.length === 0
      })
    }
  },

  // 抢单
  handleGrab(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showModal({
      title: this.data.translations.confirmGrab,
      content: `${this.data.translations.serviceName}: ${order.serviceName}\n${this.data.translations.price}: ¥${order.amount}`,
      confirmText: this.data.translations.confirm,
      cancelText: this.data.translations.cancel,
      success: async (res) => {
        if (res.confirm) {
          await this.performGrab(order)
        }
      }
    })
  },

  // 执行抢单
  async performGrab(order) {
    wx.showLoading({
      title: '抢单中...'
    })
    
    try {
      // 调用后端API接单
      await acceptOrder(order.id)
      
      wx.hideLoading()
      wx.showToast({
        title: this.data.translations.grabSuccess,
        icon: 'success'
      })
      
      // 重新加载订单列表
      await this.loadAvailableOrders()
    } catch (error) {
      wx.hideLoading()
      console.error('抢单失败:', error)
      wx.showToast({
        title: error.message || this.data.translations.grabFailed,
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadAvailableOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})