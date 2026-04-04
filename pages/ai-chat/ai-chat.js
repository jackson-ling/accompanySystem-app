// pages/ai-chat/ai-chat.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { sendAiMessage, getChatHistory, clearChatHistory } = require('../../utils/api.js')

Page({
  data: {
    // 消息列表
    messages: [],
    
    // 输入框
    inputText: '',
    canSend: false,
    
    // 建议问题
    suggestions: [],
    
    // 是否已开始聊天
    hasStarted: false,
    
    // 滚动位置
    scrollToView: '',
    
    // 用户信息
    userInfo: null,
    
    // 加载状态
    loading: false,
    
    // 菜单显示状态
    showMenu: false,
    
    // 翻译文本
    translations: {
      title: '',
      placeholder: '',
      youWantToAsk: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('AI聊天加载', options)
    this.loadUserInfo()
    this.initChat()
    this.updateTranslations()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    // 每次显示页面时重新更新翻译，确保语言切换后立即生效
    this.updateTranslations()
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('aiChat.title'),
        placeholder: i18n.t('aiChat.placeholder'),
        greeting: i18n.t('aiChat.greeting'),
        suggestions: [
          i18n.t('aiChat.suggestion1'),
          i18n.t('aiChat.suggestion2'),
          i18n.t('aiChat.suggestion3'),
          i18n.t('aiChat.suggestion4')
        ]
      },
      suggestions: [
        i18n.t('aiChat.suggestion1'),
        i18n.t('aiChat.suggestion2'),
        i18n.t('aiChat.suggestion3'),
        i18n.t('aiChat.suggestion4')
      ]
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 初始化聊天
  async initChat() {
    try {
      // 调用后端API获取聊天历史
      const result = await getChatHistory()
      const messages = (result || []).map(msg => ({
        isMe: msg.isMe || false,
        text: msg.text,
        time: msg.time
      }))
      
      this.setData({
        messages: messages,
        hasStarted: messages.length > 0
      })
      
      // 滚动到底部
      if (messages.length > 0) {
        this.setData({
          scrollToView: `msg-${messages.length - 1}`
        })
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error)
      // 降级到mock数据
      this.setData({
        messages: [...mock.mockChatHistory]
      })
    }
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
      loading: true,
      scrollToView: `msg-${this.data.messages.length}`
    })
    
    try {
      // 调用后端API发送消息
      const result = await sendAiMessage({
        message: text
      })
      
      // 添加AI回复
      const aiMessage = {
        isMe: false,
        text: result.text || result.message || result.reply || this.getAIResponse(text)
      }
      
      this.setData({
        messages: [...this.data.messages, aiMessage],
        scrollToView: `msg-${this.data.messages.length + 1}`,
        loading: false
      })
    } catch (error) {
      console.error('AI回复失败:', error)
      // 降级到本地回复
      const aiResponse = this.getAIResponse(text)
      const aiMessage = {
        isMe: false,
        text: aiResponse
      }
      
      this.setData({
        messages: [...this.data.messages, aiMessage],
        scrollToView: `msg-${this.data.messages.length + 1}`,
        loading: false
      })
    }
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
    const t = this.data.translations
    const responses = {}
    
    // 根据当前语言设置回复
    const lang = wx.getStorageSync('language') || 'zh-CN'
    
    if (lang === 'zh-CN') {
      responses['陪诊服务有哪些？'] = '我们提供以下陪诊服务：\n1. 全天陪诊服务 - ¥299\n2. 半天陪诊服务 - ¥199\n3. 夜间急诊陪诊 - ¥399\n4. 异地就医陪诊 - ¥599\n\n还有代办服务：\n1. 代取报告服务 - ¥99\n2. 代挂号服务 - ¥149\n3. 代开药服务 - ¥129'
      responses['如何选择陪诊师？'] = '选择陪诊师可以从以下几个方面考虑：\n1. 查看陪诊师评分和订单量\n2. 了解陪诊师的专业领域\n3. 查看其他用户的评价\n4. 根据自身需求选择合适的陪诊师'
      responses['陪诊服务多少钱？'] = '陪诊服务价格根据服务类型有所不同：\n- 半天陪诊：¥199\n- 全天陪诊：¥299\n- 夜间急诊：¥399\n- 异地陪诊：¥599\n\n代办服务价格更低，从¥99起。'
      responses['可以退款吗？'] = '可以的。订单支付后，在服务开始前可以申请退款。具体退款规则请查看订单详情或联系客服。'
    } else {
      responses[t.suggestion1] = t.servicesInfo
      responses[t.suggestion2] = t.chooseCompanion
      responses[t.suggestion3] = t.priceInfo
      responses[t.suggestion4] = t.refundInfo
    }
    
    return responses[question] || t.defaultResponse
  },

  // 显示菜单
  showMenu() {
    this.setData({
      showMenu: true
    })
  },

  // 隐藏菜单
  hideMenu() {
    this.setData({
      showMenu: false
    })
  },

  // 清空聊天记录
  async clearHistory() {
    wx.showModal({
      title: i18n.t('common.confirm') || '提示',
      content: i18n.t('aiChat.clearConfirm') || '确定要清空聊天记录吗？',
      confirmText: i18n.t('common.confirm') || '确定',
      cancelText: i18n.t('common.cancel') || '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用后端API清空聊天记录
            await clearChatHistory()
            
            // 清空本地消息
            this.setData({
              messages: [],
              hasStarted: false
            })
            
            wx.showToast({
              title: i18n.t('aiChat.cleared') || '已清空',
              icon: 'success'
            })
          } catch (error) {
            console.error('清空聊天记录失败:', error)
            wx.showToast({
              title: error.message || i18n.t('common.failed') || '操作失败',
              icon: 'none'
            })
          }
        }
        this.setData({
          showMenu: false
        })
      }
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止点击菜单内容时关闭菜单
  }
})