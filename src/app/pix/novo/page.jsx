'use client'

import { GeistSans } from 'geist/font/sans';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  Box, Breadcrumbs, Button, Dialog, DialogContent, DialogContentText,
  DialogTitle, FormControl, FormControlLabel, Grid, IconButton, Link,
  Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useContext, useState, useEffect, Fragment } from 'react';
import DialogRequisicoesPIX from '../components/DialogRequisicoesPIX';
import withAuth from '/src/app/auth/withAuth';
import { Context } from '/src/app/context';
import DialogRelatorioPIX from '/src/app/pix/components/Relatorios/ExportaRelatorioPIX';


const INITIAL_SEARCH_VALUES = {
  cpfCnpj: '',
  motivo: '',
  chave: ''
};

const ConsultaPix = () => {
  const [searchType, setSearchType] = useState('cpfCnpj');
  const [searchParams, setSearchParams] = useState([INITIAL_SEARCH_VALUES]);
  const [loading, setLoading] = useState(false);
  const [openDialogRequisicoesPIX, setOpenDialogRequisicoesPIX] = useState(false);
  const [statusRequisicoes, setStatusRequisicoes] = useState(false);
  const [message, setMessage] = useState([]);
  const [deAcordo, setDeAcordo] = useState(false);
  const [lista, setLista] = useState([]);
  const [openDialogRelatorio, setOpenDialogRelatorio] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState();

  const { state } = useContext(Context);
  const { cpf: cpfResponsavel, lotacao, token } = state;

  const queryParams = useSearchParams();
  const selected = queryParams.get('selected');

  useEffect(() => {
    if (selected === 'true') {
      setLoading(true);
      const detalhe = JSON.parse(localStorage.getItem("detalhe"));

      if (detalhe) {
        const newList = [];
        detalhe.forEach(item => {
          if (item.vinculos && item.vinculos.length > 0) {
            newList.push(...item.vinculos);
          }
        });

        setLista(prevLista => [...prevLista, ...newList]);
      }

      setLoading(false);
    }
  }, [selected]);

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
  };

  const addSearchParam = () => {
    const lastIndex = searchParams.length - 1;
    const newParam = {
      cpfCnpj: '',
      chave: '',
      motivo: searchParams[lastIndex].motivo,
    };
    setSearchParams([...searchParams, newParam]);
  };

  const removeSearchParam = (index) => {
    const newParams = [...searchParams];
    newParams.splice(index, 1);
    setSearchParams(newParams);
  };

  const updateSearchParam = (e, index) => {
    const { name, value } = e.target;
    const newParams = [...searchParams];

    if (name === 'cpfCnpj') {
      newParams[index].cpfCnpj = value.replace(/[^0-9]/g, "");
    } else {
      newParams[index][name] = value;
    }

    setSearchParams(newParams);
  };

  const formatCnpjCpf = (value) => {
    const cnpjCpf = value.replace(/\D/g, '');
    if (cnpjCpf.length === 11) {
      return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
    }
    return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
  };

  const formatarData = (data) => {
    return data.match(/\d{2}[-\w\_\.\/]\d{2}[-\w\_\.\/]\d{4}/gi);
  };

  const openExportDialog = (tipo) => {
    setTipoRelatorio(tipo);
    setOpenDialogRelatorio(true);
  };

  const validateSearch = () => {
    if (!deAcordo) {
      alert("Necessário CONCORDAR com os termos da consulta!");
      return false;
    }

    const requiredFields = searchType === 'cpfCnpj'
      ? ['cpfCnpj', 'motivo']
      : ['chave', 'motivo'];

    const hasEmptyFields = searchParams.some(param =>
      requiredFields.some(field => !param[field])
    );

    if (hasEmptyFields) {
      alert("Necessário preencher todos os campos!");
      return false;
    }

    return true;
  };

  const searchByCpfCnpj = async (param, index, array) => {
    try {
      const response = await axios.get(
        `/api/bacen/pix/cpfCnpj?cpfCnpj=${param.cpfCnpj}&motivo=${param.motivo}&cpfResponsavel=${cpfResponsavel}&lotacao=${lotacao}&token=${token}`
      );

      const vinculos = response.data[0];

      if (!vinculos || vinculos.length === 0 ||
        vinculos === 'CPF/CNPJ não encontrado' ||
        vinculos === "Nenhuma Chave PIX encontrada") {
        setMessage(prev => [...prev, { cpfCnpj: param.cpfCnpj, status: vinculos }]);
      } else {
        setMessage(prev => [...prev, { cpfCnpj: param.cpfCnpj, status: 'Recebido com Sucesso' }]);
        setLista(prev => [...prev, ...vinculos]);
      }

      if (index === array.length - 1) {
        setStatusRequisicoes(true);
      }
    } catch (err) {
      console.error(err);
      setMessage(prev => [...prev, { cpfCnpj: param.cpfCnpj, status: 'Erro na consulta' }]);
    }
  };

  const searchByChave = async (param, index, array) => {
    try {
      const response = await axios.get(
        `/api/bacen/pix/chave?chave=${param.chave}&motivo=${param.motivo}&cpfResponsavel=${cpfResponsavel}&lotacao=${lotacao}&token=${token}`
      );

      const vinculo = response.data;

      if (!vinculo || vinculo.length === 0) {
        setMessage(prev => [...prev, { chave: param.chave, status: 'Chave não Encontrada' }]);
      } else {
        setMessage(prev => [...prev, { chave: param.chave, status: 'Recebido com Sucesso' }]);
        setLista(prev => [...prev, ...vinculo]);
      }

      if (index === array.length - 1) {
        setStatusRequisicoes(true);
      }
    } catch (err) {
      console.error(err);
      setMessage(prev => [...prev, { chave: param.chave, status: 'Erro na consulta' }]);
    }
  };

  const handleSearch = async () => {
    if (!validateSearch()) return;

    setOpenDialogRequisicoesPIX(true);
    setMessage([]);
    setStatusRequisicoes(false);

    const searchFunction = searchType === 'cpfCnpj' ? searchByCpfCnpj : searchByChave;

    searchParams.forEach((param, index, array) => {
      searchFunction(param, index, array);
    });

    setSearchParams([INITIAL_SEARCH_VALUES]);
  };

  const clearResults = () => {
    setLista([]);
    setMessage([]);
  };

  const TableRowItem = ({ item, index }) => {
    const [open, setOpen] = useState(false);
    const isEven = index % 2 === 0;

    const getStatusColor = (status) => {
      const statusColors = {
        'ATIVO': {
          bg: '#e6f4ea',
          color: '#34a853',
          border: '#34a853'
        },
        'INATIVO': {
          bg: '#fce8e6',
          color: '#ea4335',
          border: '#ea4335'
        },
        'PORTADA': {
          bg: '#fff8e1',
          color: '#fbbc04',
          border: '#fbbc04'
        }
      };

      return statusColors[status] || {
        bg: '#f1f3f4',
        color: '#5f6368',
        border: '#9aa0a6'
      };
    };

    return (
      <Fragment>
        <TableRow
          sx={{
            '& > *': { borderBottom: 'unset' },
            backgroundColor: isEven ? '#fafbfc' : 'white',
            '&:hover': {
              backgroundColor: '#f5f7f9',
              transition: 'all 0.2s ease'
            },
            transition: 'all 0.2s ease'
          }}
          className={GeistSans.className}
        >
          <TableCell padding="checkbox">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
              sx={{
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell
            component="th"
            scope="row"
            sx={{
              fontWeight: 600,
              color: '#202124',
              fontFamily: 'monospace'
            }}
          >
            {item.chave}
          </TableCell>
          <TableCell sx={{
            color: '#5f6368',
            fontWeight: 500
          }}>
            {item.tipoChave}
          </TableCell>
          <TableCell sx={{
            fontFamily: 'monospace',
            color: '#202124'
          }}>
            {item.cpfCnpj ? formatCnpjCpf(item.cpfCnpj) : null}
          </TableCell>
          <TableCell sx={{
            fontWeight: 500,
            color: '#202124'
          }}>
            {item.nomeProprietario ? item.nomeProprietario.toUpperCase() : null}
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{
                fontWeight: 600,
                color: '#202124'
              }}>
                {item.numerobanco + ' - ' + item.nomebanco}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5f6368' }}>
                Agência: {item.agencia} • Conta: {parseInt(item.numeroConta, 10)} • Tipo: {item.tipoConta}
              </Typography>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: '16px',
                ...getStatusColor(item.status),
                border: '3px solid',
                borderColor: getStatusColor(item.status).border,
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.5,
                whiteSpace: 'nowrap'
              }}
            >
              {item.status}
            </Box>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={7}
          >
            {open && (
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Histórico da Chave
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Evento</TableCell>
                      <TableCell>Motivo</TableCell>
                      <TableCell>CPF/CNPJ</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Banco</TableCell>
                      <TableCell>Abertura Conta</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.eventosVinculo.map((evento, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="evento">{formatarData(evento.dataEvento)}</TableCell>
                        <TableCell>{evento.tipoEvento}</TableCell>
                        <TableCell>{evento.motivoEvento}</TableCell>
                        <TableCell>{evento.cpfCnpj ? formatCnpjCpf(evento.cpfCnpj) : null}</TableCell>
                        <TableCell>{evento.nomeProprietario ? evento.nomeProprietario.toUpperCase() : null}</TableCell>
                        <TableCell>
                          {evento.numerobanco + ' ' + evento.nomebanco}

                          Agência: {evento.agencia}

                          Conta: {parseInt(evento.numeroConta, 10)}

                          Tipo: {evento.tipoConta}
                        </TableCell>
                        <TableCell>{formatarData(evento.dataAberturaConta)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  };

  const LoadingDialog = () => (
    <Dialog open={loading}>
      <DialogTitle>Carregando...</DialogTitle>
      <DialogContent>
        <DialogContentText>Por favor, aguarde.</DialogContentText>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ margin: 2 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link underline="hover" color="inherit" href="/">
          <HomeIcon sx={{ mt: 0.5 }} />
        </Link>
        <Link underline="hover" color="inherit" href="/pix">
          Solicitações Pix
        </Link>
        <Typography sx={{ color: 'text.primary', fontWeight: 'bold' }}>
          Nova Solicitação
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3} justifyContent="space-between">
        {/* Search Type Selection */}
        <Grid item xs={12} md={2}>
          <FormControl sx={{ ml: 2 }}>
            <RadioGroup
              name="search-type"
              value={searchType}
              onChange={handleSearchTypeChange}
            >
              <FormControlLabel
                id="cpf_cnpj"
                value="cpfCnpj"
                control={<Radio size='small' sx={{ p: 0.5 }} />}
                label={<Typography variant="body2">Por CPF/CNPJ</Typography>}
              />
              <FormControlLabel
                value="chave"
                control={<Radio size='small' sx={{ p: 0.5 }} />}
                label={<Typography variant="body2">Por Chave PIX</Typography>}
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Search Parameters */}
        <Grid item xs={12} md={5}>
          {searchParams.map((param, index) => (
            <Grid
              container
              spacing={2}
              alignItems="flex-end"
              key={index}
              sx={{ mb: 1 }}
            >
              <Grid item xs={2}>
                {searchParams.length === 1 ? (
                  <IconButton onClick={addSearchParam} color="primary">
                    <AddCircleOutlineIcon />
                  </IconButton>
                ) : (
                  <Box display="flex">
                    <IconButton onClick={() => removeSearchParam(index)} color="error">
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                    {index === searchParams.length - 1 && (
                      <IconButton onClick={addSearchParam} color="primary">
                        <AddCircleOutlineIcon />
                      </IconButton>
                    )}
                  </Box>
                )}
              </Grid>

              <Grid item xs={10}>
                <Box display="flex" gap={2}>
                  {searchType === 'cpfCnpj' ? (
                    <TextField
                      name="cpfCnpj"
                      value={param.cpfCnpj}
                      onChange={(e) => updateSearchParam(e, index)}
                      size="small"
                      label="CPF/CNPJ"
                      variant="outlined"
                      placeholder="CPF/CNPJ"
                      sx={{ flexGrow: 1 }}
                    />
                  ) : (
                    <TextField
                      name="chave"
                      value={param.chave}
                      onChange={(e) => updateSearchParam(e, index)}
                      size="small"
                      label="Chave PIX"
                      variant="outlined"
                      placeholder="Chave PIX"
                      sx={{ flexGrow: 1 }}
                    />
                  )}

                  <TextField
                    name="motivo"
                    value={param.motivo}
                    onChange={(e) => updateSearchParam(e, index)}
                    size="small"
                    label="Motivo"
                    variant="outlined"
                    placeholder="Motivo"
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          ))}

          <FormControlLabel
            control={
              <Radio
                checked={deAcordo}
                onChange={() => setDeAcordo(!deAcordo)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Concordo com os termos da consulta e declaro que esta pesquisa está sendo realizada para fins oficiais.
              </Typography>
            }
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'flex-start' }}>
          <Button
            variant="contained"
            size="medium"
            onClick={handleSearch}
            color="primary"
            sx={{
              minWidth: '100px',
              height: '40px'
            }}
          >
            Pesquisar
          </Button>

          <Button
            variant="outlined"
            size="medium"
            onClick={clearResults}
            sx={{
              minWidth: '100px',
              height: '40px'
            }}
          >
            Limpar
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="medium"
            onClick={() => openExportDialog('pdf')}
            disabled={lista.length === 0}
            sx={{
              minWidth: '120px',
              height: '40px'
            }}
          >
            PDF
          </Button>

          <Button
            variant="outlined"
            color="success"
            size="medium"
            onClick={() => openExportDialog('etc')}
            disabled={lista.length === 0}
            sx={{
              minWidth: '120px',
              height: '40px'
            }}
          >
            CSV
          </Button>
        </Grid>

        {/* Results Table */}
        <Grid item xs={12}>
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              '& .MuiTableHead-root': {
                backgroundColor: '#f8f9fa',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  color: '#1a1b1e'
                }
              }
            }}
            className={GeistSans.className}
          >
            <Table aria-label="collapsible table">
              {lista.length > 0 && (
                <>
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Chave</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>CPF/CNPJ</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Banco</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && <LoadingDialog />}
                    {lista.map((item, index) => (
                      <TableRowItem key={`${item.chave}-${index}`} item={item} />
                    ))}
                  </TableBody>
                </>
              )}
            </Table>
          </TableContainer>

          {lista.length === 0 && !loading && (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}
              className={GeistSans.className}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                Nenhum resultado encontrado. Realize uma pesquisa para visualizar os dados.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Dialogs */}
      {openDialogRequisicoesPIX && (
        <DialogRequisicoesPIX
          openDialogRequisicoesPIX={openDialogRequisicoesPIX}
          setOpenDialogRequisicoesPIX={setOpenDialogRequisicoesPIX}
          message={message}
          statusRequisicoes={statusRequisicoes}
        />
      )}

      {openDialogRelatorio && (
        <DialogRelatorioPIX
          openDialogRelatorio={openDialogRelatorio}
          setOpenDialogRelatorio={setOpenDialogRelatorio}
          tipoRelatorio={tipoRelatorio}
          lista={lista}
        />
      )}
    </Box>
  );
};

export default withAuth(ConsultaPix);
