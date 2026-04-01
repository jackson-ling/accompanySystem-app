const mock = require('../../mock/index.js')
const { getPatients, addPatient, updatePatient } = require('../../utils/api.js')

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
      // 调用后端API获取就诊人列表并查找指定就诊人
      const patients = await getPatients()
      const patient = patients.find(p => p.id === parseInt(patientId))
      
      if (patient) {
        this.setData({
          formData: {
            name: patient.name,
            phone: patient.phone,
            relationship: patient.relationship,
            address: patient.address,
            default: patient.isDefault === 1
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
      const patientData = {
        name,
        phone,
        relationship,
        address,
        isDefault: isDefault ? 1 : 0  // 将布尔值转换为0/1
      }

      if (this.data.isEdit) {
        // 编辑模式：更新就诊人
        await updatePatient(this.data.patientId, patientData)
      } else {
        // 添加模式：创建新就诊人
        await addPatient(patientData)
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
        title: error.message || '提交失败，请重试',
        icon: 'none'
      })
    }
  }
})