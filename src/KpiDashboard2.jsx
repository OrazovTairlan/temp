import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
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
} from '@mui/material';
import {
  LayoutDashboard,
  Map,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  Upload,
  FileClock,
  View,
  Edit,
  List as ListIcon,
  Grid as GridIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- MOCK DATA --- //

// Data for the KPI Progress Chart
const kpiData = [
  { name: 'Выполнено', value: 75 },
  { name: 'Осталось', value: 25 },
];
const COLORS = ['#4caf50', '#e0e0e0'];

// Data for Upcoming Deadlines
const deadlines = [
  { id: 1, text: 'Подача отчета по научной деятельности', date: '2025-08-15' },
  { id: 2, text: 'Загрузка учебно-методических материалов', date: '2025-08-20' },
  { id: 3, text: 'Аттестация студентов', date: '2025-08-25' },
  { id: 4, text: 'План публикаций на следующий год', date: '2025-09-01' },
];

// Data for KPI Metrics Page
const kpiMetricsData = [
  { id: 1, name: 'Публикация статьи в изданиях Q1/Q2 (Scopus)', weight: '50%', target: '1', progress: 100, status: 'approved' },
  { id: 2, name: 'Участие в качестве ментора на AITU Project Challenge', weight: '25%', target: '2', progress: 50, status: 'pending' },
  { id: 3, name: 'Качество преподавания (анкетирование)', weight: '25%', target: 'не менее 80%', progress: 92, status: 'approved' },
  { id: 4, name: 'Разработка МООК', weight: '50%', target: '1', progress: 0, status: 'rejected' },
  { id: 5, name: 'Привлечение финансирования на научный проект', weight: '50%', target: '5 млн. тенге', progress: 20, status: 'pending' },
];


// --- THEME --- //
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

const drawerWidth = 240;

// --- STATUS COMPONENT --- //
const StatusIcon = ({ status }) => {
  switch (status) {
    case 'approved':
      return <MuiTooltip title="Принято"><Chip icon={<FileClock size={16} />} label="Принято" color="success" size="small" variant="outlined" /></MuiTooltip>;
    case 'pending':
      return <MuiTooltip title="Ожидает"><Chip icon={<FileClock size={16} />} label="Ожидает" color="warning" size="small" variant="outlined" /></MuiTooltip>;
    case 'rejected':
      return <MuiTooltip title="Отклонено"><Chip icon={<FileClock size={16} />} label="Отклонено" color="error" size="small" variant="outlined" /></MuiTooltip>;
    default:
      return null;
  }
};


// --- PAGES & WIDGETS --- //

const KpiProgressWidget = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Прогресс KPI</Typography>
      <Box sx={{ height: 250, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={kpiData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" labelLine={false}
                 label={({ cx, cy, percent }) => (
                   <text x={cx} y={cy} fill="black" textAnchor="middle" dominantBaseline="central">
                     {`${(percent * 100).toFixed(0)}%`}
                   </text>
                 )}>
              {kpiData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

const DeadlinesWidget = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>Ближайшие дедлайны</Typography>
      <List>
        {deadlines.map((deadline) => (
          <ListItem key={deadline.id} disablePadding>
            <ListItemButton>
              <ListItemIcon><FileClock size={20} color="#1976d2" /></ListItemIcon>
              <ListItemText primary={deadline.text} secondary={`Срок: ${new Date(deadline.date).toLocaleDateString('ru-RU')}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const QuickLinksWidget = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>Быстрые ссылки</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Button variant="contained" startIcon={<Map />}>Моя карта</Button>
        <Button variant="outlined" startIcon={<Upload />}>Загрузить документ</Button>
        <Button variant="text" startIcon={<FileClock />}>Статус проверки</Button>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6} lg={5}><KpiProgressWidget /></Grid>
    <Grid item xs={12} md={6} lg={7}><DeadlinesWidget /></Grid>
    <Grid item xs={12} lg={5}><QuickLinksWidget /></Grid>
  </Grid>
);

const MyKpiPage = () => {
  const [isCardView, setIsCardView] = useState(true);
  const isHR = true; // Mock HR role for editing capability

  const handleViewChange = (event) => {
    setIsCardView(event.target.checked);
  };

  const renderActions = (item) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size="small" variant="outlined" startIcon={<Upload size={16} />}>Загрузить</Button>
      <Button size="small" variant="text" startIcon={<View size={16} />}>Посмотреть</Button>
      {isHR && <IconButton size="small"><Edit size={16} /></IconButton>}
    </Box>
  );

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Мои KPI</Typography>
        <FormControlLabel
          control={<Switch checked={isCardView} onChange={handleViewChange} />}
          label={isCardView ? 'Карточный вид' : 'Табличный вид'}
          labelPlacement="start"
        />
      </Box>

      {isCardView ? (
        <Grid container spacing={3}>
          {kpiMetricsData.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" color="text.secondary">Вес: {item.weight}</Typography>
                    <StatusIcon status={item.status} />
                  </Box>
                  <Typography variant="h6" component="div" sx={{ my: 1 }}>{item.name}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>Цель: {item.target}</Typography>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <LinearProgress variant="determinate" value={item.progress} sx={{ height: 8, borderRadius: 5 }} />
                    <Typography variant="caption" display="block" textAlign="right">{item.progress}%</Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>{renderActions(item)}</Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table aria-label="kpi table">
            <TableHead>
              <TableRow>
                <TableCell>Название метрики</TableCell>
                <TableCell align="right">Вес</TableCell>
                <TableCell align="right">Целевое значение</TableCell>
                <TableCell>Прогресс</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiMetricsData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell align="right">{row.weight}</TableCell>
                  <TableCell align="right">{row.target}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={row.progress} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${row.progress}%`}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><StatusIcon status={row.status} /></TableCell>
                  <TableCell align="center">{renderActions(row)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};


// --- MAIN APP --- //
export default function KpiDashboard2() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState('Главная');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handlePageChange = (page) => {
    setActivePage(page);
    if(isMobile) setMobileOpen(false);
  }

  const menuItems = [
    { text: 'Главная', icon: <LayoutDashboard />, page: 'Главная' },
    { text: 'Мои KPI', icon: <BarChart3 />, page: 'Мои KPI'},
    { text: 'Моя карта', icon: <Map />, page: 'Моя карта' },
    { text: 'Документы', icon: <FileText />, page: 'Документы' },
    { text: 'Настройки', icon: <Settings />, page: 'Настройки' },
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
            <ListItemButton onClick={() => handlePageChange(item.page)}
                            sx={{ minHeight: 48, justifyContent: 'initial', px: 2.5, borderRadius: 2, margin: '4px 8px',
                              backgroundColor: activePage === item.page ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                            }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: activePage === item.page ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: 1 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    switch(activePage) {
      case 'Главная':
        return <DashboardPage />;
      case 'Мои KPI':
        return <MyKpiPage />;
      // Add cases for other pages here
      default:
        return <Typography>Страница "{activePage}" в разработке.</Typography>;
    }
  }

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
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
          <Drawer variant={isMobile ? "temporary" : "permanent"} open={mobileOpen} onClose={handleDrawerToggle}
                  ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }}>
            {drawerContent}
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, bgcolor: 'background.default' }}>
          <Toolbar />
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
