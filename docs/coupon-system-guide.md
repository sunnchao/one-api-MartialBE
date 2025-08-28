# 优惠券系统使用指南

## 🎯 系统概述

新的优惠券系统集成了多种奖励机制，包括：
- **优惠券**：充值折扣券、固定减免券、充值奖励券
- **签到奖励**：额度奖励、优惠券奖励、倍率奖励
- **多场景应用**：签到、活动、管理员发放、邀请奖励等

## 📊 数据结构

### 优惠券模板 (CouponTemplate)
```sql
CREATE TABLE coupon_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,                    -- 优惠券名称
    description VARCHAR(500),                      -- 描述
    type VARCHAR(20) NOT NULL,                     -- 类型：percentage, fixed, recharge
    value DECIMAL(10,2) NOT NULL,                  -- 折扣值或金额
    min_amount DECIMAL(10,2) DEFAULT 0,            -- 最低消费要求
    max_discount DECIMAL(10,2) DEFAULT 0,          -- 最大折扣金额
    valid_days INT DEFAULT 30,                     -- 有效天数
    total_limit INT DEFAULT 0,                     -- 总发放限制
    user_limit INT DEFAULT 1,                      -- 每用户限制数量
    issued_count INT DEFAULT 0,                    -- 已发放数量
    used_count INT DEFAULT 0,                      -- 已使用数量
    is_active BOOLEAN DEFAULT TRUE,                -- 是否启用
    source VARCHAR(20) DEFAULT 'admin',            -- 来源类型
    created_time BIGINT,
    updated_time BIGINT
);
```

### 用户优惠券 (UserCoupon)
```sql
CREATE TABLE user_coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    template_id INT NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,              -- 优惠券码 XXXX-XXXX-XXXX
    name VARCHAR(100),                             -- 优惠券名称
    type VARCHAR(20),                              -- 类型
    value DECIMAL(10,2),                           -- 折扣值
    min_amount DECIMAL(10,2) DEFAULT 0,            -- 最低消费要求
    max_discount DECIMAL(10,2) DEFAULT 0,          -- 最大折扣金额
    status INT DEFAULT 1,                          -- 状态：1未使用 2已使用 3已过期
    source VARCHAR(20) DEFAULT 'admin',            -- 来源
    order_id VARCHAR(50),                          -- 使用时的订单ID
    used_amount DECIMAL(10,2) DEFAULT 0,           -- 使用金额
    saved_amount DECIMAL(10,2) DEFAULT 0,          -- 节省金额
    expire_time BIGINT,                            -- 过期时间
    used_time BIGINT DEFAULT 0,                    -- 使用时间
    created_time BIGINT,
    INDEX idx_user_id (user_id),
    INDEX idx_template_id (template_id),
    INDEX idx_code (code)
);
```

### 签到奖励配置 (CheckinReward)
```sql
CREATE TABLE checkin_rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day INT NOT NULL UNIQUE,                       -- 连续签到天数
    reward_type VARCHAR(20) NOT NULL,              -- 奖励类型：quota, coupon, multiplier
    quota_amount INT DEFAULT 0,                    -- 额度奖励
    coupon_id INT DEFAULT 0,                       -- 优惠券模板ID
    multiplier_val DECIMAL(5,2) DEFAULT 0,         -- 倍率值
    multiplier_day INT DEFAULT 0,                  -- 倍率持续天数
    probability DECIMAL(5,4) DEFAULT 1,            -- 获得概率 0-1
    description VARCHAR(200),                      -- 奖励描述
    is_enabled BOOLEAN DEFAULT TRUE,               -- 是否启用
    created_time BIGINT,
    updated_time BIGINT
);
```

### 用户签到记录 (UserCheckinRecord)
```sql
CREATE TABLE user_checkin_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    day INT NOT NULL,                              -- 连续签到天数
    reward_type VARCHAR(20),                       -- 获得的奖励类型
    quota_reward INT DEFAULT 0,                    -- 获得的额度
    coupon_code VARCHAR(32),                       -- 获得的优惠券码
    multiplier_val DECIMAL(5,2) DEFAULT 0,         -- 获得的倍率
    multiplier_day INT DEFAULT 0,                  -- 倍率持续天数
    description VARCHAR(200),                      -- 奖励描述
    ip VARCHAR(45),
    created_time BIGINT,
    INDEX idx_user_id (user_id),
    INDEX idx_created_time (created_time)
);
```

## 🔧 API 接口

### 用户接口

#### 1. 获取用户优惠券列表
```http
GET /api/user/coupons?status=1
```

