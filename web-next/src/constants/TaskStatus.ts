export const STATUS_TYPE: Record<string, { value: string; text: string; color: string }> = {
  SUCCESS: { value: 'SUCCESS', text: '成功', color: 'success' },
  NOT_START: { value: 'NOT_START', text: '未启动', color: 'default' },
  SUBMITTED: { value: 'SUBMITTED', text: '队列中', color: 'processing' }, // secondary -> processing
  IN_PROGRESS: { value: 'IN_PROGRESS', text: '执行中', color: 'blue' }, // primary -> blue
  FAILURE: { value: 'FAILURE', text: '失败', color: 'error' }, // orange -> error/warning
  QUEUED: { value: 'QUEUED', text: '排队中', color: 'default' },
  UNKNOWN: { value: 'UNKNOWN', text: '未知', color: 'default' }
};
