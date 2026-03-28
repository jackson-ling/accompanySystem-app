const mock = require('../../mock/index.js')

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
      // 模拟网络延迟
      await mock.delay(1000)
      
      // 这里可以调用API提交反馈
      console.log('提交反馈:', {
        content,
        orderNo: orderNo || undefined,
        contact: contact || undefined
      })
      
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
        title: this.getApp().t('feedback.submitFailed'),
        icon: 'none'
      })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 获取app实例
  getApp() {
    return getApp()
  }
})