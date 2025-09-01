import { API } from 'utils/api';
import { showError } from 'utils/common';

/**
 * 签到服务 - 用于优惠券系统集成
 */
class CheckinService {
  /**
   * 获取用户签到记录列表
   * @returns {Promise<Array>} 签到记录数组
   */
  static async getCheckinList() {
    try {
      const res = await API.get('/api/user/checkin/list');
      const { success, data, message } = res.data;
      
      if (success) {
        return data || [];
      } else {
        showError(message || '获取签到记录失败');
        return [];
      }
    } catch (error) {
      console.error('获取签到记录失败:', error);
      showError('网络错误，获取签到记录失败');
      return [];
    }
  }

  /**
   * 获取签到统计信息
   * @param {Array} checkinList 签到记录列表
   * @returns {Object} 统计信息
   */
  static getCheckinStats(checkinList = []) {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // 本月签到记录
    const thisMonthCheckins = checkinList.filter(record => {
      const recordDate = new Date(record.created_time);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    });

    // 连续签到天数计算
    let consecutiveDays = 0;
    const sortedRecords = [...checkinList].sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let record of sortedRecords) {
      const recordDate = new Date(record.created_time);
      recordDate.setHours(0, 0, 0, 0);
      
      if (recordDate.getTime() === currentDate.getTime()) {
        consecutiveDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalCheckins: checkinList.length,
      thisMonthCheckins: thisMonthCheckins.length,
      consecutiveDays,
      lastCheckinDate: checkinList.length > 0 ? checkinList[0]?.created_time : null,
      isCheckedInToday: this.isCheckedInToday(checkinList)
    };
  }

  /**
   * 检查今天是否已签到
   * @param {Array} checkinList 签到记录列表
   * @returns {boolean} 是否已签到
   */
  static isCheckedInToday(checkinList = []) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkinList.some(record => {
      const recordDate = new Date(record.created_time);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
  }

  /**
   * 基于签到记录生成优惠券奖励建议
   * @param {Array} checkinList 签到记录列表
   * @returns {Object} 奖励建议
   */
  static generateCouponRewards(checkinList = []) {
    const stats = this.getCheckinStats(checkinList);
    const rewards = [];

    // 连续签到奖励
    if (stats.consecutiveDays >= 7) {
      rewards.push({
        type: 'consecutive_bonus',
        title: '连续签到奖励',
        description: `连续签到${stats.consecutiveDays}天，获得额外奖励`,
        multiplier: Math.min(1 + (stats.consecutiveDays * 0.1), 3), // 最高3倍奖励
        eligible: true
      });
    }

    // 月度活跃奖励
    if (stats.thisMonthCheckins >= 15) {
      rewards.push({
        type: 'monthly_active',
        title: '月度活跃奖励',
        description: `本月签到${stats.thisMonthCheckins}次，获得活跃用户奖励`,
        multiplier: 1.5,
        eligible: true
      });
    }

    // 新手奖励
    if (stats.totalCheckins <= 7 && stats.totalCheckins >= 3) {
      rewards.push({
        type: 'newcomer_bonus',
        title: '新手奖励',
        description: '新用户签到奖励',
        multiplier: 2,
        eligible: true
      });
    }

    return {
      stats,
      rewards,
      totalMultiplier: rewards.reduce((sum, reward) => sum + reward.multiplier - 1, 1)
    };
  }
}

export default CheckinService;