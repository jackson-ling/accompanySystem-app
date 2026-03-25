// utils/storage.js - 本地存储封装

/**
 * 设置存储
 */
const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (error) {
    console.error('存储失败:', error)
    return false
  }
}

/**
 * 获取存储
 */
const getStorage = (key, defaultValue = null) => {
  try {
    const data = wx.getStorageSync(key)
    return data !== '' ? data : defaultValue
  } catch (error) {
    console.error('读取失败:', error)
    return defaultValue
  }
}

/**
 * 删除存储
 */
const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('删除失败:', error)
    return false
  }
}

/**
 * 清空存储
 */
const clearStorage = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (error) {
    console.error('清空失败:', error)
    return false
  }
}

/**
 * 获取存储信息
 */
const getStorageInfo = () => {
  try {
    return wx.getStorageInfoSync()
  } catch (error) {
    console.error('获取存储信息失败:', error)
    return null
  }
}

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo
}