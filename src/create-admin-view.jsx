/* eslint-disable */
import React, { useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  Typography,
  Alert,
  Stack,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Assuming these components and utilities are correctly set up
import { DashboardContent } from './layouts/dashboard/index.js'; // Adjust path if needed
import { axiosCopy } from 'src/store/useBoundStore';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';

// --- Zod Schema for Validation (in Russian) ---
const AdminCreationSchema = zod.object({
  login: zod.string().min(1, 'Логин обязателен для заполнения'),
  email: zod.string().email('Неверный формат email адреса').min(1, 'Email обязателен для заполнения'),
  password: zod.string().min(6, 'Пароль должен содержать не менее 6 символов'),
});

// --- Main Admin Creation Page Component ---
export const AdminCreationPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const password = useBoolean();

  const defaultValues = {
    login: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(AdminCreationSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // The 'data' object matches the required API structure
      await axiosCopy.post('/admin/create', data);
      setSuccessMsg(`Администратор "${data.login}" успешно создан!`);
      reset(); // Clear the form on success
    } catch (error) {
      console.error('Admin creation failed:', error);
      setErrorMsg(error.response?.data?.detail || 'Не удалось создать администратора.');
    }
  });

  return (
    <DashboardContent>
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          py: 5,
        }}
      >
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Создание нового администратора
          </Typography>

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

          <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Field.Text name="login" label="Логин" />
              <Field.Text name="email" label="Email адрес" type="email" />
              <Field.Text
                name="password"
                label="Пароль"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end">
                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <LoadingButton
                sx={{ mt: 2 }}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Создать администратора
              </LoadingButton>
            </Stack>
          </Form>
        </Card>
      </Box>
    </DashboardContent>
  );
};
