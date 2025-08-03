import React, { useState, useEffect, useCallback } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Badge,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

const MEDIA_BASE_URL = 'http://localhost:8000/files/';

// --- Zod Schemas for Validation ---
// Added .nullable() to optional fields to match API responses
const GeneralInfoSchema = zod.object({
  login: zod.string().min(1, 'Логин обязателен'),
  firstname: zod.string().min(1, 'Имя обязательно'),
  surname: zod.string().min(1, 'Фамилия обязательна'),
  secondname: zod.string().optional().nullable(),
  email: zod.string().email('Неверный формат email'),
  birthday: zod.string().min(1, 'Дата рождения обязательна'),
  bio: zod.object({
    country: zod.string().optional().nullable(),
    city: zod.string().optional().nullable(),
    position: zod.string().optional().nullable(),
    work_place: zod.string().optional().nullable(),
    about_me: zod.string().optional().nullable(),
    specialization: zod.string().optional().nullable(),
    hobby: zod.string().optional().nullable(),
    movies: zod.string().optional().nullable(),
    musics: zod.string().optional().nullable(),
    worldview: zod.string().optional().nullable(),
  }),
});

const PasswordSchema = zod.object({
  password: zod.string().min(6, 'Текущий пароль должен быть не менее 6 символов'),
  new_password: zod.string().min(6, 'Новый пароль должен быть не менее 6 символов'),
});

const SupportSchema = zod.object({
  message: zod.string().min(10, 'Сообщение должно содержать не менее 10 символов'),
});

/**
 * Recursively gets only the dirty (changed) values from the form state.
 * @param {object} dirtyFields - The dirtyFields object from react-hook-form.
 * @param {object} allValues - All values from the form.
 * @returns {object} An object containing only the changed values.
 */
const getDirtyValues = (dirtyFields, allValues) => {
  const dirtyValues = {};
  if (!dirtyFields || !allValues) {
    return dirtyValues;
  }
  Object.keys(dirtyFields).forEach(key => {
    if (dirtyFields[key]) {
      if (typeof dirtyFields[key] === 'object' && !Array.isArray(dirtyFields[key]) && allValues[key]) {
        const nestedValues = getDirtyValues(dirtyFields[key], allValues[key]);
        if (Object.keys(nestedValues).length > 0) {
          dirtyValues[key] = nestedValues;
        }
      } else {
        dirtyValues[key] = allValues[key];
      }
    }
  });
  return dirtyValues;
};


// --- General Settings Form ---
const GeneralSettingsForm = ({ userData, onUpdate }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar_key ? `${MEDIA_BASE_URL}${userData.avatar_key}` : '');

  const methods = useForm({
    resolver: zodResolver(GeneralInfoSchema),
    defaultValues: userData,
  });

  const { handleSubmit, formState: { isSubmitting, isDirty } } = methods;

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = handleSubmit(async (data) => {
    // We need to get dirty fields from the form state directly
    const changedInfo = getDirtyValues(methods.formState.dirtyFields, data);
    await onUpdate(changedInfo, avatarFile);
  });

  return (
    <Form methods={methods} onSubmit={onFormSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton component="label">
                  <Iconify icon="solar:camera-add-bold" />
                  <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                </IconButton>
              }
            >
              <Avatar src={avatarPreview} sx={{ width: 128, height: 128 }} />
            </Badge>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Разрешенные форматы: *.jpeg, *.jpg, *.png, *.gif
              <br /> Максимальный размер: 5 MB
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Field.Text name="login" label="Логин" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="firstname" label="Имя" />
                <Field.Text name="surname" label="Фамилия" />
                <Field.Text name="secondname" label="Отчество" />
              </Stack>
              <Field.Text name="email" label="Email" />
              <Field.Text name="birthday" label="Дата рождения" type="date" InputLabelProps={{ shrink: true }}/>
              <Field.Text name="bio.about_me" label="О себе" multiline rows={3} />
              <Field.Text name="bio.specialization" label="Специализация" />
              <Field.Text name="bio.work_place" label="Место работы" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="bio.country" label="Страна" />
                <Field.Text name="bio.city" label="Город" />
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled={!isDirty && !avatarFile}>
          Сохранить изменения
        </LoadingButton>
      </Stack>
    </Form>
  );
};


