/* eslint-disable */
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import DialogTitle from '@mui/material/DialogTitle';

// Assuming these components and utilities are correctly set up
import { DashboardContent } from './layouts/dashboard/index.js';
import { axiosCopy, useAppStore } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// --- Zod Schemas for Validation ---
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
 */
const getDirtyValues = (dirtyFields, allValues) => {
  const dirtyValues = {};
  if (!dirtyFields || !allValues) {
    return dirtyValues;
  }
  Object.keys(dirtyFields).forEach((key) => {
    if (dirtyFields[key]) {
      if (
        typeof dirtyFields[key] === 'object' &&
        !Array.isArray(dirtyFields[key]) &&
        allValues[key]
      ) {
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

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

  const methods = useForm({
    resolver: zodResolver(GeneralInfoSchema),
    defaultValues: userData,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userData?.avatar_key) {
        try {
          const response = await axiosCopy.get('/file/url', {
            params: { key: userData.avatar_key },
          });
          setAvatarUrl(response.data);
        } catch (error) {
          console.error('Failed to fetch avatar URL:', error);
        }
      }
    };
    fetchAvatar();
  }, [userData?.avatar_key]);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = handleSubmit(async (data) => {
    const changedInfo = getDirtyValues(dirtyFields, data);
    await onUpdate(changedInfo, avatarFile);
  });

  const displayUrl = avatarPreview || avatarUrl;

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
              <Avatar src={displayUrl} sx={{ width: 128, height: 128 }} />
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
              <Typography variant="h6">Основная информация</Typography>
              <Field.Text name="login" label="Логин" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="firstname" label="Имя" />
                <Field.Text name="surname" label="Фамилия" />
                <Field.Text name="secondname" label="Отчество" />
              </Stack>
              <Field.Text name="email" label="Email" />
              <Field.Text
                name="birthday"
                label="Дата рождения"
                type="date"
                InputLabelProps={{ shrink: true }}
              />

              <Typography variant="h6" sx={{ pt: 2 }}>
                Биография и карьера
              </Typography>
              <Field.Text name="bio.about_me" label="О себе" multiline rows={3} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="bio.country" label="Страна" />
                <Field.Text name="bio.city" label="Город" />
              </Stack>
              <Field.Text name="bio.specialization" label="Специализация" />
              <Field.Text name="bio.work_place" label="Место работы" />
              <Field.Select name="bio.position" label="Должность">
                {positionOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Field.Select>

              <Typography variant="h6" sx={{ pt: 2 }}>
                Интересы и взгляды
              </Typography>
              <Field.Text name="bio.hobby" label="Хобби" />
              <Field.Text name="bio.movies" label="Любимые фильмы" />
              <Field.Text name="bio.musics" label="Любимая музыка" />
              <Field.Text name="bio.worldview" label="Мировоззрение" />
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!Object.keys(dirtyFields).length && !avatarFile}
        >
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
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    const success = await onUpdate(data);
    if (success) {
      reset();
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Смена пароля
      </Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Field.Text name="password" type="password" label="Текущий пароль" />
          <Field.Text name="new_password" type="password" label="Новый пароль" />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ alignSelf: 'flex-start' }}
          >
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
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    const success = await onUpdate(data);
    if (success) {
      reset();
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Техническая поддержка
      </Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Field.Text name="message" label="Ваше сообщение" multiline rows={6} />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ alignSelf: 'flex-end' }}
          >
            Отправить
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
};

// --- Delete Account Form ---
const DeleteAccountForm = ({ onOpenConfirm }) => (
  <Card sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 1 }}>
      Удалить аккаунт
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      После удаления вашего аккаунта все данные будут безвозвратно утеряны. Пожалуйста, будьте
      уверены, что хотите продолжить.
    </Typography>
    <LoadingButton variant="outlined" color="error" onClick={onOpenConfirm}>
      Удалить аккаунт
    </LoadingButton>
  </Card>
);

// --- Main Account Settings Page ---
export const AccountSettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState('general');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAppStore();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosCopy.get('/user/me');
      const user = response.data;

      // Deep copy to avoid mutating the original state object
      const sanitizedUser = JSON.parse(JSON.stringify(user));

      // Ensure bio object exists and set a default for position if needed
      if (!sanitizedUser.bio) {
        sanitizedUser.bio = {};
      }
      sanitizedUser.bio.position = sanitizedUser.bio.position ?? 'Абитуриент на Мед-универ';

      // Recursively replace null values with empty strings for controlled form fields
      const replaceNullWithEmpty = (obj) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] === null) {
            obj[key] = '';
          } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            replaceNullWithEmpty(obj[key]);
          }
        });
      };

      replaceNullWithEmpty(sanitizedUser);
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
        fetchInitialData(); // This re-fetches data for the form
      } else {
        setSuccess('Нет изменений для сохранения.');
      }
    } catch (err) {
      // setError(err.response?.data?.detail || 'Ошибка при обновлении данных.');
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
      await axiosCopy.post('/support/', { message_text: data.message });
      setSuccess('Ваше сообщение отправлено в поддержку!');
      return true;
    } catch (err) {
      setError('Не удалось отправить сообщение.');
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await axiosCopy.delete('/user/me');
      setSuccess('Ваш аккаунт был успешно удален.');
      // Here you would typically trigger a logout and redirect the user.
      // For example: logout(); router.push('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось удалить аккаунт.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const TABS = [
    { value: 'general', label: 'Общие', icon: <Iconify icon="solar:user-id-bold" /> },
    { value: 'security', label: 'Безопасность', icon: <Iconify icon="solar:lock-password-bold" /> },
    { value: 'support', label: 'Поддержка', icon: <Iconify icon="solar:help-bold" /> },
    {
      value: 'delete',
      label: 'Удалить аккаунт',
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
    },
  ];

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Настройки аккаунта
      </Typography>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {TABS.filter((item) => {
          if (item.value == 'support' && user.role != 'admin') {
            return false;
          }
          return true;
        }).map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            label={tab.label}
            iconPosition="start"
            sx={{
              ...(tab.value === 'delete' && {
                color: 'error.main',
                '&.Mui-selected': {
                  color: 'error.main',
                },
              }),
            }}
          />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3, mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, mt: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {currentTab === 'general' && userData && (
            <GeneralSettingsForm userData={userData} onUpdate={handleUpdateGeneralInfo} />
          )}
          {currentTab === 'security' && <SecuritySettingsForm onUpdate={handleUpdatePassword} />}
          {currentTab === 'support' && <SupportForm onUpdate={handleSendSupportMessage} />}
          {currentTab === 'delete' && (
            <DeleteAccountForm onOpenConfirm={() => setIsConfirmOpen(true)} />
          )}
        </Box>
      )}

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Подтвердите удаление аккаунта</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо, и все ваши данные
            будут потеряны.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>Отмена</Button>
          <LoadingButton onClick={handleDeleteAccount} color="error" loading={isDeleting}>
            Удалить
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
};
