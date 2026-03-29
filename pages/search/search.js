// pages/search/search.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    searchText: '',
    historyList: [],
    showResults: false,
    isSearching: false,
    allServices: [],
    loading: false,
    filteredServices: [],
    translations: {
      placeholder: '',
      search: '',
      history: '',
      clear: '',
      guessYouLike: '',
      noResults: '',
      bookNow: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('搜索页面加载', options)
    this.updateTranslations()
    this.loadHistory()
    this.loadServices()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  onShow() {
    console.log('搜索页面显示')
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        placeholder: i18n.t('index.searchPlaceholder'),
        search: i18n.t('common.search'),
        cancel: i18n.t('common.cancel'),
        history: i18n.t('search.history'),
        clear: i18n.t('search.clear'),
        guessYouLike: i18n.t('search.guessYouLike'),
        noResults: i18n.t('search.noResults'),
        bookNow: i18n.t('search.bookNow'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 加载历史搜索
  loadHistory() {
    try {
      const history = wx.getStorageSync('searchHistory')
      if (history) {
        this.setData({
          historyList: history
        })
      }
    } catch (error) {
      console.error('加载历史搜索失败:', error)
    }
  },

  // 加载服务列表
  async loadServices() {
    this.setData({ loading: true })
    try {
      await mock.delay(300)
      this.setData({
        allServices: mock.services,
        loading: false
      })
    } catch (error) {
      console.error('加载服务列表失败:', error)
      this.setData({ loading: false })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchText: '',
      showResults: false,
      isSearching: false
    })
  },

  // 执行搜索
  async performSearch(e) {
    let text = ''

    // 如果点击的是标签项（带 data-text 属性），则使用标签的文本
    if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.text) {
      text = e.currentTarget.dataset.text
    } else {
      // 否则使用输入框中的文本
      text = this.data.searchText
    }

    if (!text || !text.trim()) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }

    this.setData({
      searchText: text,
      showResults: true,
      isSearching: true
    })

    // 保存到历史搜索
    this.saveToHistory(text)

    // 搜索服务
    this.setData({ loading: true })
    try {
      await mock.delay(300)

      const filtered = mock.services.filter(service =>
        service.name.includes(text) || service.description.includes(text)
      )

      this.setData({
        filteredServices: filtered,
        loading: false,
        isSearching: false
      })
    } catch (error) {
      console.error('搜索服务失败:', error)
      this.setData({
        filteredServices: [],
        loading: false,
        isSearching: false
      })
    }
  },

  // 取消搜索（返回首页）
  cancelSearch() {
    console.log('取消搜索被调用，返回首页')
    wx.navigateBack({
      delta: 1
    })
  },

  // 保存到历史搜索
  saveToHistory(text) {
    let history = this.data.historyList || []
    const index = history.indexOf(text)
    if (index !== -1) {
      history.splice(index, 1)
    }
    history.unshift(text)
    if (history.length > 10) {
      history.pop()
    }

    this.setData({
      historyList: history
    })

    try {
      wx.setStorageSync('searchHistory', history)
    } catch (error) {
      console.error('保存历史搜索失败:', error)
    }
  },

  // 清空历史搜索
  clearHistory() {
    this.setData({
      historyList: []
    })
    try {
      wx.removeStorageSync('searchHistory')
    } catch (error) {
      console.error('清空历史搜索失败:', error)
    }
  },

  // 跳转到服务详情
  goToServiceDetail(e) {
    const service = e.currentTarget.dataset.service
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${service.id}`
    })
  }
})