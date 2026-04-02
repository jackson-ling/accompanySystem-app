// utils/request.js - HTTP请求封装

const app = getApp()
const { logout } = require('./api')

// 防止重复登出
let isLoggingOut = false

/**
 * 处理token过期，自动登出
 */
const handleTokenExpired = () => {
  if (isLoggingOut) {
    return
  }

  isLoggingOut = true

  // 清除本地token
  app.globalData.token = null
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')

  // 调用后端logout接口（不需要等待结果）
  logout().catch(err => {
    console.error('退出登录失败:', err)
  })

  // 跳转到登录页
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })

  setTimeout(() => {
    // 清除所有页面栈，直接跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    })
    isLoggingOut = false
  }, 2000)
}

/**
 * 请求拦截器
 */
const requestInterceptor = (config) => {
  // 添加token
  if (app.globalData.token) {
    config.header = config.header || {}
    config.header['Token'] = app.globalData.token
  }

  // 添加时间戳防止缓存
  config.data = config.data || {}
  config.data._t = Date.now()

  return config
}

/**
 * 响应拦截器
 */
const responseInterceptor = (response) => {
  const { statusCode, data } = response

  // HTTP状态码判断
  if (statusCode === 401) {
    handleTokenExpired()
    return Promise.reject(response)
  }

  if (statusCode !== 200) {
    handleError('网络请求失败')
    return Promise.reject(response)
  }

  // 业务状态码判断
  if (data.code !== 200 && data.code !== 201) {
    handleError(data.message || data.msg || '请求失败')
    return Promise.reject(data)
  }

  return data.data
}

/**
 * 错误处理
 */
const handleError = (message) => {
  // 先关闭loading状态，避免与toast冲突
  wx.hideLoading()

  // 检测是否是token过期相关错误
  if (message.includes('登录') || message.includes('授权') || message.includes('Token') || message.includes('JWT') || message.includes('过期') || message.includes('无效') || message.includes('未授权')) {
    handleTokenExpired()
    return
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 封装wx.request
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const config = requestInterceptor({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        ...options.header
      },
      timeout: 10000
    })
    
    wx.request({
      ...config,
      success: (response) => {
        try {
          const result = responseInterceptor(response)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        handleError('网络连接失败')
        reject(error)
      }
    })
  })
}

/**
 * GET请求
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST请求
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 文件上传
 */
const uploadFile = (url, filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: app.globalData.baseUrl + url,
      filePath,
      name: 'file',
      formData,
      header: {
        'Token': app.globalData.token
      },
      success: (response) => {
        try {
          const data = JSON.parse(response.data)
          if (data.code === 200) {
            resolve(data.data)
          } else {
            handleError(data.message || '上传失败')
            reject(data)
          }
        } catch (error) {
          handleError('上传失败')
          reject(error)
        }
      },
      fail: (error) => {
        handleError('上传失败')
        reject(error)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile
}