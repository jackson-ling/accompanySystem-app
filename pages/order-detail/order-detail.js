const mock = require('../../mock/index.js')

Page({
  data: {
    order: null,
    serviceDetail: null,
    loading: false,
    statusText: '',
    statusDesc: '',
    statusClass: ''
  },

  onLoad(options) {
    console.log('订单详情页面加载', options)
    const orderId = options.id
    if (orderId) {
      this.fetchOrderDetail(orderId)
    }
  },

  // 获取订单详情
  async fetchOrderDetail(orderId) {
    this.setData({ loading: true })
    
    try {
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const order = mock.orders.find(o => o.id === orderId)
      
      if (order) {
        // 获取服务详情
        const serviceDetail = mock.services.find(s => s.id === order.serviceId) || {
          description: '',
          duration: '',
          sales: 0
        }
        
        this.setData({
          order,
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
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 更新状态信息
  updateStatusInfo(status) {
    const statusMap = {
      1: {
        text: '待付款',
        desc: '请尽快完成支付，订单将在15分钟后自动取消',
        class: 'status-pending'
      },
      2: {
        text: '待服务',
        desc: '陪诊师正在前往中，请保持电话畅通',
        class: 'status-wait'
      },
      3: {
        text: '服务中',
        desc: '陪诊师正在为您提供服务',
        class: 'status-process'
      },
      4: {
        text: '已完成',
        desc: '服务已完成，感谢您的使用',
        class: 'status-success'
      },
      5: {
        text: '退款/售后',
        desc: '正在处理您的退款申请',
        class: 'status-refund'
      },
      6: {
        text: '已取消',
        desc: '订单已取消',
        class: 'status-cancel'
      }
    }

    const statusInfo = statusMap[status] || statusMap[1]
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
  handleCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          })
          // 更新订单状态
          this.setData({
            'order.status': 6
          })
          this.updateStatusInfo(6)
        }
      }
    })
  },

  // 去支付
  handlePay() {
    wx.showToast({
      title: '跳转支付页面...',
      icon: 'none'
    })
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
  handleConfirm() {
    wx.showModal({
      title: '提示',
      content: '确认服务已完成吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单已完成',
            icon: 'success'
          })
          // 更新订单状态
          this.setData({
            'order.status': 4
          })
          this.updateStatusInfo(4)
        }
      }
    })
  },

  // 申请售后
  handleRefund() {
    wx.showToast({
      title: '售后功能开发中',
      icon: 'none'
    })
  }
})