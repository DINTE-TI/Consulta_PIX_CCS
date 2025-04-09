'use client'

import { GeistSans } from 'geist/font/sans';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import * as React from 'react';
import { Context } from '/src/app/context';
import CustomListItem from './CustomListItem';
import AddIcon from '@mui/icons-material/Add';

export const MainListItems = () => {

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  }

  return (
    <div>
      <CustomListItem
        href="/"
        text="Visão Geral"
        icon={<DashboardIcon style={{ color: "#0a243b" }} />}
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      />
      {/* <CustomListItem
        href="/caso/novo"
        text="Novo Caso"
        icon={<AddIcon style={{ color: "#0a243b" }} />}
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      /> */}
      <CustomListItem
        href="/pix"
        text="PIX"
        icon={<CurrencyExchangeIcon style={{ color: "#0a243b" }} />}
        selected={selectedIndex === 0}
        onClick={(event) => handleListItemClick(event, 0)}
      />
      {/* <CustomListItem
        href="/ccs"
        text="CCS"
        icon={<AccountBalanceIcon style={{ color: "#0a243b" }} />}
        selected={selectedIndex === 2}
        onClick={(event) => handleListItemClick(event, 2)}
      /> */}
    </div >
  )
};


export const SecondaryListItems = () => {
  const { state } = React.useContext(Context)

  return (
    <div>
      {
        state.admin && (
          <>
            <ListItem button component={Link} href="/user">
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Usuários" sx={{ fontFamily: `${GeistSans.classname}` }} />
            </ListItem>
          </>
        )
      }
      <ListItem button component={Link} href="/auth/logout">
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Sair" sx={{ fontFamily: `${GeistSans.classname}` }} />
      </ListItem>
    </div>
  );
}