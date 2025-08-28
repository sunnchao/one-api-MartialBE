# 优惠券前端页面使用指南

## 🎯 页面概述

我们为 One-API 项目创建了完整的优惠券前端管理系统，包括：

1. **管理员优惠券管理页面** (`/panel/coupon`)
2. **用户优惠券页面** (`/panel/user/coupon`)
3. **可复用的工具组件库** (`components/CouponUtils.jsx`)

## 📁 文件结构

```
web/src/
├── views/
│   ├── Coupon/
│   │   ├── index.jsx          # 管理员优惠券管理页面
│   │   └── Demo.jsx           # 演示页面
│   └── User/
│       └── Coupon.jsx         # 用户优惠券页面
├── components/
│   ├── CouponUtils.jsx        # 优惠券工具组件库
│   └── CouponExample.jsx      # 示例组件
├── menu-items/
│   └── coupon.jsx             # 菜单配置
└── routes/
    └── MainRoutes.jsx         # 路由配置
```

## 🎨 管理员优惠券管理页面

### 功能特性

- **三个主要标签页**：
  - 优惠券模板管理
  - 签到奖励配置
  - 批量操作
- **完整的 CRUD 操作**
- **批量发放优惠券**
- **实时状态更新**

### 主要组件

```jsx
// 优惠券模板管理
- 创建/编辑优惠券模板
- 支持三种类型：百分比折扣、固定金额、充值奖励
- 配置使用条件和限制

// 签到奖励配置
- 设置不同天数的签到奖励
- 支持额度、优惠券、倍率三种奖励类型
- 概率设置

// 批量操作
- 选择模板批量发放给指定用户
- 支持不同发放来源标记
```

### 使用方法

```bash
# 访问管理员优惠券管理页面
http://localhost:3000/panel/coupon

# 需要管理员权限
```

## 👤 用户优惠券页面

### 功能特性

- **三个主要标签页**：
  - 可用优惠券展示
  - 签到中心
  - 使用记录
- **优惠券统计卡片**
- **签到奖励展示**
- **优惠券使用测试**

### 主要功能

```jsx
// 优惠券展示
- 优惠券卡片展示
- 状态标识（可用/已使用/已过期）
- 即将过期提醒
- 优惠券码复制

// 签到功能
- 每日签到按钮
- 连续签到天数显示
- 签到记录历史
- 奖励类型展示

// 使用记录
- 已使用优惠券列表
- 节省金额统计
- 使用时间记录
```

### 使用方法

```bash
# 访问用户优惠券页面
http://localhost:3000/panel/user/coupon

# 需要用户登录
```

## 🧩 工具组件库

### CouponUtils.jsx 提供的功能

#### 工具函数

```jsx
// 获取优惠券类型图标
getCouponTypeIcon(type, props);

// 获取优惠券类型文本
getCouponTypeText(type);

// 获取优惠券状态信息
getCouponStatusColor(status);
getCouponStatusText(status);

// 格式化优惠券描述
formatCouponDescription(coupon);

// 时间相关
isExpiringSoon(expireTime, days);
getExpireTimeText(expireTime);

// 折扣计算
calculateDiscount(coupon, orderAmount);

// 优惠券码处理
validateCouponCode(code);
formatCouponCodeInput(input);
```

#### React 组件

```jsx
// 状态标签
<CouponStatusChip status={1} />

// 类型标签
<CouponTypeChip type="percentage" />

// 优惠券值显示
<CouponValueDisplay coupon={coupon} />

// 优惠券卡片
<CouponCard
  coupon={coupon}
  onClick={handleClick}
  selected={isSelected}
  showActions={true}
  actions={<Button>使用</Button>}
/>

// 优惠券统计
<CouponStats coupons={coupons} />
```

## 🎮 在其他页面中集成优惠券功能

### 在充值页面中使用优惠券

