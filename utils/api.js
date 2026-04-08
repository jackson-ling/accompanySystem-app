// utils/api.js - API接口封装

const { get, post, put, del, uploadFile } = require('./request.js')

// ============ 认证相关 ============
/**
 * 用户登录
 */
const login = (data) => post('/auth/login', data)

/**
 * 用户注册
 */
const register = (data) => post('/auth/register', data)

/**
 * 退出登录
 */
const logout = () => post('/auth/logout')

/**
 * 重置密码
 */
const resetPassword = (data) => post('/auth/reset-password', data)

// ============ 用户相关 ============
/**
 * 获取用户信息
 */
const getUserProfile = () => get('/user/profile')

/**
 * 更新用户信息
 */
const updateUserProfile = (data) => put('/user/profile', data)

/**
 * 更新用户头像
 */
const updateAvatar = (data) => put('/user/avatar', data)

/**
 * 修改密码
 */
const changePassword = (data) => put('/user/password', data)

/**
 * 获取用户余额
 */
const getUserBalance = () => get('/user/balance')

// ============ 陪诊师相关 ============
/**
 * 获取陪诊师列表
 */
const getCompanions = (params) => get('/companions', params)

/**
 * 获取陪诊师详情
 */
const getCompanionDetail = (id) => get(`/companions/${id}`)

/**
 * 收藏/取消收藏陪诊师
 */
const toggleCompanionFavorite = (id) => post(`/companions/${id}/favorite`)

/**
 * 获取陪诊师评价
 */
const getCompanionComments = (id, params) => get(`/companions/${id}/comments`, params)

/**
 * 获取陪诊师可用时间段
 */
const getCompanionAvailableTimes = (id, date) => get(`/companions/${id}/available-times`, date ? { date } : {})

// ============ 陪诊师工作台相关 ============
/**
 * 获取统计数据
 */
const getCompanionStatistics = () => get('/companion/statistics')

/**
 * 获取个人信息
 */
const getCompanionProfile = () => get('/companion/profile')

/**
 * 更新个人信息
 */
const updateCompanionProfile = (data) => put('/companion/profile', data)

/**
 * 获取可接订单
 */
const getAvailableOrders = () => get('/companion/available-orders')

/**
 * 接单
 */
const acceptOrder = (orderId) => post(`/companion/orders/${orderId}/accept`)

/**
 * 拒单
 */
const rejectOrder = (orderId) => post(`/companion/orders/${orderId}/reject`)

/**
 * 更新订单状态
 */
const updateOrderStatus = (id, data) => put(`/companion/orders/${id}/status`, data)

/**
 * 开始服务
 */
const startService = (id) => post(`/companion/orders/${id}/start`)

/**
 * 完成服务
 */
const completeService = (id) => post(`/companion/orders/${id}/complete`)

/**
 * 获取订单列表
 */
const getCompanionOrders = (params) => get('/companion/orders', params)

/**
 * 获取订单详情
 */
const getCompanionOrderDetail = (id) => get(`/companion/orders/${id}`)

/**
 * 获取收入明细
 */
const getCompanionIncome = (params) => get('/companion/income', params)

/**
 * 更新在线状态
 */
const updateCompanionStatus = (data) => post('/companion/status', data)

// ============ 服务相关 ============
/**
 * 获取服务列表
 */
const getServices = (params) => get('/services', params)

/**
 * 获取服务详情
 */
const getServiceDetail = (id) => get(`/services/${id}`)

/**
 * 获取服务分类
 */
const getServiceCategories = () => get('/services/categories')

// ============ 订单相关 ============
/**
 * 创建订单
 */
const createOrder = (data) => post('/user/orders', data)

/**
 * 获取订单列表
 */
const getOrderList = (params) => get('/user/orders', params)

/**
 * 获取订单详情
 */
const getOrderDetail = (id) => get(`/user/orders/${id}`)

/**
 * 取消订单
 */
const cancelOrder = (id) => put(`/user/orders/${id}/cancel`)

/**
 * 支付订单
 */
const payOrder = (id, data) => post(`/user/orders/${id}/pay`, data)

/**
 * 确认订单
 */
const confirmOrder = (id) => put(`/user/orders/${id}/confirm`)

/**
 * 申请退款
 */
const refundOrder = (id, data) => post(`/user/orders/${id}/refund`, data)

/**
 * 评价订单
 */
const commentOrder = (id, data) => post(`/user/orders/${id}/comment`, data)

// ============ 就诊人相关 ============
/**
 * 获取就诊人列表
 */
const getPatients = () => get('/user/patients')

/**
 * 添加就诊人
 */
const addPatient = (data) => post('/user/patients', data)

/**
 * 更新就诊人
 */
const updatePatient = (id, data) => put(`/user/patients/${id}`, data)

/**
 * 删除就诊人
 */
const deletePatient = (id) => del(`/user/patients/${id}`)

