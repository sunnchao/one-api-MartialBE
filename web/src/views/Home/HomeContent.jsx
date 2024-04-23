import {
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableHead,
  TableCell,
  TableRow,
  Chip,
  List,
  Typography,
  TableBody,
  ListItem,
  ButtonBase
} from '@mui/material';
import { Box } from '@mui/system';
import { copy } from '@/utils/common';

const renderModalTable = (data, provider) => {
  function renderReplayTokensColumn(record) {
    return record.timesPrice ? (
      <div>{record.timesPrice}</div>
    ) : record.characterPrice ? (
      <div>{record.characterPrice}</div>
    ) : (
      <Stack direction={'column'} spacing={1}>
        <div>
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={'输入'}
            style={{
              marginRight: 10
            }}
          ></Chip>
          {record.inputTokens + ' / 1k tokens'}
        </div>
        <div>
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={'输出'}
            style={{
              marginRight: 10
            }}
          ></Chip>
          {record.outputTokens + ' / 1k tokens'}
        </div>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction={'column'}>
        <Button variant="outlined">{provider}</Button>
        <>
          <Table size={'small'} disablePadding>
            {
              <TableHead>
                <TableRow>
                  <TableCell size="small" style={{ width: '30%' }}>
                    模型名称
                  </TableCell>
                  {/* <TableCell>官方费率</TableCell> */}
                  <TableCell size="small" style={{ width: '45%' }}>
                    本站费率
                  </TableCell>
                  {/* <TableCell>折扣</TableCell> */}
                  <TableCell>备注</TableCell>
                </TableRow>
              </TableHead>
            }
            {
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    {/* <TableCell>{item.inputTokens}</TableCell> */}
                    <TableCell>{renderReplayTokensColumn(item)}</TableCell>
                    {/* <TableCell>{item.discount}</TableCell> */}
                    <TableCell>
                      <Typography
                        style={{
                          minWidth: '0px'
                        }}
                      >
                        {item.isSupport}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            }
          </Table>
          {/* <Table.Column title="模型名称" dataIndex="name" key="name" width={'33%'} /> */}
          {/*<Table.Column title="官方费率" dataIndex="inputTokens" key="inputTokens" width={'20%'} />*/}
          {/* <Table.Column title="本站费率" dataIndex="outputTokens" key="outputTokens" width={'33%'} render={renderReplayTokensColumn} /> */}
          {/*<Table.Column title="折扣" dataIndex="discount" key="discount" width={'20%'} />*/}
          {/* <Table.Column title="备注" dataIndex="isSupport" key="isSupport" render={renderSupportColumn} /> */}
        </>
      </Stack>
    </Box>
  );
};

const Index = () => {
  const changelog = ['2024-4-15：赠送的额度可直接使用全模型'];

  return (
    <>
      <Stack direction={'column'}>
        <Card>
          <CardContent>
            <Button>更新日志</Button>
            <List disablePadding={true}>
              <ListItem>
                {changelog.map((item, index) => (
                  <div key={index}>{item}</div>
                ))}
              </ListItem>
            </List>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Button>介绍说明</Button>

            <List disablePadding>
              <ListItem>OpenAI 接口转发站</ListItem>
              <ListItem>本站渠道来源：官网正规渠道 、 逆向解析渠道 、 上游代理渠道</ListItem>
              <ListItem>支持模型请查看下方模型介绍</ListItem>
              <ListItem>
                使用过程中有问题请发邮件至
                <a href="mailto:chirou.api@outlook.com">chirou.api@outlook.com</a>
              </ListItem>
              <ListItem>
                <Typography>
                  每位注册用户都将获得 <Chip color={'error'} label={'$1'} size="small" variant="outlined"></Chip> 的初始使用额度,
                  邀请新用户奖励
                  <Chip color={'error'} label={'$0.5'} size="small" variant="outlined"></Chip>的额度, 可使用全模型
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  当前仅支持 <Chip color={'error'} label={'Github'} size="small" variant="outlined"></Chip>{' '}
                  <Chip color={'error'} label={'QQ'} size="small" variant="outlined"></Chip>
                  <Chip color={'error'} label={'Gmail'} size="small" variant="outlined"></Chip>的账号注册 ，谢谢🙏
                </Typography>
              </ListItem>
              <ListItem>为了维持转发服务正常使用，将不定期清除非法用户，请使用真实邮箱注册</ListItem>
              <ListItem>
                <Typography>
                  受供应商和OpenAI政策影响，价格会随时调整，本站充值汇率为
                  <Chip color={'error'} label={'2元=1刀'} size="small" variant="outlined"></Chip>（模型计费详情请查看下方表格）
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Button>使用方法</Button>

            <List disablePadding>
              <ListItem>注册完成后，创建一个令牌，复制令牌的 key 填写到对应的地方</ListItem>
              <ListItem>
                <Typography>
                  接口转发地址请修改为：
                  <Chip
                    onClick={() => copy('https://api.wochirou.com', 'https://api.wochirou.com')}
                    size="small"
                    label="https://api.wochirou.com"
                    style={{
                      margin: '0 5px'
                    }}
                  ></Chip>
                  即可使用
                </Typography>
              </ListItem>
              <ListItem>严令禁止使用api进行非法行为。系统每隔一段时间会定时清理日志记录，请知悉。</ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Button>兑换码购买</Button>
            <List disablePadding>
              <ListItem>
                <Typography>
                  地址：
                  <Button variant={'contained'} type="primary" size="small" onClick={() => window.open('https://shop.wochirou.com/')}>
                    点击购买
                  </Button>
                  【<Button onClick={() => window.open('https://www.zaofaka.com/links/F8373848')}>备用购买地址</Button>
                  】购买完成后，在充值的地方输入兑换码
                </Typography>
              </ListItem>
              {/*<li>*/}
              {/*  购买10美金以上额度可升级为VIP用户（需手工处理，会存在时间延迟，如出现问题请发邮件）*/}
              {/*</li>*/}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Button>模型及计费介绍</Button>
            <Stack direction={'column'} spacing={1}>
              <List disablePadding>
                <ListItem>
                  <Typography type={'secondary'}>本页面更新可能存在延迟，实际可用模型及计费请以设置页以及日志页为准</Typography>
                </ListItem>
                <ListItem>
                  {renderModalTable(
                    [
                      {
                        name: 'gpt-3.5-turbo',
                        inputTokens: '$0.003',
                        outputTokens: '$0.006',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-0125',
                        inputTokens: '$0.0005',
                        outputTokens: '$0.0015',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-0301',
                        inputTokens: '$0.0015',
                        outputTokens: '$0.002',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-0613',
                        inputTokens: '$0.0015',
                        outputTokens: '$0.002',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-1106',
                        inputTokens: '$0.001',
                        outputTokens: '$0.002',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-16k',
                        inputTokens: '$0.0015',
                        outputTokens: '$0.002',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-3.5-turbo-16k-0613',
                        inputTokens: '$0.003',
                        outputTokens: '$0.004',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4',
                        inputTokens: '$0.03',
                        outputTokens: '$0.06',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-0613',
                        inputTokens: '$0.03',
                        outputTokens: '$0.06',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-0125-preview',
                        inputTokens: '$0.01',
                        outputTokens: '$0.03',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-1106-preview',
                        inputTokens: '$0.01',
                        outputTokens: '$0.03',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-vision-preview',
                        inputTokens: '$0.01',
                        outputTokens: '$0.03',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-turbo-2024-04-09',
                        inputTokens: '$0.03',
                        outputTokens: '$0.06',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-turbo-preview',
                        inputTokens: '$0.01',
                        outputTokens: '$0.03',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-32k',
                        inputTokens: '$0.06',
                        outputTokens: '$0.12',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-32k-0613',
                        inputTokens: '$0.06',
                        outputTokens: '$0.12',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-32k-0314',
                        inputTokens: '$0.06',
                        outputTokens: '$0.12',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 1024x1024',
                        timesPrice: '$0.1 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 1024x1792',
                        timesPrice: '$0.2 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 1792x1792',
                        timesPrice: '$0.2 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 hd 1024x1024',
                        timesPrice: '$0.2 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 hd 1024x1792',
                        timesPrice: '$0.3 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'dall-e-3 hd 1792x1792',
                        timesPrice: '$0.3 每次',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-v',
                        timesPrice: '$0.1 每次, 轻度 GPT-4 用户性价比远超官网',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-dalle',
                        timesPrice: '$0.1 每次, 轻度 GPT-4 用户性价比远超官网',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-all',
                        timesPrice: '$0.1 每次, 轻度 GPT-4 用户性价比远超官网',
                        isSupport: '支持'
                      },
                      {
                        name: 'gpt-4-gizmo-*',
                        timesPrice: '$0.1 每次, 轻度 GPT-4 用户性价比远超官网'
                      },
                      {
                        name: 'tts-1',
                        characterPrice: '$0.015 / 1k characters',
                        isSupport: '支持'
                      },
                      {
                        name: 'tts-1-1106',
                        characterPrice: '$0.015 / 1k characters',
                        isSupport: '支持'
                      },
                      {
                        name: 'tts-1-hd',
                        characterPrice: '$0.03 / 1k characters',
                        isSupport: '支持'
                      },
                      {
                        name: 'tts-1-hd-1106',
                        characterPrice: '$0.03 / 1k characters',
                        isSupport: '支持'
                      }
                    ],
                    'OpenAI'
                  )}
                </ListItem>
                <ListItem>
                  {renderModalTable(
                    [
                      {
                        name: 'glm-3-turbo',
                        inputTokens: '$0.0025',
                        outputTokens: '$0.0025',
                        isSupport: '支持'
                      },
                      {
                        name: 'glm-4',
                        inputTokens: '$0.05',
                        outputTokens: '$0.05',
                        isSupport: '支持'
                      },
                      {
                        name: 'glm-4v',
                        inputTokens: '$0.05',
                        outputTokens: '$0.05',
                        isSupport: '支持'
                      }
                    ],
                    'ChatGLM 智谱清言'
                  )}
                </ListItem>
                <ListItem>
                  {renderModalTable(
                    [
                      {
                        name: 'claude-3-opus-20240229',
                        inputTokens: '$0.15',
                        outputTokens: '$0.75',
                        isSupport: '支持'
                      },
                      {
                        name: 'claude-3-sonnet-20240229',
                        inputTokens: '$0.03',
                        outputTokens: '$0.15',
                        isSupport: '支持'
                      },
                      {
                        name: 'claude-3-haiku-20240307',
                        inputTokens: '$0.0025',
                        outputTokens: '$0.0125',
                        isSupport: '支持'
                      }
                    ],
                    'Claude'
                  )}
                </ListItem>
                <ListItem>
                  {renderModalTable(
                    [
                      {
                        name: 'qwen-plus',
                        inputTokens: '$0.1',
                        outputTokens: '$0.1',
                        isSupport: '支持'
                      },
                      {
                        name: 'qwen-plus-net',
                        inputTokens: '$0.1',
                        outputTokens: '$0.1',
                        isSupport: '支持'
                      },
                      {
                        name: 'qwen-turbo',
                        inputTokens: '$0.04',
                        outputTokens: '$0.04',
                        isSupport: '支持'
                      },
                      {
                        name: 'qwen-turbo-net',
                        inputTokens: '$0.04',
                        outputTokens: '$0.04',
                        isSupport: '支持'
                      }
                    ],
                    'DashScope 通义千问'
                  )}
                </ListItem>
                <ListItem>
                  {renderModalTable(
                    [
                      {
                        name: 'llama2-70b-4096',
                        inputTokens: '$0.0007',
                        outputTokens: '$0.0007',
                        isSupport: '支持'
                      },
                      {
                        name: 'mixtral-8x7b-32768',
                        inputTokens: '$0.000405',
                        outputTokens: '$0.000405',
                        isSupport: '支持'
                      }
                    ],
                    '其他'
                  )}
                </ListItem>
              </List>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Typography>
        最后说一句，根据
        <a href="https://www.gov.cn/zhengce/zhengceku/202307/content_6891752.htm">《生成式人工智能服务管理暂行办法》</a>
        规定，本站严格遵守相关规定，请切勿用于非法用途。
      </Typography>
    </>
  );
};

export default Index;
