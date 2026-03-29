Page({
  data: {
    chatType: '',
    pageTitle: '',
    messages: [],
    inputText: '',
    showMenu: false,
    scrollTop: 0,
    scrollIntoView: '',
    userAvatar: 'https://placehold.co/100x100/ff99cc/fff?text=我',
    otherAvatar: 'https://placehold.co/100x100/ff99cc/fff?text=陪'
  },

  onLoad(options) {
    console.log('消息详情页面加载', options)
    const { id } = options
    this.setData({
      chatType: id || 'system'
    })
    this.updatePageTitle()
    this.loadChatHistory()
  },

  // 更新页面标题
  updatePageTitle() {
    const chatType = this.data.chatType
    let pageTitle = '聊天'
    
    if (chatType === 'system') {
      pageTitle = '系统通知'
    } else if (chatType === 'order') {
      pageTitle = '订单通知'
    } else if (chatType === 'activity') {
      pageTitle = '活动通知'
    } else if (chatType === 'companion') {
      pageTitle = '陪诊师'
    } else if (chatType === 'service') {
      pageTitle = '在线客服'
    }
    
    this.setData({ pageTitle })
  },

  // 加载聊天历史
  loadChatHistory() {
    const chatType = this.data.chatType
    const storageKey = `chatHistory_${chatType}`
    
    try {
      const history = wx.getStorageSync(storageKey) || []
      this.setData({
        messages: history
      })
      this.scrollToBottom()
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }

    // 如果没有历史记录，根据类型添加欢迎消息
    if (this.data.messages.length === 0) {
      let welcomeText = ''
      
      if (chatType === 'system') {
        welcomeText = '系统通知'
      } else if (chatType === 'order') {
        welcomeText = '您的订单状态已更新，请查看订单详情。'
      } else if (chatType === 'activity') {
        welcomeText = '活动通知：新用户注册送大礼包啦！'
      } else if (chatType === 'service') {
        welcomeText = '您好！我是客服，有什么可以帮您的吗？'
      } else if (chatType === 'companion') {
        welcomeText = '您好，有什么需要帮助的吗？'
      }
      
      if (welcomeText) {
        this.addMessage({
          text: welcomeText,
          isMe: false,
          time: this.formatTime(new Date())
        })
      }
    }
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  // 添加消息
  addMessage(message) {
    const messages = [...this.data.messages, message]
    this.setData({
      messages
    })
    this.saveChatHistory()
    this.scrollToBottom()
  },

  // 保存聊天历史
  saveChatHistory() {
    const chatType = this.data.chatType
    const storageKey = `chatHistory_${chatType}`
    
    try {
      wx.setStorageSync(storageKey, this.data.messages)
    } catch (error) {
      console.error('保存聊天历史失败:', error)
    }
  },

  // 输入框变化
  onInput(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const inputText = this.data.inputText.trim()
    if (!inputText) {
      return
    }

    // 添加用户消息
    this.addMessage({
      text: inputText,
      isMe: true,
      time: this.formatTime(new Date())
    })

    // 清空输入框
    this.setData({
      inputText: ''
    })

    // 模拟回复
    setTimeout(() => {
      this.simulateReply()
    }, 1000)
  },

  // 模拟回复
  simulateReply() {
    const chatType = this.data.chatType
    let replyText = ''

    if (chatType === 'service') {
      const replies = [
        '收到您的消息，我们会尽快回复。',
        '好的，请稍等片刻。',
        '这个问题我需要核实一下，请稍后回复您。',
        '感谢您的反馈！'
      ]
      replyText = replies[Math.floor(Math.random() * replies.length)]
    } else if (chatType === 'companion') {
      const replies = [
        '好的，我明白了。',
        '请放心，我会按时到达。',
        '有任何问题随时联系我。',
        '感谢您的信任！'
      ]
      replyText = replies[Math.floor(Math.random() * replies.length)]
    } else if (chatType === 'order') {
      replyText = '您的订单状态已更新，请查看订单详情。'
    } else if (chatType === 'activity') {
      replyText = '感谢您的参与，活动详情请查看公告。'
    } else if (chatType === 'system') {
      replyText = '系统消息已收到，我们会尽快处理。'
    }

    if (replyText) {
      this.addMessage({
        text: replyText,
        isMe: false,
        time: this.formatTime(new Date())
      })
    }
  },

  // 滚动到底部
  scrollToBottom() {
    const length = this.data.messages.length
    if (length > 0) {
      this.setData({
        scrollIntoView: `msg-${length - 1}`
      })
    }
  },

  // 切换菜单
  toggleMenu() {
    this.setData({
      showMenu: !this.data.showMenu
    })
  },

  // 菜单操作
  handleMenuAction(e) {
    const action = e.currentTarget.dataset.action
    this.setData({
      showMenu: false
    })

    if (action === 'clear') {
      this.showConfirm('确定要清空当前聊天记录吗？', () => {
        this.setData({
          messages: []
        })
        this.saveChatHistory()
        wx.showToast({
          title: '已清空聊天记录',
          icon: 'success'
        })
      })
    } else if (action === 'delete') {
      this.showConfirm('确定要删除该聊天吗？', () => {
        // 清空聊天记录
        this.setData({
          messages: []
        })
        this.saveChatHistory()
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      })
    }
  },

  // 显示确认对话框
  showConfirm(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      success: (res) => {
        if (res.confirm && callback) {
          callback()
        }
      }
    })
  }
})