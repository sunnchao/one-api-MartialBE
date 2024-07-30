import React from 'react';
import { Layout, Menu, Breadcrumb, Message } from '@arco-design/web-react';
import { IconHome, IconCalendar } from '@arco-design/web-react/icon';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

function BaseMenu(props) {
  return (
    <Menu defaultOpenKeys={['1']} defaultSelectedKeys={['0_2']} {...props}>
      <MenuItem key="0_1" disabled>
        <IconHome />
        Menu 1
      </MenuItem>
      <MenuItem key="0_2">
        <IconCalendar />
        Menu 2
      </MenuItem>
      <SubMenu
        key="1"
        title={
          <span>
            <IconCalendar />
            Navigation 1
          </span>
        }
      >
        <MenuItem key="1_1">Menu 1</MenuItem>
        <MenuItem key="1_2">Menu 2</MenuItem>
        <SubMenu key="2" title="Navigation 2">
          <MenuItem key="2_1">Menu 1</MenuItem>
          <MenuItem key="2_2">Menu 2</MenuItem>
        </SubMenu>
        <SubMenu key="3" title="Navigation 3">
          <MenuItem key="3_1">Menu 1</MenuItem>
          <MenuItem key="3_2">Menu 2</MenuItem>
          <MenuItem key="3_3">Menu 3</MenuItem>
        </SubMenu>
      </SubMenu>
      <SubMenu
        key="4"
        title={
          <span>
            <IconCalendar />
            Navigation 4
          </span>
        }
      >
        <MenuItem key="4_1">Menu 1</MenuItem>
        <MenuItem key="4_2">Menu 2</MenuItem>
        <MenuItem key="4_3">Menu 3</MenuItem>
      </SubMenu>
    </Menu>
  );
}

export default function MenuSider() {
  return (
    <BaseMenu
      onClickMenuItem={(key) =>
        Message.info({
          content: `You select ${key}`,
          showIcon: true
        })
      }
      theme="dark"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
