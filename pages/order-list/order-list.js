const mock = require('../../mock/index.js')
const { ORDER_STATUS_TEXT } = require('../../mock/orders.js')
const { getOrderList, cancelOrder, payOrder, confirmOrder } = require('../../utils/api.js')

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
    
    // 设置导航栏标题
    const app = getApp()
    wx.setNavigationBarTitle({
      title: app.t('order.title') || '我的订单'
    })
    
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
    this.updateTranslations()
    this.loadOrders()
  },

  onHide() {
    // 页面隐藏时关闭loading状态
    wx.hideLoading()
  },

  onUnload() {
    // 页面卸载时关闭loading状态
    wx.hideLoading()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    this.loadOrders()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: app.t('order.title') || '我的订单'
    })
    
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
        comment: app.t('order.comment'),
        commented: app.t('order.commented'),
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
      // 调用后端API获取订单列表
      const result = await getOrderList({ page: 1, pageSize: 100 })
      
      // 处理字段映射
      const orderList = (result.list || []).map(order => ({
        ...order,
        image: order.serviceImage || order.image, // 将serviceImage映射为image
        price: order.actualAmount || order.amount, // 使用实付金额
        reviewed: order.reviewed || false // 确保reviewed字段有值
      }))
      
      this.setData({
        orderList,
        loading: false
      })
      
      // 根据当前标签过滤订单
      this.filterOrders()
    } catch (error) {
      console.error('加载订单失败:', error)
      // 如果API调用失败，使用mock数据
      this.setData({
        orderList: mock.orders || [],
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
      // 根据tab映射过滤订单
      let filtered = []
      switch (activeTab) {
        case 1: // 待支付
          filtered = orderList.filter(order => order.status === 0)
          break
        case 2: // 进行中（待接单、已接单、服务中）
          filtered = orderList.filter(order => [1, 2, 7].includes(order.status))
          break
        case 3: // 服务中
          filtered = orderList.filter(order => order.status === 7)
          break
        case 4: // 已完成
          filtered = orderList.filter(order => order.status === 3)
          break
        case 5: // 退款（退款中、已退款）
          filtered = orderList.filter(order => [5, 6].includes(order.status))
          break
        default:
          filtered = orderList
      }
      
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
      0: 'status-pending',
      1: 'status-wait',
      2: 'status-accepted',
      3: 'status-success',
      4: 'status-cancel',
      5: 'status-refund',
      6: 'status-refunded',
      7: 'status-process'
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
      // 调用后端API取消订单
      await cancelOrder(order.id)
      
      // 重新加载订单列表
      await this.loadOrders()
      
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: error.message || this.getApp().t('common.error'),
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 去支付
  async handlePay(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showLoading({
      title: '处理中...'
    })
    
    try {
      // 调用后端API支付订单
      await payOrder(order.id, { paymentMethod: 'wechat' })
      
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      // 重新加载订单列表
      await this.loadOrders()
    } catch (error) {
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
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
      // 调用后端API确认完成
      await confirmOrder(order.id)
      
      // 重新加载订单列表
      await this.loadOrders()
      
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: error.message || this.getApp().t('common.error'),
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 申请售后
  handleRefund(e) {
    const order = e.currentTarget.dataset.order
    
    wx.showModal({
      title: '申请退款',
      content: '请输入退款原因',
      editable: true,
      placeholderText: '请说明退款原因',
      success: (res) => {
        if (res.confirm && res.content) {
          this.performRefund(order, res.content)
        }
      }
    })
  },

  // 执行申请退款
  async performRefund(order, reason) {
    wx.showLoading({
      title: '处理中...'
    })
    
    try {
      // 调用后端API申请退款
      await refundOrder(order.id, { reason })
      
      // 重新加载订单列表
      await this.loadOrders()
      
      wx.showToast({
        title: '退款申请已提交',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: error.message || '申请失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 评价订单
  handleComment(e) {
    const order = e.currentTarget.dataset.order
    
    // 跳转到评价页面
    wx.navigateTo({
      url: `/pages/order-comment/order-comment?id=${order.id}&orderData=${encodeURIComponent(JSON.stringify(order))}`
    })
  },

  // 评分变化
  

  // 获取app实例
  getApp() {
    return getApp()
  }
})