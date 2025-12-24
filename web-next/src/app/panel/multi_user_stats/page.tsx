'use client';

import React, { useState } from 'react';
import { Card, Input, Button, DatePicker, Row, Col, Typography, Statistic, Spin, Empty } from 'antd';
import { SearchOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, calculateQuota, thousandsSeparator } from '@/utils/common';
import dayjs from 'dayjs';
import ApexCharts from '@/app/panel/analytics/components/ApexCharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function MultiUserStatsPage() {
  const { t } = useTranslation();
  const [usernames, setUsernames] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'), 
    dayjs()
  ]);
  const [searching, setSearching] = useState(false);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [modelUsage, setModelUsage] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!usernames.trim()) {
      showError('请输入用户名');
      return;
    }

    setSearching(true);
    try {
      const res = await API.get('/api/analytics/multi_user_stats', {
        params: {
          usernames: usernames.trim(),
          start_time: dateRange[0].format('YYYY-MM-DD'),
          end_time: dateRange[1].format('YYYY-MM-DD')
        }
      });
      const { success, message, data, model_usage } = res.data;
      if (success) {
        setStatistics(data || []);
        setModelUsage(model_usage || []);
        if (data.length === 0) {
          showSuccess('查询成功,但没有找到数据');
        } else {
          showSuccess(`查询成功,找到 ${data.length} 个用户的数据`);
        }
      } else {
        showError(message);
      }
    } catch (error: any) {
      console.error(error);
      showError('查询失败: ' + (error.response?.data?.message || error.message));
    }
    setSearching(false);
  };

  const handleExportCSV = async () => {
    if (!usernames.trim()) {
      showError('请输入用户名');
      return;
    }

    setSearching(true);
    try {
      const res = await API.get('/api/analytics/multi_user_stats/export', {
        params: {
          usernames: usernames.trim(),
          start_time: dateRange[0].format('YYYY-MM-DD'),
          end_time: dateRange[1].format('YYYY-MM-DD')
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `multi_user_stats_${dateRange[0].format('YYYY-MM-DD')}_${dateRange[1].format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccess('CSV导出成功');
    } catch (error: any) {
      console.error(error);
      showError('导出失败: ' + (error.response?.data?.message || error.message));
    }
    setSearching(false);
  };

  const quotaChartData = {
    options: {
      chart: {
        type: 'bar' as const,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: statistics.map((s) => s.username),
      },
      yaxis: {
        title: { text: '额度消耗' },
        labels: {
          formatter: (val: number) => '$' + calculateQuota(val, 2)
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100]
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => '$' + calculateQuota(val, 6)
        }
      }
    },
    series: [
      {
        name: '额度消耗',
        data: statistics.map((s) => s.quota)
      }
    ]
  };

  const modelUsageChartData = {
    options: {
      chart: {
        type: 'donut' as const,
      },
      labels: modelUsage.map((m) => `${m.username} - ${m.model_name}`),
      legend: {
        position: 'bottom' as const,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: '总调用次数',
                formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString()
              }
            }
          }
        }
      },
      tooltip: {
        y: { formatter: (val: number) => val.toLocaleString() + ' 次' }
      }
    },
    series: modelUsage.map((m) => m.request_count)
  };

  return (
    <div>
      <Card style={{ marginBottom: 24 }} size="default">
        <div style={{ marginBottom: 24 }}>
            <Title level={4}>多用户令牌统计</Title>
            <Text type="secondary">Multi-User Token Statistics</Text>
            <br/>
            <Text type="secondary">查询多个用户的所有令牌使用情况统计数据</Text>
        </div>

        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Input 
                    placeholder="用户名 (多个用户名用逗号分隔，例如: user1, user2, user3)" 
                    value={usernames}
                    onChange={(e) => setUsernames(e.target.value)}
                    size="middle"
                />
            </Col>
            <Col xs={24} md={12}>
                <RangePicker 
                    value={dateRange}
                    onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                            setDateRange([dates[0], dates[1]]);
                        }
                    }}
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    size="middle"
                />
            </Col>
            <Col xs={24} md={12}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Button 
                        type="primary" 
                        icon={<SearchOutlined />} 
                        onClick={handleSearch}
                        loading={searching}
                        size="middle"
                    >
                        查询统计
                    </Button>
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleExportCSV}
                        disabled={searching || statistics.length === 0}
                        size="middle"
                    >
                        导出CSV
                    </Button>
                </div>
            </Col>
        </Row>
      </Card>

      {searching && <div style={{ textAlign: 'center', margin: '20px 0' }}><Spin size="large" /></div>}

      {statistics.length > 0 && (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statistics.map((stat, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                        <Card 
                            hoverable
                            style={{ 
                                borderRadius: 16,
                                background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.1) 0%, rgba(22, 119, 255, 0.05) 100%)'
                            }}
                            size="default"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Title level={5} style={{ margin: 0 }}>{stat.username}</Title>
                                <UserOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                            </div>
                            
                            <Statistic 
                                title="总请求数" 
                                value={stat.request_count} 
                                valueStyle={{ color: '#1677ff', fontWeight: 600 }}
                            />
                            <Statistic 
                                title="额度消耗" 
                                value={calculateQuota(stat.quota, 6)} 
                                prefix="$"
                                valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                                style={{ marginTop: 16 }}
                            />
                            
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={12}>
                                    <Statistic 
                                        title="输入Tokens" 
                                        value={stat.prompt_tokens} 
                                        valueStyle={{ fontSize: 14 }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic 
                                        title="输出Tokens" 
                                        value={stat.completion_tokens} 
                                        valueStyle={{ fontSize: 14 }}
                                    />
                                </Col>
                            </Row>
                            
                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary">请求时长: {(stat.request_time / 1000).toFixed(2)}s</Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="用户额度消耗对比" style={{ borderRadius: 16 }} size='default'>
                        <ApexCharts 
                            isLoading={false}
                            chartDatas={quotaChartData} 
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="不同用户模型调用分布" style={{ borderRadius: 16 }} size='default'>
                        {modelUsage.length > 0 ? (
                            <ApexCharts 
                                isLoading={false}
                                chartDatas={modelUsageChartData} 
                            />
                        ) : (
                            <Empty description="暂无数据" />
                        )}
                    </Card>
                </Col>
            </Row>
        </>
      )}

      {!searching && statistics.length === 0 && (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="请输入查询条件并点击'查询统计'按钮" 
            style={{ margin: '40px 0' }}
          />
      )}
    </div>
  );
}
