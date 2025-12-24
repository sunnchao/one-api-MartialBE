export const ACTION_TYPE: Record<string, { value: string; text: string; color: string }> = {
  IMAGINE: { value: 'IMAGINE', text: '绘图', color: 'blue' },
  UPSCALE: { value: 'UPSCALE', text: '放大', color: 'orange' },
  VARIATION: { value: 'VARIATION', text: '变换', color: 'default' },
  HIGH_VARIATION: { value: 'HIGH_VARIATION', text: '强变换', color: 'default' },
  LOW_VARIATION: { value: 'LOW_VARIATION', text: '弱变换', color: 'default' },
  PAN: { value: 'PAN', text: '平移', color: 'cyan' },
  DESCRIBE: { value: 'DESCRIBE', text: '图生文', color: 'cyan' },
  BLEND: { value: 'BLEND', text: '图混合', color: 'cyan' },
  SHORTEN: { value: 'SHORTEN', text: '缩词', color: 'cyan' },
  REROLL: { value: 'REROLL', text: '重绘', color: 'cyan' },
  INPAINT: { value: 'INPAINT', text: '局部重绘-提交', color: 'cyan' },
  ZOOM: { value: 'ZOOM', text: '变焦', color: 'cyan' },
  CUSTOM_ZOOM: { value: 'CUSTOM_ZOOM', text: '自定义变焦-提交', color: 'cyan' },
  MODAL: { value: 'MODAL', text: '窗口处理', color: 'cyan' },
  SWAP_FACE: { value: 'SWAP_FACE', text: '换脸', color: 'cyan' },
  UPLOAD: { value: 'UPLOAD', text: '上传文件', color: 'cyan' }
};

export const CODE_TYPE: Record<number, { value: number; text: string; color: string }> = {
  1: { value: 1, text: '已提交', color: 'blue' },
  21: { value: 21, text: '等待中', color: 'orange' },
  22: { value: 22, text: '重复提交', color: 'default' },
  0: { value: 0, text: '未提交', color: 'default' }
};

export const STATUS_TYPE: Record<string, { value: string; text: string; color: string }> = {
  SUCCESS: { value: 'SUCCESS', text: '成功', color: 'success' },
  NOT_START: { value: 'NOT_START', text: '未启动', color: 'default' },
  SUBMITTED: { value: 'SUBMITTED', text: '队列中', color: 'cyan' },
  IN_PROGRESS: { value: 'IN_PROGRESS', text: '执行中', color: 'blue' },
  FAILURE: { value: 'FAILURE', text: '失败', color: 'error' },
  MODAL: { value: 'MODAL', text: '窗口等待', color: 'default' }
};
