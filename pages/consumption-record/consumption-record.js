const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getConsumptionRecords } = require('../../utils/api.js')

Page({
  data: {
    // 消费记录列表
    records: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      noRecords: '',
      serviceOrder: '',
      recharge: '',
      time: '',
      amount: '',
      balance: '',
      loading: ''
    }
  },

  onLoad(options) {
    this.loadRecords()
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
    // 重新加载记录
    this.loadRecords()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('consumptionRecord.title'),
        noRecords: i18n.t('consumptionRecord.noRecords'),
        serviceOrder: i18n.t('consumptionRecord.serviceOrder'),
        recharge: i18n.t('consumptionRecord.recharge'),
        time: i18n.t('consumptionRecord.time'),
        amount: i18n.t('consumptionRecord.amount'),
        balance: i18n.t('consumptionRecord.balance'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载消费记录
  async loadRecords() {
    this.setData({ loading: true })
    
    try {
      // 调用后端API获取消费记录
      const result = await getConsumptionRecords({ page: 1, pageSize: 100 })
      const records = (result.list || result || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        amount: item.amount,
        balance: item.balance,
        time: item.time || item.createTime
      }))
      
      this.setData({
        records,
        loading: false,
        isEmpty: records.length === 0
      })
    } catch (error) {
      console.error('加载消费记录失败:', error)
      // 降级到mock数据
      try {
        await mock.delay(500)
        const mockRecords = mock.mockConsumptionRecords || []
        this.setData({
          records: mockRecords,
          loading: false,
          isEmpty: mockRecords.length === 0
        })
      } catch (mockError) {
        this.setData({
          records: [],
          loading: false,
          isEmpty: true
        })
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})