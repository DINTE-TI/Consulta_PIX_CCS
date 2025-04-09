'use client'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import * as React from 'react';
import { MainListItems, SecondaryListItems } from './ItensMenu';
import { MenuContext } from './menuContext';

const drawerWidth = 240;

const LogoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  transition: 'all 0.3s ease'
});

const ToggleButton = styled(IconButton)(({ theme, open }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  padding: '10px 0',
  backgroundColor: '#f5f5f5',
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'all 0.3s ease',
}));

const DrawerContainer = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : theme.spacing(7),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export default function MiniDrawer() {
  const { state, dispatch } = React.useContext(MenuContext)
  const [open, setOpen] = React.useState(state.open)

  const handleDrawerToggle = () => {
    const newState = !open;
    dispatch({ type: 'setMenu', payload: newState })
    setOpen(newState)
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerContainer>
        <LogoContainer>
          <Image
            src={open ? '/Logo_Lab.jpg' : '/logo_Lab_sm.png'}
            alt='Logo Lab'
            height={open ? 78 : 40}
            width={open ? 220 : 40}
            style={{
              transition: 'all 0.3s ease'
            }}
          />
        </LogoContainer>

        <List><MainListItems /></List>
        <List style={{ marginTop: 'auto' }}><SecondaryListItems /></List>

        <ToggleButton
          onClick={handleDrawerToggle}
          open={open}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </ToggleButton>
      </DrawerContainer>
    </Drawer>
  );
}