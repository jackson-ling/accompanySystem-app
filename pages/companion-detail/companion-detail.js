const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getCompanionDetail, getCompanionComments, toggleCompanionFavorite } = require('../../utils/api.js')

Page({
  data: {
    companion: null,
    serviceList: [],
    comments: [],
    currentTab: 'services',
    isExpanded: false,
    shouldShowExpand: false,
    isCollected: false,
    translations: {
      yearsOld: '',
      totalOrders: '',
      rating: '',
      collected: '',
      intro: '',
      collapse: '',
      expand: '',
      selectService: '',
      comments: '',
      bookNow: '',
      selectCompanion: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('陪诊师详情页面加载', options)
    this.updateTranslations()
    this.fetchCompanionDetail(options.id)
    this.fetchServices()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        yearsOld: i18n.t('index.yearsOld'),
        totalOrders: '累计接单',
        rating: '综合评分',
        collected: '关注收藏',
        intro: '个人介绍',
        collapse: '收起',
        expand: '展开',
        selectService: '选择项目',
        comments: 'TA的评价',
        bookNow: i18n.t('index.bookNow'),
        selectCompanion: '选择陪诊师',
        loading: i18n.t('common.loading')
      }
    })
  },

  // 获取陪诊师详情
  async fetchCompanionDetail(id) {
    try {
      // 调用后端API获取陪诊师详情
      const companion = await getCompanionDetail(id)
      const processedCompanion = this.processCompanionData(companion)
      
      this.setData({
        companion: processedCompanion,
        isCollected: processedCompanion.collected || false
      })
      this.checkIntroOverflow()
      this.fetchComments(id)
    } catch (error) {
      console.error('获取陪诊师详情失败:', error)
      // 如果API调用失败，使用mock数据
      const companionId = parseInt(id)
      const mockCompanion = mock.companions.find(c => c.id === companionId)
      
      if (mockCompanion) {
        this.setData({
          companion: mockCompanion,
          isCollected: mockCompanion.collected || false
        })
        this.checkIntroOverflow()
        this.fetchComments(companionId)
      }
    }
  },

  // 处理陪诊师数据（将JSON字符串转换为对象，处理性别等字段）
  processCompanionData(companion) {
    // 处理标签字段
    let tags = []
    if (companion.tags) {
      try {
        if (typeof companion.tags === 'string') {
          tags = JSON.parse(companion.tags)
        } else {
          tags = companion.tags
        }
      } catch (e) {
        console.error('解析tags失败:', e)
      }
    }
    
    // 处理服务类别字段
    let services = []
    if (companion.services) {
      try {
        if (typeof companion.services === 'string') {
          services = JSON.parse(companion.services)
        } else {
          services = companion.services
        }
      } catch (e) {
        console.error('解析services失败:', e)
      }
    }
    
    // 处理性别字段（0=未知，1=男，2=女）
    const genderMap = {
      0: 'unknown',
      1: 'male',
      2: 'female'
    }
    const gender = genderMap[companion.gender] || 'unknown'
    
    return {
      ...companion,
      tags,
      services,
      gender,
      collected: companion.isFavorite || false
    }
  },

  // 获取服务列表
  async fetchServices() {
    try {
      this.setData({
        serviceList: mock.services
      })
    } catch (error) {
      console.error('获取服务列表失败:', error)
    }
  },

  // 获取评论
  async fetchComments(companionId) {
    try {
      // 调用后端API获取陪诊师评价
      const result = await getCompanionComments(companionId, { page: 1, pageSize: 10 })
      
      this.setData({
        comments: result.list || []
      })
    } catch (error) {
      console.error('获取评论失败:', error)
      // 如果API调用失败，使用mock数据
      const mockComments = [
        {
          id: 1,
          userName: '用户A',
          userAvatar: 'https://placehold.co/100x100/409eff/ffffff?text=A',
          score: 5.0,
          content: '服务非常专业，陪诊师很有耐心，推荐！',
          time: '2024-03-20'
        },
        {
          id: 2,
          userName: '用户B',
          userAvatar: 'https://placehold.co/100x100/67c23a/ffffff?text=B',
          score: 4.8,
          content: '准时到达，服务态度很好，下次还会选择。',
          time: '2024-03-18'
        }
      ]
      this.setData({
        comments: mockComments
      })
    }
  },

  // 检查介绍内容是否溢出
  checkIntroOverflow() {
    // 简化处理，假设超过50字需要展开
    const intro = this.data.companion?.intro || ''
    this.setData({
      shouldShowExpand: intro.length > 50
    })
  },

  // 切换展开/收起
  toggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded
    })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 收藏/取消收藏
  async toggleCollection() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }

    try {
      wx.showLoading({
        title: '处理中...'
      })
      
      // 调用后端API收藏/取消收藏
      await toggleCompanionFavorite(this.data.companion.id)
      
      // 切换收藏状态
      const isCollected = !this.data.isCollected
      this.setData({
        isCollected
      })
      
      wx.hideLoading()
      wx.showToast({
        title: isCollected ? '收藏成功' : '已取消收藏',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      console.error('收藏操作失败:', error)
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      })
    }
  },

  // 预览图片
  previewImage() {
    if (this.data.companion?.avatar) {
      wx.previewImage({
        urls: [this.data.companion.avatar]
      })
    }
  },

  // 跳转到服务详情
  goToServiceDetail(e) {
    const service = e.currentTarget.dataset.service
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${service.id}&companionId=${this.data.companion.id}`
    })
  },

  // 跳转到订单
  goToOrder(e) {
    const service = e.currentTarget.dataset.service
    
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }

    wx.navigateTo({
      url: `/pages/order-create/order-create?serviceId=${service.id}&companionId=${this.data.companion.id}`
    })
  },

  // 打开预约
  openBooking() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }

    wx.navigateTo({
      url: '/pages/service-category/service-category'
    })
  }
})