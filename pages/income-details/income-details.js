const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getCompanionIncome } = require('../../utils/api.js')

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
      // 调用后端API获取收入明细
      const result = await getCompanionIncome({ page: 1, pageSize: 100 })
      
      // 处理收入记录数据
      const incomeRecords = (result.list || []).map(item => ({
        id: item.id,
        orderId: item.orderId,
        orderNo: item.orderNo,
        serviceName: item.serviceName,
        amount: item.amount,
        status: item.status,
        time: item.createTime
      }))
      
      // 计算收入统计
      const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
      const todayIncome = result.todayIncome || 0
      const totalCumulativeIncome = result.totalIncome || totalIncome
      
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
      // 如果API调用失败，使用mock数据
      const incomeRecords = []
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
      
      const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
      
      this.setData({
        incomeRecords,
        totalIncome,
        todayIncome: 0,
        totalCumulativeIncome: totalIncome,
        loading: false,
        isEmpty: incomeRecords.length === 0
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