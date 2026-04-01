// utils/request.js - HTTP请求封装

const app = getApp()

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
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
  
  // 401未授权，跳转登录
  if (message.includes('登录') || message.includes('授权')) {
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }, 1500)
  }
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