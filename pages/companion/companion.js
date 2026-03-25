// pages/companion/companion.js
const mock = require('../../mock/index.js')

Page({
  data: {
    // 搜索文本
    searchText: '',
    
    // 当前排序
    currentFilter: 'score',
    
    // 筛选表单
    filterForm: {
      gender: '',
      category: ''
    },
    
    // 应用筛选条件
    appliedFilter: {
      gender: '',
      category: ''
    },
    
    // 陪诊师列表
    companionList: [],
    filteredCompanions: [],
    
    // 服务列表
    serviceList: [],
    
    // 加载状态
    loading: false,
    
    // 抽屉状态
    showBookingDrawer: false,
    showFilterDrawer: false,
    
    // 当前选择的陪诊师
    selectedCompanion: null
  },

  onLoad(options) {
    console.log('陪诊师列表加载', options)
    this.fetchData()
  },

  onShow() {
    console.log('陪诊师列表显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  onPullDownRefresh() {
    console.log('下拉刷新')
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 获取数据
  async fetchData() {
    this.setData({ loading: true })
    
    try {
      await mock.delay(300)
      
      this.setData({
        companionList: mock.companions,
        serviceList: mock.services,
        loading: false
      })
      
      this.applyFilters()
    } catch (error) {
      console.error('获取数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  // 搜索确认
  onSearchConfirm() {
    this.applyFilters()
  },

  // 清除搜索
  onClearSearch() {
    this.setData({
      searchText: ''
    })
    this.applyFilters()
  },

  // 排序切换
  onSortChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentFilter: type
    })
    this.applyFilters()
  },

  // 性别筛选
  onGenderFilter(e) {
    const gender = e.currentTarget.dataset.gender
    this.setData({
      'filterForm.gender': gender
    })
  },

  // 分类筛选
  onCategoryFilter(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      'filterForm.category': category
    })
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      filterForm: {
        gender: '',
        category: ''
      },
      appliedFilter: {
        gender: '',
        category: ''
      }
    })
    this.applyFilters()
    this.closeFilterDrawer()
  },

  // 应用筛选
  applyFilter() {
    this.setData({
      appliedFilter: {
        ...this.data.filterForm
      }
    })
    this.applyFilters()
    this.closeFilterDrawer()
  },

  // 应用所有筛选条件
  applyFilters() {
    let list = [...this.data.companionList]
    
    // 搜索筛选
    if (this.data.searchText) {
      list = list.filter(item => 
        item.name.includes(this.data.searchText)
      )
    }
    
    // 性别筛选
    if (this.data.appliedFilter.gender) {
      list = list.filter(item => 
        item.gender === this.data.appliedFilter.gender
      )
    }
    
    // 分类筛选
    if (this.data.appliedFilter.category) {
      list = list.filter(item => 
        item.services && item.services.some(serviceId => {
          const service = this.data.serviceList.find(s => s.id === serviceId)
          return service && service.type === this.data.appliedFilter.category
        })
      )
    }
    
    // 排序
    if (this.data.currentFilter === 'score') {
      list.sort((a, b) => (b.score || 0) - (a.score || 0))
    } else if (this.data.currentFilter === 'sales') {
      list.sort((a, b) => (b.orders || 0) - (a.orders || 0))
    }
    
    this.setData({
      filteredCompanions: list
    })
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${id}`
    })
  },

  // 打开预约抽屉
  openBooking(e) {
    const companion = e.currentTarget.dataset.companion
    this.setData({
      selectedCompanion: companion,
      showBookingDrawer: true
    })
  },

  // 关闭预约抽屉
  closeBookingDrawer() {
    this.setData({
      showBookingDrawer: false,
      selectedCompanion: null
    })
  },

  // 打开筛选抽屉
  showFilterDrawer() {
    this.setData({
      showFilterDrawer: true
    })
  },

  // 关闭筛选抽屉
  closeFilterDrawer() {
    this.setData({
      showFilterDrawer: false
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止点击抽屉内容时关闭抽屉
  },

  // 选择服务
  selectService(e) {
    const service = e.currentTarget.dataset.service
    const companion = this.data.selectedCompanion
    
    if (!companion) {
      return
    }
    
    // 关闭抽屉
    this.closeBookingDrawer()
    
    // 检查登录状态
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    
    // 跳转到订单创建页
    wx.navigateTo({
      url: `/pages/order-create/order-create?serviceId=${service.id}&companionId=${companion.id}`
    })
  }
})