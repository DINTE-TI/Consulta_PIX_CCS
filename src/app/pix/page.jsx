'use client'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Box from "@mui/material/Box";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import axios from "axios";
import Link from 'next/link';
import { Suspense, useContext, useEffect, useState } from 'react';
import CustomActionButton from '../components/Buttons/CustomActionButton';
import { Context } from '../context';
import withAuth from '/src/app/auth/withAuth';

import PIXRow from './components/PIXRow';

const DashPIX = () => {

  const { state, dispatch } = useContext(Context);


  //variável para controle de carregamento de página
  const [loading, setLoading] = useState(true)

  // variável para armazenar a lista de Requisições exibidas no FrontEnd
  const [requisicoesPIX, setRequisicoesPIX] = useState([]);

  const cpfResponsavel = state.cpf;
  const token = state.token;

  // Chamada da API para Buscar Requisições armazenadas no Banco de Dados

  useEffect(() => {
    const buscaRequisicoes = async () => {
      setLoading(true)
      await axios
        .get(
          "/api/bacen/pix/requisicoespix?cpfCnpj=" + cpfResponsavel + '&token=' + token
        )
        .then((response) => response.data)
        .then((res) => {
          setRequisicoesPIX(res)
          setLoading(false);
        })
        .catch((err) => console.error(err));
    };
    buscaRequisicoes();
  }, [cpfResponsavel, token])


  // Componente DIALOG (popup) para mostrar que a página está sendo carregada

  function LoadingDialog() {
    return (
      <>
        <Dialog open={loading}>
          <DialogTitle>
            Carregando...
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Por favor, aguarde.
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Box style={{ margin: 10 }}>
      <Breadcrumbs aria-label="breadcrumb" separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">
          <HomeIcon sx={{ mt: 1, color: 'gray' }} />
        </Link>
        <Typography sx={{ color: 'text.primary', fontWeight: 'bold' }}>Solicitações Pix</Typography>
      </Breadcrumbs>
      <Grid item xs={5} md={5} mb={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }} >
        <Link href="/pix/novo">
          <CustomActionButton icon={<AddCircleOutlineIcon sx={{ marginRight: '5px' }} />} text="Nova Solicitação" />
        </Link>
      </Grid>
      <Grid container spacing={2}>
        {
          loading ?
            <LoadingDialog />
            :
            <>
              <Suspense fallback={<p>CARREGANDO REQUISIÇÕES PIX...</p>}>
                <PIXRow requisicoes={requisicoesPIX} />
              </Suspense>
            </>
        }
      </Grid>
    </Box>
  )
}

export default withAuth(DashPIX)
