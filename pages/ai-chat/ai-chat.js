// pages/ai-chat/ai-chat.js
const mock = require('../../mock/index.js')

Page({
  data: {
    // 消息列表
    messages: [],
    
    // 输入框
    inputText: '',
    canSend: false,
    
    // 建议问题
    suggestions: [
      '陪诊服务有哪些？',
      '如何选择陪诊师？',
      '陪诊服务多少钱？',
      '可以退款吗？'
    ],
    
    // 是否已开始聊天
    hasStarted: false,
    
    // 滚动位置
    scrollToView: '',
    
    // 用户信息
    userInfo: null
  },

  onLoad(options) {
    console.log('AI聊天加载', options)
    this.loadUserInfo()
    this.initChat()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 初始化聊天
  initChat() {
    this.setData({
      messages: [...mock.mockChatHistory]
    })
  },

  // 输入
  onInput(e) {
    this.setData({
      inputText: e.detail.value,
      canSend: e.detail.value.trim().length > 0
    })
  },

  // 发送消息
  async sendMessage() {
    const text = this.data.inputText.trim()
    
    if (!text || this.data.loading) {
      return
    }
    
    // 添加用户消息
    const userMessage = {
      isMe: true,
      text: text
    }
    
    this.setData({
      messages: [...this.data.messages, userMessage],
      inputText: '',
      canSend: false,
      hasStarted: true,
      scrollToView: `msg-${this.data.messages.length}`
    })
    
    // 模拟AI回复
    await mock.delay(1000)
    
    const aiResponse = this.getAIResponse(text)
    
    const aiMessage = {
      isMe: false,
      text: aiResponse
    }
    
    this.setData({
      messages: [...this.data.messages, aiMessage],
      scrollToView: `msg-${this.data.messages.length + 1}`
    })
  },

  // 发送建议问题
  sendSuggestion(e) {
    const text = e.currentTarget.dataset.text
    this.setData({
      inputText: text,
      canSend: true
    })
    this.sendMessage()
  },

  // 获取AI回复
  getAIResponse(question) {
    const responses = {
      '陪诊服务有哪些？': '我们提供以下陪诊服务：\n1. 全天陪诊服务 - ¥299\n2. 半天陪诊服务 - ¥199\n3. 夜间急诊陪诊 - ¥399\n4. 异地就医陪诊 - ¥599\n\n还有代办服务：\n1. 代取报告服务 - ¥99\n2. 代挂号服务 - ¥149\n3. 代开药服务 - ¥129',
      '如何选择陪诊师？': '选择陪诊师可以从以下几个方面考虑：\n1. 查看陪诊师评分和订单量\n2. 了解陪诊师的专业领域\n3. 查看其他用户的评价\n4. 根据自身需求选择合适的陪诊师',
      '陪诊服务多少钱？': '陪诊服务价格根据服务类型有所不同：\n- 半天陪诊：¥199\n- 全天陪诊：¥299\n- 夜间急诊：¥399\n- 异地陪诊：¥599\n\n代办服务价格更低，从¥99起。',
      '可以退款吗？': '可以的。订单支付后，在服务开始前可以申请退款。具体退款规则请查看订单详情或联系客服。'
    }
    
    return responses[question] || '感谢您的提问！我们的客服会尽快为您解答。您也可以联系客服：400-123-4567'
  }
})