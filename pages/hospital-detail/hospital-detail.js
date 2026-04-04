// pages/hospital-detail/hospital-detail.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getDepartments } = require('../../utils/api.js')

Page({
  data: {
    // 医院信息
    hospital: null,
    
    // 科室列表
    departments: [],
    
    // 加载状态
    loading: false,
    loadingDepartments: false,
    
    // 翻译文本
    translations: {
      title: '',
      level: '',
      address: '',
      rating: '',
      distance: '',
      departments: '',
      noDepartments: '',
      navigate: '',
      call: '',
      loading: '',
      loadingDepartments: ''
    }
  },

  onLoad(options) {
    console.log('医院详情页面加载', options)
    const hospitalId = options.id
    
    if (!hospitalId) {
      wx.showToast({
        title: '医院信息不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.updateTranslations()
    this.loadHospitalDetail(hospitalId)
    this.loadDepartments(hospitalId)
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      translations: {
        title: app.t('hospitalDetail.title') || '医院详情',
        level: app.t('hospitalDetail.level') || '医院等级',
        address: app.t('hospitalDetail.address') || '医院地址',
        rating: app.t('hospitalDetail.rating') || '评分',
        distance: app.t('hospitalDetail.distance') || '距离',
        departments: app.t('hospitalDetail.departments') || '科室列表',
        noDepartments: app.t('hospitalDetail.noDepartments') || '暂无科室信息',
        navigate: app.t('hospitalDetail.navigate') || '导航',
        call: app.t('hospitalDetail.call') || '拨打电话',
        loading: app.t('common.loading') || '加载中...',
        loadingDepartments: app.t('common.loading') || '加载中...'
      }
    })
  },

  // 加载医院详情
  loadHospitalDetail(hospitalId) {
    this.setData({ loading: true })
    
    // 从mock数据中获取医院信息
    const hospitals = mock.hospitals || []
    const hospital = hospitals.find(h => h.id === parseInt(hospitalId))
    
    if (hospital) {
      // 添加额外的详细信息
      const hospitalDetail = {
        ...hospital,
        // 可以添加更多字段
        phone: '010-12345678',
        openTime: '08:00-17:30',
        description: '这是一家综合性三级甲等医院，拥有先进的医疗设备和专业的医疗团队，为患者提供优质的医疗服务。'
      }
      
      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: hospital.name
      })
      
      this.setData({
        hospital: hospitalDetail,
        loading: false
      })
    } else {
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '医院信息不存在',
        icon: 'none'
      })
    }
  },

  // 加载科室列表
  async loadDepartments(hospitalId) {
    this.setData({ loadingDepartments: true })
    
    try {
      // 调用后端API获取科室列表
      const result = await getDepartments({ hospitalId })
      const departments = result || []
      
      this.setData({
        departments,
        loadingDepartments: false
      })
    } catch (error) {
      console.error('获取科室列表失败:', error)
      // 降级到mock数据
      const mockDepartments = [
        { id: 1, name: '内科', hospitalId: hospitalId },
        { id: 2, name: '外科', hospitalId: hospitalId },
        { id: 3, name: '儿科', hospitalId: hospitalId },
        { id: 4, name: '妇产科', hospitalId: hospitalId },
        { id: 5, name: '骨科', hospitalId: hospitalId },
        { id: 6, name: '神经科', hospitalId: hospitalId },
        { id: 7, name: '呼吸科', hospitalId: hospitalId },
        { id: 8, name: '心脏科', hospitalId: hospitalId },
        { id: 9, name: '消化科', hospitalId: hospitalId },
        { id: 10, name: '眼科', hospitalId: hospitalId }
      ]
      
      this.setData({
        departments: mockDepartments,
        loadingDepartments: false
      })
    }
  },

  // 导航
  handleNavigate() {
    const hospital = this.data.hospital
    if (!hospital) return
    
    wx.openLocation({
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      name: hospital.name,
      address: hospital.address
    })
  },

  // 拨打电话
  handleCall() {
    const hospital = this.data.hospital
    if (!hospital || !hospital.phone) return
    
    wx.showModal({
      title: '确认拨打电话',
      content: `确定要拨打医院电话 ${hospital.phone} 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: hospital.phone
          })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    const hospitalId = this.data.hospital?.id
    if (hospitalId) {
      Promise.all([
        this.loadHospitalDetail(hospitalId),
        this.loadDepartments(hospitalId)
      ]).then(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  }
})