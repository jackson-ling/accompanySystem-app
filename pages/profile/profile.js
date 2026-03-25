// pages/profile/profile.js
const mock = require('../../mock/index.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLogin: false,
    
    // 待服务订单数
    pendingServiceCount: 0
  },

  onLoad(options) {
    console.log('个人中心加载', options)
    this.checkLogin()
    this.loadUserData()
  },

  onShow() {
    console.log('个人中心显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
    this.checkLogin()
    this.loadUserData()
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo
    })
  },

  // 加载用户数据
  async loadUserData() {
    const app = getApp()
    
    if (app.globalData.isLogin) {
      try {
        await mock.delay(200)
        
        // 计算待服务订单数
        const pendingOrders = mock.orders.filter(
          order => order.status === 2
        )
        
        this.setData({
          pendingServiceCount: pendingOrders.length
        })
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    }
  },

  // 点击用户信息
  handleUserInfoClick() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },

  // 充值
  handleRecharge() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
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
      url: '/pages/recharge/recharge'
    })
  },

  // 跳转到订单列表
  goToOrderList(e) {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
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
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
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
      url: '/pages/patient-list/patient-list'
    })
  },

  // 我的收藏
  handleFavorites() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
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
      url: '/pages/favorites/favorites'
    })
  },

  // 陪诊师工作台
  handleWorkbench() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 联系客服
  handleContactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: true,
      cancelText: '取消',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      }
    })
  },

  // 意见反馈
  handleFeedback() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
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
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 关于我们
  handleAbout() {
    wx.showModal({
      title: '关于我们',
      content: '陪诊服务小程序\n版本：1.0.0\n\n专业陪诊，贴心服务',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.logout()
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})