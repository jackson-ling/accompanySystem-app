const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    // 医院列表
    hospitalList: [],
    
    // 加载状态
    loading: false,
    
    // 翻译文本
    translations: {
      title: '',
      noHospitals: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('医院列表页面加载', options)
    this.updateTranslations()
    this.fetchData()
    
    // 测试翻译
    setTimeout(() => {
      console.log('Translations after update:', this.data.translations)
      console.log('Testing direct translation:', getApp().t('hospitalList.title'))
    }, 500)
  },

  onShow() {
    // 重新加载翻译
    this.updateTranslations()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    try {
      this.setData({
        translations: {
          title: app.t('hospitalList.title') || '附近医院',
          noHospitals: app.t('hospitalList.noHospitals') || '暂无医院信息',
          loading: app.t('common.loading') || '加载中...'
        }
      })
    } catch (error) {
      console.error('Translation error:', error)
      this.setData({
        translations: {
          title: '附近医院',
          noHospitals: '暂无医院信息',
          loading: '加载中...'
        }
      })
    }
  },

  // 获取数据
  async fetchData() {
    this.setData({ loading: true })
    
    try {
      await mock.delay(300)
      
      // 获取医院列表
      const hospitals = mock.hospitals || []
      
      // 计算距离并排序
      const hospitalList = this.calculateHospitalDistances(hospitals)
      
      this.setData({
        hospitalList,
        loading: false
      })
    } catch (error) {
      console.error('获取医院列表失败:', error)
      wx.showToast({
        title: i18n.t('common.error'),
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 计算医院距离并排序
  calculateHospitalDistances(hospitals) {
    // 获取当前位置
    const app = getApp()
    const latitude = app.globalData.latitude || 39.9042
    const longitude = app.globalData.longitude || 116.4074
    
    // 计算每个医院的距离
    return hospitals.map(hospital => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
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

  // 跳转到医院详情
  goToHospitalDetail(e) {
    const hospital = e.currentTarget.dataset.hospital
    wx.showToast({
      title: `${hospital.name}`,
      icon: 'none',
      duration: 2000
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})