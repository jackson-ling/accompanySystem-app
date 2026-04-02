// mock/orders.js - 订单模拟数据

module.exports = [
  {
    id: 'ORD20240325001',
    serviceId: 1,
    serviceName: '全天陪诊服务',
    image: 'https://placehold.co/200x200/409eff/ffffff?text=全天陪诊',
    companionId: 1,
    companionName: '王医生',
    companionPhone: '138****1234',
    companionAvatar: 'https://placehold.co/100x100/409eff/ffffff?text=王',
    patientName: '张三',
    hospital: '北京协和医院',
    department: '内科',
    appointmentTime: '2024-03-26 09:00:00',
    pickupOption: 'both',
    remarks: '请提前15分钟到达',
    amount: 299,
    price: 299,
    status: 2, // 已接单
    createTime: '2024-03-25 10:30:00',
    payTime: '2024-03-25 10:31:00',
    clientComment: null
  },
  {
    id: 'ORD20240320002',
    serviceId: 2,
    serviceName: '半天陪诊服务',
    image: 'https://placehold.co/200x200/67c23a/ffffff?text=半天陪诊',
    companionId: 2,
    companionName: '李护士',
    companionPhone: '139****5678',
    companionAvatar: 'https://placehold.co/100x100/f56c6c/ffffff?text=李',
    patientName: '张三',
    hospital: '北京大学第一医院',
    department: '儿科',
    appointmentTime: '2024-03-20 14:00:00',
    pickupOption: 'pick',
    remarks: '',
    amount: 199,
    price: 199,
    status: 7, // 服务中
    createTime: '2024-03-18 15:20:00',
    payTime: '2024-03-18 15:21:00',
    clientComment: null
  },
  {
    id: 'ORD20240315003',
    serviceId: 5,
    serviceName: '代取报告服务',
    image: 'https://placehold.co/200x200/909399/ffffff?text=代取报告',
    companionId: null,
    companionName: null,
    companionPhone: null,
    companionAvatar: null,
    patientName: '张三',
    hospital: '北京301医院',
    department: '检验科',
    appointmentTime: '2024-03-15 10:00:00',
    pickupOption: 'none',
    remarks: '',
    amount: 99,
    price: 99,
    status: 3, // 已完成
    createTime: '2024-03-14 16:45:00',
    payTime: '2024-03-14 16:46:00',
    clientComment: {
      score: 5,
      content: '服务非常好，取件很及时！',
      time: '2024-03-16 10:20:00'
    }
  },
  {
    id: 'ORD20240310004',
    serviceId: 1,
    serviceName: '全天陪诊服务',
    image: 'https://placehold.co/200x200/409eff/ffffff?text=全天陪诊',
    companionId: 4,
    companionName: '刘护士长',
    companionPhone: '137****9012',
    companionAvatar: 'https://placehold.co/100x100/e6a23c/ffffff?text=刘',
    patientName: '张三',
    hospital: '中日友好医院',
    department: '外科',
    appointmentTime: '2024-03-10 08:30:00',
    pickupOption: 'both',
    remarks: '需要轮椅',
    amount: 299,
    price: 299,
    status: 3, // 已完成
    createTime: '2024-03-09 11:20:00',
    payTime: '2024-03-09 11:21:00',
    clientComment: {
      score: 5,
      content: '非常专业，服务周到，下次还找您！',
      time: '2024-03-11 09:30:00'
    }
  },
  {
    id: 'ORD20240305005',
    serviceId: 6,
    serviceName: '代挂号服务',
    image: 'https://placehold.co/200x200/409eff/ffffff?text=代挂号',
    companionId: null,
    companionName: null,
    companionPhone: null,
    companionAvatar: null,
    patientName: '张三',
    hospital: '北京同仁医院',
    department: '眼科',
    appointmentTime: '2024-03-05 09:00:00',
    pickupOption: 'none',
    remarks: '',
    amount: 149,
    price: 149,
    status: 6, // 已退款
    createTime: '2024-03-04 14:30:00',
    payTime: '2024-03-04 14:31:00',
    clientComment: null
  }
]

// 订单状态枚举
const ORDER_STATUS = {
  PENDING_PAYMENT: 0,    // 待支付
  PENDING_ACCEPT: 1,    // 待接单
  ACCEPTED: 2,          // 已接单
  COMPLETED: 3,         // 已完成
  CANCELLED: 4,         // 已取消
  REFUNDING: 5,         // 退款中
  REFUNDED: 6,          // 已退款
  IN_SERVICE: 7         // 服务中
}

// 订单状态文本
const ORDER_STATUS_TEXT = {
  0: '待支付',
  1: '待接单',
  2: '已接单',
  3: '已完成',
  4: '已取消',
  5: '退款中',
  6: '已退款',
  7: '服务中'
}

// 接送选项枚举
const PICKUP_OPTION = {
  NONE: 'none',      // 不接送
  PICK: 'pick',      // 仅接
  DROP: 'drop',      // 仅送
  BOTH: 'both'       // 接送
}

// 接送选项文本
const PICKUP_OPTION_TEXT = {
  none: '不接送',
  pick: '仅接',
  drop: '仅送',
  both: '接送'
}

module.exports.ORDER_STATUS = ORDER_STATUS
module.exports.ORDER_STATUS_TEXT = ORDER_STATUS_TEXT
module.exports.PICKUP_OPTION = PICKUP_OPTION
module.exports.PICKUP_OPTION_TEXT = PICKUP_OPTION_TEXT