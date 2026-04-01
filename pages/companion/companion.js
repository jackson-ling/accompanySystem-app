// pages/companion/companion.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getCompanions } = require('../../utils/api.js')

Page({
  data: {
    // 搜索文本
    searchText: '',
    
    // 当前排序
    currentFilter: 'score',
    
    // 排序方向：'desc'（降序）或 'asc'（升序）
    sortDirection: {
      score: 'desc',
      orders: 'desc',
      distance: 'asc'
    },
    
    // 用户位置
    userLocation: null,
    
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
    selectedCompanion: null,
    
    // 翻译文本
    translations: {
      searchPlaceholder: '',
      allCompanions: '',
      filter: '',
      sortBy: '',
      default: '',
      byScore: '',
      byOrders: '',
      byDistance: '',
      noMatchingResults: '',
      loading: '',
      book: '',
      orders: '',
      rating: '',
      yearsOld: '',
      selectService: '',
      filterConditions: '',
      genderRequirement: '',
      serviceCategory: '',
      all: '',
      male: '',
      female: '',
      companionService: '',
      agencyService: '',
      reset: '',
      confirm: ''
    }
  },

  onLoad(options) {
    console.log('陪诊师列表加载', options)
    this.updateTranslations()
    this.getUserLocation()
    this.fetchData()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  onShow() {
    console.log('陪诊师列表显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    // 每次显示页面时重新更新翻译，确保语言切换后立即生效
    this.updateTranslations()
  },

  // 获取用户位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({
          userLocation: { latitude, longitude }
        })
        // 重新计算距离并排序
        this.calculateDistances()
        this.applyFilters()
      },
      fail: (err) => {
        console.log('获取位置失败:', err)
        // 位置获取失败时，使用默认位置（北京）
        this.setData({
          userLocation: { latitude: 39.9042, longitude: 116.4074 }
        })
      }
    })
  },

  // 计算陪诊师距离
  calculateDistances() {
    if (!this.data.userLocation) return
    
    const { latitude: userLat, longitude: userLng } = this.data.userLocation
    const companionList = this.data.companionList.map(companion => {
      if (companion.latitude && companion.longitude) {
        const distance = this.getDistance(
          userLat,
          userLng,
          companion.latitude,
          companion.longitude
        )
        return { ...companion, distance }
      }
      return { ...companion, distance: Infinity }
    })
    
    this.setData({ companionList })
  },

  // 计算两点之间的距离（单位：米）
  getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // 格式化距离显示
  formatDistance(distance) {
    if (distance === Infinity) return '未知'
    if (distance < 1000) return Math.round(distance) + 'm'
    return (distance / 1000).toFixed(1) + 'km'
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        searchPlaceholder: i18n.t('companion.searchPlaceholder'),
        allCompanions: i18n.t('companion.allCompanions'),
        filter: i18n.t('companion.filter'),
        sortBy: i18n.t('companion.sortBy'),
        default: i18n.t('companion.default'),
        byScore: i18n.t('companion.byScore'),
        byOrders: i18n.t('companion.byOrders'),
        byDistance: i18n.t('companion.byDistance'),
        noMatchingResults: i18n.t('companion.noMatchingResults'),
        loading: i18n.t('common.loading'),
        bookNow: i18n.t('index.bookNow'),
        orders: i18n.t('index.orders'),
        rating: i18n.t('index.rating'),
        yearsOld: i18n.t('index.yearsOld'),
        selectService: i18n.t('companion.selectService'),
        filterConditions: i18n.t('companion.filterConditions'),
        genderRequirement: i18n.t('companion.genderRequirement'),
        serviceCategory: i18n.t('companion.serviceCategory'),
        all: i18n.t('companion.all'),
        male: i18n.t('index.male'),
        female: i18n.t('index.female'),
        companionService: i18n.t('index.companionService'),
        agencyService: i18n.t('index.agencyService'),
        reset: i18n.t('common.cancel'),
        confirm: i18n.t('common.confirm')
      }
    })
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
      // 准备查询参数
      const params = {
        page: 1,
        pageSize: 100
      }
      
      // 根据当前排序设置参数
      const currentFilter = this.data.currentFilter
      const sortDirection = this.data.sortDirection[currentFilter]
      
      if (currentFilter === 'score') {
        params.sort = 'score_desc'
      } else if (currentFilter === 'sales') {
        params.sort = 'orders_desc'
      }
      // distance排序由前端处理，后端不提供
      
      // 根据筛选条件设置参数
      if (this.data.appliedFilter.gender) {
        params.gender = this.data.appliedFilter.gender
      }
      
      // 调用后端API获取陪诊师列表
      const result = await getCompanions(params)
      const companionList = (result.list || []).map(comp => this.processCompanionData(comp))
      
      this.setData({
        companionList,
        serviceList: mock.services,
        loading: false
      })
      
      this.applyFilters()
    } catch (error) {
      console.error('获取数据失败:', error)
      // 如果API调用失败，使用mock数据
      this.setData({
        companionList: mock.companions,
        serviceList: mock.services,
        loading: false
      })
      this.applyFilters()
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
  async onSortChange(e) {
    const type = e.currentTarget.dataset.type
    
    // 如果点击的是当前选中的排序方式，切换排序方向
    if (this.data.currentFilter === type) {
      const currentDirection = this.data.sortDirection[type]
      const newDirection = currentDirection === 'desc' ? 'asc' : 'desc'
      this.setData({
        [`sortDirection.${type}`]: newDirection
      })
    } else {
      // 切换到新的排序方式，使用默认方向
      this.setData({
        currentFilter: type
      })
    }
    
    // 重新获取数据
    await this.fetchData()
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
    const currentFilter = this.data.currentFilter
    const sortDirection = this.data.sortDirection[currentFilter]
    const isDesc = sortDirection === 'desc'

    if (currentFilter === 'score') {
      list.sort((a, b) => isDesc ? (b.score || 0) - (a.score || 0) : (a.score || 0) - (b.score || 0))
    } else if (currentFilter === 'sales') {
      list.sort((a, b) => isDesc ? (b.orders || 0) - (a.orders || 0) : (a.orders || 0) - (b.orders || 0))
    } else if (currentFilter === 'distance') {
      list.sort((a, b) => {
        const distA = a.distance || Infinity
        const distB = b.distance || Infinity
        return isDesc ? distB - distA : distA - distB
      })
    }

    // 为每个陪诊师添加格式化后的距离显示
    list = list.map(item => {
      const distanceText = this.formatDistance(item.distance)
      return { ...item, distanceText }
    })

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
    if (!app.requireLogin()) {
      return
    }
    
    // 跳转到订单创建页
    wx.navigateTo({
      url: `/pages/order-create/order-create?serviceId=${service.id}&companionId=${companion.id}`
    })
  }
})