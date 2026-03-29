const mock = require('../../mock/index.js')

Page({
  data: {
    isEdit: false,
    patientId: null,
    formData: {
      name: '',
      phone: '',
      relationship: '',
      address: '',
      default: false
    },
    canSubmit: false
  },

  onLoad(options) {
    console.log('就诊人页面加载', options)
    
    // 判断是编辑还是添加
    if (options.id) {
      this.setData({
        isEdit: true,
        patientId: parseInt(options.id)
      })
      this.loadPatientDetail(options.id)
    }
  },

  // 加载就诊人详情（编辑模式）
  async loadPatientDetail(patientId) {
    try {
      const patient = mock.mockPatients.find(p => p.id === parseInt(patientId))
      if (patient) {
        this.setData({
          formData: {
            name: patient.name,
            phone: patient.phone,
            relationship: patient.relationship,
            address: patient.address,
            default: patient.default
          }
        })
        this.validateForm()
      }
    } catch (error) {
      console.error('加载就诊人失败:', error)
    }
  },

  // 输入框变化
  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`formData.${field}`]: value
    })
    
    this.validateForm()
  },

  // 开关变化
  onSwitchChange(e) {
    this.setData({
      'formData.default': e.detail.value
    })
  },

  // 验证表单
  validateForm() {
    const { name, phone, relationship, address } = this.data.formData
    const canSubmit = name.trim() && phone.trim() && relationship.trim() && address.trim()
    
    this.setData({
      canSubmit
    })
  },

  // 验证手机号
  validatePhone(phone) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  },

  // 提交表单
  async handleSubmit() {
    if (!this.data.canSubmit) {
      return
    }

    const { name, phone, relationship, address, default: isDefault } = this.data.formData

    // 验证手机号
    if (!this.validatePhone(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '提交中...'
    })

    try {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 500))

      if (this.data.isEdit) {
        // 编辑模式：更新就诊人
        const patientIndex = mock.mockPatients.findIndex(p => p.id === this.data.patientId)
        if (patientIndex !== -1) {
          mock.mockPatients[patientIndex] = {
            ...mock.mockPatients[patientIndex],
            name,
            phone,
            relationship,
            address,
            default: isDefault
          }
        }
        
        // 如果设为默认，取消其他默认
        if (isDefault) {
          mock.mockPatients.forEach(p => {
            if (p.id !== this.data.patientId) {
              p.default = false
            }
          })
        }
      } else {
        // 添加模式：创建新就诊人
        const newPatient = {
          id: mock.mockPatients.length + 1,
          name,
          phone,
          relationship,
          address,
          default: isDefault
        }
        
        // 如果设为默认，取消其他默认
        if (isDefault) {
          mock.mockPatients.forEach(p => {
            p.default = false
          })
        }
        
        mock.mockPatients.push(newPatient)
      }

      wx.hideLoading()
      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '添加成功',
        icon: 'success'
      })

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('提交失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  }
})