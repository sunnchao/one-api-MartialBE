'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as AntdCalendar, Card, Typography, message, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { CalendarProps as AntdCalendarProps } from 'antd';
import CheckInModal from './CheckInModal';
import './calendar.css';

const { Title, Text } = Typography;

interface CalendarProps {
  checkinDates?: any[];
  refreshCheckins?: () => void;
}

type CheckinStatus = 'otherMonth' | 'checked' | 'today' | 'missed' | 'future';

const Calendar: React.FC<CalendarProps> = ({ checkinDates = [], refreshCheckins }) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [panelValue, setPanelValue] = useState<Dayjs>(() => dayjs());

  const checkinDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const record of checkinDates) {
      const createdTimeSeconds = record?.created_time;
      if (typeof createdTimeSeconds !== 'number') continue;
      set.add(dayjs(createdTimeSeconds * 1000).format('YYYY-MM-DD'));
    }
    return set;
  }, [checkinDates]);

  const checkedInToday = useMemo(() => checkinDateSet.has(dayjs().format('YYYY-MM-DD')), [checkinDateSet]);

  const getStatus = (date: Dayjs): CheckinStatus => {
    if (!date.isSame(panelValue, 'month')) return 'otherMonth';
    const dateKey = date.format('YYYY-MM-DD');
    if (checkinDateSet.has(dateKey)) return 'checked';
    const today = dayjs();
    if (date.isSame(today, 'day')) return 'today';
    if (date.isBefore(today, 'day')) return 'missed';
    return 'future';
  };

  const statusMeta = (status: CheckinStatus) => {
    switch (status) {
      case 'checked':
        return { text: t('calendar.statusChecked') || '已签到', icon: <CheckCircleOutlined className="oneapi-checkin-cell__pillIcon" /> };
      case 'today':
        return { text: t('calendar.statusToday') || '去签到', icon: <CalendarOutlined className="oneapi-checkin-cell__pillIcon" /> };
      case 'missed':
        return { text: t('calendar.statusMissed') || '未签到', icon: <CloseCircleOutlined className="oneapi-checkin-cell__pillIcon" /> };
      case 'future':
        return { text: t('calendar.statusFuture') || '等待签到', icon: <GiftOutlined className="oneapi-checkin-cell__pillIcon" /> };
      default:
        return null;
    }
  };

  const fullCellRender: NonNullable<AntdCalendarProps<Dayjs>['fullCellRender']> = (date, info) => {
    if (info.type !== 'date') return info.originNode;

    const status = getStatus(date);
    const meta = statusMeta(status);
    const inMonth = status !== 'otherMonth';

    return (
      <div
        className={[
          'oneapi-checkin-cell',
          inMonth ? 'oneapi-checkin-cell--inMonth' : 'oneapi-checkin-cell--otherMonth',
          status === 'checked' ? 'oneapi-checkin-cell--checked' : '',
          status === 'missed' ? 'oneapi-checkin-cell--missed' : '',
          status === 'today' ? 'oneapi-checkin-cell--today' : '',
          status === 'future' ? 'oneapi-checkin-cell--future' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="oneapi-checkin-cell__dateRow">
          <div className="oneapi-checkin-cell__date">{date.date()}</div>
        </div>
        {meta ? (
          <div className="oneapi-checkin-cell__pill">
            {meta.icon}
            <span style={{fontSize: 10}}>{meta.text}</span>
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  };

  const openCheckin = () => setModalOpen(true);
  const handleSelect = (date: Dayjs) => {
    const today = dayjs();
    if (date.isSame(today, 'day') && !checkedInToday) openCheckin();
  };

  return (
    <Card 
       title={<Title level={4} style={{ margin: 0 }} >{t('calendar.title') || 'Calendar'}</Title>}
       extra={
         <Button
           type="primary"
           icon={<CalendarOutlined />}
           onClick={openCheckin}
           disabled={checkedInToday}
           size={'middle'}
         >
           {checkedInToday ? (t('calendar.checkedToday') || 'Checked in') : (t('calendar.checkinNow') || 'Check in')}
         </Button>
       }
       style={{ height: '100%' }}
       size={'default'}
    >
        <AntdCalendar
          className="oneapi-checkin-calendar"
          fullscreen={false}
          fullCellRender={fullCellRender}
          onSelect={handleSelect}
          onPanelChange={(value) => setPanelValue(value)}
          headerRender={() => []}
        />

       <CheckInModal 
          visible={modalOpen} 
          onClose={() => setModalOpen(false)}
          refreshCheckins={refreshCheckins}
       />
    </Card>
  );
};

export default Calendar;
