const mock = require('../../mock/index.js')

Page({
  data: {
    // 收藏的陪诊师列表
    favoriteCompanions: [],
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // 翻译文本
    translations: {
      title: '',
      emptyTip: '',
      orders: '',
      comments: '',
      loading: '',
      yearsOld: ''
    }
  },

  onLoad(options) {
    console.log('收藏页面加载', options)
    this.updateTranslations()
    this.loadFavorites()
  },

  onShow() {
    // 重新加载收藏数据
    this.loadFavorites()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    this.loadFavorites()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('favorite.title'),
        emptyTip: app.t('favorite.emptyTip'),
        orders: app.t('favorite.orders'),
        comments: app.t('favorite.comments'),
        loading: app.t('common.loading'),
        yearsOld: app.t('common.yearsOld')
      }
    })
  },

  // 加载收藏列表
  async loadFavorites() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取所有陪诊师
      const companions = mock.companions || []
      
      // 过滤出已收藏的陪诊师
      const favoriteCompanions = companions.filter(c => c.collected)
      
      this.setData({
        favoriteCompanions,
        loading: false,
        isEmpty: favoriteCompanions.length === 0
      })
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      this.setData({
        favoriteCompanions: [],
        loading: false,
        isEmpty: true
      })
    }
  },

  // 跳转到陪诊师详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${id}`,
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 取消收藏
  handleToggleFavorite(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: this.getApp().t('common.confirm'),
      content: this.getApp().t('favorite.cancel') + '？',
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          this.performToggleFavorite(id)
        }
      }
    })
  },

  // 执行取消收藏
  async performToggleFavorite(id) {
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      await mock.delay(800)
      
      // 更新陪诊师列表的收藏状态
      const companions = mock.companions.map(c => {
        if (c.id === id) {
          return { ...c, collected: false }
        }
        return c
      })
      
      // 更新mock数据
      mock.companions = companions
      
      // 重新加载收藏列表
      await this.loadFavorites()
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.error'),
        icon: 'none'
      })
    }
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})