import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function SearchNotFound({ query, sx, ...other }) {
  if (!query) {
    return (
      <Typography variant="body2" sx={sx}>
        Введите ключевые слова
      </Typography>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', borderRadius: 1.5, ...sx }} {...other}>
      <Box sx={{ mb: 1, typography: 'h6' }}>Not found</Box>

      <Typography variant="body2">
       Результаты не найдены для &nbsp;
        <strong>{`"${query}"`}</strong>
        .
        <br /> Возможно ошибки
      </Typography>
    </Box>
  );
}
