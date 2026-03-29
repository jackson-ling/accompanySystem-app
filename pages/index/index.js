// pages/index/index.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 轮播图
    carouselImages: [
      'https://placehold.co/750x360/409eff/ffffff?text=专业陪诊+安心无忧',
      'https://placehold.co/750x360/67c23a/ffffff?text=全程陪伴+贴心服务',
      'https://placehold.co/750x360/e6a23c/ffffff?text=专业代办+省时省力'
    ],
    
    // 位置信息
    locationName: '',
    latitude: null,
    longitude: null,
    
    // 医院列表
    hospitalList: [],
    
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
      getLocation: '',
      searchPlaceholder: '',
      companionService: '',
      agencyService: '',
      findCompanion: '',
      nearbyHospitals: '',
      recommendedServices: '',
      popularCompanions: '',
      companion: '',
      orders: '',
      rating: '',
      book: ''
    }
  },

  onLoad(options) {
    console.log('首页加载', options)
    this.updateTranslations()
    this.getCurrentLocation()
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
    console.log('首页显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    // 每次显示页面时重新更新翻译，确保语言切换后立即生效
    this.updateTranslations()
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        getLocation: i18n.t('index.getLocation'),
        searchPlaceholder: i18n.t('index.searchPlaceholder'),
        companionService: i18n.t('index.companionService'),
        agencyService: i18n.t('index.agencyService'),
        findCompanion: i18n.t('index.findCompanion'),
        myOrders: i18n.t('index.myOrders'),
        nearbyHospitals: i18n.t('index.nearbyHospitals'),
        popularServices: i18n.t('index.popularServices'),
        popularCompanions: i18n.t('index.popularCompanions'),
        companion: i18n.t('index.companion'),
        orders: i18n.t('index.orders'),
        rating: i18n.t('index.rating'),
        book: i18n.t('index.book'),
        bookNow: i18n.t('index.bookNow'),
        sold: i18n.t('index.sold'),
        male: i18n.t('index.male'),
        female: i18n.t('index.female'),
        yearsOld: i18n.t('index.yearsOld'),
        selectCompanion: i18n.t('index.selectCompanion'),
        viewAll: i18n.t('index.viewAll'),
        loading: i18n.t('common.loading')
      }
    })
  },

  onPullDownRefresh() {
    console.log('下拉刷新')
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const { latitude, longitude } = res
        this.setData({
          latitude,
          longitude
        })
        // 根据经纬度获取地址
        this.getAddressFromLocation(latitude, longitude)
      },
      fail: (err) => {
        console.log('获取位置失败', err)
        // 使用默认位置
        this.setData({
          locationName: '北京市朝阳区',
          latitude: 39.9042,
          longitude: 116.4074
        })
        this.calculateHospitalDistances()
      }
    })
  },

  // 根据经纬度获取地址
  getAddressFromLocation(latitude, longitude) {
    // 使用腾讯地图逆地理编码API（需要申请key）
    // 这里使用模拟数据
    const mockAddresses = [
      '北京市朝阳区',
      '北京市海淀区',
      '北京市东城区',
      '北京市西城区'
    ]
    const randomIndex = Math.floor(Math.random() * mockAddresses.length)
    this.setData({
      locationName: mockAddresses[randomIndex]
    })
    this.calculateHospitalDistances()
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const { latitude, longitude, name } = res
        this.setData({
          locationName: name || res.address,
          latitude,
          longitude
        })
        this.calculateHospitalDistances()
      },
      fail: (err) => {
        console.log('选择位置失败', err)
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },

  // 计算医院距离并排序
  calculateHospitalDistances() {
    if (!this.data.latitude || !this.data.longitude) {
      return
    }
    
    const hospitals = [...mock.hospitals].map(hospital => {
      // 计算距离（简化计算，实际应使用精确的地理距离公式）
      const distance = this.calculateDistance(
        this.data.latitude,
        this.data.longitude,
        hospital.latitude,
        hospital.longitude
      )
      return {
        ...hospital,
        distance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`
      }
    }).sort((a, b) => {
      // 按距离排序
      const distA = parseFloat(a.distance)
      const distB = parseFloat(b.distance)
      return distA - distB
    })
    
    this.setData({
      hospitalList: hospitals.slice(0, 6) // 只显示前6个最近的医院
    })
  },

  // 计算两点距离（米）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // 获取数据
  async fetchData() {
    this.setData({ loading: true })
    
    try {
      await mock.delay(300)
      
      this.setData({
        serviceList: (mock.services || []).slice(0, 4), // 只显示前4个服务
        companionList: mock.companions,
        loading: false
      })
      
      // 如果已经有位置信息，计算医院距离
      if (this.data.latitude && this.data.longitude) {
        this.calculateHospitalDistances()
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 跳转到搜索页
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  // 跳转到陪诊师列表
  goToCompanionList() {
    wx.switchTab({
      url: '/pages/companion/companion'
    })
  },

  // 跳转到订单列表
  goToOrderList() {
    wx.navigateTo({
      url: '/pages/order-list/order-list'
    })
  },

  // 跳转到医院列表
  goToHospitalList() {
    wx.navigateTo({
      url: '/pages/hospital-list/hospital-list'
    })
  },

  // 跳转到医院详情
  goToHospitalDetail(e) {
    const hospital = e.currentTarget.dataset.hospital
    wx.showToast({
      title: `医院：${hospital.name}`,
      icon: 'none'
    })
  },

  // 跳转到服务分类
  goToServiceCategory(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/service-category/service-category?type=${type}`
    })
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