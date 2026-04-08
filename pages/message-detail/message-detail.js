const { getChatMessages, sendChatMessage, deleteChatConversation } = require('../../utils/api.js')

Page({
  data: {
    chatType: '',
    conversationId: '',
    conversationType: '',
    targetId: '',
    pageTitle: '',
    messages: [],
    inputText: '',
    showMenu: false,
    showActionSheet: false,
    scrollTop: 0,
    scrollIntoView: '',
    userAvatar: 'https://placehold.co/100x100/ff99cc/fff?text=我',
    otherAvatar: 'https://placehold.co/100x100/ff99cc/fff?text=陪'
  },

  onLoad(options) {
    console.log('消息详情页面加载', options)
    const { id, type, targetId } = options
    
    // 获取当前用户头像
    const app = getApp()
    if (app.globalData.userInfo && app.globalData.userInfo.avatar) {
      this.setData({
        userAvatar: app.globalData.userInfo.avatar
      })
    }
    
    this.setData({
      conversationId: id,
      conversationType: type,
      targetId: targetId || '',
      chatType: type || 'service'
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
  async loadChatHistory() {
    try {
      const type = this.data.conversationType
      // 对于客服消息，targetId 为 0；对于陪诊师消息，使用实际的 targetId
      let targetId = null
      if (type === 'service') {
        targetId = 0
      } else if (this.data.targetId) {
        targetId = parseInt(this.data.targetId)
      }
      const result = await getChatMessages(type, targetId)
      const messages = (result || []).map(msg => ({
        id: msg.id,
        text: msg.text,
        isMe: msg.isMe,
        time: this.formatTime(msg.time),
        type: msg.type || 'text'
      }))

      this.setData({
        messages: messages
      })
      // 滚动到底部
      this.scrollToBottom()
    } catch (error) {
      console.error('加载聊天历史失败:', error)
      // 降级到本地存储
      const chatType = this.data.chatType
      const storageKey = `chatHistory_${chatType}`
      try {
        const history = wx.getStorageSync(storageKey) || []
        this.setData({
          messages: history
        })
        // 滚动到底部
        this.scrollToBottom()
      } catch (e) {
        console.error('加载本地聊天历史失败:', e)
      }
    }

    // 如果没有历史记录，根据类型添加欢迎消息
    if (this.data.messages.length === 0) {
      let welcomeText = ''

      if (this.data.chatType === 'service') {
        welcomeText = '您好！我是客服，有什么可以帮您的吗？'
      } else if (this.data.chatType === 'companion') {
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

  onShow() {
    // 每次显示页面时滚动到底部
    setTimeout(() => {
      this.scrollToBottom()
    }, 100)
  },

  // 格式化时间
  formatTime(date) {
    let d = date
    // 如果是字符串，转换为Date对象
    if (typeof date === 'string') {
      d = new Date(date)
    }
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
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
  async sendMessage() {
    const inputText = this.data.inputText.trim()
    if (!inputText) {
      return
    }

    // 添加用户消息到列表
    this.addMessage({
      text: inputText,
      isMe: true,
      time: this.formatTime(new Date())
    })

    // 清空输入框
    this.setData({
      inputText: ''
    })

    try {
      // 调用后端API发送消息
      const type = this.data.conversationType
      // 对于客服消息，targetId 为 0；对于陪诊师消息，使用实际的 targetId
      let targetId = null
      if (type === 'service') {
        targetId = 0
      } else if (this.data.targetId) {
        targetId = parseInt(this.data.targetId)
      }
      await sendChatMessage(type, targetId, {
        text: inputText,
        type: 'text'
      })
    } catch (error) {
      console.error('发送消息失败:', error)
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      })
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  // 滚动到底部
  scrollToBottom() {
    const length = this.data.messages.length
    if (length > 0) {
      // 先清空scrollIntoView
      this.setData({
        scrollIntoView: ''
      })
      
      // 延迟一下再设置scrollIntoView
      setTimeout(() => {
        this.setData({
          scrollIntoView: `msg-${length - 1}`
        })
      }, 50)
    }
  },

  // 切换菜单
  toggleMenu() {
    this.setData({
      showMenu: !this.data.showMenu
    })
  },

  // 菜单操作
  async handleMenuAction(e) {
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
      this.showConfirm('确定要删除该聊天吗？', async () => {
        try {
          // 调用后端API删除聊天会话
          const type = this.data.conversationType
          // 对于客服消息，targetId 为 0；对于陪诊师消息，使用实际的 targetId
          let targetId = null
          if (type === 'service') {
            targetId = 0
          } else if (this.data.targetId) {
            targetId = parseInt(this.data.targetId)
          }
          await deleteChatConversation(type, targetId)

          // 清空本地数据
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
        } catch (error) {
          console.error('删除聊天失败:', error)
          wx.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        }
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
  },

  // 显示功能选择弹窗
  showActionSheet() {
    this.setData({
      showActionSheet: true
    })
  },

  // 隐藏功能选择弹窗
  hideActionSheet() {
    this.setData({
      showActionSheet: false
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  // 选择图片
  chooseImage(e) {
    const source = e.currentTarget.dataset.source || 'album'
    const count = 9
    
    let sourceType = ['album', 'camera']
    if (source === 'album') {
      sourceType = ['album']
    } else if (source === 'camera') {
      sourceType = ['camera']
    }

    wx.chooseMedia({
      count: count,
      mediaType: ['image'],
      sourceType: sourceType,
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const tempFiles = res.tempFiles
        tempFiles.forEach((file, index) => {
          // 上传图片到服务器
          this.uploadImage(file.tempFilePath, file.size)
        })
        this.setData({
          showActionSheet: false
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        if (err.errMsg !== 'chooseMedia:fail cancel') {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
        this.setData({
          showActionSheet: false
        })
      }
    })
  },

  // 上传图片
  uploadImage(filePath, fileSize) {
    wx.showLoading({
      title: '上传中...'
    })

    // 模拟上传过程
    setTimeout(() => {
      wx.hideLoading()
      
      // 添加图片消息到列表
      this.addMessage({
        text: filePath,
        isMe: true,
        time: this.formatTime(new Date()),
        type: 'image'
      })

      // 调用后端API发送图片消息
      this.sendImageMessage(filePath)
    }, 1000)
  },

  // 发送图片消息
  async sendImageMessage(imageUrl) {
    try {
      // 调用后端API发送消息
      const type = this.data.conversationType
      // 对于客服消息，targetId 为 0；对于陪诊师消息，使用实际的 targetId
      let targetId = null
      if (type === 'service') {
        targetId = 0
      } else if (this.data.targetId) {
        targetId = parseInt(this.data.targetId)
      }
      await sendChatMessage(type, targetId, {
        text: imageUrl,
        type: 'image'
      })
    } catch (error) {
      console.error('发送图片失败:', error)
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      })
    }
  }
})