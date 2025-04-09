'use client'

// import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
// import AddIcon from '@mui/icons-material/Add';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Box } from '@mui/material';
import axios from 'axios';
import React from 'react';
import withAuth from '../auth/withAuth';
import CustomCard from '../components/Cards/CustomCard';
import { Context } from '../context';

const Dashboard = () => {

  const { state, dispatch } = React.useContext(Context);

  //variável para controle de carregamento de página
  const [loading, setLoading] = React.useState(true)

  // variável para recuperar o CPF do usuário do Context
  const cpfResponsavel = state.cpf
  const token = state.token

  // Chamada da API para Buscar Requisições armazenadas no Banco de Dados
  React.useEffect(() => {
    const atualizaCCS = async () => {
      setLoading(true)
      await axios
        .get(
          "api/utils/processaFilaCCS?cpfResponsavel=" + cpfResponsavel + '&token=' + token
        )
        .then((response) => response.data)
        .catch((err) => console.error(err));
      await axios
        .get(
          "/api/utils/recebeBDVCCS?cpfResponsavel=" + cpfResponsavel + '&token=' + token
        )
        .then((response) => response.data)
        .then((res) => {
          setLoading(false);
        })
        .catch((err) => console.error(err));
    };
    atualizaCCS();
  }, [cpfResponsavel, token])


  return (
    <Box style={{ display: 'flex' }}>
      {/* <Box width="300px" padding="20px">
        <CustomCard
          title="Novo Caso"
          image={"img_card_caso.webp"}
          iconTitle={<AddIcon sx={{ marginRight: 1 }}/>}
          description="Criação de um novo caso para coleta de dados e informações."
          href="/caso/novo"
        />
      </Box> */}
      <Box width="300px" padding="20px">
        <CustomCard
          title="Consulta PIX"
          image={"img_card_pix.webp"}
          iconTitle={<CurrencyExchangeIcon sx={{ marginRight: 1 }} />}
          description="Consulta ao BACEN por CPF, CNPJ ou chave PIX do investigado."
          href="/pix"
        />
      </Box>
      {/* <Box width="300px" padding="20px">
        <CustomCard
          title="Consulta CCS"
          image={"img_card_ccs.png"}
          iconTitle={<AccountBalanceIcon sx={{ marginRight: 1 }} />}
          description="Consulta ao BACEN por CPF ou CNPJ de instituições financeiras vinculadas."
          href="/ccs"
        />
      </Box> */}
    </Box>
  );
}

export default withAuth(Dashboard)
