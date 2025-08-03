/* eslint-disable */
import { useEffect, useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';

import { Form, Field } from 'src/components/hook-form';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';

// ----------------------------------------------------------------------

// Zod Schema for bio validation
const BioSchema = zod.object({
  about_me: zod.string().optional(),
  work_place: zod.string().optional(),
  country: zod.string().min(1, 'Страна обязательна'),
  city: zod.string().min(1, 'Город обязателен'),
  position: zod.string().optional(),
  specialization: zod.string().min(1, 'Специализация обязательна'),
});

// ----------------------------------------------------------------------

export function BioForm() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { user, fetchUser } = useAppStore(); // Assuming fetchUser updates the user state

  const defaultValues = {
    about_me: '',
    work_place: '',
    country: '',
    city: '',
    position: 'Другое',
    specialization: '',
  };

  const methods = useForm({
    resolver: zodResolver(BioSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Pre-fill the form with existing user data on component mount
  useEffect(() => {
    if (user?.bio) {
      reset({
        about_me: user.bio.about_me || '',
        work_place: user.bio.work_place || '',
        country: user.bio.country || '',
        city: user.bio.city || '',
        position: user.bio.position || 'Абитуриент на Мед-универ',
        specialization: user.bio.specialization || '',
      });
    }
  }, [user, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Make a PATCH request to update the user's bio
      await axiosCopy.patch('/user/me/bio', data);
      setSuccessMsg('Биография успешно обновлена!');
      // Optionally, refetch user data to update the store
      fetchUser();
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Не удалось обновить биографию.');
    }
  });

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Заполните вашу биографию
      </Typography>

      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {!!successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="about_me" label="О себе" multiline rows={4} />
          <Field.Text name="specialization" label="Специализация" />
          <Field.Text name="work_place" label="Место работы" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Field.Text name="country" label="Страна" />
            <Field.Text name="city" label="Город" />
          </Stack>
          <Field.Text name="position" label="Должность" disabled />

          <LoadingButton
            sx={{ mt: 2 }}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Сохранить изменения
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
}
