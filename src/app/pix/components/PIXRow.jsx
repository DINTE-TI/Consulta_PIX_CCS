'use client'
import SearchIcon from '@mui/icons-material/Search';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { GeistSans } from 'geist/font/sans';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from "uuid";

const PIXRow = ({ requisicoes = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchInputRef = useRef(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selected, setSelected] = useState([]);
  const [detalhe, setDetalhe] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('data');

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sortedAndFilteredRequisicoes.map((n) => n.id);
      setSelected(newSelected);
      setDetalhe([...sortedAndFilteredRequisicoes]);
      localStorage.setItem("detalhe", JSON.stringify(sortedAndFilteredRequisicoes));
      return;
    }
    setSelected([]);
    setDetalhe([]);
    localStorage.setItem("detalhe", "");
  };

  const handleClick = (event, id) => {
    const requisicao = requisicoes.find(x => x.id === id);
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    let newDetalhe = [];

    if (selectedIndex === -1) {
      // Add to selection
      newSelected = [...selected, id];
      newDetalhe = [...detalhe, requisicao];
    } else if (selectedIndex === 0) {
      // Remove from beginning
      newSelected = selected.slice(1);
      newDetalhe = detalhe.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      // Remove from end
      newSelected = selected.slice(0, -1);
      newDetalhe = detalhe.slice(0, -1);
    } else {
      // Remove from middle
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1)
      ];
      newDetalhe = [
        ...detalhe.slice(0, selectedIndex),
        ...detalhe.slice(selectedIndex + 1)
      ];
    }
    
    setSelected(newSelected);
    setDetalhe(newDetalhe);
    localStorage.setItem("detalhe", JSON.stringify(newDetalhe));
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const formatCnpjCpf = (value) => {
    const cnpjCpf = value.replace(/\D/g, '');
    return cnpjCpf.length === 11
      ? cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4")
      : cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
  };

  const getDisplayName = (requisicao) => {
    if (requisicao.resultado !== 'Sucesso') {
      return requisicao.resultado.toUpperCase();
    }
    
    if (requisicao.tipoBusca === 'cpf/cnpj') {
      const vinculo = requisicao.vinculos[0];
      return (vinculo.nomeProprietario || vinculo.nomeProprietarioBusca).toUpperCase();
    }
    
    return requisicao.vinculos.nomeProprietario.toUpperCase();
  };

  const sortRequisicoes = (reqs, orderBy, order) => {
    return [...reqs].sort((a, b) => {
      if (orderBy === 'data') {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  const handleSearchChange = (event) => {
    const newValue = event.target.value;
    setSearchTerm(newValue);
  };

  const filteredRequisicoes = useMemo(() => {
    if (!searchTerm.trim()) return requisicoes;
    
    return requisicoes.filter(req => {
      const nome = getDisplayName(req).toLowerCase();
      const chaveBusca = req.chaveBusca.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return nome.includes(searchLower) || chaveBusca.includes(searchLower);
    });
  }, [requisicoes, searchTerm]);

  const sortedAndFilteredRequisicoes = useMemo(() => {
    return sortRequisicoes(filteredRequisicoes, orderBy, order);
  }, [filteredRequisicoes, orderBy, order]);

  const paginatedRequisicoes = useMemo(() => {
    return sortedAndFilteredRequisicoes.slice(
      page * rowsPerPage, 
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedAndFilteredRequisicoes, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const getTypeBadgeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'cpf/cnpj': return 'primary';
      case 'email': return 'success';
      case 'telefone': return 'info';
      case 'chave aleatória': return 'warning';
      default: return 'default';
    }
  };

  const TableToolbar = ({ numSelected }) => (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        py: 2
      }}
    >
      <FormatListBulletedIcon sx={{ color: '#0a243b9e' }} />
      <Typography
        sx={{ flex: '1 1 100%', fontFamily: `${GeistSans.className}` }}
        variant="h6"
        id="tableTitle"
        component="div"
        color="#0a243b9e"
      >
        Solicitações Pix
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: isMobile ? '100%' : 'auto' }}>
        <TextField
          inputRef={searchInputRef}
          placeholder="Nome ou chave"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { whiteSpace: 'nowrap' }
          }}
          sx={{
            width: isMobile ? '100%' : '180px',
            '& .MuiInputBase-root': {
              height: '36px',
              whiteSpace: 'nowrap'
            }
          }}
        />
        {numSelected > 0 && (
          <Tooltip title="Detalhar">
            <Link
              href={{
                pathname: '/pix/novo',
                query: { selected: 'true' },
              }}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Detalhar ({numSelected})
              </Button>
            </Link>
          </Tooltip>
        )}
      </Box>

    </Toolbar>
  );

  const TableHeader = ({ onSelectAllClick, numSelected, rowCount }) => (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'selecionar todas requisições',
            }}
          />
        </TableCell>
        <TableCell>
          <TableSortLabel
            active={orderBy === 'data'}
            direction={orderBy === 'data' ? order : 'asc'}
            onClick={() => handleRequestSort('data')}
          >
            <Typography fontFamily={GeistSans.className}>
              Solicitado em
            </Typography>
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            Chave de Busca
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            Nome
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            Tipo
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            Caso
          </Typography>
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const DataRow = ({ requisicao }) => {
    const isItemSelected = isSelected(requisicao.id);
    const dataRequisicao = new Date(requisicao.data);
    
    return (
      <TableRow 
        hover
        onClick={(event) => handleClick(event, requisicao.id)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={requisicao.id}
        selected={isItemSelected}
        sx={{ cursor: 'pointer', "& > *": { borderBottom: "unset" } }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
          />
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            {dataRequisicao.toLocaleDateString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            {requisicao.tipoBusca === 'cpf/cnpj' 
              ? formatCnpjCpf(requisicao.chaveBusca) 
              : requisicao.chaveBusca}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            {getDisplayName(requisicao)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={requisicao.tipoBusca.toUpperCase()}
            color={getTypeBadgeColor(requisicao.tipoBusca)}
            size="small"
            variant="filled"
            sx={{ fontFamily: GeistSans.className }}
          />
        </TableCell>
        <TableCell>
          <Typography fontFamily={GeistSans.className}>
            {requisicao.caso}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Grid item xs={12}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          mb: 3
        }}
      >
        <TableToolbar numSelected={selected.length} />
        <TableContainer 
          id="table" 
          sx={{ 
            maxHeight: 'calc(100vh - 250px)',
            overflowX: 'auto'
          }}
        >
          <Table 
            stickyHeader
            sx={{ 
              minWidth: isMobile ? 650 : 1200,
              fontFamily: GeistSans.className
            }} 
            size="small" 
            aria-label="tabela de requisições"
          >
            <TableHeader
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              rowCount={sortedAndFilteredRequisicoes.length}
            />
            <TableBody>
              {paginatedRequisicoes.length > 0 ? (
                paginatedRequisicoes.map((requisicao) => (
                  <DataRow key={uuidv4()} requisicao={requisicao} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography fontFamily={GeistSans.className}>
                      {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma solicitação disponível'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={sortedAndFilteredRequisicoes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{ fontFamily: GeistSans.className }}
        />
      </Paper>
    </Grid>
  );
};

export default PIXRow;