// --- Security Settings Form ---
const SecuritySettingsForm = ({ onUpdate }) => {
  const methods = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: '', new_password: '' },
  });
  const { handleSubmit, formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (data) => {
    const success = await onUpdate(data);
    if (success) {
      reset();
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Смена пароля</Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Field.Text name="password" type="password" label="Текущий пароль" />
          <Field.Text name="new_password" type="password" label="Новый пароль" />
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
            Сменить пароль
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
};


// --- Support Form ---
const SupportForm = ({ onUpdate }) => {
  const methods = useForm({
    resolver: zodResolver(SupportSchema),
    defaultValues: { message: '' },
  });
  const { handleSubmit, formState: { isSubmitting }, reset } = methods;

  const onSubmit = async (data) => {
    const success = await onUpdate(data);
    if (success) {
      reset();
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Техническая поддержка</Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Field.Text name="message" label="Ваше сообщение" multiline rows={6} />
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ alignSelf: 'flex-end' }}>
            Отправить
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
};


// --- Main Account Settings Page ---
export const AccountSettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState('general');
  const { fetchUser } = useAppStore();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosCopy.get('/user/me');
      // Sanitize data to prevent uncontrolled -> controlled input error
      const user = response.data;
      const sanitizedBio = {};
      for (const key in user.bio) {
        sanitizedBio[key] = user.bio[key] ?? '';
      }
      const sanitizedUser = { ...user, bio: sanitizedBio };
      for (const key in sanitizedUser) {
        if (sanitizedUser[key] === null) {
          sanitizedUser[key] = '';
        }
      }
      setUserData(sanitizedUser);
    } catch (err) {
      setError('Не удалось загрузить данные профиля.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleUpdateGeneralInfo = async (infoData, avatarFile) => {
    setSuccess('');
    setError('');
    let infoUpdated = false;
    let avatarUpdated = false;

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const hasAvatar = !!userData.avatar_key;
        await axiosCopy.post(`/user/avatar?change=${hasAvatar}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUpdated = true;
      }

      if (Object.keys(infoData).length > 0) {
        await axiosCopy.patch('/user/info', infoData);
        infoUpdated = true;
      }

      if (infoUpdated || avatarUpdated) {
        setSuccess('Данные успешно обновлены!');
        fetchUser(); // Refresh user data in global store
        fetchInitialData(); // Refetch data for the form
      } else {
        setSuccess('Нет изменений для сохранения.');
      }
    } catch (err) {
      // setError('Ошибка при обновлении данных.');
    }
  };

  const handleUpdatePassword = async (data) => {
    setSuccess('');
    setError('');
    try {
      await axiosCopy.patch('/user/credentials', data);
      setSuccess('Пароль успешно изменен!');
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось сменить пароль.');
      return false;
    }
  };

  const handleSendSupportMessage = async (data) => {
    setSuccess('');
    setError('');
    try {
      await axiosCopy.post('/support/', { message: data.message });
      setSuccess('Ваше сообщение отправлено в поддержку!');
      return true;
    } catch (err) {
      setError('Не удалось отправить сообщение.');
      return false;
    }
  };

  const TABS = [
    { value: 'general', label: 'Общие', icon: <Iconify icon="solar:user-id-bold" /> },
    { value: 'security', label: 'Безопасность', icon: <Iconify icon="solar:lock-password-bold" /> },
    { value: 'support', label: 'Поддержка', icon: <Iconify icon="solar:help-bold" /> },
  ];

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>Настройки аккаунта</Typography>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {TABS.map((tab) => <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} iconPosition="start" />)}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 3, mt: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, mt: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box>
          {currentTab === 'general' && userData && <GeneralSettingsForm userData={userData} onUpdate={handleUpdateGeneralInfo} />}
          {currentTab === 'security' && <SecuritySettingsForm onUpdate={handleUpdatePassword} />}
          {currentTab === 'support' && <SupportForm onUpdate={handleSendSupportMessage} />}
        </Box>
      )}
    </DashboardContent>
  );
};
