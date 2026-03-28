const mock = require('../../mock/index.js')
const { ORDER_STATUS_TEXT } = require('../../mock/orders.js')

Page({
  data: {
    // 当前选中的标签
    activeTab: 0,
    
    // 订单列表
    orderList: [],
    
    // 过滤后的订单列表
    filteredOrders: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      all: '',
      pendingPayment: '',
      pendingService: '',
      inService: '',
      completed: '',
      refund: '',
      viewDetail: '',
      companion: '',
      contactPhone: '',
      totalPrice: '',
      cancelOrder: '',
      pay: '',
      contact: '',
      confirm: '',
      afterSales: ''
    }
  },

  onLoad(options) {
    console.log('订单列表页面加载', options)
    
    // 从URL参数获取初始标签
    if (options.status) {
      this.setData({
        activeTab: parseInt(options.status)
      })
    }
    
    this.updateTranslations()
    this.loadOrders()
  },

  onShow() {
    // 重新加载订单数据
    this.loadOrders()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    this.loadOrders()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('order.title'),
        all: app.t('order.all'),
        pendingPayment: app.t('order.pendingPayment'),
        pendingService: app.t('order.pendingService'),
        inService: app.t('order.inService'),
        completed: app.t('order.completed'),
        refund: app.t('order.refund'),
        viewDetail: app.t('order.viewDetail'),
        companion: app.t('order.companion'),
        contactPhone: app.t('order.contactPhone'),
        totalPrice: app.t('order.totalPrice'),
        cancelOrder: app.t('order.cancelOrder'),
        pay: app.t('order.pay'),
        contact: app.t('order.contact'),
        confirm: app.t('order.confirm'),
        afterSales: app.t('order.afterSales'),
        noData: app.t('common.noData'),
        loading: app.t('common.loading')
      }
    })
  },

  // 语言切换回调
  onLanguageChange() {
    this.loadOrders()
  },

  // 加载订单数据
  async loadOrders() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取订单列表
      const orderList = mock.orders || []
      
      this.setData({
        orderList,
        loading: false
      })
      
      // 根据当前标签过滤订单
      this.filterOrders()
    } catch (error) {
      console.error('加载订单失败:', error)
      this.setData({
        orderList: [],
        loading: false
      })
      this.filterOrders()
    }
  },

  // 过滤订单
  filterOrders() {
    const { activeTab, orderList } = this.data
    
    if (activeTab === 0) {
      // 全部订单
      this.setData({
        filteredOrders: orderList,
        isEmpty: orderList.length === 0
      })
    } else {
      // 根据状态过滤
      const filtered = orderList.filter(order => order.status === activeTab)
      this.setData({
        filteredOrders: filtered,
        isEmpty: filtered.length === 0
      })
    }
  },

  // 切换标签
  handleTabChange(e) {
    const tabIndex = parseInt(e.detail.current)
    this.setData({
      activeTab: tabIndex
    })
    this.filterOrders()
  },

  // 点击标签项
  handleTabClick(e) {
    const tabIndex = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeTab: tabIndex
    })
    this.filterOrders()
  },

  // 获取状态文本
  getStatusText(status) {
    const app = getApp()
    return app.t(`order.statusText.${status}`) || ORDER_STATUS_TEXT[status] || '未知状态'
  },

  // 获取状态样式类
  getStatusClass(status) {
    const statusClassMap = {
      1: 'status-pending',
      2: 'status-wait',
      3: 'status-process',
      4: 'status-success',
      5: 'status-refund',
      6: 'status-cancel'
    }
    return statusClassMap[status] || ''
  },

  // 跳转到订单详情
  goToDetail(e) {
    const order = e.currentTarget.dataset.order
    if (!order || !order.id) {
      return
    }
    
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${order.id}`,
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 取消订单
  handleCancel(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showModal({
      title: this.getApp().t('common.confirm'),
      content: '确定要取消该订单吗？',
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          this.performCancel(order)
        }
      }
    })
  },

  // 执行取消订单
  async performCancel(order) {
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      await mock.delay(1000)
      
      // 更新订单状态
      const orderList = this.data.orderList.map(item => {
        if (item.id === order.id) {
          return { ...item, status: 6 } // 已取消
        }
        return item
      })
      
      this.setData({
        orderList
      })
      
      this.filterOrders()
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
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

  // 去支付
  handlePay(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showToast({
      title: '跳转支付页面...',
      icon: 'none'
    })
  },

  // 联系陪诊师
  handleContact(e) {
    const order = e.currentTarget.dataset.order
    
    if (order.companionPhone) {
      wx.makePhoneCall({
        phoneNumber: order.companionPhone,
        fail: () => {
          wx.showToast({
            title: '拨打电话失败',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '暂无联系方式',
        icon: 'none'
      })
    }
  },

  // 确认完成
  handleConfirm(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showModal({
      title: this.getApp().t('common.confirm'),
      content: '确认服务已完成吗？',
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          this.performConfirm(order)
        }
      }
    })
  },

  // 执行确认完成
  async performConfirm(order) {
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      await mock.delay(1000)
      
      // 更新订单状态
      const orderList = this.data.orderList.map(item => {
        if (item.id === order.id) {
          return { ...item, status: 4 } // 已完成
        }
        return item
      })
      
      this.setData({
        orderList
      })
      
      this.filterOrders()
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
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

  // 申请售后
  handleRefund(e) {
    wx.showToast({
      title: '售后功能开发中',
      icon: 'none'
    })
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})