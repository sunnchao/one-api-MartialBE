import { API } from '@/utils/api';
import { showError } from '@/utils/common';

/**
 * Checkin Service - for coupon system integration
 */
class CheckinService {
  /**
   * Get user checkin record list
   * @returns {Promise<Array>} checkin record array
   */
  static async getCheckinList() {
    try {
      const res = await API.get('/api/user/checkin/list');
      const { success, data, message } = res.data;

      if (success) {
        return data?.records || [];
      } else {
        showError(message || 'Failed to fetch checkin records');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch checkin records:', error);
      showError('Network error, failed to fetch checkin records');
      return [];
    }
  }

  /**
   * Get checkin statistics
   * @param {Array} checkinList checkin record list
   * @returns {Object} statistics
   */
  static getCheckinStats(checkinList: any[] = []) {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Checkins this month
    const thisMonthCheckins = checkinList.filter((record) => {
      const recordDate = new Date(record.created_time * 1000); // Check timestamp unit!
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    });

    // Consecutive check-in days calculation
    let consecutiveDays = 0;
    const sortedRecords = [...checkinList].sort((a, b) => new Date(b.created_time * 1000).getTime() - new Date(a.created_time * 1000).getTime());

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let record of sortedRecords) {
      const recordDate = new Date(record.created_time * 1000);
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
   * Check if checked in today
   * @param {Array} checkinList checkin record list
   * @returns {boolean} is checked in
   */
  static isCheckedInToday(checkinList: any[] = []) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return checkinList.some((record) => {
      const recordDate = new Date(record.created_time * 1000); // Check unit
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
  }
}

export default CheckinService;
