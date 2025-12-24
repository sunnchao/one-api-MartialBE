'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Button, Input, DatePicker, Row, Col, Space, Statistic, Tooltip, Tabs, Popover, Checkbox } from 'antd';
import { SearchOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, timestamp2string, renderQuota } from '@/utils/common';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import QuotaDetail from './components/QuotaDetail';

const { Title } = Typography;
const { RangePicker } = DatePicker;

function renderCachedTokens(metadata: any) {
  const cachedWriteTokens = Number(metadata?.cached_write_tokens) || 0;
  const cachedReadTokens = Number(metadata?.cached_read_tokens) || 0;
  if (!cachedWriteTokens && !cachedReadTokens) return null;

  const parts: string[] = [];
  if (cachedWriteTokens) parts.push(`cached_write: ${cachedWriteTokens}`);
  if (cachedReadTokens) parts.push(`cached_read: ${cachedReadTokens}`);
  return <Tag>{parts.join(', ')}</Tag>;
}

function formatPrice(value: number) {
  if (!Number.isFinite(value)) return '0';
  return value.toFixed(6).replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
}

function normalizeDollarPrice(price: any) {
  if (price === null || price === undefined) return '';
  const s = String(price).trim();
  if (!s) return '';
  return s.replace(/^\$/, '').replace(/\s*\/\s*M\s*$/i, '');
}

function getStoredPageSize() {
  const v = Number(localStorage.getItem('page_size_log') || 10);
  return Number.isFinite(v) && v > 0 ? v : 10;
}

function setStoredPageSize(v: number) {
  localStorage.setItem('page_size_log', String(v));
}

