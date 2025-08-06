import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  useTheme,
  Link
} from '@mui/material';
import { useRouter } from 'src/routes/hooks';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from 'src/routes/paths';


const InterlinkedLandingPage = () => {
  const theme = useTheme();
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={3}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '1px',
              }}
            >
              Interlinked
            </Typography>

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 2,
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              Манифест
            </Typography>

            <Stack spacing={2.5}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Это не клуб по интересам и не очередная соцсеть. Здесь нет цели «объединить»,
                «улучшить коммуникацию» или «поддержать молодых специалистов». Ничего этого не
                требуется. Все и так знают, зачем они здесь.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Если вы студент, интерн или практикующий врач — этого достаточно. Вы имеете право
                спрашивать, рассказывать, молчать, делиться, сомневаться или уходить. Это
                пространство допускает все формы присутствия, кроме навязчивых.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Здесь нет алгоритмов. Никакой рекомендации, рейтингов, накрученных охватов.
                Публикация живёт столько, сколько её читают или обсуждают. А потом исчезает, как
                всё человеческое.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Границы очевидны:
                <br />
                — Личные данные пациентов остаются вне сети.
                <br />— Агрессия — не аргумент.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Это не место для демонстрации знаний. Здесь никто не обязан казаться умным,
                спокойным или уверенным. Можно не знать. Можно ошибаться. Можно быть человеком.
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Здесь собираются люди, у которых, как правило, нет времени. Но есть причина
                остаться хотя бы на пару минут. И этого, в общем, достаточно.
              </Typography> <br/>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Основатель{' '}
                <Link
                  component={RouterLink}
                  to="/dashboard/user/berkeshov"
                  color="inherit" // Inherits the color from the parent Typography
                  underline="hover" // A nice UX touch: only underline on hover
                  sx={{ fontWeight: 'bold' }} // Optional: makes the name stand out
                >
                  Бауыржан Еркешов
                </Link>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default InterlinkedLandingPage;