/**
 * 设置默认就诊人
 */
const setDefaultPatient = (id) => put(`/user/patients/${id}/default`)

// ============ 收藏相关 ============
/**
 * 获取收藏列表
 */
const getFavorites = (params) => get('/user/favorites', params)

/**
 * 添加收藏
 */
const addFavorite = (data) => post('/user/favorites', data)

/**
 * 删除收藏
 */
const deleteFavorite = (id) => del(`/user/favorites/${id}`)

// ============ 充值相关 ============
/**
 * 获取充值配置
 */
const getRechargeConfig = () => get('/user/recharge/config')

/**
 * 创建充值订单
 */
const createRecharge = (data) => post('/user/recharge', data)

/**
 * 获取充值记录
 */
const getRechargeRecords = (params) => get('/user/recharge/records', params)

/**
 * 获取消费记录
 */
const getConsumptionRecords = (params) => get('/user/consumption', params)

/**
 * 获取交易记录
 */
const getTransactions = (params) => get('/user/transactions', params)

// 消息相关
/**
 * 获取消息会话列表
 */
const getMessageList = () => get('/user/messages')

/**
 * 获取未读消息数
 */
const getUnreadCount = () => get('/user/messages/unread-count')

/**
 * 标记消息已读
 */
const markMessageRead = (id) => put(`/user/messages/${id}/read`)

/**
 * 删除消息
 */
const deleteMessage = (id) => del(`/user/messages/${id}`)

// 聊天相关
const getChatMessages = (type, targetId) => {
  const params = targetId !== null && targetId !== undefined ? { targetId } : {}
  return get(`/user/chats/${type}`, params)
}
const sendChatMessage = (type, targetId, data) => {
  const params = targetId !== null && targetId !== undefined ? { targetId } : {}
  return post(`/user/chats/${type}/messages`, data, params)
}
const deleteChatConversation = (type, targetId) => {
  const url = (targetId !== null && targetId !== undefined) ? `/user/chats/${type}?targetId=${targetId}` : `/user/chats/${type}`
  return del(url)
}

// ============ AI相关 ============
/**
 * 发送AI消息
 */
const sendAiMessage = (data) => post('/ai/chat', data)

/**
 * 获取聊天历史
 */
const getChatHistory = () => get('/ai/chat')

/**
 * 清空聊天记录
 */
const clearChatHistory = () => del('/ai/chat')

// ============ 上传相关 ============
/**
 * 上传图片
 */
const uploadImage = (filePath) => uploadFile('/upload/image', filePath)

/**
 * 上传文件
 */
const uploadFileApi = (filePath) => uploadFile('/upload/file', filePath)

// ============ 反馈相关 ============
/**
 * 提交反馈
 */
const submitFeedback = (data) => post('/user/feedback', data)

/**
 * 获取反馈列表
 */
const getFeedbackList = (params) => get('/user/feedback', params)

// ============ 字典相关 ============
/**
 * 获取字典数据
 */
const getDictData = (type) => get(`/dict/${type}`)
const getServiceTypes = () => get('/dict/service-types')
const getHospitals = (params) => get('/dict/hospitals', params)
const getDepartments = (params) => get('/dict/departments', params)

module.exports = {
  // 认证相关
  login,
  register,
  logout,
  resetPassword,
  
  // 用户相关
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  changePassword,
  getUserBalance,
  
  // 陪诊师相关
  getCompanions,
  getCompanionDetail,
  toggleCompanionFavorite,
  getCompanionComments,
  getCompanionAvailableTimes,
  
  // 陪诊师工作台相关
  getCompanionStatistics,
  getCompanionProfile,
  updateCompanionProfile,
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  startService,
  completeService,
  getCompanionOrders,
  getCompanionOrderDetail,
  getCompanionIncome,
  updateCompanionStatus,
  
  // 服务相关
  getServices,
  getServiceDetail,
  getServiceCategories,
  
  // 订单相关
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  payOrder,
  confirmOrder,
  refundOrder,
  commentOrder,
  
  // 就诊人相关
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  setDefaultPatient,
  
  // 收藏相关
  getFavorites,
  addFavorite,
  deleteFavorite,
  
  // 充值相关
  getRechargeConfig,
  createRecharge,
  getRechargeRecords,
  getConsumptionRecords,
  getTransactions,
  
  // 消息相关
  getMessageList,
  getUnreadCount,
  markMessageRead,
  deleteMessage,
  
  // 聊天相关
  getChatMessages,
  sendChatMessage,
  deleteChatConversation,
  
  // AI相关
  sendAiMessage,
  getChatHistory,
  clearChatHistory,
  
  // 上传相关
  uploadImage,
  uploadFileApi,
  
  // 反馈相关
  submitFeedback,
  getFeedbackList,
  
  // 字典相关
  getDictData,
  getServiceTypes,
  getHospitals,
  getDepartments
}