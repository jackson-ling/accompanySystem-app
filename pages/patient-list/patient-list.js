const mock = require('../../mock/index.js')
const { getPatients, deletePatient, setDefaultPatient } = require('../../utils/api.js')

Page({
  data: {
    // 就诊人列表
    patients: [],
    
    // 当前选中的就诊人ID（用于订单等场景的临时选择）
    selectedPatientId: null,
    
    // 默认就诊人ID（长期保存的默认设置）
    defaultPatientId: null,
    
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
      // 调用后端API获取就诊人列表
      const patients = await getPatients()
      
      // 将isDefault从0/1转换为布尔值，方便前端使用
      const processedPatients = patients.map(p => ({
        ...p,
        default: p.isDefault === 1
      }))
      
      // 从本地存储读取当前选中的就诊人ID
      const savedSelectedPatientId = wx.getStorageSync('selectedPatientId')
      
      // 从就诊人列表中找到默认就诊人
      const defaultPatient = processedPatients.find(p => p.default)
      const defaultPatientId = defaultPatient ? defaultPatient.id : null
      
      // 确定当前选中的就诊人ID
      let selectedPatientId = null
      if (savedSelectedPatientId) {
        selectedPatientId = Number(savedSelectedPatientId)
      } else if (defaultPatientId) {
        // 如果没有保存的选中ID，使用默认就诊人ID
        selectedPatientId = defaultPatientId
      }
      
      console.log('最终设置的selectedPatientId:', selectedPatientId)
      console.log('最终设置的defaultPatientId:', defaultPatientId)
      console.log('就诊人列表:', processedPatients)
      
      this.setData({
        patients: processedPatients,
        selectedPatientId,
        defaultPatientId,
        loading: false,
        isEmpty: processedPatients.length === 0
      })
      
      // 更新翻译文本
      this.updateTranslations()
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
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: app.t('patient.title') || '就诊人管理'
    })
    
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
    
    // 保存当前选中的就诊人ID到本地存储
    wx.setStorageSync('selectedPatientId', Number(patient.id))
    
    console.log('已切换当前选中的就诊人:', patient.name, 'ID:', patient.id)
    
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
      // 调用后端API删除就诊人
      await deletePatient(this.data.currentPatient.id)
      
      // 重新加载就诊人列表
      await this.loadPatients()
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || this.getApp().t('common.error'),
        icon: 'none'
      })
    }
  },

  // 设置默认就诊人
  async handleSetDefault(e) {
    const patient = e.currentTarget.dataset.patient
    
    // 如果已经是默认就诊人，不需要设置
    if (patient.default) return
    
    wx.showLoading({
      title: this.getApp().t('common.loading')
    })
    
    try {
      // 调用后端API设置默认就诊人
      await setDefaultPatient(patient.id)
      
      // 重新加载就诊人列表
      await this.loadPatients()
      
      wx.hideLoading()
      wx.showToast({
        title: this.getApp().t('common.success'),
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || this.getApp().t('common.error'),
        icon: 'none'
      })
    }
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
  async handleSetDefault() {
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
    
    try {
      // 调用后端API设置默认就诊人
      await setDefaultPatient(this.data.currentPatient.id)
      
      // 重新加载就诊人列表
      await this.loadPatients()
      
      wx.hideLoading()
      wx.showToast({
        title: '已设为默认',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || '设置失败',
        icon: 'none'
      })
    }
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})