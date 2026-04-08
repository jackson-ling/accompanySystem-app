// mock/index.js - 模拟数据入口

// 导入各个模块的模拟数据
const services = require('./services.js')
const companions = require('./companions.js')
const orders = require('./orders.js')

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟用户数据
let mockUser = {
  id: 1,
  nickname: '测试用户',
  avatar: '',
  phone: '138****8888',
  balance: 1000.00,
  createTime: '2024-01-01',
  isCompanion: false,
  companionInfo: null
}

// 模拟患者数据
let mockPatients = [
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    address: '北京市朝阳区',
    relationship: '本人',
    default: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138002',
    address: '北京市海淀区',
    relationship: '家属',
    default: false
  }
]

// 模拟消息数据
let mockMessages = [
  {
    id: '1',
    type: 'system',
    name: '系统通知',
    time: '10:30',
    preview: '您的订单已确认，陪诊师正在前往...',
    icon: 'Bell',
    iconName: 'bell',
    unreadCount: 2
  },
  {
    id: '2',
    type: 'order',
    name: '订单消息',
    time: '昨天',
    preview: '订单支付成功',
    icon: 'Document',
    iconName: 'orders-o',
    unreadCount: 0
  },
  {
    id: '3',
    type: 'activity',
    name: '活动通知',
    time: '3天前',
    preview: '新用户注册送大礼包啦！',
    icon: 'Gift',
    iconName: 'gift-o',
    unreadCount: 1
  },
  {
    id: '4',
    type: 'companion',
    name: '武海艳',
    time: '10:35',
    preview: '收到，我会按时到达。',
    avatar: 'https://project--accompanysystem.oss-cn-beijing.aliyuncs.com/2026/04/43248519-f784-4054-967c-faba7b2eea51.png',
    targetId: '101',
    unreadCount: 0
  }
]

// 模拟AI聊天数据
let mockChatHistory = [
  {
    isMe: false,
    text: '您好！我是AI智能助手，请问有什么可以帮您的？'
  }
]

// 模拟充值记录
let mockRechargeRecords = [
  {
    id: 1,
    amount: 100,
    method: '微信支付',
    time: '2024-03-20 10:30:00',
    status: 'success'
  },
  {
    id: 2,
    amount: 200,
    method: '余额支付',
    time: '2024-03-15 14:20:00',
    status: 'success'
  }
]

// 模拟消费记录
let mockConsumptionRecords = [
  {
    id: 1,
    type: 'order',
    title: '陪诊服务订单',
    amount: -199.00,
    balance: 801.00,
    time: '2024-03-18 09:00:00'
  },
  {
    id: 2,
    type: 'recharge',
    title: '账户充值',
    amount: 100.00,
    balance: 1000.00,
    time: '2024-03-20 10:30:00'
  }
]

// 模拟医院数据
let mockHospitals = [
  {
    id: 1,
    name: '北京协和医院',
    level: '三甲',
    address: '北京市东城区',
    icon: '🏥',
    latitude: 39.9139,
    longitude: 116.4175,
    rating: 4.9
  },
  {
    id: 2,
    name: '北京大学第一医院',
    level: '三甲',
    address: '北京市西城区',
    icon: '🏥',
    latitude: 39.9184,
    longitude: 116.3734,
    rating: 4.8
  },
  {
    id: 3,
    name: '北京301医院',
    level: '三甲',
    address: '北京市海淀区',
    icon: '🏥',
    latitude: 39.9088,
    longitude: 116.2756,
    rating: 4.9
  },
  {
    id: 4,
    name: '中日友好医院',
    level: '三甲',
    address: '北京市朝阳区',
    icon: '🏥',
    latitude: 39.9665,
    longitude: 116.4328,
    rating: 4.7
  },
  {
    id: 5,
    name: '北京同仁医院',
    level: '三甲',
    address: '北京市东城区',
    icon: '🏥',
    latitude: 39.9168,
    longitude: 116.4164,
    rating: 4.8
  },
  {
    id: 6,
    name: '北京天坛医院',
    level: '三甲',
    address: '北京市东城区',
    icon: '🏥',
    latitude: 39.8765,
    longitude: 116.4168,
    rating: 4.9
  }
]

// 导出模拟数据
module.exports = {
  // 延迟函数
  delay,
  
  // 用户相关
  mockUser,
  mockPatients,
  
  // 消息相关
  mockMessages,
  mockChatHistory,
  
  // 财务相关
  mockRechargeRecords,
  mockConsumptionRecords,
  
  // 医院相关
  hospitals: mockHospitals,
  
  // 业务数据
  services,
  companions,
  orders
}