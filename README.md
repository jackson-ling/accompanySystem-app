# 陪诊服务微信小程序

一个基于Vue3陪诊项目转换而成的微信小程序，提供专业的陪诊服务和代办服务。

## 📱 项目简介

本项目是基于原Vue3陪诊项目转换而来的微信小程序版本，保留了原有的核心功能和精美的UI设计，并针对微信小程序平台进行了优化和适配。

## 📁 项目结构

```
accompany-system-miniprogram/
├── pages/                  # 页面目录
│   ├── index/             # 首页
│   ├── companion/         # 陪诊师列表
│   ├── ai-chat/           # AI聊天
│   ├── messages/          # 消息列表
│   ├── profile/           # 个人中心
│   ├── login/             # 登录页
│   └── ...                # 其他页面
├── components/            # 组件目录
│   ├── companion-card/    # 陪诊师卡片
│   ├── service-card/      # 服务卡片
│   └── custom-tabbar/     # 自定义tabbar
├── utils/                 # 工具类
│   ├── request.js         # HTTP请求封装
│   ├── storage.js         # 本地存储封装
│   └── api.js             # API接口封装
├── mock/                  # 模拟数据
│   ├── index.js           # 模拟数据入口
│   ├── services.js        # 服务数据
│   ├── companions.js      # 陪诊师数据
│   └── orders.js          # 订单数据
├── static/                # 静态资源
│   ├── images/            # 图片资源
│   └── icons/             # 图标资源
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
└── sitemap.json           # 站点地图
```