const mock = require('../../mock/index.js')
const i18n = require('../../utils/i18n.js')

Page({
  data: {
    service: {
      id: 0,
      name: '',
      description: '',
      price: 0,
      sales: 0,
      duration: '',
      image: ''
    },
    companionList: [],
    currentTab: 'intro',
    showCompanionDrawer: false,
    hasCompanion: false,
    isFromOrderDetail: false,
    isFromOrderCreate: false,
    loading: false,
    translations: {
      sold: '',
      intro: '',
      notes: '',
      imagePlaceholder: '',
      selectCompanion: '',
      bookNow: '',
      male: '',
      female: '',
      yearsOld: '',
      orders: '',
      loading: ''
    }
  },

  onLoad(options) {
    console.log('服务详情页面加载', options)
    this.updateTranslations()
    
    const serviceId = options.id
    const companionId = options.companionId
    const from = options.from
    
    this.setData({
      hasCompanion: !!companionId,
      isFromOrderCreate: from === 'order-create',
      isFromOrderDetail: from === 'order-detail'
    })
    
    this.fetchServiceDetail(serviceId)
    this.fetchCompanions()
    
    // 监听语言变化
    const app = getApp()
    if (app.onLanguageChange) {
      app.onLanguageChange(() => {
        this.updateTranslations()
      })
    }
  },

  // 更新翻译文本
  updateTranslations() {
    this.setData({
      translations: {
        sold: i18n.t('index.sold'),
        intro: '服务介绍',
        notes: '下单须知',
        imagePlaceholder: '服务详情图片展示区域',
        selectCompanion: '选择陪诊人',
        bookNow: '立即下单',
        male: i18n.t('index.male'),
        female: i18n.t('index.female'),
        yearsOld: i18n.t('index.yearsOld'),
        orders: i18n.t('index.orders'),
        loading: i18n.t('common.loading')
      }
    })
  },

  // 获取服务详情
  async fetchServiceDetail(id) {
    this.setData({ loading: true })
    try {
      const serviceId = parseInt(id)
      const service = mock.services.find(s => s.id === serviceId)
      
      if (service) {
        this.setData({
          service,
          loading: false
        })
      } else {
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('获取服务详情失败:', error)
      this.setData({ loading: false })
    }
  },

  // 获取陪诊师列表
  async fetchCompanions() {
    try {
      this.setData({
        companionList: mock.companions
      })
    } catch (error) {
      console.error('获取陪诊师列表失败:', error)
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
  },

  // 处理预订
  handleBook() {
    const app = getApp()
    if (!app.requireLogin()) {
      return
    }

    if (this.data.isFromOrderCreate) {
      // 如果来自订单创建页面，直接返回
      wx.navigateBack()
      return
    }

    if (this.data.hasCompanion) {
      // 如果已经选择了陪诊师，直接跳转到订单创建页
      const companionId = this.getQueryVariable('companionId')
      wx.navigateTo({
        url: `/pages/order-create/order-create?serviceId=${this.data.service.id}&companionId=${companionId}`
      })
    } else {
      // 否则打开陪诊师选择抽屉
      this.setData({
        showCompanionDrawer: true
      })
    }
  },

  // 打开陪诊师选择抽屉
  openCompanionDrawer() {
    this.setData({
      showCompanionDrawer: true
    })
  },

  // 关闭陪诊师选择抽屉
  closeCompanionDrawer() {
    this.setData({
      showCompanionDrawer: false
    })
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止点击抽屉内容时关闭抽屉
  },

  // 选择陪诊师

    selectCompanion(e) {

          const companion = e.currentTarget.dataset.companion

    

          const app = getApp()

    

          if (!app.requireLogin()) {

    

            return

    

          }

    

        // 关闭抽屉

        this.closeCompanionDrawer()

        

        // 跳转到订单创建页

        wx.navigateTo({

          url: `/pages/order-create/order-create?serviceId=${this.data.service.id}&companionId=${companion.id}`

        })

      },

    

      // 查看陪诊师详情

      goToCompanionDetail(e) {

        const companionId = e.currentTarget.dataset.id

        wx.navigateTo({

          url: `/pages/companion-detail/companion-detail?id=${companionId}`

        })

      },

    

      // 直接预约陪诊师

      bookCompanion(e) {

        const companion = e.currentTarget.dataset.companion

        const app = getApp()

        

        if (!app.requireLogin()) {

          return

        }

        

        // 关闭抽屉

        this.closeCompanionDrawer()

        

        // 跳转到订单创建页

        wx.navigateTo({

          url: `/pages/order-create/order-create?serviceId=${this.data.service.id}&companionId=${companion.id}`

        })

      },

    

      // 获取URL参数

      getQueryVariable(variable) {

        const query = wx.getEnterOptionsSync().query || {}

        return query[variable]

      }
})