**参数：**
- `status` (可选): 优惠券状态 (1:未使用, 2:已使用, 3:已过期)

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ABCD-EFGH-IJKL",
      "name": "充值9折券",
      "type": "percentage",
      "value": 10.0,
      "min_amount": 10.0,
      "max_discount": 5.0,
      "status": 1,
      "expire_time": 1703923200000,
      "created_time": 1703836800000
    }
  ]
}
```

#### 2. 获取可用优惠券
```http
GET /api/user/coupons/available?amount=50.0
```

**参数：**
- `amount`: 订单金额

#### 3. 验证优惠券
```http
GET /api/user/coupons/validate?code=ABCD-EFGH-IJKL&amount=30.0
```

#### 4. 使用优惠券
```http
POST /api/user/coupons/apply
```

**请求体：**
```json
{
  "coupon_code": "ABCD-EFGH-IJKL",
  "order_amount": 30.0,
  "order_id": "ORDER123456"
}
```

#### 5. 签到
```http
POST /api/user/checkin
```

**响应：**
```json
{
  "success": true,
  "message": "签到成功！获得充值9折券",
  "data": {
    "consecutive_days": 3,
    "reward_type": "coupon",
    "description": "获得优惠券：充值9折券",
    "coupon_code": "ABCD-EFGH-IJKL"
  }
}
```

#### 6. 获取签到记录
```http
GET /api/user/checkin/list
```

### 管理员接口

#### 1. 优惠券模板管理
```http
GET /api/coupon/admin/templates          # 获取模板列表
POST /api/coupon/admin/templates         # 创建模板
PUT /api/coupon/admin/templates/:id      # 更新模板
DELETE /api/coupon/admin/templates/:id   # 删除模板
```

#### 2. 批量发放优惠券
```http
POST /api/coupon/admin/batch_issue
```

**请求体：**
```json
{
  "template_id": 1,
  "user_ids": [1, 2, 3, 4, 5],
  "source": "activity"
}
```

#### 3. 签到奖励配置
```http
POST /api/coupon/admin/checkin_rewards      # 创建签到奖励
PUT /api/coupon/admin/checkin_rewards/:id   # 更新签到奖励
```

## 💡 使用场景

### 1. 设置签到奖励
```json
// 第3天签到奖励配置
{
  "day": 3,
  "reward_type": "coupon",
  "coupon_id": 1,
  "probability": 1.0,
  "description": "连续签到第3天奖励",
  "is_enabled": true
}
```

### 2. 创建优惠券模板
```json
// 新用户专享券
{
  "name": "新用户专享券",
  "description": "新用户首次充值享受85折",
  "type": "percentage",
  "value": 15.0,
  "min_amount": 5.0,
  "max_discount": 10.0,
  "valid_days": 7,
  "total_limit": 0,
  "user_limit": 1,
  "source": "admin",
  "is_active": true
}
```

### 3. 集成到充值流程
```javascript
// 前端充值时应用优惠券
const applyCoupon = async (couponCode, amount) => {
  const response = await fetch('/api/user/coupons/validate', {
    method: 'GET',
    params: { code: couponCode, amount: amount }
  });
  
  if (response.success) {
    const { discount_amount, final_amount } = response.data;
    // 更新UI显示折扣后金额
    updateOrderAmount(final_amount, discount_amount);
  }
};
```

## 🎮 活动示例

### 14日签到活动配置
```sql
-- 第1天：基础额度
INSERT INTO checkin_rewards (day, reward_type, quota_amount, probability, description) 
VALUES (1, 'quota', 5000, 1.0, '新手签到奖励');

-- 第3天：9折券
INSERT INTO checkin_rewards (day, reward_type, coupon_id, probability, description) 
VALUES (3, 'coupon', 1, 1.0, '连续签到第3天奖励');

-- 第7天：高额度奖励
INSERT INTO checkin_rewards (day, reward_type, quota_amount, probability, description) 
VALUES (7, 'quota', 20000, 1.0, '连续签到1周奖励');

-- 第14天：特殊优惠券
INSERT INTO checkin_rewards (day, reward_type, coupon_id, probability, description) 
VALUES (14, 'coupon', 2, 1.0, '连续签到2周大奖');
```

## 🔄 定时任务

### 清理过期优惠券
建议每日执行清理过期优惠券的任务：
```go
// 在定时任务中调用
model.CleanupExpiredCouponsTask()
```

## 📈 数据统计

可以通过以下SQL查询获得活动数据：

```sql
-- 优惠券使用统计
SELECT 
    ct.name,
    ct.issued_count,
    ct.used_count,
    ROUND(ct.used_count * 100.0 / ct.issued_count, 2) as usage_rate
FROM coupon_templates ct 
WHERE ct.issued_count > 0;

-- 签到活跃度统计
SELECT 
    DATE(FROM_UNIXTIME(created_time/1000)) as date,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_checkins
FROM user_checkin_records 
WHERE created_time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY)) * 1000
GROUP BY DATE(FROM_UNIXTIME(created_time/1000))
ORDER BY date DESC;
```

这个优惠券系统为你的One-API平台提供了完整的用户激励机制，可以有效提高用户粘性和充值转化率。
