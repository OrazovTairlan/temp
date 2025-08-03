/* eslint-disable */
import { useEffect, useState, useCallback } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';

import { Form, Field } from 'src/components/hook-form';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';

// ----------------------------------------------------------------------

// Zod Schema for bio validation, including all possible fields
const BioSchema = zod.object({
  about_me: zod.string().optional().nullable(),
  work_place: zod.string().optional().nullable(),
  country: zod.string().min(1, 'Страна обязательна'),
  city: zod.string().min(1, 'Город обязателен'),
  position: zod.string().optional().nullable(),
  sub_position: zod.string().optional().nullable(), // Now optional for conditional logic
  specialization: zod.string().min(1, 'Специализация обязательна'),
  movies: zod.string().optional().nullable(),
  musics: zod.string().optional().nullable(),
  hobby: zod.string().optional().nullable(),
  worldview: zod.string().optional().nullable(),
});

// --- BioEditForm Component ---
const BioEditForm = ({ initialData, onSave, onCancel }) => {
  const positionOptions = [
    'Абитуриент на Мед-универ',
    'Студент медицинской школы/бакалавриат',
    'Интерн',
    'Резидент/ординатор (студент узкой специальности)',
    'Медсестра/медбрат',
    'Лицензированный врач',
    'Исследователь/научный сотрудник',
    'Другое',
  ];

  const subPositionOptions = [
    'Общественное здравоохранение',
    'Политика',
    'Менеджмент',
    'Врач на пенсии',
  ];

  const methods = useForm({
    resolver: zodResolver(BioSchema),
    defaultValues: initialData,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedPosition = watch('position');

  // Effect to manage the sub_position value based on the selected position
  useEffect(() => {
    if (selectedPosition === 'Другое') {
      // If the user selects 'Другое', clear the sub_position value
      if (methods.getValues('sub_position') !== null) {
        setValue('sub_position', null, { shouldDirty: true });
      }
    }
  }, [selectedPosition, setValue, methods]);


  const onSubmit = handleSubmit(async (data) => {
    await onSave(data);
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Field.Text name="about_me" label="О себе" multiline rows={4} />
        <Field.Text name="specialization" label="Специализация" />
        <Field.Text name="work_place" label="Место работы" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Field.Text name="country" label="Страна" />
          <Field.Text name="city" label="Город" />
        </Stack>

        <Field.Select name="position" label="Должность">
          {positionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Field.Select>

        {/* Conditionally render the sub_position dropdown */}
        {selectedPosition !== 'Другое' && (
          <Field.Select name="sub_position" label="Под-должность">
            {subPositionOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Field.Select>
        )}

        <Field.Text name="hobby" label="Хобби" />
        <Field.Text name="movies" label="Любимые фильмы" />
        <Field.Text name="musics" label="Любимая музыка" />
        <Field.Text name="worldview" label="Мировоззрение" />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button color="inherit" onClick={onCancel}>
            Отмена
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Сохранить изменения
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
};

// --- BioPreview Component ---
const BioPreview = ({ bioData, onEdit }) => (
  <Stack spacing={2}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5">Биография</Typography>
      <Button onClick={onEdit} variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />}>
        Редактировать
      </Button>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">О себе</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.about_me || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Специализация</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.specialization || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Место работы</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.work_place || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack direction="row" spacing={4}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">Страна</Typography>
        <Typography variant="body2" color="text.secondary">
          {bioData.country || 'Нет данных'}
        </Typography>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="subtitle1">Город</Typography>
        <Typography variant="body2" color="text.secondary">
          {bioData.city || 'Нет данных'}
        </Typography>
      </Stack>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Должность</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.position || 'Нет данных'}
      </Typography>
    </Stack>
    {/* Only show sub_position if it's relevant and has a value */}
    {bioData.position !== 'Другое' && bioData.sub_position && (
      <Stack spacing={1}>
        <Typography variant="subtitle1">Под-должность</Typography>
        <Typography variant="body2" color="text.secondary">
          {bioData.sub_position}
        </Typography>
      </Stack>
    )}
    <Stack spacing={1}>
      <Typography variant="subtitle1">Хобби</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.hobby || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Любимые фильмы</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.movies || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Любимая музыка</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.musics || 'Нет данных'}
      </Typography>
    </Stack>
    <Stack spacing={1}>
      <Typography variant="subtitle1">Мировоззрение</Typography>
      <Typography variant="body2" color="text.secondary">
        {bioData.worldview || 'Нет данных'}
      </Typography>
    </Stack>
  </Stack>
);

// --- Main BioForm Container ---
export function BioForm({ userId }) {
  const [mode, setMode] = useState('preview'); // 'preview' or 'edit'
  const [bioData, setBioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBio = useCallback(async () => {
    if (!userId) {
      setErrorMsg('User ID not provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await axiosCopy.get(`/user/bio/${userId}`);
      const data = response.data;

      const position = data.position ?? 'Абитуриент на Мед-универ';
      // Set sub_position to null if position is 'Другое', otherwise use its value or a default
      const sub_position = position !== 'Другое' ? (data.sub_position ?? 'Общественное здравоохранение') : null;

      const sanitizedData = {
        about_me: data.about_me ?? '',
        work_place: data.work_place ?? '',
        country: data.country ?? '',
        city: data.city ?? '',
        position,
        sub_position,
        specialization: data.specialization ?? '',
        movies: data.movies ?? '',
        musics: data.musics ?? '',
        hobby: data.hobby ?? '',
        worldview: data.worldview ?? '',
      };
      setBioData(sanitizedData);
    } catch (error) {
      setErrorMsg('Не удалось загрузить биографию.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBio();
  }, [fetchBio]);

  const handleSave = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await axiosCopy.patch(`/user/update/bio/${userId}`, data);
      setSuccessMsg('Биография успешно обновлена!');
      await fetchBio();
      setMode('preview');
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Не удалось обновить биографию.');
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
      {!!successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

      {mode === 'preview' && bioData ? (
        <BioPreview bioData={bioData} onEdit={() => setMode('edit')} />
      ) : mode === 'edit' && bioData ? (
        <BioEditForm initialData={bioData} onSave={handleSave} onCancel={() => setMode('preview')} />
      ) : (
        <Typography>Нет данных для отображения.</Typography>
      )}
    </Card>
  );
}
