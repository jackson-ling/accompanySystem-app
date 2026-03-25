// pages/search/search.js
const mock = require('../../mock/index.js')

Page({
  data: {
    searchText: '',
    historyList: [],
    showResults: false,
    isSearching: false,
    allServices: [],
    loading: false,
    filteredServices: []
  },

  onLoad(options) {
    console.log('搜索页面加载', options)
    this.loadHistory()
    this.loadServices()
  },

  onShow() {
    console.log('搜索页面显示')
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

  // 返回
  goBack() {
    if (this.data.showResults) {
      this.setData({
        showResults: false,
        searchText: ''
      })
    } else {
      wx.navigateBack()
    }
  },

  // 执行搜索
  async performSearch(e) {
    let text = ''
    if (e && e.currentTarget && e.currentTarget.dataset) {
      text = e.currentTarget.dataset.text
    } else {
      text = this.data.searchText
    }

    if (!text || !text.trim()) return

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
        loading: false
      })
    } catch (error) {
      console.error('搜索服务失败:', error)
      this.setData({
        filteredServices: [],
        loading: false
      })
    } finally {
      this.setData({
        isSearching: false
      })
    }
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