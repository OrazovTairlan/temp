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
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import {
  LayoutDashboard,
  ChevronLeft,
  Menu,
  Settings,
  PlusCircle,
  Trash2,
  Save,
  Send,
  ShieldCheck
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATA --- //

// Predefined list of all possible metrics an HR admin can choose from.
// This is based on the KPI document provided.
const ALL_POSSIBLE_METRICS = [
  { id: 'pub_scopus_q1_q2', name: 'Статья в изданиях Q1/Q2 (Scopus)', category: 'Научно-инновационная' },
  { id: 'pub_wos', name: 'Статья в изданиях (Web of Science)', category: 'Научно-инновационная' },
  { id: 'funding_large', name: 'Привлечение финансирования (проект > 5 млн)', category: 'Научно-инновационная' },
  { id: 'funding_small', name: 'Привлечение финансирования (проект > 2 млн)', category: 'Научно-инновационная' },
  { id: 'monograph', name: 'Публикация монографии', category: 'Научно-инновационная' },
  { id: 'textbook', name: 'Издание учебника/пособия', category: 'Научно-инновационная' },
  { id: 'mooc_dev', name: 'Разработка МООК', category: 'Научно-инновационная' },
  { id: 'patent', name: 'Получение патента', category: 'Научно-инновационная' },
  { id: 'mentor_project_challenge', name: 'Менторство на AITU Project Challenge', category: 'Общественная' },
  { id: 'republic_commission', name: 'Участие в республиканских комиссиях', category: 'Общественная' },
  { id: 'media_publication', name: 'Публикация в СМИ / Выступление на ТВ', category: 'Общественная' },
  { id: 'teaching_quality_students', name: 'Качество преподавания (анкетирование студентов)', category: 'Учебная' },
  { id: 'teaching_quality_dop', name: 'Качество преподавания (оценка ДОП)', category: 'Учебная' },
];


// --- THEME --- //
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    error: { main: '#d32f2f' },
    success: { main: '#2e7d32' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}},
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none' }}},
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 }}},
  },
});

const drawerWidth = 260;

// --- Main Settings Panel Page --- //
const SettingsPanelPage = () => {
  const [roleName, setRoleName] = useState('');
  const [templateMetrics, setTemplateMetrics] = useState([]);

  const totalWeight = useMemo(() => {
    return templateMetrics.reduce((sum, metric) => sum + (Number(metric.weight) || 0), 0);
  }, [templateMetrics]);

  const handleAddMetric = () => {
    setTemplateMetrics([...templateMetrics, { id: uuidv4(), metricId: '', weight: '' }]);
  };

  const handleRemoveMetric = (id) => {
    setTemplateMetrics(templateMetrics.filter(m => m.id !== id));
  };

  const handleMetricChange = (id, field, value) => {
    setTemplateMetrics(templateMetrics.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = (publish = false) => {
    if (totalWeight !== 100) {
      alert('Ошибка: Суммарный вес всех метрик должен быть равен 100%.');
      return;
    }
    if (!roleName) {
      alert('Ошибка: Укажите название роли.');
      return;
    }

    const action = publish ? 'опубликован' : 'сохранен';
    console.log({
      roleName,
      metrics: templateMetrics,
    });
    alert(`Шаблон для роли "${roleName}" успешно ${action}!`);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Создание шаблона KPI</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Создайте новый шаблон для должности, добавив необходимые метрики и указав их вес. Общий вес должен составлять 100%.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название роли (должности)"
            variant="outlined"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider><Typography variant="overline">Метрики</Typography></Divider>
        </Grid>

        {templateMetrics.map((metric, index) => (
          <Grid item xs={12} container spacing={2} key={metric.id} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} md={7}>
              <FormControl fullWidth>
                <InputLabel>Название метрики</InputLabel>
                <Select
                  value={metric.metricId}
                  label="Название метрики"
                  onChange={(e) => handleMetricChange(metric.id, 'metricId', e.target.value)}
                >
                  {ALL_POSSIBLE_METRICS.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.name} ({opt.category})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Вес (%)"
                type="number"
                value={metric.weight}
                onChange={(e) => handleMetricChange(metric.id, 'weight', e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button fullWidth variant="outlined" color="error" onClick={() => handleRemoveMetric(metric.id)} startIcon={<Trash2 />}>
                Удалить
              </Button>
            </Grid>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="dashed"
            onClick={handleAddMetric}
            startIcon={<PlusCircle />}
            sx={{
              border: `2px dashed ${theme.palette.divider}`,
              py: 1.5,
              color: 'text.secondary',
              '&:hover': {
                border: `2px dashed ${theme.palette.primary.main}`,
                backgroundColor: 'action.hover'
              }
            }}
          >
            Добавить метрику
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="h6" align="right">
              Общий вес: <span style={{ color: totalWeight === 100 ? theme.palette.success.main : theme.palette.error.main }}>{totalWeight}%</span>
            </Typography>
          </Box>
          {totalWeight !== 100 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Суммарный вес должен быть равен 100% для сохранения шаблона.
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" color="secondary" startIcon={<Save />} onClick={() => handleSave(false)} disabled={totalWeight !== 100 || !roleName}>
              Сохранить шаблон
            </Button>
            <Button variant="contained" color="primary" startIcon={<Send />} onClick={() => handleSave(true)} disabled={totalWeight !== 100 || !roleName}>
              Опубликовать
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};


// --- MAIN APP --- //
export default function KpiDashboard7() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activePage, setActivePage] = useState('Панель настройки');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handlePageChange = (page) => {
    setActivePage(page);
    if(isMobile) setMobileOpen(false);
  }

  const menuItems = [
    { text: 'Панель настройки', icon: <Settings />, page: 'Панель настройки' },
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
              onClick={() => handlePageChange(item.page)}
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

  const renderContent = () => {
    switch(activePage) {
      case 'Панель настройки':
        return <SettingsPanelPage />;
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
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
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
