// pages/my-reviews/my-reviews.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 评价列表
    reviewList: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      noReviews: '',
      companion: '',
      service: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('我的评价页面加载', options)
    this.loadReviews()
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
    // 重新加载评价
    this.loadReviews()
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('myReviews.title'),
        noReviews: i18n.t('myReviews.noReviews'),
        companion: i18n.t('myReviews.companion'),
        service: i18n.t('myReviews.service'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载评价列表
  async loadReviews() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取评价列表（模拟数据）
      const reviews = [
        {
          id: 1,
          orderNo: 'ORDER20240315001',
          companionId: 1,
          companionName: '武海艳',
          companionAvatar: 'https://placehold.co/100x100/ff99cc/fff?text=武',
          serviceId: 1,
          serviceName: '全程陪诊服务',
          serviceImage: 'https://placehold.co/400x300/409eff/fff?text=全程陪诊',
          score: 5,
          content: '非常专业！陪诊师提前到达，全程耐心陪同，服务态度很好，值得推荐！',
          images: [
            'https://placehold.co/300x200/409eff/fff?text=图片1',
            'https://placehold.co/300x200/67c23a/fff?text=图片2'
          ],
          time: '2024-03-15 10:30:00',
          reply: '感谢您的认可！我们会继续提供优质服务。'
        },
        {
          id: 2,
          orderNo: 'ORDER20240314002',
          companionId: 2,
          companionName: '刘明',
          companionAvatar: 'https://placehold.co/100x100/409eff/fff?text=刘',
          serviceId: 2,
          serviceName: '半日陪诊服务',
          serviceImage: 'https://placehold.co/400x300/67c23a/fff?text=半日陪诊',
          score: 4,
          content: '服务很贴心，陪诊师熟悉医院流程，帮我节省了很多时间。',
          images: [],
          time: '2024-03-14 15:20:00',
          reply: ''
        },
        {
          id: 3,
          orderNo: 'ORDER20240310003',
          companionId: 3,
          companionName: '陈静',
          companionAvatar: 'https://placehold.co/100x100/f56c6c/fff?text=陈',
          serviceId: 3,
          serviceName: '代取报告服务',
          serviceImage: 'https://placehold.co/400x300/e6a23c/fff?text=代取报告',
          score: 5,
          content: '代取报告很快，还帮我简单解读了报告内容，非常专业！',
          images: [],
          time: '2024-03-10 09:15:00',
          reply: '谢谢您的信任！'
        }
      ]
      
      this.setData({
        reviewList: reviews,
        loading: false,
        isEmpty: reviews.length === 0
      })
    } catch (error) {
      console.error('加载评价失败:', error)
      this.setData({
        reviewList: [],
        loading: false,
        isEmpty: true
      })
    }
  },

  // 查看订单详情
  goToOrderDetail(e) {
    const orderNo = e.currentTarget.dataset.orderNo
    wx.showToast({
      title: `订单: ${orderNo}`,
      icon: 'none'
    })
  },

  // 查看服务详情
  goToServiceDetail(e) {
    const serviceId = e.currentTarget.dataset.serviceId
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${serviceId}`
    })
  },

  // 查看陪诊师详情
  goToCompanionDetail(e) {
    const companionId = e.currentTarget.dataset.companionId
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${companionId}`
    })
  },

  // 预览图片
  previewImage(e) {
    const urls = e.currentTarget.dataset.urls
    const current = e.currentTarget.dataset.current
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadReviews().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})