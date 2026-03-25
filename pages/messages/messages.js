// pages/messages/messages.js
const mock = require('../../mock/index.js')

Page({
  data: {
    // 消息列表
    messageList: []
  },

  onLoad(options) {
    console.log('消息列表加载', options)
    this.loadMessages()
  },

  onShow() {
    console.log('消息列表显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    this.loadMessages()
  },

  // 加载消息列表
  async loadMessages() {
    try {
      await mock.delay(200)
      
      // 添加背景色
      const messages = mock.mockMessages.map(item => ({
        ...item,
        bgColor: this.getMessageBgColor(item.type)
      }))
      
      this.setData({
        messageList: messages
      })
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  },

  // 获取消息背景色
  getMessageBgColor(type) {
    const colors = {
      system: 'linear-gradient(135deg, #409eff 0%, #4facfe 100%)',
      order: 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)',
      activity: 'linear-gradient(135deg, #e6a23c 0%, #ebb563 100%)',
      service: 'linear-gradient(135deg, #f56c6c 0%, #f78989 100%)'
    }
    return colors[type] || colors.system
  },

  // 跳转到详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${id}`
    })
  }
})