export default function LogPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(() => ({ page: 0, pageSize: 10, total: 0 }));
  const [stats, setStats] = useState({ rpm: 0, tpm: 0, quota: 0 });
  const originalKeyword = useMemo(
    () => ({
      username: '',
      token_name: '',
      model_name: '',
      start_timestamp: dayjs().startOf('day').unix(),
      end_timestamp: dayjs().endOf('day').unix(),
      log_type: '0',
      channel_id: '',
      source_ip: '',
      request_ip: '',
    }),
    []
  );

  const [toolBarValue, setToolBarValue] = useState<any>(originalKeyword);
  const [searchKeyword, setSearchKeyword] = useState<any>(originalKeyword);
  const [hasSearchChanges, setHasSearchChanges] = useState(false);
  const [orderBy, setOrderBy] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  const userIsAdmin = useSelector((state: any) => state.account.user?.role >= 10);
  const userGroup = useSelector((state: any) => state.account.userGroup);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => ({
    created_at: true,
    channel_id: true,
    user_id: true,
    group: true,
    token_name: true,
    type: true,
    model_name: true,
    duration: true,
    prompt_tokens: true,
    completion_tokens: true,
    quota: true,
    source_ip: true,
    request_ip: true,
    content: true,
  }));

  const LOG_TYPES = {
    0: { text: t('logPage.logType.all'), color: '' },
    1: { text: t('logPage.logType.recharge'), color: 'blue' },
    2: { text: t('logPage.logType.consumption'), color: 'orange' },
    3: { text: t('logPage.logType.management'), color: 'default' },
    4: { text: t('logPage.logType.system'), color: 'cyan' },
    5: { text: '签到', color: 'blue' },
    6: { text: '登录', color: 'blue' },
    7: { text: '错误', color: 'error' },
  };

  const columns = useMemo(() => {
    const cols: any[] = [];

    if (columnVisibility.created_at) {
      cols.push({
        title: t('logPage.timeLabel'),
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        sorter: true,
        render: (text: number) => timestamp2string(text),
      });
    }

    if (userIsAdmin && columnVisibility.channel_id) {
      cols.push({
        title: t('logPage.channelLabel'),
        dataIndex: 'channel_id',
        key: 'channel_id',
        width: 110,
        render: (v: any, record: any) => (
          <div>
            <div>{v ?? '-'}</div>
            {record.channel?.name ? <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>({record.channel.name})</div> : null}
          </div>
        ),
      });
    }

    if (userIsAdmin && columnVisibility.user_id) {
      cols.push({
        title: t('logPage.userLabel'),
        dataIndex: 'username',
        key: 'user_id',
        width: 180,
        render: (text: string, record: any) => <span>{text} (ID: {record.user_id})</span>,
      });
    }

    if (columnVisibility.group) {
      cols.push({
        title: t('logPage.groupLabel'),
        key: 'group',
        width: 160,
        render: (_: any, record: any) => {
          const metadata = record?.metadata || {};
          const groupName = metadata?.group_name || '';
          const backupGroupName = metadata?.backup_group_name || '';
          const isBackup = Boolean(metadata?.is_backup_group);
          if (!groupName && !backupGroupName) return '-';
          if (isBackup && groupName && backupGroupName) {
            return (
              <Space size={6}>
                <Tag>
                  {userGroup?.[groupName]?.name || groupName || t('logPage.groupLabel')}
                </Tag>
                <Tag color="gold">{userGroup?.[backupGroupName]?.name || backupGroupName}</Tag>
              </Space>
            );
          }
          const show = backupGroupName || groupName;
          return <Tag>{userGroup?.[show]?.name || show}</Tag>;
        },
      });
    }

    if (columnVisibility.token_name) {
      cols.push({
        title: t('logPage.tokenLabel'),
        dataIndex: 'token_name',
        key: 'token_name',
        width: 140,
        render: (text: string) => (text ? <Tag>{text}</Tag> : '-'),
      });
    }

    if (columnVisibility.type) {
      cols.push({
        title: t('logPage.typeLabel'),
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (text: number) => {
          const type = LOG_TYPES[Number(text) as keyof typeof LOG_TYPES];
          return type ? <Tag color={type.color}>{type.text}</Tag> : <Tag>Unknown</Tag>;
        },
      });
    }

    if (columnVisibility.model_name) {
      cols.push({
        title: t('logPage.modelLabel'),
        dataIndex: 'model_name',
        key: 'model_name',
        width: 180,
        render: (text: string, record: any) => (
          <Space size={6} wrap>
            {text ? <Tag color="geekblue">{text}</Tag> : '-'}
            {record.is_stream ? <Tag color="processing">Stream</Tag> : null}
          </Space>
        ),
      });
    }

    if (columnVisibility.duration) {
      cols.push({
        title: (
          <Tooltip title={t('logPage.durationTooltip')}>
            <span>{t('logPage.durationLabel')}</span>
          </Tooltip>
        ),
        key: 'duration',
        width: 120,
        render: (_: any, record: any) => {
          if (Number(record.type) !== 2) return '-';
          const time = (record.request_time || 0) / 1000;
          const first = record?.metadata?.first_response ? record.metadata.first_response / 1000 : 0;
          const streamTime = Math.max(time - first, 0);
          let requestTs: string | null = null;
          if (first > 0 && record.completion_tokens > 0 && streamTime > 0) {
            requestTs = `${(record.completion_tokens / streamTime).toFixed(2)} t/s`;
          }
          return (
            <Space direction="vertical" size={0}>
              <span>{time > 0 ? `${time.toFixed(2)}s${first ? ` / ${first.toFixed(2)}s` : ''}` : '-'}</span>
              {requestTs ? <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{requestTs}</span> : null}
            </Space>
          );
        },
      });
    }

    if (columnVisibility.prompt_tokens) {
      cols.push({
        title: t('logPage.inputLabel'),
        dataIndex: 'prompt_tokens',
        key: 'prompt_tokens',
        width: 90,
        render: (val: number, record: any) => (Number(record.type) === 2 ? val ?? '-' : '-'),
      });
    }

    if (columnVisibility.completion_tokens) {
      cols.push({
        title: t('logPage.outputLabel'),
        dataIndex: 'completion_tokens',
        key: 'completion_tokens',
        width: 90,
        render: (val: number, record: any) => (Number(record.type) === 2 ? val ?? '-' : '-'),
      });
    }

    if (columnVisibility.quota) {
      cols.push({
        title: t('logPage.quotaLabel'),
        dataIndex: 'quota',
        key: 'quota',
        width: 160,
        render: (text: number, record: any) => {
          if (Number(record.type) !== 2) return text ? text : '-';
          const groupRatio = Number(record?.metadata?.group_ratio || 1);
          const originalQuota = record?.metadata?.original_quota || record?.metadata?.origin_quota;
          const calculatedOriginalQuota = groupRatio ? text / groupRatio : originalQuota;

          const quotaNode = <span>{renderQuota(text, 6)}</span>;
          if (groupRatio < 1 && calculatedOriginalQuota) {
            return (
              <Tooltip title={`${t('logPage.quotaDetail.originalBilling')}: ${renderQuota(calculatedOriginalQuota, 6)}`}>
                <span>
                  <span style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'line-through', marginRight: 8 }}>
                    {renderQuota(calculatedOriginalQuota, 6)}
                  </span>
                  {quotaNode}
                </span>
              </Tooltip>
            );
          }
          return quotaNode;
        },
      });
    }

    if (userIsAdmin && columnVisibility.source_ip) {
      // cols.push({
      //   title: t('logPage.sourceIp'),
      //   dataIndex: 'source_ip',
      //   key: 'source_ip',
      //   width: 140,
      //   render: (v: any) => v || '-',
      // });
    }

    if (columnVisibility.request_ip) {
      cols.push({
        title: t('logPage.requestIPLabel'),
        dataIndex: 'request_ip',
        key: 'request_ip',
        width: 140,
        render: (v: any) => v || '-',
      });
    }

    if (columnVisibility.content) {
      cols.push({
        title: t('logPage.detailLabel'),
        dataIndex: 'content',
        key: 'content',
        render: (_: any, record: any) => {
          if (Number(record.type) !== 2) return record.content || '';
          const metadata = record.metadata || {};
          const cachedTokens = renderCachedTokens(metadata);
          const free = (record.quota === 0 || record.quota === undefined) && record.type === 2;

          if (!metadata?.input_ratio) {
            return (
              <Space size={6} wrap>
                {cachedTokens}
                {free ? <Tag color="success">{t('logPage.content.free')}</Tag> : <span>{record.content || ''}</span>}
              </Space>
            );
          }

          const groupDiscount = Number(metadata?.group_ratio || 1);
          const priceType = metadata?.price_type || '';
          const originalOutputRatio = Number(metadata?.output_ratio || 0);
          const originalInputRatio = Number(metadata?.input_ratio || 0);

          if (priceType === 'times') {
            // Mirror `web`: calculatePrice(ratio, groupRatio, true) => $/times
            const fromMetadata = normalizeDollarPrice(metadata?.input_price);
            const timesPrice = fromMetadata || formatPrice(originalInputRatio * groupDiscount * 0.002);
            return (
              <Space size={6} wrap>
                {cachedTokens}
                <Tag color="blue">{t('logPage.content.times_price', { times: timesPrice })}</Tag>
              </Space>
            );
          }

          // Mirror `web` pricing: `ratio * group_ratio * 1000 * 0.002` => `$ /M`
          const inputPrice = normalizeDollarPrice(metadata?.input_price) || formatPrice(originalInputRatio * groupDiscount * 2);
          const outputPrice = normalizeDollarPrice(metadata?.output_price) || formatPrice(originalOutputRatio * groupDiscount * 2);

          return (
            <Space size={6} wrap>
              {cachedTokens}
              <Tag color="blue">{t('logPage.content.input_price', { price: inputPrice })}</Tag>
              <Tag color="blue">{t('logPage.content.output_price', { price: outputPrice })}</Tag>
            </Space>
          );
        },
      });
    }

    return cols;
  }, [LOG_TYPES, columnVisibility, t, userGroup, userIsAdmin]);

  const fetchLogs = async (page = 0, pageSize = pagination.pageSize, keyword = searchKeyword) => {
    setLoading(true);
    try {
      const url = userIsAdmin ? '/api/log/' : '/api/log/self/';
      const cleanKeyword = { ...keyword };
      if (!userIsAdmin) {
        delete cleanKeyword.username;
        delete cleanKeyword.channel_id;
        delete cleanKeyword.source_ip;
        delete cleanKeyword.request_ip;
      }
      // remove empty strings
      Object.keys(cleanKeyword).forEach((k) => {
        if (typeof cleanKeyword[k] === 'string' && cleanKeyword[k].trim() === '') delete cleanKeyword[k];
      });

      const orderParam = orderBy ? (order === 'desc' ? `-${orderBy}` : orderBy) : '';

      const params = {
        page: page + 1,
        size: pageSize,
        order: orderParam,
        ...cleanKeyword
      };
      
      const res = await API.get(url, { params });
      const { success, message: msg, data, stat } = res.data;
      if (success) {
        setLogs(data.data);
        setPagination({ page, pageSize, total: data.total_count });
        if (stat) {
          setStats({
            rpm: stat.rpm || 0,
            tpm: stat.tpm || 0,
            quota: stat.quota || 0
          });
        }
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // init page size from localStorage once on client
    const ps = getStoredPageSize();
    setPagination((p) => ({ ...p, pageSize: ps }));
  }, []); // Initial load

  useEffect(() => {
    // auto-load when searchKeyword/order/pageSize changes
    fetchLogs(pagination.page, pagination.pageSize, searchKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize, searchKeyword, order, orderBy]);

  useEffect(() => {
    const hasChanged = JSON.stringify(toolBarValue) !== JSON.stringify(searchKeyword);
    setHasSearchChanges(hasChanged);
  }, [toolBarValue, searchKeyword]);

  const handleSearch = () => {
    setPagination((p) => ({ ...p, page: 0 }));
    setSearchKeyword(toolBarValue);
  };

  const handleResetAndRefresh = () => {
    setOrderBy('created_at');
    setOrder('desc');
    setToolBarValue(originalKeyword);
    setSearchKeyword(originalKeyword);
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const columnOptions = useMemo(() => {
    const items = [
      { key: 'created_at', label: t('logPage.timeLabel') },
      ...(userIsAdmin ? [{ key: 'channel_id', label: t('logPage.channelLabel') }] : []),
      ...(userIsAdmin ? [{ key: 'user_id', label: t('logPage.userLabel') }] : []),
      { key: 'group', label: t('logPage.groupLabel') },
      { key: 'token_name', label: t('logPage.tokenLabel') },
      { key: 'type', label: t('logPage.typeLabel') },
      { key: 'model_name', label: t('logPage.modelLabel') },
      { key: 'duration', label: t('logPage.durationLabel') },
      { key: 'prompt_tokens', label: t('logPage.inputLabel') },
      { key: 'completion_tokens', label: t('logPage.outputLabel') },
      { key: 'quota', label: t('logPage.quotaLabel') },
      ...(userIsAdmin ? [{ key: 'source_ip', label: t('logPage.sourceIp') }] : []),
      { key: 'request_ip', label: t('logPage.requestIPLabel') },
      { key: 'content', label: t('logPage.detailLabel') },
    ];
    return items;
  }, [t, userIsAdmin]);

  return (
    <div>
      {/* <Title level={2}>{t('logPage.title')}</Title> */}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('logPage.quota')} value={renderQuota(stats.quota, 6)} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('logPage.rpm')} value={stats.rpm} suffix="req/min" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title={t('logPage.tpm')} value={stats.tpm} suffix="token/min" />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Tabs
            activeKey={toolBarValue.log_type}
            onChange={(key) => setToolBarValue((v: any) => ({ ...v, log_type: key }))}
            items={Object.entries(LOG_TYPES).map(([key, value]) => ({ key, label: value.text }))}
            destroyOnHidden
            size="middle"
          />

          <Row gutter={[16, 16]} align="middle">
            <Col>
              <RangePicker
                showTime
                value={[dayjs.unix(toolBarValue.start_timestamp), dayjs.unix(toolBarValue.end_timestamp)]}
                onChange={(dates) => {
                  if (!dates || !dates[0] || !dates[1]) return;
                  setToolBarValue((v: any) => ({
                    ...v,
                    start_timestamp: dates[0]!.unix(),
                    end_timestamp: dates[1]!.unix(),
                  }));
                }}
                size="middle"
              />
            </Col>
            <Col>
              <Input
                placeholder={t('logPage.tokenLabel')}
                style={{ width: 160 }}
                value={toolBarValue.token_name}
                onChange={(e) => setToolBarValue((v: any) => ({ ...v, token_name: e.target.value }))}
                size="middle"
              />
            </Col>
            <Col>
              <Input
                placeholder={t('logPage.modelLabel')}
                style={{ width: 160 }}
                value={toolBarValue.model_name}
                onChange={(e) => setToolBarValue((v: any) => ({ ...v, model_name: e.target.value }))}
                size="middle"
              />
            </Col>
            {userIsAdmin ? (
              <>
                <Col>
                  <Input
                    placeholder={t('logPage.userLabel')}
                    style={{ width: 160 }}
                    value={toolBarValue.username}
                    onChange={(e) => setToolBarValue((v: any) => ({ ...v, username: e.target.value }))}
                    size="middle"
                  />
                </Col>
                <Col>
                  <Input
                    placeholder={t('logPage.channelLabel')}
                    style={{ width: 140 }}
                    value={toolBarValue.channel_id}
                    onChange={(e) => setToolBarValue((v: any) => ({ ...v, channel_id: e.target.value }))}
                    size="middle"
                  />
                </Col>
                <Col>
                  <Input
                    placeholder={t('logPage.sourceIp')}
                    style={{ width: 160 }}
                    value={toolBarValue.source_ip}
                    onChange={(e) => setToolBarValue((v: any) => ({ ...v, source_ip: e.target.value }))}
                    size="middle"
                  />
                </Col>
              </>
            ) : null}
            <Col>
              <Input
                placeholder={t('logPage.requestIPLabel')}
                style={{ width: 160 }}
                value={toolBarValue.request_ip}
                onChange={(e) => setToolBarValue((v: any) => ({ ...v, request_ip: e.target.value }))}
                size="middle"
              />
            </Col>

            <Col>
              <Button type={hasSearchChanges ? 'primary' : 'default'} icon={<SearchOutlined />} onClick={handleSearch} disabled={loading} size="middle">
                {t('logPage.searchButton') || t('common.search')}
              </Button>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={handleResetAndRefresh} disabled={loading} size="middle">
                {t('logPage.refreshButton') || t('common.refresh')}
              </Button>
            </Col>
            <Col flex="none">
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <div style={{ width: 260 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Button
                        size="middle"
                        onClick={() => {
                          const keys = columnOptions.map((o) => o.key);
                          const allVisible = keys.every((k) => columnVisibility[k]);
                          const next: any = { ...columnVisibility };
                          keys.forEach((k) => (next[k] = !allVisible));
                          setColumnVisibility(next);
                        }}
                      >
                        {t('logPage.columnSelectAll')}
                      </Button>
                      <Button
                        size="middle"
                        onClick={() => {
                          const next: any = { ...columnVisibility };
                          Object.keys(next).forEach((k) => (next[k] = true));
                          setColumnVisibility(next);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <Checkbox.Group
                      value={columnOptions.map((o) => o.key).filter((k) => columnVisibility[k])}
                      onChange={(checkedKeys) => {
                        const checked = new Set(checkedKeys as string[]);
                        const next: any = { ...columnVisibility };
                        Object.keys(next).forEach((k) => (next[k] = checked.has(k)));
                        // ensure admin-only columns don't get forced on for non-admin
                        if (!userIsAdmin) {
                          next.channel_id = false;
                          next.user_id = false;
                          next.source_ip = false;
                        }
                        setColumnVisibility(next);
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                      options={columnOptions.map((o) => ({ label: o.label, value: o.key }))}
                    />
                  </div>
                }
              >
                <Button icon={<SettingOutlined />} size="middle">{t('logPage.columnSettings')}</Button>
              </Popover>
            </Col>
          </Row>
        </Space>

        <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            loading={loading}
            onChange={(p: any, _filters: any, sorter: any) => {
              const current = (p?.current ?? 1) - 1;
              const pageSize = p?.pageSize ?? pagination.pageSize;
              setPagination((prev) => ({ ...prev, page: current, pageSize }));
              if (pageSize !== pagination.pageSize) setStoredPageSize(pageSize);

              if (sorter && sorter.field) {
                const nextOrder = sorter.order === 'ascend' ? 'asc' : sorter.order === 'descend' ? 'desc' : 'desc';
                setOrder(nextOrder);
                setOrderBy(sorter.field);
              }
            }}
            expandable={{
              expandedRowRender: (record: any) => <QuotaDetail item={record} userGroup={userGroup} />,
              rowExpandable: (record: any) => Number(record?.type) === 2,
            }}
            pagination={{
                current: pagination.page + 1,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
            }}
            scroll={{ x: 1600 }}
            size='middle' 
        />
      </Card>
    </div>
  );
}
