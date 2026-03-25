// utils/api.js - API接口封装

const { get, post, put, del, uploadFile } = require('./request.js')

// ============ 认证相关 ============
/**
 * 用户登录
 */
export const login = (data) => post('/auth/login', data)

/**
 * 用户注册
 */
export const register = (data) => post('/auth/register', data)

/**
 * 退出登录
 */
export const logout = () => post('/auth/logout')

/**
 * 重置密码
 */
export const resetPassword = (data) => post('/auth/reset-password', data)

// ============ 用户相关 ============
/**
 * 获取用户信息
 */
export const getUserProfile = () => get('/user/profile')

/**
 * 更新用户信息
 */
export const updateUserProfile = (data) => put('/user/profile', data)

/**
 * 修改密码
 */
export const changePassword = (data) => put('/user/password', data)

/**
 * 获取用户余额
 */
export const getUserBalance = () => get('/user/balance')

// ============ 陪诊师相关 ============
/**
 * 获取陪诊师列表
 */
export const getCompanions = (params) => get('/companions', params)

/**
 * 获取陪诊师详情
 */
export const getCompanionDetail = (id) => get(`/companions/${id}`)

/**
 * 收藏/取消收藏陪诊师
 */
export const toggleCompanionFavorite = (id) => post(`/companions/${id}/favorite`)

/**
 * 获取陪诊师评价
 */
export const getCompanionComments = (id, params) => get(`/companions/${id}/comments`, params)

// ============ 服务相关 ============
/**
 * 获取服务列表
 */
export const getServices = (params) => get('/services', params)

/**
 * 获取服务详情
 */
export const getServiceDetail = (id) => get(`/services/${id}`)

/**
 * 获取服务分类
 */
export const getServiceCategories = () => get('/services/categories')

// ============ 订单相关 ============
/**
 * 创建订单
 */
export const createOrder = (data) => post('/user/orders', data)

/**
 * 获取订单列表
 */
export const getOrderList = (params) => get('/user/orders', params)

/**
 * 获取订单详情
 */
export const getOrderDetail = (id) => get(`/user/orders/${id}`)

/**
 * 取消订单
 */
export const cancelOrder = (id) => put(`/user/orders/${id}/cancel`)

/**
 * 支付订单
 */
export const payOrder = (id, data) => post(`/user/orders/${id}/pay`, data)

/**
 * 确认订单
 */
export const confirmOrder = (id) => put(`/user/orders/${id}/confirm`)

/**
 * 申请退款
 */
export const refundOrder = (id, data) => post(`/user/orders/${id}/refund`, data)

/**
 * 评价订单
 */
export const commentOrder = (id, data) => post(`/user/orders/${id}/comment`, data)

// ============ 就诊人相关 ============
/**
 * 获取就诊人列表
 */
export const getPatients = () => get('/user/patients')

/**
 * 添加就诊人
 */
export const addPatient = (data) => post('/user/patients', data)

/**
 * 更新就诊人
 */
export const updatePatient = (id, data) => put(`/user/patients/${id}`, data)

/**
 * 删除就诊人
 */
export const deletePatient = (id) => del(`/user/patients/${id}`)

/**
 * 设置默认就诊人
 */
export const setDefaultPatient = (id) => put(`/user/patients/${id}/default`)

// ============ 收藏相关 ============
/**
 * 获取收藏列表
 */
export const getFavorites = (params) => get('/user/favorites', params)

/**
 * 添加收藏
 */
export const addFavorite = (data) => post('/user/favorites', data)

/**
 * 删除收藏
 */
export const deleteFavorite = (id) => del(`/user/favorites/${id}`)

// ============ 充值相关 ============
/**
 * 获取充值配置
 */
export const getRechargeConfig = () => get('/user/recharge/config')

/**
 * 创建充值订单
 */
export const createRecharge = (data) => post('/user/recharge', data)

/**
 * 获取充值记录
 */
export const getRechargeRecords = (params) => get('/user/recharge/records', params)

/**
 * 获取消费记录
 */
export const getConsumptionRecords = (params) => get('/user/consumption', params)

/**
 * 获取交易记录
 */
export const getTransactions = (params) => get('/user/transactions', params)

// ============ 消息相关 ============
/**
 * 获取消息会话列表
 */
export const getMessageList = () => get('/user/messages')

/**
 * 获取未读消息数
 */
export const getUnreadCount = () => get('/user/messages/unread-count')

/**
 * 标记消息已读
 */
export const markMessageRead = (id) => put(`/user/messages/${id}/read`)

/**
 * 删除消息
 */
export const deleteMessage = (id) => del(`/user/messages/${id}`)

// ============ AI相关 ============
/**
 * 发送AI消息
 */
export const sendAiMessage = (data) => post('/ai/chat', data)

/**
 * 获取聊天历史
 */
export const getChatHistory = () => get('/ai/chat')

/**
 * 清空聊天记录
 */
export const clearChatHistory = () => del('/ai/chat')

// ============ 上传相关 ============
/**
 * 上传图片
 */
export const uploadImage = (filePath) => uploadFile('/upload/image', filePath)

/**
 * 上传文件
 */
export const uploadFileApi = (filePath) => uploadFile('/upload/file', filePath)

// ============ 反馈相关 ============
/**
 * 提交反馈
 */
export const submitFeedback = (data) => post('/user/feedback', data)

// ============ 字典相关 ============
/**
 * 获取字典数据
 */
export const getDictData = (type) => get(`/dict/${type}`)