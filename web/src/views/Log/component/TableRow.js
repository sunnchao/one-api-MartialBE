import PropTypes from 'prop-types';

import { TableRow, TableCell, Stack } from '@mui/material';

import { timestamp2string, renderQuota } from '@/utils/common';
import Label from '@/ui-component/Label';
import LogType from '../type/LogType';

function renderType(type) {
  const typeOption = LogType[type];
  if (typeOption) {
    return (
      <Label variant="filled" color={typeOption.color}>
        {' '}
        {typeOption.text}{' '}
      </Label>
    );
  } else {
    return (
      <Label variant="filled" color="error">
        {' '}
        未知{' '}
      </Label>
    );
  }
}

function requestTimeLabelOptions(request_time) {
  let color = 'error';
  if (request_time === 0) {
    color = 'default';
  } else if (request_time <= 1000) {
    color = 'success';
  } else if (request_time <= 3000) {
    color = 'primary';
  } else if (request_time <= 5000) {
    color = 'secondary';
  }

  return color;
}

function requestTSLabelOptions(request_ts) {
  let color = 'success';
  if (request_ts === 0) {
    color = 'default';
  } else if (request_ts <= 10) {
    color = 'error';
  } else if (request_ts <= 15) {
    color = 'secondary';
  } else if (request_ts <= 20) {
    color = 'primary';
  }

  return color;
}

export default function LogTableRow({ item, userIsAdmin }) {
  let request_time = item.request_time / 1000;
  let request_time_str = request_time.toFixed(2) + ' 秒';
  let request_ts = 0;
  let request_ts_str = '';
  if (request_time > 0 && item.completion_tokens > 0) {
    request_ts = (item.completion_tokens ? item.completion_tokens : 1) / request_time;
    request_ts_str = request_ts.toFixed(2) + ' t/s';
  }

  return (
    <>
      <TableRow tabIndex={item.id}>
        <TableCell>{timestamp2string(item.created_at)}</TableCell>

        {userIsAdmin && (
          <TableCell>
            <Stack direction={'column'}>
              {item.type === 2 ? (
                <>
                  <div>
                    <Label color={'default'} variant={'outlined'}>
                      {' '}
                      {item.channel_id}{' '}
                    </Label>
                  </div>
                  {item.channel?.name}
                </>
              ) : (
                ''
              )}
            </Stack>
          </TableCell>
        )}
        {userIsAdmin && (
          <TableCell>
            <Stack direction={'column'} width={'auto'}>
              <div>
                <Label color={'default'} variant={'outlined'}>
                  {item.user_id}
                </Label>
              </div>
              {item.username}
            </Stack>
          </TableCell>
        )}
        <TableCell>
          {item.token_name && (
            <Label color="default" variant="soft">
              {item.token_name}
            </Label>
          )}
        </TableCell>
        <TableCell>{renderType(item.type)}</TableCell>
        <TableCell>
          {item.model_name && (
            <Label color="primary" variant="outlined">
              {item.model_name}
            </Label>
          )}
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Label color={requestTimeLabelOptions(item.request_time)}> {item.request_time == 0 ? '无' : request_time_str} </Label>
            {request_ts_str && <Label color={requestTSLabelOptions(request_ts)}> {request_ts_str} </Label>}
          </Stack>
        </TableCell>
        <TableCell>{item.prompt_tokens || '0'}</TableCell>
        <TableCell>{item.completion_tokens || '0'}</TableCell>
        <TableCell>{item.quota ? renderQuota(item.quota, 6) : '$0'}</TableCell>
        <TableCell>{item.content}</TableCell>
      </TableRow>
    </>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object,
  userIsAdmin: PropTypes.bool
};
