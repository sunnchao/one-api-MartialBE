#!/bin/bash

# 优惠券系统测试脚本
# 使用方法: ./test_coupon_system.sh [API_BASE_URL] [USER_TOKEN] [ADMIN_TOKEN]

API_BASE=${1:-"http://localhost:3000/api"}
USER_TOKEN=${2:-""}
ADMIN_TOKEN=${3:-""}

echo "🧪 优惠券系统功能测试"
echo "API Base: $API_BASE"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local token="$4"
    local data="$5"
    
    echo -e "${YELLOW}测试: $name${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -X GET "$API_BASE$url" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -X "$method" "$API_BASE$url" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    success=$(echo $response | jq -r '.success // false')
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✓ $name 成功${NC}"
        echo "响应: $(echo $response | jq -r '.message // .data // ""' | head -1)"
    else
        echo -e "${RED}✗ $name 失败${NC}"
        echo "错误: $(echo $response | jq -r '.message // "未知错误"')"
    fi
    echo ""
}

# 检查依赖
if ! command -v jq &> /dev/null; then
    echo -e "${RED}错误: 需要安装 jq 工具${NC}"
    echo "Ubuntu/Debian: sudo apt-get install jq"
    echo "macOS: brew install jq"
    exit 1
fi

if [ -z "$USER_TOKEN" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${YELLOW}警告: 缺少用户或管理员 Token，部分测试将跳过${NC}"
    echo "使用方法: $0 [API_BASE_URL] [USER_TOKEN] [ADMIN_TOKEN]"
    echo ""
fi

echo "1. 📋 测试基础接口..."

# 测试获取签到奖励配置（公开接口）
test_api "获取签到奖励配置" "GET" "/coupon/checkin_rewards" "" ""

if [ -n "$ADMIN_TOKEN" ]; then
    echo "2. 🔧 测试管理员接口..."
    
    # 测试获取优惠券模板
    test_api "获取优惠券模板列表" "GET" "/coupon/admin/templates" "$ADMIN_TOKEN" ""
    
    # 测试创建优惠券模板
    template_data='{
        "name": "测试优惠券",
        "description": "自动化测试创建的优惠券",
        "type": "percentage",
        "value": 10.0,
        "min_amount": 20.0,
        "max_discount": 5.0,
        "valid_days": 30,
        "total_limit": 100,
        "user_limit": 2,
        "source": "admin",
        "is_active": true
    }'
    test_api "创建优惠券模板" "POST" "/coupon/admin/templates" "$ADMIN_TOKEN" "$template_data"
    
    # 测试创建签到奖励配置
    reward_data='{
        "day": 99,
        "reward_type": "quota",
        "quota_amount": 1000,
        "probability": 1.0,
        "description": "测试签到奖励",
        "is_enabled": true
    }'
    test_api "创建签到奖励配置" "POST" "/coupon/admin/checkin_rewards" "$ADMIN_TOKEN" "$reward_data"
else
    echo "⏭️ 跳过管理员接口测试（缺少 ADMIN_TOKEN）"
fi

if [ -n "$USER_TOKEN" ]; then
    echo "3. 👤 测试用户接口..."
    
    # 测试获取用户优惠券
    test_api "获取用户优惠券列表" "GET" "/user/coupons" "$USER_TOKEN" ""
    
    # 测试获取可用优惠券
    test_api "获取可用优惠券" "GET" "/user/coupons/available?amount=50.0" "$USER_TOKEN" ""
    
    # 测试签到记录
    test_api "获取签到记录" "GET" "/user/checkin/list" "$USER_TOKEN" ""
    
    # 测试签到（可能失败如果今日已签到）
    test_api "用户签到" "POST" "/user/checkin" "$USER_TOKEN" ""
    
    # 测试验证优惠券（使用假的优惠券码）
    test_api "验证优惠券" "GET" "/user/coupons/validate?code=TEST-COUP-ON01&amount=30.0" "$USER_TOKEN" ""
else
    echo "⏭️ 跳过用户接口测试（缺少 USER_TOKEN）"
fi

echo "🎯 测试完成!"
echo ""
echo "💡 提示:"
echo "1. 如果创建优惠券模板成功，可以在管理后台查看"
echo "2. 如果签到成功，可以检查用户额度是否增加"
echo "3. 检查数据库中是否正确创建了相关记录"
echo ""
echo "📊 相关数据库表:"
echo "- coupon_templates: 优惠券模板"
echo "- user_coupons: 用户优惠券"
echo "- checkin_rewards: 签到奖励配置"
echo "- user_checkin_records: 用户签到记录"
