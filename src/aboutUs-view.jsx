import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  useTheme,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// --- Translation Content ---

const landingPageTranslations = {
  ru: {
    title: 'Interlinked',
    manifestoTitle: 'Манифест',
    paragraphs: [
      'Это не клуб по интересам и не очередная соцсеть. Здесь нет цели «объединить», «улучшить коммуникацию» или «поддержать молодых специалистов». Ничего этого не требуется. Все и так знают, зачем они здесь.',
      'Если вы студент, интерн или практикующий врач — этого достаточно. Вы имеете право спрашивать, рассказывать, молчать, делиться, сомневаться или уходить. Это пространство допускает все формы присутствия, кроме навязчивых.',
      'Здесь нет алгоритмов. Никакой рекомендации, рейтингов, накрученных охватов. Публикация живёт столько, сколько её читают или обсуждают. А потом исчезает, как всё человеческое.',
    ],
    boundaries: {
      title: 'Границы очевидны:',
      items: [
        '— Личные данные пациентов остаются вне сети.',
        '— Агрессия — не аргумент.',
      ]
    },
    conclusion: [
      'Это не место для демонстрации знаний. Здесь никто не обязан казаться умным, спокойным или уверенным. Можно не знать. Можно ошибаться. Можно быть человеком.',
      'Здесь собираются люди, у которых, как правило, нет времени. Но есть причина остаться хотя бы на пару минут. И этого, в общем, достаточно.',
    ],
    founder: {
      intro: 'Основатель',
      name: 'Бауыржан Еркешов'
    }
  },
  en: {
    title: 'Interlinked',
    manifestoTitle: 'Manifesto',
    paragraphs: [
      'This is not a hobby club or just another social network. It’s not about “bringing people together,” “improving communication,” or “supporting young professionals.” None of that is needed. Everyone here already knows why they’ve come.',
      'If you’re a medical student, an intern, or a practicing physician — that’s enough. You have the right to ask, to share, to stay silent, to doubt, or to leave. This space allows all forms of presence — except intrusive ones.',
      'There are no algorithms here. No recommendations, no rankings, no inflated reach. A post lives for as long as it’s being read or discussed. Then it disappears — like everything human.',
    ],
    boundaries: {
      title: 'The boundaries are clear:',
      items: [
        '— Patient data stays outside the network.',
        '— Aggression is not an argument.',
      ]
    },
    conclusion: [
      'This is not a place to showcase knowledge. No one here is required to appear smart, calm, or confident. You’re allowed to not know. You’re allowed to make mistakes. You’re allowed to be human.',
      'This space is for those who carry responsibility — often quietly, often under pressure. And yet, even in silence, you’re not alone. This place is shaped by people like you — who may not have much time, but still have a reason to stay for a couple of minutes. And that, really, is enough.',
    ],
    founder: {
      intro: 'Founder',
      name: 'Bauyrzhan Yerkeshov'
    }
  }
};

// --- Component ---

const InterlinkedLandingPage = () => {
  const theme = useTheme();
  const { i18n } = useTranslation();

  // Select the correct language from the translation object
  const content = landingPageTranslations[i18n.language] || landingPageTranslations.en;

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
              {content.title}
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
              {content.manifestoTitle}
            </Typography>

            <Stack spacing={2.5}>
              {/* Map over paragraphs */}
              {content.paragraphs.map((text, index) => (
                <Typography key={`p-${index}`} variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  {text}
                </Typography>
              ))}

              {/* Render boundaries */}
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {content.boundaries.title}
                {content.boundaries.items.map((item, index) => (
                  <React.Fragment key={`b-${index}`}>
                    <br />{item}
                  </React.Fragment>
                ))}
              </Typography>

              {/* Map over conclusion paragraphs */}
              {content.conclusion.map((text, index) => (
                <Typography key={`c-${index}`} variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                  {text}
                </Typography>
              ))}

              <br/>

              {/* Founder Information */}
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {content.founder.intro}{' '}
                <Link
                  component={RouterLink}
                  to="/dashboard/user/berkeshov"
                  color="inherit"
                  underline="hover"
                  sx={{ fontWeight: 'bold' }}
                >
                  {content.founder.name}
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
