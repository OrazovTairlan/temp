/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
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
import { useRouter } from './routes/hooks/index.js';
// ❗️ Make sure this path to your translation file is correct
import { translation } from './translation.js';

// --- Helper Function ---
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
  const { i18n } = useTranslation();

  // Zod schema is now defined inside the component to access i18n
  const GeneralInfoSchema = useMemo(
    () =>
      zod.object({
        login: zod.string().min(1, translation[i18n.language].validationSettings.loginRequired),
        firstname: zod
          .string()
          .min(1, translation[i18n.language].validationSettings.firstnameRequired),
        surname: zod.string().min(1, translation[i18n.language].validationSettings.surnameRequired),
        secondname: zod.string().optional().nullable(),
        email: zod.string().email(translation[i18n.language].validationSettings.emailInvalid),
        birthday: zod
          .string()
          .min(1, translation[i18n.language].validationSettings.birthdayRequired),
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
      }),
    [i18n.language]
  );

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
              {translation[i18n.language].allowedFormats}
              <br /> {translation[i18n.language].maximumSize}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{translation[i18n.language].general}</Typography>
              <Field.Text name="login" label={translation[i18n.language].login} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="firstname" label={translation[i18n.language].firstname} />
                <Field.Text name="surname" label={translation[i18n.language].surname} />
                <Field.Text name="secondname" label={translation[i18n.language].secondname} />
              </Stack>
              <Field.Text name="email" label={translation[i18n.language].email} />
              <Field.Text
                name="birthday"
                label={translation[i18n.language].birthDate}
                type="date"
                InputLabelProps={{ shrink: true }}
              />

              <Typography variant="h6" sx={{ pt: 2 }}>
                {translation[i18n.language].biographyAndCareer}
              </Typography>
              <Field.Text
                name="bio.about_me"
                label={translation[i18n.language].aboutMe}
                multiline
                rows={3}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Field.Text name="bio.country" label={translation[i18n.language].country} />
                <Field.Text name="bio.city" label={translation[i18n.language].city} />
              </Stack>
              <Field.Text
                name="bio.specialization"
                label={translation[i18n.language].specialization}
              />
              <Field.Text name="bio.work_place" label={translation[i18n.language].workPlace} />
              <Field.Select name="bio.position" label={translation[i18n.language].position}>
                {positionOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Field.Select>

              <Typography variant="h6" sx={{ pt: 2 }}>
                {translation[i18n.language].interestingAndOpinions}
              </Typography>
              <Field.Text name="bio.hobby" label={translation[i18n.language].hobby} />
              <Field.Text name="bio.movies" label={translation[i18n.language].films} />
              <Field.Text name="bio.musics" label={translation[i18n.language].music} />
              <Field.Text name="bio.worldview" label={translation[i18n.language].worldvide} />
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
          {translation[i18n.language].save}
        </LoadingButton>
      </Stack>
    </Form>
  );
};

// --- Security Settings Form ---
const SecuritySettingsForm = ({ onUpdate }) => {
  const { i18n } = useTranslation();

  // Zod schema is now defined inside the component to access i18n
  const PasswordSchema = useMemo(
    () =>
      zod.object({
        password: zod
          .string()
          .min(6, translation[i18n.language].validationSettings.passwordCurrentMin),
        new_password: zod
          .string()
          .min(6, translation[i18n.language].validationSettings.passwordNewMin),
      }),
    [i18n.language]
  );

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
        {translation[i18n.language].changePassword}
      </Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Field.Text
            name="password"
            type="password"
            label={translation[i18n.language].currentPassword}
          />
          <Field.Text
            name="new_password"
            type="password"
            label={translation[i18n.language].newPassword}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ alignSelf: 'flex-start' }}
          >
            {translation[i18n.language].changePasswordButton}
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
};

// --- Support Form ---
const SupportForm = ({ onUpdate }) => {
  const { i18n } = useTranslation();

  // Zod schema is now defined inside the component to access i18n
  const SupportSchema = useMemo(
    () =>
      zod.object({
        message: zod
          .string()
          .min(10, translation[i18n.language].validationSettings.supportMessageMin),
      }),
    [i18n.language]
  );

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
        {translation[i18n.language].support}
      </Typography>
      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Field.Text
            name="message"
            label={translation[i18n.language].supportMessage}
            multiline
            rows={6}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ alignSelf: 'flex-end' }}
          >
            {translation[i18n.language].submit}
          </LoadingButton>
        </Stack>
      </Form>
    </Card>
  );
};

// --- Delete Account Form ---
const DeleteAccountForm = ({ onOpenConfirm }) => {
  const { i18n } = useTranslation();
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {translation[i18n.language].deleteAccount}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {translation[i18n.language].deleteAccountDescription}
      </Typography>
      <LoadingButton variant="outlined" color="error" onClick={onOpenConfirm}>
        {translation[i18n.language].deleteAccount}
      </LoadingButton>
    </Card>
  );
};

// --- Main Account Settings Page ---
export const AccountSettingsPage = () => {
  const [userData, setUserData] = useState(null);
  const { i18n } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState('general');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, logout } = useAppStore();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axiosCopy.get('/user/me');
      const fetchedUser = response.data;

      const sanitizedUser = JSON.parse(JSON.stringify(fetchedUser));

      if (!sanitizedUser.bio) {
        sanitizedUser.bio = {};
      }
      sanitizedUser.bio.position = sanitizedUser.bio.position ?? 'Абитуриент на Мед-универ';

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
        setSuccess(translation[i18n.language].success);
        fetchInitialData();
      } else {
        setSuccess(translation[i18n.language].error);
      }
    } catch (err) {
      setError(err.response?.data?.detail || translation[i18n.language].error);
    }
  };

  const handleUpdatePassword = async (data) => {
    setSuccess('');
    setError('');
    try {
      await axiosCopy.patch('/user/credentials', data);
      setSuccess(translation[i18n.language].success);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || translation[i18n.language].error);
      return false;
    }
  };

  const handleSendSupportMessage = async (data) => {
    setSuccess('');
    setError('');
    try {
      await axiosCopy.post('/support/', { message_text: data.message });
      setSuccess(translation[i18n.language].success);
      return true;
    } catch (err) {
      setError(translation[i18n.language].error);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await axiosCopy.delete('/user/me');
      router.push('/auth/jwt/sign-in');
      logout();
      setSuccess(translation[i18n.language].success);
    } catch (err) {
      setError(err.response?.data?.detail || translation[i18n.language].error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const TABS = [
    {
      value: 'general',
      label: translation[i18n.language].general,
      icon: <Iconify icon="solar:user-id-bold" />,
    },
    {
      value: 'security',
      label: translation[i18n.language].security,
      icon: <Iconify icon="solar:lock-password-bold" />,
    },
    {
      value: 'support',
      label: translation[i18n.language].support,
      icon: <Iconify icon="solar:help-bold" />,
    },
    {
      value: 'delete',
      label: translation[i18n.language].deleteAccount,
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
    },
  ];

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {translation[i18n.language].settings}
      </Typography>
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {TABS.filter((item) => {
          if (item.value == 'support' && user.is_verified == false) {
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
        <DialogTitle> {translation[i18n.language].deleteAccountConfirmation}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translation[i18n.language].deleteAccountConfirmationDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)}>
            {' '}
            {translation[i18n.language].close}
          </Button>
          <LoadingButton onClick={handleDeleteAccount} color="error" loading={isDeleting}>
            {translation[i18n.language].deleteAccount}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
};
