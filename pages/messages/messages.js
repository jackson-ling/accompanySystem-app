// pages/messages/messages.js
const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')
const { getMessageList, deleteMessage, markMessageRead } = require('../../utils/api.js')

Page({
  data: {
    // 消息列表
    messageList: [],
    
    // 翻译文本
    translations: {
      title: '',
      noMessages: ''
    }
  },

  onLoad(options) {
    console.log('消息列表加载', options)
    this.updateTranslations()
    this.loadMessages()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  onShow() {
    console.log('消息列表显示')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    // 每次显示页面时重新更新翻译，确保语言切换后立即生效
    this.updateTranslations()
    this.loadMessages()
  },
  
  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        title: i18n.t('messages.title'),
        noMessages: i18n.t('messages.noMessages')
      }
    })
  },

  // 加载消息列表
  async loadMessages() {
    try {
      const result = await getMessageList()
      const messages = (result || []).map(item => ({
        id: item.id,
        type: item.type,
        name: item.name,
        avatar: item.avatar,
        time: item.time,
        preview: item.preview || item.lastMessage,
        unreadCount: item.unreadCount || 0,
        bgColor: this.getMessageBgColor(item.type),
        iconName: this.getMessageIcon(item.type)
      }))
      
      this.setData({
        messageList: messages
      })
    } catch (error) {
      console.error('加载消息失败:', error)
      // 降级到mock数据
      const messages = mock.mockMessages.map(item => ({
        ...item,
        bgColor: this.getMessageBgColor(item.type),
        iconName: this.getMessageIcon(item.type)
      }))
      this.setData({
        messageList: messages
      })
    }
  },

  // 获取消息背景色
  getMessageBgColor(type) {
    const colors = {
      system: 'linear-gradient(135deg, #409eff 0%, #4facfe 100%)',
      order: 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)',
      activity: 'linear-gradient(135deg, #e6a23c 0%, #ebb563 100%)',
      service: 'linear-gradient(135deg, #f56c6c 0%, #f78989 100%)',
      companion: 'linear-gradient(135deg, #409eff 0%, #4facfe 100%)'
    }
    return colors[type] || colors.service
  },

  // 获取消息图标
  getMessageIcon(type) {
    const icons = {
      system: 'bell-o',
      order: 'todo-list-o',
      activity: 'gift-o',
      service: 'service-o',
      companion: 'user-o'
    }
    return icons[type] || icons.service
  },

  // 跳转到详情
  goToDetail(e) {
    const item = e.currentTarget.dataset.item
    const type = item.type || 'service'
    
    // 标记消息已读
    this.markAsRead(item.id)
    
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${item.id}&type=${type}`
    })
  },

  // 标记消息已读
  async markAsRead(id) {
    if (!id) return
    
    try {
      await markMessageRead(id)
      // 更新本地数据
      const messageList = this.data.messageList.map(item => {
        if (item.id === id) {
          return { ...item, unreadCount: 0 }
        }
        return item
      })
      this.setData({ messageList })
    } catch (error) {
      console.error('标记消息已读失败:', error)
    }
  },

  // 显示操作菜单
  showActionSheet(e) {
    const item = e.currentTarget.dataset.item
    
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 删除消息
          this.handleDeleteWithId(item.id)
        }
      }
    })
  },

  // 删除消息会话（带ID参数）
  async handleDeleteWithId(id) {
    wx.showModal({
      title: i18n.t('common.confirm') || '提示',
      content: i18n.t('messages.deleteConfirm') || '确定要删除这条消息吗？',
      confirmText: i18n.t('common.confirm') || '确定',
      cancelText: i18n.t('common.cancel') || '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteMessage(id)
            wx.showToast({
              title: i18n.t('common.success') || '删除成功',
              icon: 'success'
            })
            // 重新加载消息列表
            this.loadMessages()
          } catch (error) {
            console.error('删除消息失败:', error)
            wx.showToast({
              title: error.message || i18n.t('common.failed') || '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 删除消息会话
  handleDelete(e) {
    const id = e.currentTarget.dataset.id
    this.handleDeleteWithId(id)
  },
})