// pages/order-create/order-create.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { createOrder, getPatients } = require('../../utils/api.js')

Page({
  data: {
    // URL参数
    serviceId: null,
    companionId: null,

    // 选中的服务
    selectedService: null,

    // 选中的陪诊师
    selectedCompanion: null,

    // 选中的就诊人
    selectedPatient: null,

    // 服务时间
    appointmentTime: null,

    // 接送选项
    pickupOption: 'none',

    // 接送选项列表
    pickupOptions: [
      { label: '否', value: 'none' },
      { label: '要接', value: 'pick' },
      { label: '要送', value: 'drop' },
      { label: '要接送', value: 'both' }
    ],

    // 接送地址
    pickupAddress: '',
    dropoffAddress: '',

    // 订单备注
    remarks: '',

    // 支付方式
    paymentMethod: 'wechat',

    // 用户信息
    userInfo: null,

    // 服务列表
    serviceList: [],

    // 陪诊师列表
    companionList: [],

    // 就诊人列表
    patientList: [],

    // 时间选择器
    showTimeSelector: false,
    dateList: [],
    selectedDateIndex: 0,
    availableTimes: [],
    selectedTimeSlot: null,

    // 翻译文本
    translations: {
      title: '',
      companion: '',
      pleaseSelectCompanion: '',
      patient: '',
      pleaseSelectPatient: '',
      service: '',
      pleaseSelectService: '',
      serviceTime: '',
      selectTime: '',
      pickup: '',
      noPickup: '',
      pickupOnly: '',
      dropoffOnly: '',
      both: '',
      pickupAddress: '',
      pickupAddressPlaceholder: '',
      dropoffAddress: '',
      dropoffAddressPlaceholder: '',
      remarks: '',
      remarksPlaceholder: '',
      paymentMethod: '',
      wechatPay: '',
      balance: '',
      balanceInfo: '',
      total: '',
      payNow: '',
      pleaseSelectTime: '',
      pleaseFillRequiredFields: ''
    },

    // 总价
    totalPrice: 0
  },

  onLoad(options) {
    console.log('创建订单页面加载', options)
    const { serviceId, companionId } = options
    this.setData({
      serviceId: serviceId ? parseInt(serviceId) : null,
      companionId: companionId ? parseInt(companionId) : null
    })
    this.updateTranslations()
    this.loadData()
  },

  onShow() {
    // 每次显示页面时重新更新翻译
    this.updateTranslations()
    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return false
    }
    this.setData({
      userInfo: app.globalData.userInfo
    })
    return true
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('order.createTitle'),
        companion: i18n.t('order.companion'),
        pleaseSelectCompanion: i18n.t('order.pleaseSelectCompanion'),
        patient: i18n.t('patient.title'),
        pleaseSelectPatient: i18n.t('patient.pleaseSelectPatient'),
        service: i18n.t('order.service'),
        pleaseSelectService: i18n.t('order.pleaseSelectService'),
        serviceTime: i18n.t('order.serviceTime'),
        selectTime: i18n.t('order.selectTime'),
        pickup: i18n.t('order.pickup'),
        noPickup: i18n.t('order.noPickup'),
        pickupOnly: i18n.t('order.pickupOnly'),
        dropoffOnly: i18n.t('order.dropoffOnly'),
        both: i18n.t('order.both'),
        pickupAddress: i18n.t('order.pickupAddress'),
        pickupAddressPlaceholder: i18n.t('order.pickupAddressPlaceholder'),
        dropoffAddress: i18n.t('order.dropoffAddress'),
        dropoffAddressPlaceholder: i18n.t('order.dropoffAddressPlaceholder'),
        remarks: i18n.t('order.remarks'),
        remarksPlaceholder: i18n.t('order.remarksPlaceholder'),
        paymentMethod: i18n.t('order.paymentMethod'),
        wechatPay: i18n.t('order.wechatPay'),
        balance: i18n.t('order.balance'),
        balanceInfo: i18n.t('order.balanceInfo'),
        total: i18n.t('order.total'),
        payNow: i18n.t('order.payNow'),
        pleaseSelectTime: i18n.t('order.pleaseSelectTime'),
        pleaseFillRequiredFields: i18n.t('order.pleaseFillRequiredFields')
      },
      
        onHide() {
          // 页面隐藏时关闭loading状态
          wx.hideLoading()
        },
      
        onUnload() {
          // 页面卸载时关闭loading状态
          wx.hideLoading()
        }
      })
    // 更新接送选项的翻译
    this.setData({
      'pickupOptions[0].label': i18n.t('order.noPickup'),
      'pickupOptions[1].label': i18n.t('order.pickupOnly'),
      'pickupOptions[2].label': i18n.t('order.dropoffOnly'),
      'pickupOptions[3].label': i18n.t('order.both')
    })
  },

  // 加载数据
  async loadData() {
    try {
      await mock.delay(300)

      // 加载服务列表
      const serviceList = mock.services || []
      this.setData({ serviceList })

      // 加载陪诊师列表
      const companionList = mock.companions || []
      this.setData({ companionList })

      // 调用后端API获取就诊人列表
      try {
        const patientList = await getPatients() || []
        this.setData({ patientList })
      } catch (error) {
        console.error('获取就诊人列表失败:', error)
        // 如果API调用失败，使用mock数据
        this.setData({ patientList: mock.mockPatients || [] })
      }

      console.log('就诊人列表:', this.data.patientList)

      // 从URL参数初始化选中的服务
      if (this.data.serviceId) {
        const service = serviceList.find(s => s.id === this.data.serviceId)
        if (service) {
          this.setData({ selectedService: service })
        }
      }

      // 从URL参数初始化选中的陪诊师
      if (this.data.companionId) {
        const companion = companionList.find(c => c.id === this.data.companionId)
        if (companion) {
          this.setData({ selectedCompanion: companion })
        }
      }

      // 优先选择当前选中的就诊人，其次选择默认就诊人，最后选择第一个
      const patientList = this.data.patientList
      if (patientList.length > 0) {
        // 从本地存储读取当前选中的就诊人ID
        const savedSelectedPatientId = wx.getStorageSync('selectedPatientId')
        console.log('本地存储的当前选中就诊人ID:', savedSelectedPatientId)

        let selectedPatient = null

        // 优先使用当前选中的就诊人
        if (savedSelectedPatientId) {
          const savedId = Number(savedSelectedPatientId)
          selectedPatient = patientList.find(p => p.id === savedId)
          console.log('找到当前选中的就诊人:', selectedPatient)
        }

        // 如果没有当前选中的，使用默认就诊人
        if (!selectedPatient) {
          selectedPatient = patientList.find(p => p.default)
          console.log('使用默认就诊人:', selectedPatient)
        }

        // 如果都没有，使用第一个就诊人
        if (!selectedPatient) {
          selectedPatient = patientList[0]
          console.log('使用第一个就诊人:', selectedPatient)
        }

        this.setData({ selectedPatient })
      }

      // 生成日期列表
      this.generateDateList()

      // 更新总价
      this.updateTotalPrice()
    } catch (error) {
      console.error('加载数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 生成日期列表
  generateDateList() {
    const dateList = []
    const today = new Date()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      dateList.push({
        date: date,
        dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
        week: i === 0 ? '今天' : `周${weekDays[date.getDay()]}`
      })
    }

    this.setData({ dateList })
    this.loadAvailableTimes(0)
  },

  // 加载可用时间段
  async loadAvailableTimes(dateIndex) {
    try {
      await mock.delay(200)

      const timeSlots = []
      const startHour = 8
      const endHour = 18

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          const status = Math.random() > 0.3 ? 'available' : 'booked'
          timeSlots.push({ time, status })
        }
      }

      this.setData({
        availableTimes: timeSlots
      })
    } catch (error) {
      console.error('加载时间段失败:', error)
    }
  },

  // 选择日期
  selectDate(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedDateIndex: index,
      selectedTimeSlot: null,
      appointmentTime: null
    })
    this.loadAvailableTimes(index)
  },

  // 选择时间
  selectTime(e) {
    const slot = e.currentTarget.dataset.slot
    if (slot.status === 'booked') {
      wx.showToast({
        title: '该时段已被预约',
        icon: 'none'
      })
      return
    }

    const { dateList, selectedDateIndex } = this.data
    const selectedDate = dateList[selectedDateIndex]
    const timeString = `${selectedDate.week} ${selectedDate.dateStr} ${slot.time}`

    this.setData({
      selectedTimeSlot: slot,
      appointmentTime: timeString
    })

    this.closeTimeSelector()
  },

  // 打开时间选择器
  openTimeSelector() {
    this.setData({ showTimeSelector: true })
  },

  // 关闭时间选择器
  closeTimeSelector() {
    this.setData({ showTimeSelector: false })
  },

  // 跳转到陪诊师详情
  goToCompanionDetail() {
    if (!this.data.selectedCompanion) {
      return
    }
    wx.navigateTo({
      url: `/pages/companion-detail/companion-detail?id=${this.data.selectedCompanion.id}`
    })
  },

  // 跳转到服务详情
  goToServiceDetail() {
    if (!this.data.selectedService) {
      return
    }
    wx.navigateTo({
      url: `/pages/service-detail/service-detail?id=${this.data.selectedService.id}`
    })
  },

  // 跳转到就诊人选择
  goToPatientSelect() {
    wx.navigateTo({
      url: '/pages/patient-list/patient-list?selectMode=true'
    })
  },

  // 切换接送选项
  onPickupOptionChange(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      pickupOption: value
    })
    // 更新总价
    this.updateTotalPrice()
  },

  // 备注输入
  onRemarksInput(e) {
    this.setData({
      remarks: e.detail.value
    })
  },

  // 接送地址输入
  onPickupAddressInput(e) {
    this.setData({
      pickupAddress: e.detail.value
    })
  },

  // 送地址输入
  onDropoffAddressInput(e) {
    this.setData({
      dropoffAddress: e.detail.value
    })
  },

  // 切换支付方式
  onPaymentMethodChange(e) {
    const method = e.currentTarget.dataset.method
    this.setData({
      paymentMethod: method
    })
  },

  // 更新总价
  updateTotalPrice() {
    const { selectedService, pickupOption } = this.data
    if (!selectedService) {
      this.setData({ totalPrice: 0 })
      return
    }

    let totalPrice = selectedService.price

    // 接送费用
    if (pickupOption === 'pick' || pickupOption === 'drop') {
      totalPrice += 20
    } else if (pickupOption === 'both') {
      totalPrice += 40
    }

    this.setData({ totalPrice })
  },

  // 提交订单
  async handleSubmit() {
    const { selectedCompanion, selectedPatient, selectedService, appointmentTime, remarks, paymentMethod, pickupOption } = this.data

    // 验证必填项
    if (!selectedCompanion) {
      wx.showToast({
        title: '请选择陪诊师',
        icon: 'none'
      })
      return
    }

    if (!selectedPatient) {
      wx.showToast({
        title: '请选择就诊人',
        icon: 'none'
      })
      return
    }

    if (!selectedService) {
      wx.showToast({
        title: '请选择服务',
        icon: 'none'
      })
      return
    }

    if (!appointmentTime) {
      wx.showToast({
        title: '请选择服务时间',
        icon: 'none'
      })
      return
    }

    // 显示加载
    wx.showLoading({
      title: '提交中...'
    })

    try {
      // 将appointmentTime转换为标准格式（当前格式：今天 1/2 09:00，需要转换为：2024-01-02 09:00:00）
      const { dateList, selectedDateIndex, selectedTimeSlot } = this.data
      const selectedDate = dateList[selectedDateIndex]
      const timeStr = selectedTimeSlot.time
      
      // 构造日期对象
      const date = selectedDate.date
      const [hours, minutes] = timeStr.split(':')
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      // 格式化为后端需要的格式
      const formattedTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${timeStr}:00`

      // 准备订单数据
      const orderData = {
        serviceId: selectedService.id,
        companionId: selectedCompanion.id,
        patientId: selectedPatient.id,
        hospital: '北京协和医院', // 默认医院，实际应该让用户选择
        department: '普通门诊', // 默认科室，实际应该让用户选择
        appointmentTime: formattedTime,
        pickupOption: pickupOption === 'none' ? 1 : (pickupOption === 'pick' ? 2 : (pickupOption === 'drop' ? 2 : 2)), // 后端定义：1-医院门口, 2-指定地点
        pickupAddress: pickupOption === 'none' ? '' : this.data.pickupAddress,
        remarks: remarks
      }

      // 调用后端API创建订单
      const orderId = await createOrder(orderData)

      wx.showToast({
        title: '订单创建成功',
        icon: 'success'
      })

      // 跳转到订单详情
      wx.redirectTo({
        url: `/pages/order-detail/order-detail?id=${orderId}`
      })
    } catch (error) {
      console.error('创建订单失败:', error)
      wx.showToast({
        title: error.message || '订单创建失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  })