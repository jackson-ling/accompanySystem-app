const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getServices, getServiceCategories } = require('../../utils/api.js')

Page({
  data: {
    // 服务类型
    type: 'companion',
    
    // 当前排序方式
    currentSort: 'smart',
    
    // 页面标题
    pageTitle: '',
    bannerTitle: '',
    bannerSubtitle: '',
    
    // 服务列表
    serviceList: [],
    
    // 陪诊师列表
    companionList: [],
    
    // 加载状态
    loading: false,
    
    // 抽屉状态
    showCompanionDrawer: false,
    
    // 当前选择的服务
    selectedService: null,
    
    // 翻译文本
    translations: {
      smartSort: '',
      salesFirst: '',
      priceFirst: '',
      selectCompanion: '',
      sold: '',
      noServices: '',
      loading: '',
      male: '',
      female: '',
      yearsOld: '',
      orders: ''
    }
  },

  onLoad(options) {
    console.log('服务分类页面加载', options)
    
    // 获取服务类型参数
    const type = options.type || 'companion'
    this.setData({ type })
    
    this.updateTranslations()
    this.updatePageTitle()
    this.fetchData()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
        this.updatePageTitle()
      })
    }
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        smartSort: i18n.t('serviceCategory.smartSort'),
        salesFirst: i18n.t('serviceCategory.salesFirst'),
        priceFirst: i18n.t('serviceCategory.priceFirst'),
        selectCompanion: i18n.t('serviceCategory.selectCompanion'),
        sold: i18n.t('serviceCategory.sold'),
        noServices: i18n.t('serviceCategory.noServices'),
        loading: i18n.t('common.loading'),
        male: i18n.t('index.male'),
        female: i18n.t('index.female'),
        yearsOld: i18n.t('index.yearsOld'),
        orders: i18n.t('index.orders')
      }
    })
  },

  // 更新页面标题
  updatePageTitle() {
    const isCompanion = this.data.type === 'companion'
    const isAll = this.data.type === 'all'
    
    let pageTitle = ''
    let bannerTitle = ''
    let bannerSubtitle = ''
    
    if (isAll) {
      pageTitle = i18n.t('index.popularServices')
      bannerTitle = '全部服务'
      bannerSubtitle = '陪诊代办 一应俱全'
    } else if (isCompanion) {
      pageTitle = i18n.t('serviceCategory.companionService')
      bannerTitle = '专业陪诊 贴心服务'
      bannerSubtitle = '让就医更简单'
    } else {
      pageTitle = i18n.t('serviceCategory.agencyService')
      bannerTitle = '专业代办 省时省力'
      bannerSubtitle = '让生活更便捷'
    }
    
    this.setData({
      pageTitle,
      bannerTitle,
      bannerSubtitle
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
      
      // 根据类型筛选
      if (this.data.type !== 'all') {
        params.type = this.data.type
      }
      
      // 根据排序方式设置
      if (this.data.currentSort === 'sales') {
        params.sort = 'sales_desc'
      } else if (this.data.currentSort === 'price') {
        params.sort = 'price_asc'
      }
      
      // 调用后端API获取服务列表
      const result = await getServices(params)
      let filteredServices = result.list || []
      
      // 根据排序方式排序（如果后端没有排序）
      filteredServices = this.sortServices(filteredServices, this.data.currentSort)
      
      // 获取陪诊师列表
      const companions = mock.companions || []
      
      this.setData({
        serviceList: filteredServices,
        companionList: companions,
        loading: false
      })
    } catch (error) {
      console.error('获取数据失败:', error)
      // 如果API调用失败，使用mock数据
      const allServices = mock.services || []
      let filteredServices = []
      
      if (this.data.type === 'all') {
        filteredServices = allServices
      } else {
        filteredServices = allServices.filter(service => service.type === this.data.type)
      }
      
      filteredServices = this.sortServices(filteredServices, this.data.currentSort)
      
      this.setData({
        serviceList: filteredServices,
        companionList: mock.companions,
        loading: false
      })
    }
  },

  // 排序服务列表
  sortServices(services, sortType) {
    const sorted = [...services]
    
    switch (sortType) {
      case 'smart':
        // 智能排序：按销量优先
        sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0))
        break
      case 'sales':
        // 销量优先
        sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0))
        break
      case 'price':
        // 低价优先
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      default:
        break
    }
    
    return sorted
  },

  // 切换排序
  async changeSort(e) {
    const sortType = e.currentTarget.dataset.sort
    if (sortType === this.data.currentSort) {
      return
    }
    
    this.setData({ currentSort: sortType })
    
    // 重新获取数据以应用新的排序
    await this.fetchData()
  },

  // 跳转到服务详情
  goToServiceDetail(e) {
    const service = e.currentTarget.dataset.service
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${service.id}`
    })
  },

  // 打开陪诊师选择抽屉
  openCompanionDrawer(e) {
    const service = e.currentTarget.dataset.service
    this.setData({
      selectedService: service,
      showCompanionDrawer: true
    })
  },

  // 关闭陪诊师选择抽屉
  closeCompanionDrawer() {
    this.setData({
      showCompanionDrawer: false,
      selectedService: null
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止点击抽屉内容时关闭抽屉
  },

  // 选择陪诊师
  selectCompanion(e) {
    const companion = e.currentTarget.dataset.companion
    const service = this.data.selectedService
    
    if (!service) {
      return
    }
    
    // 关闭抽屉
    this.closeCompanionDrawer()
    
    // 检查登录状态
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }
    
    // 跳转到订单创建页
    wx.navigateTo({
      url: `/pages/order-create/order-create?serviceId=${service.id}&companionId=${companion.id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})