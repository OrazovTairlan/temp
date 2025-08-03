import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from '../../../store/useBoundStore.js';

// ----------------------------------------------------------------------

// 1. Zod schema updated to match the new registration fields with Russian messages.
export const RegistrationSchema = zod.object({
  login: zod.string().min(1, { message: 'Логин обязателен!' }),
  password: zod
    .string()
    .min(1, { message: 'Пароль обязателен!' })
    .min(6, { message: 'Пароль должен содержать не менее 6 символов!' }),
  email: zod
    .string()
    .min(1, { message: 'Email обязателен!' })
    .email({ message: 'Неверный формат email адреса!' }),
  firstname: zod.string().min(1, { message: 'Имя обязательно!' }),
  surname: zod.string().min(1, { message: 'Фамилия обязательна!' }),
  secondname: zod.string().optional(), // Отчество не обязательно
  birthday: zod.string().min(1, { message: 'Дата рождения обязательна!' }),
  country: zod.string().min(1, { message: 'Страна обязательна!' }),
  city: zod.string().min(1, { message: 'Город обязателен!' }),
  position: zod.string().min(1, { message: 'Должность обязательна!' }),
  sub_position: zod.string().min(1, { message: 'Под-должность обязательна!' }),
  specialization: zod.string().min(1, { message: 'Специализация обязательна!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const password = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 2. Default values updated for the new form fields.
  const defaultValues = {
    login: '',
    password: '',
    email: '',
    firstname: '',
    surname: '',
    secondname: '',
    birthday: '',
    country: '',
    city: '',
    position: 'Абитуриент на Мед-универ',
    sub_position: 'Общественное здравоохранение',
    specialization: '',
  };

  const methods = useForm({
    resolver: zodResolver(RegistrationSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // 3. onSubmit now constructs the payload and makes a POST request.
  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // The payload is the 'data' object from the form, which already matches the API structure.
      console.log('Sending data to API:', data);

      // Replace '/api/register' with your actual registration endpoint
      const response = await axiosCopy.post('/register', data);

      console.log('API Response:', response.data);
      setSuccessMsg('Регистрация прошла успешно! Вы будете перенаправлены.');

      // Redirect on success after a short delay
      setTimeout(() => {
        router.push(paths.auth.jwt.signIn);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error.response?.data?.message || error.message || 'Произошла ошибка при регистрации.';
      setErrorMsg(message);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Создать аккаунт</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Уже есть аккаунт?
        </Typography>
        <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
          Войти
        </Link>
      </Stack>
    </Stack>
  );

  // 4. Form fields are rendered according to the new requirements.
  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="login" label="Логин" InputLabelProps={{ shrink: true }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text name="firstname" label="Имя" InputLabelProps={{ shrink: true }} />
        <Field.Text name="surname" label="Фамилия" InputLabelProps={{ shrink: true }} />
        <Field.Text name="secondname" label="Отчество" InputLabelProps={{ shrink: true }} />
      </Stack>

      <Field.Text name="email" label="Email адрес" InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="password"
        label="Пароль"
        placeholder="6+ символов"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
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

      <Field.Text
        name="birthday"
        label="Дата рождения"
        type="date"
        InputLabelProps={{ shrink: true }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text name="country" label="Страна" InputLabelProps={{ shrink: true }} />
        <Field.Text name="city" label="Город" InputLabelProps={{ shrink: true }} />
      </Stack>

      <Field.Text name="position" label="Должность" InputLabelProps={{ shrink: true }} />
      <Field.Text name="sub_position" label="Под-должность" InputLabelProps={{ shrink: true }} />
      <Field.Text name="specialization" label="Специализация" InputLabelProps={{ shrink: true }} />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Создание аккаунта..."
      >
        Создать аккаунт
      </LoadingButton>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 3,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'Регистрируясь, я соглашаюсь с '}
      <Link underline="always" color="text.primary">
        Условиями обслуживания
      </Link>
      {' и '}
      <Link underline="always" color="text.primary">
        Политикой конфиденциальности
      </Link>
      .
    </Typography>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>

      {renderTerms}
    </>
  );
}
