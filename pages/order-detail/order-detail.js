const mock = require('../../mock/index.js')
const { getOrderDetail, cancelOrder, payOrder, confirmOrder, refundOrder } = require('../../utils/api.js')

Page({
  data: {
    order: null,
    serviceDetail: null,
    loading: false,
    statusText: '',
    statusDesc: '',
    statusClass: '',
    translations: {} // 添加翻译文本
  },

  onLoad(options) {
    console.log('订单详情页面加载', options)
    this.updateTranslations() // 初始化翻译
    const orderId = options.id
    if (orderId) {
      this.fetchOrderDetail(orderId)
    }
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        comment: app.t('order.comment'),
        commented: app.t('order.commented'),
        afterSales: app.t('order.afterSales')
      }
    })
  },

  // 获取订单详情
  async fetchOrderDetail(orderId) {
    this.setData({ loading: true })
    
    try {
      // 调用后端API获取订单详情
      const order = await getOrderDetail(orderId)
      
      if (order) {
        // 处理字段映射
        const processedOrder = {
          ...order,
          image: order.serviceImage || order.image, // 将serviceImage映射为image
          price: order.actualAmount || order.amount, // 使用实付金额
          reviewed: order.reviewed || false // 确保reviewed字段有值
        }
        
        // 获取服务详情（如果API不返回服务详情，可以用mock数据补充）
        const serviceDetail = mock.services.find(s => s.id === order.serviceId) || {
          description: '',
          duration: '',
          sales: 0
        }
        
        this.setData({
          order: processedOrder,
          serviceDetail,
          loading: false
        })
        
        this.updateStatusInfo(order.status)
      } else {
        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      // 如果API调用失败，尝试使用mock数据
      try {
        const mockOrder = mock.orders.find(o => o.id === orderId)
        if (mockOrder) {
          const serviceDetail = mock.services.find(s => s.id === mockOrder.serviceId) || {
            description: '',
            duration: '',
            sales: 0
          }
          
          this.setData({
            order: mockOrder,
            serviceDetail,
            loading: false
          })
          
          this.updateStatusInfo(mockOrder.status)
        } else {
          this.setData({ loading: false })
        }
      } catch (mockError) {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    }
  },

  // 更新状态信息
  updateStatusInfo(status) {
    const statusMap = {
      0: {
        text: '待支付',
        desc: '请尽快完成支付，订单将在15分钟后自动取消',
        class: 'status-pending'
      },
      1: {
        text: '待接单',
        desc: '等待陪诊师接单',
        class: 'status-wait'
      },
      2: {
        text: '已接单',
        desc: '陪诊师已接单，准备为您服务',
        class: 'status-accepted'
      },
      3: {
        text: '已完成',
        desc: '服务已完成，感谢您的使用',
        class: 'status-success'
      },
      4: {
        text: '已取消',
        desc: '订单已取消',
        class: 'status-cancel'
      },
      5: {
        text: '退款中',
        desc: '正在处理您的退款申请',
        class: 'status-refund'
      },
      6: {
        text: '已退款',
        desc: '退款已完成',
        class: 'status-refunded'
      },
      7: {
        text: '服务中',
        desc: '陪诊师正在为您提供服务',
        class: 'status-process'
      }
    }

    const statusInfo = statusMap[status] || statusMap[0]
    this.setData({
      statusText: statusInfo.text,
      statusDesc: statusInfo.desc,
      statusClass: statusInfo.class
    })
  },

  // 跳转到服务详情
  navigateToService(e) {
    const serviceId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${serviceId}`
    })
  },

  // 跳转到陪诊师详情
  navigateToCompanion() {
    if (!this.data.order?.companionId) return
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${this.data.order.companionId}`
    })
  },

  // 复制文本
  copyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  },

  // 取消订单
  async handleCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          })
          
          try {
            // 调用后端API取消订单
            await cancelOrder(this.data.order.id)
            
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            
            // 更新订单状态
            this.setData({
              'order.status': 4
            })
            this.updateStatusInfo(4)
          } catch (error) {
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 去支付
  async handlePay() {
    wx.showLoading({
      title: '处理中...'
    })
    
    try {
      // 调用后端API支付订单
      await payOrder(this.data.order.id, { paymentMethod: 'wechat' })
      
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      // 重新加载订单详情
      await this.fetchOrderDetail(this.data.order.id)
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
  handleContact() {
    const phone = this.data.order?.companionPhone
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
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
  async handleConfirm() {
    wx.showModal({
      title: '提示',
      content: '确认服务已完成吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中...'
          })
          
          try {
            // 调用后端API确认完成
            await confirmOrder(this.data.order.id)
            
            wx.showToast({
              title: '订单已完成',
              icon: 'success'
            })
            
            // 更新订单状态
            this.setData({
              'order.status': 3
            })
            this.updateStatusInfo(3)
          } catch (error) {
            wx.showToast({
              title: error.message || '操作失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 申请售后
  handleRefund() {
    wx.showModal({
      title: '申请退款',
      content: '请输入退款原因',
      editable: true,
      placeholderText: '请说明退款原因',
      success: async (res) => {
        if (res.confirm && res.content) {
          wx.showLoading({
            title: '处理中...'
          })
          
          try {
            // 调用后端API申请退款
            await refundOrder(this.data.order.id, { reason: res.content })
            
            wx.showToast({
              title: '退款申请已提交',
              icon: 'success'
            })
            
            // 重新加载订单详情
            await this.fetchOrderDetail(this.data.order.id)
          } catch (error) {
            wx.showToast({
              title: error.message || '申请失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 评价订单
  handleComment() {
    const order = this.data.order

    // 跳转到评价页面
    wx.navigateTo({
      url: `/pages/order-comment/order-comment?id=${order.id}&orderData=${encodeURIComponent(JSON.stringify(order))}`
    })
  },

  onShow() {
    // 页面显示时重新获取订单详情，确保数据最新
    this.updateTranslations()
    if (this.data.order && this.data.order.id) {
      this.fetchOrderDetail(this.data.order.id)
    }
  },

  onHide() {
    // 页面隐藏时关闭loading状态
    wx.hideLoading()
  },

  onUnload() {
    // 页面卸载时关闭loading状态
    wx.hideLoading()
  }
})