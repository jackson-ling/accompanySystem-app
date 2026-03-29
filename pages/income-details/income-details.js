const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 总收入
    totalIncome: 0,
    
    // 今日收入
    todayIncome: 0,
    
    // 累计收入
    totalCumulativeIncome: 0,
    
    // 收入记录列表
    incomeRecords: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      totalIncome: '',
      todayIncome: '',
      totalCumulative: '',
      recentDetails: '',
      noRecords: '',
      completed: '',
      pending: '',
      cancelled: '',
      viewDetail: '',
      loading: ''
    }
  },

  onLoad(options) {
    this.loadIncomeData()
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
    // 重新加载数据
    this.loadIncomeData()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('incomeRecord.title'),
        totalIncome: i18n.t('workbench.monthIncome') + ' (元)',
        todayIncome: i18n.t('workbench.todayIncome'),
        totalCumulative: i18n.t('rechargeRecord.total'),
        recentDetails: i18n.t('rechargeRecord.recentDetails'),
        noRecords: i18n.t('incomeRecord.noRecords'),
        completed: i18n.t('incomeRecord.completed'),
        pending: i18n.t('incomeRecord.pending'),
        cancelled: i18n.t('incomeRecord.cancelled'),
        viewDetail: i18n.t('incomeRecord.viewDetail'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载收入数据
  async loadIncomeData() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取陪诊师信息
      const companionId = getApp().globalData.userInfo?.companionInfo?.id
      
      // 模拟收入记录数据
      const incomeRecords = []
      
      // 从订单中生成收入记录
      const completedOrders = mock.orders.filter(order => order.status === 4)
      completedOrders.forEach((order, index) => {
        incomeRecords.push({
          id: index + 1,
          orderId: order.id,
          serviceName: order.serviceName,
          amount: order.amount,
          status: 'completed',
          time: order.createTime || new Date().toISOString().split('T')[0]
        })
      })
      
      // 计算收入统计
      const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
      const todayIncome = 0 // 模拟数据
      const totalCumulativeIncome = totalIncome
      
      this.setData({
        incomeRecords,
        totalIncome,
        todayIncome,
        totalCumulativeIncome,
        loading: false,
        isEmpty: incomeRecords.length === 0
      })
    } catch (error) {
      console.error('加载收入数据失败:', error)
      this.setData({
        incomeRecords: [],
        loading: false,
        isEmpty: true
      })
    }
  },

  // 查看订单详情
  handleViewDetail(e) {
    const orderId = e.currentTarget.dataset.orderId
    if (!orderId) {
      return
    }
    
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadIncomeData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})