// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#409eff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconName: "home-o"
      },
      {
        pagePath: "/pages/companion/companion",
        text: "陪诊师",
        iconName: "friends-o"
      },
      {
        pagePath: "/pages/ai-chat/ai-chat",
        text: "AI助手",
        iconName: "chat-o"
      },
      {
        pagePath: "/pages/messages/messages",
        text: "消息",
        iconName: "envelop-o"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconName: "user-o"
      }
    ]
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
    }
  }
})