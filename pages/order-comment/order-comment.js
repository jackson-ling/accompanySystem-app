const app = getApp()
const { commentOrder, uploadImage } = require('../../utils/api')

Page({
  data: {
    orderId: '',
    orderInfo: {},
    commentScore: 5,
    commentContent: '',
    selectedTags: [],
    submitting: false,
    canSubmit: false,
    ratingText: '',
    ratingTips: [],
    tagOptions: [],
    commentImages: [], // 上传的图片列表
    maxImageCount: 6, // 最多上传6张图片
    translations: {} // 翻译文本
  },

  onLoad(options) {
    console.log('评价页面加载', options)
    this.updateTranslations()
    
    const orderId = options.id
    if (orderId) {
      this.setData({ orderId })
      // 从页面参数或全局数据获取订单信息
      if (options.orderData) {
        try {
          this.setData({
            orderInfo: JSON.parse(decodeURIComponent(options.orderData))
          })
        } catch (e) {
          console.error('解析订单数据失败', e)
        }
      } else {
        // 如果没有传入订单数据，尝试从页面栈获取
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage && prevPage.data.orderInfo) {
          this.setData({ orderInfo: prevPage.data.orderInfo })
        } else if (prevPage && prevPage.data.selectedOrder) {
          this.setData({ orderInfo: prevPage.data.selectedOrder })
        } else if (prevPage && prevPage.data.commentOrder) {
          this.setData({ orderInfo: prevPage.data.commentOrder })
        }
      }
    }
    console.log('订单信息:', this.data.orderInfo)
    
    // 更新评分文本
    this.updateRatingText()
  },

  onShow() {
    this.updateTranslations()
    this.updateRatingText()
  },

  // 更新翻译文本
  updateTranslations() {
    const lang = app.globalData.language || 'zh-CN'
    const i18n = require(`../../i18n/${lang === 'zh-CN' ? 'zh-CN' : 'en-US'}`)
    
    this.setData({
      translations: i18n.order,
      ratingTips: [
        i18n.order.tag1 || '服务态度好',
        i18n.order.tag2 || '专业水平高',
        i18n.order.tag3 || '准时守约',
        i18n.order.tag4 || '细心周到'
      ],
      tagOptions: [
        i18n.order.tag1 || '服务态度好',
        i18n.order.tag2 || '专业水平高',
        i18n.order.tag3 || '准时守约',
        i18n.order.tag4 || '细心周到',
        i18n.order.tag5 || '沟通顺畅',
        i18n.order.tag6 || '耐心细致',
        i18n.order.tag7 || '值得信赖',
        i18n.order.tag8 || '推荐给朋友'
      ]
    })
  },

  // 更新评分文本
  updateRatingText() {
    const score = this.data.commentScore
    const ratingTexts = this.getRatingTexts()
    this.setData({
      ratingText: ratingTexts[score] || ''
    })
  },

  // 获取评分文本
  getRatingTexts() {
    const lang = app.globalData.language || 'zh-CN'
    if (lang === 'en-US') {
      return {
        1: 'Very Dissatisfied',
        2: 'Dissatisfied',
        3: 'Average',
        4: 'Satisfied',
        5: 'Very Satisfied'
      }
    } else {
      return {
        1: '非常不满意',
        2: '不满意',
        3: '一般',
        4: '满意',
        5: '非常满意'
      }
    }
  },

  // 评分变化
  onRatingChange(e) {
    const score = e.detail
    const ratingTexts = this.getRatingTexts()
    
    this.setData({ 
      commentScore: score,
      ratingText: ratingTexts[score] || ''
    })
  },

  // 评价内容变化
  onCommentChange(e) {
    this.setData({
      commentContent: e.detail,
      canSubmit: e.detail && e.detail.trim().length >= 5
    })
  },

  // 切换标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = [...this.data.selectedTags]
    let commentContent = this.data.commentContent
    const index = selectedTags.indexOf(tag)

    if (index !== -1) {
      // 取消选择，从评价内容中移除这个标签
      selectedTags.splice(index, 1)
      // 从评价内容中移除标签和后面的逗号
      const tagToRemove = `${tag}，`
      commentContent = commentContent.replace(tagToRemove, '')
      // 如果标签在末尾，可能没有逗号
      if (commentContent.endsWith(tag)) {
        commentContent = commentContent.slice(0, -tag.length)
      }
    } else {
      // 选择标签，添加到评价内容
      if (selectedTags.length < 3) {
        selectedTags.push(tag)
        // 在评价内容中添加标签和逗号
        if (commentContent && !commentContent.endsWith('，') && !commentContent.endsWith(',')) {
          commentContent += '，'
        }
        commentContent += tag + '，'
      } else {
        wx.showToast({
          title: '最多选择3个标签',
          icon: 'none'
        })
        return
      }
    }

    this.setData({
      selectedTags,
      commentContent,
      canSubmit: commentContent && commentContent.trim().length >= 5
    })
  },

  // 选择图片
  chooseImage() {
    const { commentImages, maxImageCount, translations } = this.data
    const remainCount = maxImageCount - commentImages.length

    if (remainCount <= 0) {
      wx.showToast({
        title: translations.maxImages || '最多上传6张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.setData({
          commentImages: [...commentImages, ...tempFilePaths]
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const commentImages = [...this.data.commentImages]
    commentImages.splice(index, 1)
    this.setData({ commentImages })
  },

  // 上传图片
  async uploadImages() {
    const { commentImages, translations } = this.data
    if (commentImages.length === 0) {
      return null
    }

    wx.showLoading({
      title: app.t('common.loading') || '上传中...'
    })

    const uploadPromises = commentImages.map(filePath => {
      return uploadImage(filePath)
    })

    try {
      const results = await Promise.all(uploadPromises)
      wx.hideLoading()
      // 返回上传成功的图片URL数组
      return results
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: translations.uploadImageFailed || '图片上传失败',
        icon: 'none'
      })
      throw error
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const { commentImages } = this.data
    wx.previewImage({
      current: url,
      urls: commentImages
    })
  },

  // 提交评价
  async submitComment() {
    const { orderId, commentScore, commentContent, commentImages, translations } = this.data

    // 验证
    if (!commentContent || commentContent.trim().length < 5) {
      wx.showToast({
        title: translations.commentAtLeast5Chars || '评价内容至少5个字',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    try {
      // 先上传图片
      let imageUrls = null
      if (commentImages.length > 0) {
        imageUrls = await this.uploadImages()
      }

      // 调用后端评价接口
      await commentOrder(orderId, {
        score: commentScore,
        content: commentContent,
        images: imageUrls ? JSON.stringify(imageUrls) : null
      })

      wx.showToast({
        title: translations.commentSuccess || '评价成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        // 返回上一页并刷新
        const pages = getCurrentPages()
        if (pages.length >= 2) {
          const prevPage = pages[pages.length - 2]
          // 刷新上一页数据
          if (prevPage.loadOrders) {
            prevPage.loadOrders()
          } else if (prevPage.fetchOrderDetail) {
            prevPage.fetchOrderDetail(orderId)
          }
        }
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('提交评价失败:', error)
      wx.showToast({
        title: error.message || (translations.commentFailed || '提交失败，请重试'),
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 翻译方法
  t(key) {
    const keys = key.split('.')
    let value = app.globalData.language === 'en-US' ? 
      require('../../i18n/en-US') : 
      require('../../i18n/zh-CN')
    
    for (const k of keys) {
      value = value[k]
      if (!value) return key
    }
    return value
  }
})