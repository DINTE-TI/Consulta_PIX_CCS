'use client'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Breadcrumbs, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, MenuItem, Select, TextField } from '@mui/material';
import { pink } from '@mui/material/colors';
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from '@mui/material/TablePagination';
import TableRow from "@mui/material/TableRow";
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import withAuth from '/src/app/auth/withAuth';
import { GeistSans } from 'geist/font/sans';
import PeopleIcon from '@mui/icons-material/People';

const USERRow = (props) => {

  const { usuarios, fetchUsers } = props;

  // Variáveis e Funções para apresentação de Tabelas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
  };

  const handleAdd = () => {
    setEditingUser({
      cpf: '',
      nome: '',
      email: '',
      password: '',
      lotacao: '',
      matricula: '',
      admin: false
    });
  };

  const handleClose = () => {
    setEditingUser(null);
  };

  const handleSave = async () => {
    try {
      // Se editingUser tem um ID, então estamos editando um usuário existente
      if (editingUser.id) {
        await axios.post(`/api/user/edit`, editingUser);
      } else {
        // Se não tem um ID, estamos adicionando um novo usuário
        await axios.post(`/api/user/register`, editingUser);
      }
      // Após a requisição bem-sucedida, atualize a lista de usuários e feche o diálogo
      fetchUsers();
      handleClose();
    } catch (error) {
      // Em caso de erro, registre o erro no console
      console.error("Erro ao salvar usuário:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.post(`/api/user/delete`, { id: userToDelete });
      fetchUsers(); // Atualiza a lista de usuários após a exclusão
      handleCloseConfirmDialog();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  const handleOpenConfirmDialog = (id) => {
    setUserToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setUserToDelete(null);
    setConfirmDialogOpen(false);
  };

  // Formatar CPF / CNPJ para apresentação no FrontEnd
  const formatCnpjCpf = (value) => {
    const cnpjCpf = value.replace(/\D/g, '')
    if (cnpjCpf.length === 11) {
      return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
    }
    return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
  }

  // Estilos comuns para componentes com fonte Geist
  const geistStyle = {
    fontFamily: GeistSans.className,
  };

  // Toolbar para a Tabela
  function TableToolbar() {
    return (
      <Toolbar sx={{
        ...geistStyle,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        backgroundColor: '#f5f7fa',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography
            variant="h6"
            id="tableTitle"
            component="div"
            sx={{ ...geistStyle, fontWeight: 600, display: 'flex', alignItems: 'center' }}
            color="#0a243b9e"
          >
            <PeopleIcon sx={{ marginRight: '8px' }}/> Usuários Cadastrados
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleAdd}
            sx={{
              ...geistStyle,
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#0a243b',
              '&:hover': {
                backgroundColor: '#1a344b'
              },
              '&:active': {
                backgroundColor: '#0a243b'
              }
            }}>
            <AddCircleOutlineIcon sx={{ marginRight: '8px' }} /> Novo Usuário
          </Button>
        </Box>
      </Toolbar>
    );
  }

  // Função para Montar a LINHA de Cabeçalho
  function Head() {
    return (
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}>CPF</TableCell>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}>Nome</TableCell>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}>Lotação</TableCell>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}>Acesso</TableCell>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}></TableCell>
          <TableCell sx={{ ...geistStyle, fontWeight: 600, backgroundColor: '#f9fafb' }}></TableCell>
        </TableRow>
      </TableHead>
    );
  }

  // Função para Montar as LINHAS da Tabela no FrontEnd (sem o cabeçalho, pois o cabeçalho está no return)
  function Row(props) {
    const { usuario, index } = props;
    const isEven = index % 2 === 0;

    return (
      <React.Fragment>
        <TableRow hover
          role="checkbox"
          tabIndex={-1}
          key={usuario.id}
          sx={{
            cursor: 'pointer',
            "& > *": { borderBottom: "unset" },
            backgroundColor: isEven ? '#ffffff' : '#f5f7fa',
            '&:hover': {
              backgroundColor: '#e8f4fd',
            }
          }}>
          <TableCell sx={geistStyle}>{formatCnpjCpf(usuario.cpf)}</TableCell>
          <TableCell sx={geistStyle}>{(usuario.nome).toUpperCase()}</TableCell>
          <TableCell sx={geistStyle}>{(usuario.lotacao)}</TableCell>
          <TableCell sx={geistStyle}>
            <Box sx={{
              display: 'inline-block',
              px: 1.5,
              py: 0.5,
              borderRadius: '4px',
              backgroundColor: usuario.admin ? '#e3f2fd' : '#f1f8e9',
              color: usuario.admin ? '#0d47a1' : '#33691e',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}>
              {(usuario.admin === true) ? "Admin" : "Consulta"}
            </Box>
          </TableCell>
          <TableCell>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleEdit(usuario)}
              sx={{
                minWidth: 'unset',
                p: 0.5,
                borderColor: 'transparent',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <EditIcon color="primary" fontSize="small" />
            </Button>
          </TableCell>
          <TableCell>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpenConfirmDialog(usuario.id)}
              sx={{
                minWidth: 'unset',
                p: 0.5,
                borderColor: 'transparent',
                '&:hover': { borderColor: pink[500] }
              }}
            >
              <ClearIcon sx={{ color: pink[500], fontSize: 'small' }} />
            </Button>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3, ...geistStyle }}
      >
        <Link underline="hover" color="inherit" href="/">
          <HomeIcon sx={{ mt: 0.5 }} />
        </Link>
        <Typography sx={{ color: 'text.primary', fontWeight: 'bold', ...geistStyle }}>
          Usuários
        </Typography>
      </Breadcrumbs>
      <Grid item xs={12} md={12}>
        <Paper elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <TableToolbar />
          <TableContainer id="table">
            <Table sx={{ minWidth: 1200 }} size="small" aria-label="a dense table">
              <Head />
              <TableBody>
                {
                  (usuarios.length > 0) &&
                  usuarios
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((usuario, index) => (
                      <Row key={uuidv4()} usuario={usuario} index={index} />
                    ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20, 50, 100]}
            component="div"
            count={usuarios.length > 0 ? usuarios.length : 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={geistStyle}
          />
        </Paper>
      </Grid>

      <Dialog open={!!editingUser} onClose={handleClose} PaperProps={{ sx: { borderRadius: '8px' } }}>
        <DialogTitle sx={geistStyle}>{editingUser?.id ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            id="cpf"
            label="CPF"
            value={editingUser ? editingUser.cpf : ''}
            onChange={(e) => setEditingUser({ ...editingUser, cpf: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="nome"
            label="Nome"
            value={editingUser ? editingUser.nome : ''}
            onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email"
            value={editingUser ? editingUser.email : ''}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            type="password"
            value={editingUser ? editingUser.password : ''}
            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="lotacao"
            label="Unidade"
            value={editingUser ? editingUser.lotacao : ''}
            onChange={(e) => setEditingUser({ ...editingUser, lotacao: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="matricula"
            label="Matrícula"
            value={editingUser ? editingUser.matricula : ''}
            onChange={(e) => setEditingUser({ ...editingUser, matricula: e.target.value })}
            InputProps={{ sx: geistStyle }}
            InputLabelProps={{ sx: geistStyle }}
          />
          <Box mt={2}> {/* Adiciona margem superior entre Matrícula e Consulta */}
            <Typography sx={{ ...geistStyle, mb: 1, fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.6)' }}>
              Tipo de Acesso
            </Typography>
            <Select
              fullWidth
              value={editingUser ? editingUser.admin : false}
              onChange={(e) => setEditingUser({ ...editingUser, admin: e.target.value })}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              sx={{ ...geistStyle, color: 'rgba(0, 0, 0, 0.87)' }}
            >
              <MenuItem value={true} sx={geistStyle}>Admin</MenuItem>
              <MenuItem value={false} sx={geistStyle}>Consulta</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" sx={geistStyle}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              ...geistStyle,
              backgroundColor: '#0a243b',
              '&:hover': {
                backgroundColor: '#1a344b'
              }
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        PaperProps={{ sx: { borderRadius: '8px' } }}
      >
        <DialogTitle sx={geistStyle}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText sx={geistStyle}>
            Você tem certeza que deseja excluir este usuário?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary" sx={geistStyle}>
            Não
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={geistStyle}
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>

    </React.Fragment>
  );
}

export default withAuth(USERRow);
