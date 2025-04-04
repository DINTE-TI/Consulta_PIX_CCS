'use client'

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Context } from '../../context';

const LoginPage = () => {

  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { state, dispatch } = React.useContext(Context);

  const onLoginPressed = async () => {
    const authData = {
      email: email,
      password: password
    }

    var options = {
      method: 'POST',
      url: '/api/user/login',
      headers: { 'Content-Type': 'application/json' },
      data: authData
    };

    try {
      const data = await axios.request(options)
      if (data.data.status === 201) {
        document.cookie = `token=${data.data.token}; path=/`;
        localStorage.setItem('userInfo', JSON.stringify(data.data))
        dispatch({ type: 'logIn', payload: data.data })
        router.push('/');
      } else {
        alert(data.data.message)
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          maxWidth: 400,
          width: '100%',
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <AccountBalanceIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color={'primary.main'}>
            Consulta <strong>Pix</strong>
          </Typography>
        </Box>
        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button
            onClick={() => onLoginPressed()}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Image
            src={'/logo_Lab_sm.png'}
            alt='Logo_Lab_sm'
            style={{ alignSelf:'center', margin:'10px' }}
            height={20}
            width={20} />
          <Typography component="p" sx={{ color: 'text.secondary', fontWeight: 300, fontSize: 12 }}>
            PCPI/DIPC/LAB-LD
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage