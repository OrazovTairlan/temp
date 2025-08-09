import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tooltip as MuiTooltip,
  Chip,
  TextField,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import {
  LayoutDashboard,
  ChevronLeft,
  Menu,
  FileClock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';

// --- MOCK DATA --- //

const departments = [
  'Кафедра программной инженерии',
  'Кафедра компьютерных наук',
  'Департамент медиатехнологий',
  'Общеобразовательные дисциплины'
];

const employeesData = [
  {
    id: 1,
    name: 'Иванов Иван Иванович',
    department: 'Кафедра программной инженерии',
    avatarUrl: 'https://placehold.co/40x40/3175D4/white?text=ИИ',
    kpiProgress: 85,
    kpiMetrics: [
      { id: 1, name: 'Публикация статьи в изданиях Q1/Q2 (Scopus)', weight: '50%', target: '1', progress: 100, status: 'approved' },
      { id: 2, name: 'Участие в качестве ментора на AITU Project Challenge', weight: '25%', target: '2', progress: 50, status: 'pending' },
      { id: 3, name: 'Качество преподавания (анкетирование)', weight: '25%', target: 'не менее 80%', progress: 92, status: 'approved' },
    ]
  },
  {
    id: 2,
    name: 'Петров Петр Петрович',
    department: 'Кафедра компьютерных наук',
    avatarUrl: 'https://placehold.co/40x40/D431A2/white?text=ПП',
    kpiProgress: 60,
    kpiMetrics: [
      { id: 1, name: 'Разработка МООК', weight: '50%', target: '1', progress: 100, status: 'approved' },
      { id: 2, name: 'Участие в республиканских комиссиях', weight: '25%', target: '1', progress: 0, status: 'rejected' },
      { id: 3, name: 'Качество преподавания', weight: '25%', target: '80%', progress: 81, status: 'approved' },
    ]
  },
  {
    id: 3,
    name: 'Сидорова Анна Викторовна',
    department: 'Департамент медиатехнологий',
    avatarUrl: 'https://placehold.co/40x40/43D431/white?text=СА',
    kpiProgress: 95,
    kpiMetrics: [
      { id: 1, name: 'Организация медиа/кинофестиваля', weight: '50%', target: '1', progress: 100, status: 'approved' },
      { id: 2, name: 'Публикация в СМИ', weight: '25%', target: '2', progress: 100, status: 'approved' },
      { id: 3, name: 'Качество преподавания', weight: '25%', target: '80%', progress: 88, status: 'approved' },
    ]
  },
  {
    id: 4,
    name: 'Кузнецов Сергей Дмитриевич',
    department: 'Кафедра программной инженерии',
    avatarUrl: 'https://placehold.co/40x40/D48831/white?text=КС',
    kpiProgress: 40,
    kpiMetrics: [
      { id: 1, name: 'Статья в журнале, рекомендованном КОКНВО', weight: '50%', target: '1', progress: 0, status: 'pending' },
      { id: 2, name: 'Организация и проведение Олимпиад для школьников', weight: '25%', target: '1', progress: 100, status: 'approved' },
      { id: 3, name: 'Качество преподавания', weight: '25%', target: '80%', progress: 75, status: 'rejected' },
    ]
  },
];


// --- THEME --- //
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}},
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none' }}},
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 }}},
  },
});

const drawerWidth = 260;

// --- Helper Components --- //
const StatusChip = ({ status }) => {
  const statusMap = {
    approved: { label: 'Принято', color: 'success', icon: <CheckCircle size={14} /> },
    pending: { label: 'Ожидает', color: 'warning', icon: <FileClock size={14} /> },
    rejected: { label: 'Отклонено', color: 'error', icon: <XCircle size={14} /> },
  };
  const currentStatus = statusMap[status] || { label: 'N/A', color: 'default' };
  return <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.color} size="small" variant="outlined" />;
};

// --- Main Verification Panel Page --- //
const VerificationPanelPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(employeesData[0]);
  const [comment, setComment] = useState('');

  const filteredEmployees = useMemo(() => {
    return employeesData.filter(emp => {
      const nameMatch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const deptMatch = selectedDept ? emp.department === selectedDept : true;
      return nameMatch && deptMatch;
    });
  }, [searchTerm, selectedDept]);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setComment(''); // Reset comment on new selection
  };

  const handleAction = (action) => {
    if (!selectedEmployee) return;
    // In a real app, this would dispatch an action to an API
    console.log({
      action,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      comment,
    });
    alert(`Действие "${action}" для сотрудника ${selectedEmployee.name} выполнено. Комментарий: ${comment || 'нет'}`);
    // Potentially move to the next employee or clear selection
    setSelectedEmployee(null);
  };

  return (
    <Grid container spacing={3} sx={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Left Column: Filters and Employee List */}
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Фильтры</Typography>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Поиск по имени"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8, color: 'grey' }} />,
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="dept-filter-label">Департамент</InputLabel>
              <Select
                labelId="dept-filter-label"
                value={selectedDept}
                label="Департамент"
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <MenuItem value=""><em>Все департаменты</em></MenuItem>
                {departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Paper>
        <Paper sx={{ p: 1, flexGrow: 1, overflowY: 'auto', borderRadius: 3 }}>
          <List>
            {filteredEmployees.map(emp => (
              <ListItemButton
                key={emp.id}
                selected={selectedEmployee?.id === emp.id}
                onClick={() => handleSelectEmployee(emp)}
                sx={{ borderRadius: 2, mb: 1 }}
              >
                <ListItemIcon>
                  <Avatar src={emp.avatarUrl} />
                </ListItemIcon>
                <ListItemText
                  primary={emp.name}
                  secondary={
                    <Box>
                      <Typography component="span" variant="body2" color="text.secondary">{emp.department}</Typography>
                      <LinearProgress variant="determinate" value={emp.kpiProgress} sx={{ height: 6, borderRadius: 3, mt: 1 }} />
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Right Column: KPI Card Details */}
      <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
        <Paper sx={{ p: 3, width: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
          {selectedEmployee ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">{selectedEmployee.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{selectedEmployee.department}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>Карта KPI</Typography>
              <TableContainer sx={{ flexGrow: 1 }}>
                <Table stickyHeader aria-label="kpi details table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Название метрики</TableCell>
                      <TableCell align="right">Вес</TableCell>
                      <TableCell align="right">Цель</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEmployee.kpiMetrics.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.weight}</TableCell>
                        <TableCell align="right">{row.target}</TableCell>
                        <TableCell><StatusChip status={row.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Комментарий (обязательно при отклонении)"
                  variant="outlined"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" color="error" startIcon={<XCircle />} onClick={() => handleAction('Отклонить')}>
                    Отклонить
                  </Button>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleAction('Подписать')}>
                    Подписать
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
              <Typography variant="h6">Выберите сотрудника для просмотра KPI</Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};


// --- MAIN APP --- //
export default function KpiDashboard5() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const activePage = "Панель проверки"; // Hardcoded for this version

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { text: 'Панель проверки', icon: <ShieldCheck />, page: 'Панель проверки' },
    { text: 'Главная', icon: <LayoutDashboard />, page: 'Главная' },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
          <img src="https://placehold.co/40x40/1976d2/ffffff?text=U" alt="University Logo" style={{ borderRadius: '50%' }} />
          <Typography variant="h6" noWrap>KPI Университет</Typography>
        </Box>
        {isMobile && <IconButton onClick={handleDrawerToggle}><ChevronLeft /></IconButton>}
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{ minHeight: 48, justifyContent: 'initial', px: 2.5, borderRadius: 2, margin: '4px 8px',
                backgroundColor: activePage === item.page ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
              }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: activePage === item.page ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed"
                sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)', boxShadow: 'none', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar>
            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}>
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" color="text.primary">{activePage}</Typography>
          </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer variant={isMobile ? "temporary" : "permanent"} open={mobileOpen} onClose={handleDrawerToggle}
                  ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}>
            {drawerContent}
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, bgcolor: 'background.default' }}>
          <Toolbar />
          <VerificationPanelPage />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
