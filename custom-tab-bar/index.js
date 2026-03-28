// custom-tab-bar/index.js
const i18n = require('../utils/i18n.js')

Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#409eff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconName: "home-o",
        textKey: "homeTab"
      },
      {
        pagePath: "/pages/companion/companion",
        text: "陪诊师",
        iconName: "friends-o",
        textKey: "companionTab"
      },
      {
        pagePath: "/pages/ai-chat/ai-chat",
        text: "AI助手",
        iconName: "chat-o",
        textKey: "aiAssistantTab"
      },
      {
        pagePath: "/pages/messages/messages",
        text: "消息",
        iconName: "envelop-o",
        textKey: "messagesTab"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconName: "user-o",
        textKey: "profileTab"
      }
    ]
  },
  
  lifetimes: {
    attached() {
      this.updateTabText()
      // 注册语言变化监听
      const app = getApp()
      if (app.onLanguageChange) {
        app.onLanguageChange(() => {
          this.updateTabText()
        })
      }
    }
  },
  
  pageLifetimes: {
    show() {
      this.updateTabText()
    }
  },
  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url: url
      })
      this.setData({
        selected: data.index
      })
    },
    
    updateTabText() {
      const list = this.data.list.map(item => ({
        ...item,
        text: i18n.t(`common.${item.textKey}`)
      }))
      this.setData({ list })
    }
  }
})