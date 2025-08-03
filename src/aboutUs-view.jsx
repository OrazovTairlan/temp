import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Stack,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MedicalServices,
  School,
  Groups,
  Psychology,
  LocalHospital,
  Science,
  Forum,
  Event,
  MenuBook,
  Language,
  ConnectWithoutContact,
  Diversity3,
  HealthAndSafety,
  AutoStories,
  VideoCall,
  EmojiEvents,
  Flag
} from '@mui/icons-material';

const InterlinkedLandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <ConnectWithoutContact sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Персональный профиль врача',
      description: 'Создайте профессиональный профиль с указанием специализации, опыта и достижений'
    },
    {
      icon: <Forum sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Умная лента публикаций',
      description: 'Следите за актуальными новостями и публикациями коллег по специальности'
    },
    {
      icon: <Groups sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Дискуссионные клубы',
      description: 'Участвуйте в обсуждениях клинических случаев и протоколов лечения'
    },
    {
      icon: <Event sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Мероприятия и вебинары',
      description: 'Участвуйте в онлайн и оффлайн событиях для повышения квалификации'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Коллаборация и наставничество',
      description: 'Находите наставников и делитесь опытом с молодыми специалистами'
    }
  ];

  const targetAudience = [
    {
      icon: <MedicalServices sx={{ fontSize: 32 }} />,
      title: 'Врачи и интерны',
      color: '#1976d2'
    },
    {
      icon: <School sx={{ fontSize: 32 }} />,
      title: 'Студенты и преподаватели',
      color: '#388e3c'
    },
    {
      icon: <Science sx={{ fontSize: 32 }} />,
      title: 'Исследователи',
      color: '#7b1fa2'
    },
    {
      icon: <LocalHospital sx={{ fontSize: 32 }} />,
      title: 'Медперсонал',
      color: '#d32f2f'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Медицинских работников' },
    { number: '50+', label: 'Специальностей' },
    { number: '100+', label: 'Обучающих мероприятий' },
    { number: '24/7', label: 'Поддержка сообщества' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 3
                  }}
                >
                  Interlinked
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.4,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Первая профессиональная социальная сеть для медицинского сообщества Казахстана
                </Typography>
                <Stack direction="row" spacing={2} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    Присоединиться
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Узнать больше
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[MedicalServices, Groups, Psychology, Science].map((Icon, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 60,
                          height: 60,
                          mb: 1
                        }}
                      >
                        <Icon sx={{ fontSize: 30 }} />
                      </Avatar>
                    ))}
                  </Stack>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Объединяем медиков Казахстана
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    На одной платформе для общения, обмена опытом и совместного развития
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Наша миссия
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
            Объединить врачей, студентов, исследователей и медицинских работников на одной платформе
            для общения, обмена опытом и совместного развития
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Typography variant="h4" component="div" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Why Section */}
        <Paper elevation={2} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, mb: 8 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <EmojiEvents />
            </Avatar>
            <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold' }}>
              Зачем мы это делаем?
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
            В условиях стремительного развития медицины и цифровых технологий мы видим необходимость
            в платформе, где казахстанские медики смогут:
          </Typography>

          <Grid container spacing={2}>
            {[
              'Обсуждать клинические кейсы и протоколы',
              'Делиться статьями, исследованиями и новостями',
              'Создавать профессиональные связи по всей стране',
              'Повышать квалификацию через вебинары, курсы и события',
              'Формировать активное и поддерживающее комьюнити'
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main'
                    }}
                  />
                  <Typography variant="body1">{item}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Target Audience */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Для кого создан Interlinked?
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {targetAudience.map((audience, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10]
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: audience.color,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {audience.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {audience.title}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Возможности платформы
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" spacing={3} alignItems="flex-start">
                    <Box sx={{ flexShrink: 0 }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Made in Kazakhstan */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Flag sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                  Сделано в Казахстане
                </Typography>
              </Stack>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                Interlinked — это проект, созданный медиками для медиков.
                Мы учитываем реалии системы здравоохранения РК и стремимся быть полезными
                в повседневной клинической и образовательной практике.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <Flag sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Для казахстанской медицины
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Присоединяйтесь к сообществу
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
            Где знания, поддержка и профессионализм объединены в одном месте
          </Typography>

          <Stack spacing={2} sx={{ mb: 4, maxWidth: '560px', mx: 'auto' }}>
            <Chip
              label="Будущее казахстанской медицины — взаимосвязано"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '1rem',
                p: 3,
                height: 'auto'
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Будь Interlinked
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Начать сейчас
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default InterlinkedLandingPage;
