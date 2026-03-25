// mock/services.js - 服务模拟数据

module.exports = [
  {
    id: 1,
    name: '全天陪诊服务',
    description: '专业陪诊师全天陪同，提供挂号、排队、取药等全方位服务',
    price: 299,
    type: 'companion',
    sales: 1520,
    duration: '全天',
    image: 'https://placehold.co/200x200/409eff/ffffff?text=全天陪诊',
    cover: 'https://placehold.co/750x360/409eff/ffffff?text=全天陪诊',
    features: ['全天陪同', '专业指导', '贴心服务', '安全保障']
  },
  {
    id: 2,
    name: '半天陪诊服务',
    description: '半天陪诊服务，适合上午或下午就诊的患者',
    price: 199,
    type: 'companion',
    sales: 2340,
    duration: '半天',
    image: 'https://placehold.co/200x200/67c23a/ffffff?text=半天陪诊',
    cover: 'https://placehold.co/750x360/67c23a/ffffff?text=半天陪诊',
    features: ['半天陪同', '高效服务', '经济实惠']
  },
  {
    id: 3,
    name: '夜间急诊陪诊',
    description: '夜间急诊专属陪诊服务，24小时待命',
    price: 399,
    type: 'companion',
    sales: 890,
    duration: '全程',
    image: 'https://placehold.co/200x200/e6a23c/ffffff?text=急诊陪诊',
    cover: 'https://placehold.co/750x360/e6a23c/ffffff?text=急诊陪诊',
    features: ['夜间服务', '急诊优先', '专业医护']
  },
  {
    id: 4,
    name: '异地就医陪诊',
    description: '异地就医全程陪同，提供交通、住宿建议',
    price: 599,
    type: 'companion',
    sales: 456,
    duration: '全程',
    image: 'https://placehold.co/200x200/f56c6c/ffffff?text=异地陪诊',
    cover: 'https://placehold.co/750x360/f56c6c/ffffff?text=异地陪诊',
    features: ['异地全程', '交通协助', '住宿建议']
  },
  {
    id: 5,
    name: '代取报告服务',
    description: '专业代取医院各类检查报告，快速便捷',
    price: 99,
    type: 'agency',
    sales: 3560,
    duration: '1-2天',
    image: 'https://placehold.co/200x200/909399/ffffff?text=代取报告',
    cover: 'https://placehold.co/750x360/909399/ffffff?text=代取报告',
    features: ['快速取件', '安全送达', '实时追踪']
  },
  {
    id: 6,
    name: '代挂号服务',
    description: '专业代挂号，避免排队等待，省时省力',
    price: 149,
    type: 'agency',
    sales: 4230,
    duration: '当天',
    image: 'https://placehold.co/200x200/409eff/ffffff?text=代挂号',
    cover: 'https://placehold.co/750x360/409eff/ffffff?text=代挂号',
    features: ['快速挂号', '专家号源', '时间灵活']
  },
  {
    id: 7,
    name: '代开药服务',
    description: '专业代开药，医生处方，药品正规',
    price: 129,
    type: 'agency',
    sales: 2890,
    duration: '1-3天',
    image: 'https://placehold.co/200x200/67c23a/ffffff?text=代开药',
    cover: 'https://placehold.co/750x360/67c23a/ffffff?text=代开药',
    features: ['正规处方', '药品齐全', '送药上门']
  },
  {
    id: 8,
    name: '体检陪诊服务',
    description: '体检全程陪同，解读报告，健康指导',
    price: 249,
    type: 'companion',
    sales: 1780,
    duration: '半天',
    image: 'https://placehold.co/200x200/e6a23c/ffffff?text=体检陪诊',
    cover: 'https://placehold.co/750x360/e6a23c/ffffff?text=体检陪诊',
    features: ['体检陪同', '报告解读', '健康指导']
  }
]