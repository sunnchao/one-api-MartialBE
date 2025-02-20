import PropTypes from 'prop-types';
import Label from 'ui-component/Label';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

const GroupLabel = ({ group }) => {
  let groups = [];
  if (group === '') {
    groups = ['default'];
  } else {
    groups = group.split(',');
    groups.sort();
  }
  return (
    <Stack spacing={0.5} direction={'row'} useFlexGap flexWrap={'wrap'}>
      {groups.map((group, index) => {
        return <Label key={index}>{group}</Label>;
      })}
    </Stack>
  );
};

GroupLabel.propTypes = {
  group: PropTypes.string
};

export default GroupLabel;
