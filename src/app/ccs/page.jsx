'use client'

import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import axios from "axios";
import Link from 'next/link';
import { Suspense, useContext, useEffect, useState } from 'react';
import { Context } from '../context';
import withAuth from '/src/app/auth/withAuth';
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import Typography from "@mui/material/Typography";

import CCSRow from './components/CCSRow';

const DashCCS = () => {

  const { state, dispatch } = useContext(Context);

  //variável para controle de carregamento de página
  const [loading, setLoading] = useState(true)

  // variável para armazenar a lista de Requisições exibidas no FrontEnd
  const [requisicoesCCS, setRequisicoesCCS] = useState([]);

  // variável para recuperar o CPF do usuário do Context
  const cpfResponsavel = state.cpf
  const token = state.token

  // Chamada da API para Buscar Requisições armazenadas no Banco de Dados

  useEffect(() => {
    const buscaRequisicoes = async () => {
      setLoading(true)
      await axios
        .get(
          "/api/bacen/ccs/requisicoesccs?cpfResponsavel=" + cpfResponsavel + '&token=' + token
        )
        .then((response) => response.data)
        .then((res) => {
          setRequisicoesCCS(res)
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
        <Typography sx={{ color: 'text.primary', fontWeight: 'bold' }}>Solicitações CCS</Typography>
      </Breadcrumbs>
      <Grid container spacing={2}>
        <Grid item xs={5} md={5} style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }} >
          <Link href="/ccs/novo">
            <Button style={{ marginInlineEnd: 20 }} variant="contained" size="small" >
              Nova Solicitação
            </Button>
          </Link>
        </Grid>
        {
          loading ?
            <LoadingDialog />
            :
            <>
              <Suspense fallback={<span>Carregando Requisições CCS...</span>}>
                <CCSRow requisicoes={requisicoesCCS} />
              </Suspense>
            </>
        }

      </Grid>
    </Box>
  )
}

export default withAuth(DashCCS)