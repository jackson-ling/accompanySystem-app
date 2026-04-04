const mock = require('../../mock/index.js')
const { submitFeedback } = require('../../utils/api.js')

Page({
  data: {
    // 反馈内容
    content: '',
    
    // 订单编号
    orderNo: '',
    
    // 联系方式
    contact: '',
    
    // 提交状态
    submitting: false,
    
    // 翻译文本
    translations: {
      title: '',
      question: '',
      questionPlaceholder: '',
      orderNo: '',
      orderNoPlaceholder: '',
      contact: '',
      contactPlaceholder: '',
      submit: ''
    }
  },

  onLoad(options) {
    console.log('意见反馈页面加载', options)
    this.updateTranslations()
    
    // 如果从订单详情跳转过来，预填订单编号
    if (options.orderId) {
      this.setData({
        orderNo: options.orderId
      })
    }
  },

  // 语言切换回调
  onLanguageChange() {
    this.updateTranslations()
  },

  // 更新翻译文本
  updateTranslations() {
    const app = getApp()
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: app.t('feedback.title') || '意见反馈'
    })
    
    this.setData({
      translations: {
        title: app.t('feedback.title'),
        question: app.t('feedback.question'),
        questionPlaceholder: app.t('feedback.questionPlaceholder'),
        orderNo: app.t('feedback.orderNo'),
        orderNoPlaceholder: app.t('feedback.orderNoPlaceholder'),
        contact: app.t('feedback.contact'),
        contactPlaceholder: app.t('feedback.contactPlaceholder'),
        submit: app.t('feedback.submit')
      }
    })
  },

  // 反馈内容输入
  handleContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 订单编号输入
  handleOrderNoInput(e) {
    this.setData({
      orderNo: e.detail.value
    })
  },

  // 联系方式输入
  handleContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 提交反馈
  async handleSubmit() {
    const { content, orderNo, contact } = this.data
    
    // 验证必填项
    if (!content.trim()) {
      wx.showToast({
        title: this.getApp().t('feedback.contentEmpty'),
        icon: 'none'
      })
      return
    }
    
    // 验证内容长度
    if (content.length > 500) {
      wx.showToast({
        title: this.getApp().t('feedback.maxLength'),
        icon: 'none'
      })
      return
    }
    
    this.setData({ submitting: true })
    
    try {
      // 准备提交数据
      const feedbackData = {
        content: content.trim()
      }
      
      // 添加可选字段
      if (orderNo && orderNo.trim()) {
        feedbackData.orderNo = orderNo.trim()
      }
      
      if (contact && contact.trim()) {
        feedbackData.contact = contact.trim()
      }
      
      // 调用后端API提交反馈
      await submitFeedback(feedbackData)
      
      this.setData({ submitting: false })
      
      wx.showToast({
        title: this.getApp().t('feedback.submitSuccess'),
        icon: 'success'
      })
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('提交反馈失败:', error)
      this.setData({ submitting: false })
      
      wx.showToast({
        title: error.message || this.getApp().t('feedback.submitFailed'),
        icon: 'none'
      })
    }
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})