import { useEffect, useState, useCallback, useMemo } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// @mui
import {
  Alert,
  Stack,
  Typography,
  Card,
  Button,
  Box,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

// components
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from './store/useBoundStore.js';
// ----------------------------------------------------------------------

// Zod Schema for bio validation
const BioSchema = zod.object({
  about_me: zod.string().optional().nullable(),
  work_place: zod.string().optional().nullable(),
  country: zod.string().min(1, 'Страна обязательна'),
  city: zod.string().min(1, 'Город обязателен'),
  position: zod.string().min(1, 'Должность обязательна'),
  sub_position: zod.string().optional().nullable(),
  specialization: zod.string().min(1, 'Специализация обязательна'),
  movies: zod.string().optional().nullable(),
  musics: zod.string().optional().nullable(),
  hobby: zod.string().optional().nullable(),
  worldview: zod.string().optional().nullable(),
});

// Constants moved outside the component to prevent re-creation on renders
const POSITION_OPTIONS = [
  'Абитуриент на Мед-универ',
  'Студент медицинской школы/бакалавриат',
  'Интерн',
  'Резидент/ординатор (студент узкой специальности)',
  'Медсестра/медбрат',
  'Лицензированный врач',
  'Исследователь/научный сотрудник',
  'Другое',
];

const SUB_POSITION_OPTIONS = [
  'Общественное здравоохранение',
  'Политика',
  'Менеджмент',
  'Врач на пенсии',
];

// --- Helper Component for displaying details ---
const ProfileDetailItem = ({ label, value }) => (
  <Stack spacing={0.5}>
    <Typography variant="subtitle1" sx={{ color: 'text.disabled' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value || 'Нет данных'}</Typography>
  </Stack>
);

// --- BioEditForm Component ---
const BioEditForm = ({ initialData, onSave, onCancel }) => {
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

  // Effect to clear sub_position if the main position is changed from 'Другое'
  useEffect(() => {
    if (selectedPosition !== 'Другое') {
      setValue('sub_position', null);
    }
  }, [selectedPosition, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    await onSave(data);
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Typography variant="h5">Редактирование биографии</Typography>
        <Field.Text name="about_me" label="О себе" multiline rows={4} />
        <Field.Text name="specialization" placeholder = "терапевт, педиатр, невролог и другие" label="Специализация" />
        <Field.Text name="work_place" label="Место работы" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Field.Text name="country" label="Страна" />
          <Field.Text name="city" label="Город" />
        </Stack>

        <Field.Select name="position" label="Должность">
          {POSITION_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Field.Select>

        {selectedPosition === 'Другое' && (
          <Field.Select name="sub_position" label="Под-должность">
            {SUB_POSITION_OPTIONS.map((option) => (
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
  <Stack spacing={3}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5">Биография</Typography>
      <Button onClick={onEdit} variant="outlined" startIcon={<Iconify icon="solar:pen-bold" />}>
        Редактировать
      </Button>
    </Stack>
    <ProfileDetailItem label="О себе" value={bioData.about_me} />
    <ProfileDetailItem label="Специализация" value={bioData.specialization} />
    <ProfileDetailItem label="Место работы" value={bioData.work_place} />
    <Stack direction="row" spacing={4}>
      <ProfileDetailItem label="Страна" value={bioData.country} />
      <ProfileDetailItem label="Город" value={bioData.city} />
    </Stack>
    <ProfileDetailItem label="Должность" value={bioData.position} />
    {/* Corrected Logic: Only show sub_position if position is 'Другое' and it has a value */}
    {bioData.position === 'Другое' && bioData.sub_position && (
      <ProfileDetailItem label="Под-должность" value={bioData.sub_position} />
    )}
    <ProfileDetailItem label="Хобби" value={bioData.hobby} />
    <ProfileDetailItem label="Любимые фильмы" value={bioData.movies} />
    <ProfileDetailItem label="Любимая музыка" value={bioData.musics} />
    <ProfileDetailItem label="Мировоззрение" value={bioData.worldview} />
  </Stack>
);

// --- Main BioForm Container ---
export function BioForm({ userId }) {
  const [mode, setMode] = useState('preview');
  const [bioData, setBioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const createInitialBioData = (data = {}) => ({
    about_me: data.about_me ?? null,
    work_place: data.work_place ?? null,
    country: data.country ?? '',
    city: data.city ?? '',
    position: data.position ?? '',
    sub_position: data.sub_position ?? null,
    specialization: data.specialization ?? '',
    movies: data.movies ?? null,
    musics: data.musics ?? null,
    hobby: data.hobby ?? null,
    worldview: data.worldview ?? null,
  });

  const fetchBio = useCallback(async () => {
    if (!userId) {
      setErrorMsg('User ID is not provided.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosCopy.get(`/user/bio/${userId}`);
      setBioData(createInitialBioData(response.data));
    } catch (error) {
      setErrorMsg('Не удалось загрузить биографию.');
      console.error(error);
      setBioData(createInitialBioData()); // Set empty defaults on error
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBio();
  }, [fetchBio]);

  const handleSave = async (formData) => {
    setErrorMsg('');
    setSuccessMsg('');

    // **CORE CHANGE**: Construct the payload exactly as required by the API.
    const payload = {
      bio: {
        country: formData.country,
        city: formData.city,
        position: formData.position,
        work_place: formData.work_place,
        about_me: formData.about_me,
        specialization: formData.specialization,
        hobby: formData.hobby,
        movies: formData.movies,
        musics: formData.musics,
        worldview: formData.worldview,
        // sub_position is intentionally omitted as per your spec,
        // but if the API needs it conditionally, you can add it here:
        // ...(formData.position === 'Другое' && { sub_position: formData.sub_position }),
      },
    };

    try {
      await axiosCopy.patch(`/user/update/bio/${userId}`, payload);
      setSuccessMsg('Биография успешно обновлена!');
      await fetchBio(); // Refetch the updated data
      setMode('preview'); // Switch back to preview mode
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Не удалось обновить биографию.');
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}
      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {mode === 'preview' ? (
        <BioPreview bioData={bioData} onEdit={() => setMode('edit')} />
      ) : (
        <BioEditForm
          initialData={bioData}
          onSave={handleSave}
          onCancel={() => setMode('preview')}
        />
      )}
    </Card>
  );
}
