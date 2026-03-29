const mock = require('../../mock/index.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 充值金额选项
    amounts: [50, 100, 200, 500, 1000],
    
    // 选中的金额
    selectedAmount: 50,
    
    // 自定义金额
    customAmount: '',
    
    // 是否自定义金额
    isCustomAmount: false,
    
    // 支付方式
    payMethod: 'wechat',
    
    // 是否显示菜单
    showMenu: false,
    
    // 翻译文本
    translations: {
      title: '',
      currentBalance: '',
      rechargeAmount: '',
      otherAmount: '',
      payMethod: '',
      wechatPay: '',
      rechargeNow: '',
      inputAmount: '',
      maxAmountWarning: '',
      rechargeSuccess: '',
      rechargeFailed: '',
      invalidAmount: '',
      rechargeLoading: ''
    }
  },

  onLoad(options) {
    console.log('充值页面加载', options)
    this.loadUserInfo()
    this.updateTranslations()
  },

  onShow() {
    // 重新加载用户信息
    this.loadUserInfo()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('recharge.title'),
        currentBalance: app.t('recharge.currentBalance'),
        rechargeAmount: app.t('recharge.rechargeAmount'),
        otherAmount: app.t('recharge.otherAmount'),
        payMethod: app.t('recharge.payMethod'),
        wechatPay: app.t('recharge.wechatPay'),
        rechargeNow: app.t('recharge.rechargeNow'),
        inputAmount: app.t('recharge.inputAmount'),
        maxAmountWarning: app.t('recharge.maxAmountWarning'),
        rechargeSuccess: app.t('recharge.rechargeSuccess'),
        rechargeFailed: app.t('recharge.rechargeFailed'),
        invalidAmount: app.t('recharge.invalidAmount'),
        rechargeLoading: app.t('recharge.rechargeLoading')
      }
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    if (app.globalData.isLogin && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  // 选择金额
  selectAmount(e) {
    const amount = e.currentTarget.dataset.amount
    this.setData({
      selectedAmount: amount,
      isCustomAmount: false,
      customAmount: ''
    })
  },

  // 选择自定义金额
  selectCustom() {
    this.setData({
      isCustomAmount: true
    })
  },

  // 自定义金额输入
  handleCustomAmountInput(e) {
    let value = e.detail.value
    
    // 限制最大金额为9999
    if (Number(value) > 9999) {
      value = '9999'
      wx.showToast({
        title: this.data.translations.maxAmountWarning,
        icon: 'none',
        duration: 2000
      })
    }
    
    this.setData({
      customAmount: value
    })
  },

  // 切换菜单
  toggleMenu() {
    this.setData({
      showMenu: !this.data.showMenu
    })
  },

  // 菜单操作
  handleMenuAction(e) {
    const action = e.currentTarget.dataset.action
    this.setData({
      showMenu: false
    })

    if (action === 'recharge') {
      wx.navigateTo({
        url: '/pages/recharge-record/recharge-record'
      })
    } else if (action === 'consumption') {
      wx.navigateTo({
        url: '/pages/consumption-record/consumption-record'
      })
    }
  },

  // 立即充值
  async handleRecharge() {
    const amount = this.data.isCustomAmount 
      ? Number(this.data.customAmount) 
      : this.data.selectedAmount

    // 验证金额
    if (!amount || amount <= 0) {
      wx.showToast({
        title: this.data.translations.invalidAmount,
        icon: 'none'
      })
      return
    }

    if (this.data.isCustomAmount && (!this.data.customAmount || this.data.customAmount === '')) {
      wx.showToast({
        title: this.data.translations.invalidAmount,
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: this.data.translations.rechargeLoading
    })

    try {
      // 模拟网络延迟
      await mock.delay(1500)
      
      // 更新用户余额
      const app = getApp()
      if (app.globalData.userInfo) {
        app.globalData.userInfo.balance += amount
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        
        this.setData({
          userInfo: app.globalData.userInfo
        })
      }

      wx.hideLoading()
      wx.showToast({
        title: this.data.translations.rechargeSuccess,
        icon: 'success'
      })

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      wx.hideLoading()
      console.error('充值失败:', error)
      wx.showToast({
        title: this.data.translations.rechargeFailed,
        icon: 'none'
      })
    }
  }
})