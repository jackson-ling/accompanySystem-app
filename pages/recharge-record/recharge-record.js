const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 充值记录列表
    records: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      noRecords: '',
      rechargeMethod: '',
      time: '',
      amount: '',
      status: '',
      success: '',
      pending: '',
      failed: '',
      wechatPay: '',
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
        title: i18n.t('rechargeRecord.title'),
        noRecords: i18n.t('rechargeRecord.noRecords'),
        rechargeMethod: i18n.t('rechargeRecord.rechargeMethod'),
        time: i18n.t('rechargeRecord.time'),
        amount: i18n.t('rechargeRecord.amount'),
        status: i18n.t('rechargeRecord.status'),
        success: i18n.t('rechargeRecord.success'),
        pending: i18n.t('rechargeRecord.pending'),
        failed: i18n.t('rechargeRecord.failed'),
        wechatPay: i18n.t('rechargeRecord.wechatPay'),
        other: i18n.t('rechargeRecord.other'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载充值记录
  async loadRecords() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取充值记录
      const records = mock.mockRechargeRecords || []
      
      this.setData({
        records,
        loading: false,
        isEmpty: records.length === 0
      })
    } catch (error) {
      console.error('加载充值记录失败:', error)
      this.setData({
        records: [],
        loading: false,
        isEmpty: true
      })
    }
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'success': this.data.translations.success,
      'pending': this.data.translations.pending,
      'failed': this.data.translations.failed
    }
    return statusMap[status] || status
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})