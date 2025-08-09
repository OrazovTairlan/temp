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
  Paper,
  IconButton,
  ThemeProvider,
  createTheme,
  useMediaQuery,
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
  ExternalLink,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- MOCK DATA --- //

// Data for the KPI Progress Chart
const kpiData = [
  { name: 'Выполнено', value: 75 },
  { name: 'Осталось', value: 25 },
];
const COLORS = ['#4caf50', '#e0e0e0']; // Green for completed, Gray for remaining

// Data for Upcoming Deadlines
const deadlines = [
  { id: 1, text: 'Подача отчета по научной деятельности', date: '2025-08-15' },
  { id: 4, text: 'План публикаций на следующий год', date: '2025-09-01' },
];

// --- THEME --- //
// A basic theme to ensure components are styled consistently.
// In a real app, this would be more extensive and defined elsewhere.
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

// --- COMPONENTS --- //

/**
 * KPI Progress Widget
 * Displays a circular progress chart.
 */
const KpiProgressWidget = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Прогресс KPI
      </Typography>
      <Box sx={{ height: 250, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={kpiData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                if (index === 0) { // Only show label for the 'completed' part
                  return (
                    <text x={cx} y={cy} fill="black" textAnchor="middle" dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }
                return null;
              }}
            >
              {kpiData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Upcoming Deadlines Widget
 * Displays a list of tasks with due dates.
 */
const DeadlinesWidget = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Ближайшие дедлайны
      </Typography>
      <List>
        {deadlines.map((deadline) => (
          <ListItem key={deadline.id} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <FileClock size={20} color="#1976d2" />
              </ListItemIcon>
              <ListItemText
                primary={deadline.text}
                secondary={`Срок: ${new Date(deadline.date).toLocaleDateString('ru-RU')}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

/**
 * Quick Links Widget
 * Provides buttons for common actions.
 */
const QuickLinksWidget = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Быстрые ссылки
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Button variant="contained" startIcon={<Map />}>
          Моя карта
        </Button>
        <Button variant="outlined" startIcon={<Upload />}>
          Загрузить документ
        </Button>
        <Button variant="text" startIcon={<FileClock />}>
          Статус проверки
        </Button>
      </Box>
    </CardContent>
  </Card>
);

/**
 * Main Application Component
 * Combines Sidebar and Main Content into a dashboard layout.
 */
export default function Demo() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Главная', icon: <LayoutDashboard /> },
    { text: 'Моя карта', icon: <Map /> },
    { text: 'Документы', icon: <FileText /> },
    { text: 'Отчеты', icon: <BarChart3 /> },
    { text: 'Настройки', icon: <Settings /> },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
          <img src="https://placehold.co/40x40/1976d2/ffffff?text=U" alt="University Logo" style={{ borderRadius: '50%' }} />
          <Typography variant="h6" noWrap>
            KPI Университет
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                borderRadius: 2,
                margin: '4px 8px',
                backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                  color: index === 0 ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: 1 }} />
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
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" color="text.primary">
              Главная панель
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, bgcolor: 'background.default' }}
        >
          <Toolbar />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={5}>
              <KpiProgressWidget />
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <DeadlinesWidget />
            </Grid>
            <Grid item xs={12} lg={5}>
              <QuickLinksWidget />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