```jsx
import React, { useState } from "react";
import { CouponCard, calculateDiscount } from "components/CouponUtils";
import { API } from "utils/api";

const RechargeWithCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [amount, setAmount] = useState(50);

  // 获取可用优惠券
  const fetchAvailableCoupons = async () => {
    const res = await API.get(`/api/user/coupons/available?amount=${amount}`);
    if (res.data.success) {
      setCoupons(res.data.data);
    }
  };

  // 应用优惠券
  const applyCoupon = (coupon) => {
    const result = calculateDiscount(coupon, amount);
    if (result.valid) {
      setSelectedCoupon(coupon);
      // 更新订单金额
      updateOrderAmount(result.finalAmount, result.discountAmount);
    }
  };

  return (
    <div>
      {/* 充值金额输入 */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* 可用优惠券列表 */}
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          onClick={() => applyCoupon(coupon)}
          selected={selectedCoupon?.id === coupon.id}
        />
      ))}
    </div>
  );
};
```

## 🎨 样式自定义

### 主题色彩

```jsx
// 优惠券状态颜色
success: '#4caf50',    // 可用
default: '#9e9e9e',    // 已使用
error: '#f44336',      // 已过期
warning: '#ff9800',    // 即将过期

// 优惠券类型颜色
primary: '#1976d2',    // 主色调
secondary: '#dc004e',  // 次要色调
```

### 自定义样式

```jsx
// 自定义优惠券卡片样式
<CouponCard
  coupon={coupon}
  sx={{
    border: "2px solid #1976d2",
    borderRadius: 2,
    "&:hover": {
      boxShadow: 3,
    },
  }}
/>
```

## 🔧 API 集成

### 主要 API 端点

```javascript
// 用户端API
GET /api/user/coupons                    // 获取用户优惠券
GET /api/user/coupons/available?amount=50 // 获取可用优惠券
GET /api/user/coupons/validate?code=XXX&amount=50 // 验证优惠券
POST /api/user/coupons/apply             // 使用优惠券
POST /api/user/checkin                   // 用户签到
GET /api/user/checkin/list              // 获取签到记录

// 管理员API
GET /api/coupon/admin/templates          // 获取优惠券模板
POST /api/coupon/admin/templates         // 创建优惠券模板
PUT /api/coupon/admin/templates/:id      // 更新优惠券模板
DELETE /api/coupon/admin/templates/:id   // 删除优惠券模板
POST /api/coupon/admin/batch_issue       // 批量发放优惠券
GET /api/coupon/checkin_rewards          // 获取签到奖励配置
POST /api/coupon/admin/checkin_rewards   // 创建签到奖励
```

## 🚀 快速启动

### 1. 确保后端 API 正常运行

```bash
# 启动后端服务
go run main.go
```

### 2. 启动前端开发服务器

```bash
cd web
npm install
npm start
```

### 3. 访问页面

```bash
# 管理员页面
http://localhost:3000/panel/coupon

# 用户页面
http://localhost:3000/panel/user/coupon

# 演示页面
http://localhost:3000/panel/coupon/demo
```

## 📱 移动端适配

所有页面都使用了 Material-UI 的响应式设计：

- 使用 Grid 系统自动适配屏幕尺寸
- 优惠券卡片在小屏幕上单列显示
- 表格在移动端可横向滚动
- 按钮和表单控件触摸友好

## 🔍 调试和测试

### 开发工具

```jsx
// 在浏览器控制台中测试工具函数
import { calculateDiscount } from "components/CouponUtils";

const testCoupon = {
  type: "percentage",
  value: 10,
  min_amount: 20,
  max_discount: 5,
};

console.log(calculateDiscount(testCoupon, 50));
```

### 测试数据

可以使用提供的演示页面(`Demo.jsx`)来测试各种优惠券场景。

## 🎯 下一步扩展

1. **添加优惠券分享功能**
2. **实现优惠券使用统计图表**
3. **添加优惠券模板预览功能**
4. **实现优惠券使用限制（地区、时间段等）**
5. **添加优惠券使用提醒通知**

这个优惠券前端系统为你的 One-API 项目提供了完整的用户界面支持，可以大大提升用户体验和管理效率！
