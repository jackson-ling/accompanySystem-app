const mock = require('../../mock/index.js')

Page({
  data: {
    // 就诊人列表
    patients: [],
    
    // 选中的就诊人ID
    selectedPatientId: null,
    
    // 操作抽屉显示状态
    showDrawer: false,
    
    // 当前操作的就诊人
    currentPatient: null,
    
    // 加载状态
    loading: false,
    
    // 空状态
    isEmpty: false,
    
    // Action Sheet 操作项
    drawerActions: [],
    
    // 翻译文本
    translations: {
      title: '',
      addPatient: '',
      default: '',
      address: '',
      noAddress: '',
      emptyTip: ''
    }
  },

  onLoad(options) {
    console.log('就诊人列表页面加载', options)
    this.loadPatients()
  },

  onShow() {
    // 重新加载就诊人数据
    this.loadPatients()
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
    this.loadPatients()
  },

  // 加载就诊人数据
  async loadPatients() {
    this.setData({ loading: true })
    
    try {
      // 模拟网络延迟
      await mock.delay(500)
      
      // 获取就诊人列表
      const patients = mock.mockPatients || []
      
      // 获取默认就诊人
      const defaultPatient = patients.find(p => p.default)
      const selectedPatientId = defaultPatient ? defaultPatient.id : null
      
      // 更新翻译文本
      this.updateTranslations()
      
      this.setData({
        patients,
        selectedPatientId,
        loading: false,
        isEmpty: patients.length === 0
      })
    } catch (error) {
      console.error('加载就诊人失败:', error)
      this.setData({
        patients: [],
        loading: false,
        isEmpty: true
      })
    }
  },
  
  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    this.setData({
      drawerActions: [
        { name: app.t('patient.setDefault'), color: '#333' },
        { name: app.t('patient.editPatient'), color: '#333' },
        { name: app.t('patient.deletePatient'), color: '#f56c6c' },
        { name: app.t('common.cancel'), color: '#999' }
      ],
      translations: {
        title: app.t('patient.title'),
        addPatient: app.t('patient.addPatient'),
        default: app.t('patient.default'),
        address: app.t('patient.address'),
        noAddress: app.t('patient.noAddress'),
        emptyTip: app.t('patient.emptyTip')
      }
    })
  },

  // 选择就诊人
  handleSelect(e) {
    const patient = e.currentTarget.dataset.patient
    
    // 只改变选中状态，不改变默认设置
    this.setData({
      selectedPatientId: patient.id
    })
    
    // 如果需要返回上一页（从订单创建页选择就诊人）
    // 可以在这里添加返回逻辑
    // setTimeout(() => {
    //   wx.navigateBack()
    // }, 150)
  },

  // 添加就诊人
  handleAdd() {
    wx.navigateTo({
      url: '/pages/patient-add/patient-add'
    })
  },

  // 打开操作抽屉
  openDrawer(e) {
    const patient = e.currentTarget.dataset.patient
    this.setData({
      currentPatient: patient,
      showDrawer: true
    })
  },

  // 关闭抽屉
  closeDrawer() {
    this.setData({
      showDrawer: false
    })
  },

  // 编辑就诊人
  handleEdit() {
    if (!this.data.currentPatient) return
    
    this.closeDrawer()
    
    wx.navigateTo({
      url: `/pages/patient-add/patient-add?id=${this.data.currentPatient.id}`
    })
  },

  // 删除就诊人
  handleDelete() {
    if (!this.data.currentPatient) return
    
    wx.showModal({
      title: this.getApp().t('common.confirm'),
      content: this.getApp().t('patient.confirmDelete'),
      confirmText: this.getApp().t('common.confirm'),
      cancelText: this.getApp().t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          this.performDelete()
        }
      }
    })
  },

  // 执行删除
  async performDelete() {
    this.closeDrawer()
    
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      await mock.delay(800)
      
      // 删除就诊人
      const patients = this.data.patients.filter(
        p => p.id !== this.data.currentPatient.id
      )
      
      // 如果删除的是选中的就诊人，清空选中状态
      let selectedPatientId = this.data.selectedPatientId
      if (selectedPatientId === this.data.currentPatient.id) {
        const newDefault = patients.find(p => p.default)
        selectedPatientId = newDefault ? newDefault.id : null
      }
      
      // 更新mock数据
      mock.mockPatients = patients
      
      this.setData({
        patients,
        selectedPatientId,
        currentPatient: null,
        isEmpty: patients.length === 0
      })
      
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

  // 设置默认就诊人
  handleSetDefault(e) {
    const patient = e.currentTarget.dataset.patient
    
    // 如果已经是默认就诊人，不需要设置
    if (patient.default) return
    
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    mock.delay(500).then(() => {
      // 更新就诊人列表，设置新的默认就诊人
      const patients = this.data.patients.map(p => ({
        ...p,
        default: p.id === patient.id
      }))
      
      // 更新mock数据
      mock.mockPatients = patients
      
      this.setData({
        patients,
        selectedPatientId: patient.id
      })
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    })
  },

  // 处理Action Sheet选择
  handleActionSelect(e) {
    // 尝试获取索引，可能是不同的属性名
    const index = e.detail.index !== undefined ? e.detail.index : 
                  e.detail.item !== undefined ? e.detail.item.index :
                  e.detail.name !== undefined ? this.data.drawerActions.findIndex(a => a.name === e.detail.name) : undefined
    
    if (index === undefined) {
      this.closeDrawer()
      return
    }
    
    switch(index) {
      case 0: // 设为默认
        this.handleSetDefault()
        break
      case 1: // 编辑就诊人
        this.handleEdit()
        break
      case 2: // 删除就诊人
        this.handleDelete()
        break
      case 3: // 取消
        this.closeDrawer()
        break
    }
  },

  // 设为默认就诊人
  handleSetDefault() {
    if (!this.data.currentPatient) return
    
    // 如果已经是默认就诊人，直接返回
    if (this.data.currentPatient.default) {
      wx.showToast({
        title: '已是默认就诊人',
        icon: 'none'
      })
      this.closeDrawer()
      return
    }
    
    this.closeDrawer()
    
    wx.showLoading({
      title: '设置中...'
    })
    
    mock.delay(500).then(() => {
      // 更新就诊人列表，设置新的默认就诊人
      const patients = this.data.patients.map(p => ({
        ...p,
        default: p.id === this.data.currentPatient.id
      }))
      
      // 更新mock数据
      mock.mockPatients = patients
      
      this.setData({
        patients,
        selectedPatientId: this.data.currentPatient.id
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '已设为默认',
        icon: 'success'
      })
    })
  },

  // 选择就诊人（设置为默认）
  handleSelectPatient() {
    if (!this.data.currentPatient) return
    
    this.closeDrawer()
    
    // 如果已经是默认就诊人，直接返回
    if (this.data.currentPatient.default) {
      wx.showToast({
        title: '已是默认就诊人',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '设置中...'
    })
    
    mock.delay(500).then(() => {
      // 更新就诊人列表，设置新的默认就诊人
      const patients = this.data.patients.map(p => ({
        ...p,
        default: p.id === this.data.currentPatient.id
      }))
      
      // 更新mock数据
      mock.mockPatients = patients
      
      this.setData({
        patients,
        selectedPatientId: this.data.currentPatient.id
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '已设为默认',
        icon: 'success'
      })
    })
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})