const mock = require('../../mock/index.js')
const { getUserProfile, getRechargeConfig, createRecharge } = require('../../utils/api.js')

Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 充值金额选项
    amounts: [50, 100, 200, 500, 1000],
    
    // 最小充值金额
    minAmount: 10,
    
    // 最大充值金额
    maxAmount: 5000,
    
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
    this.loadRechargeConfig()
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

  // 加载充值配置
  async loadRechargeConfig() {
    try {
      const config = await getRechargeConfig()
      if (config) {
        this.setData({
          minAmount: config.minAmount || 10,
          maxAmount: config.maxAmount || 5000,
          amounts: config.quickAmounts || [50, 100, 200, 500, 1000],
          selectedAmount: config.quickAmounts ? config.quickAmounts[0] : 50
        })
      }
    } catch (error) {
      console.error('加载充值配置失败:', error)
      // 使用默认配置
    }
  },

// 加载用户信息
  async loadUserInfo() {
    const app = getApp()
    if (!app.globalData.isLogin) {
      return
    }
    
    try {
      const userInfo = await getUserProfile()
      this.setData({
        userInfo: userInfo
      })
      // 更新全局用户信息
      app.globalData.userInfo = userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 降级到全局数据
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo
        })
      }
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
    
    // 限制最大金额为配置的最大值
    if (Number(value) > this.data.maxAmount) {
      value = String(this.data.maxAmount)
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

    // 验证最小金额
    if (amount < this.data.minAmount) {
      wx.showToast({
        title: `最小充值金额为${this.data.minAmount}元`,
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
      // 调用后端API创建充值订单
      const result = await createRecharge({
        amount: amount,
        payMethod: this.data.payMethod
      })
      
      // 更新用户余额
      await this.loadUserInfo()

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
        title: error.message || this.data.translations.rechargeFailed,
        icon: 'none'
      })
    }
  }
})