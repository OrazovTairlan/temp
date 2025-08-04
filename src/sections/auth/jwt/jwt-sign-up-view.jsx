/* eslint-disable */
import { useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from '../../../store/useBoundStore.js';
import MenuItem from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

// Zod schema updated for conditional logic
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
  secondname: zod.string().optional(),
  birthday: zod.string().min(1, { message: 'Дата рождения обязательна!' }),
  country: zod.string().min(1, { message: 'Страна обязательна!' }),
  city: zod.string().min(1, { message: 'Город обязателен!' }),
  position: zod.string().min(1, { message: 'Должность обязательна!' }),
  // sub_position is now optional as it's conditional
  sub_position: zod.string().optional(),
  specialization: zod.string().min(1, { message: 'Специализация обязательна!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const password = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Watch the value of the 'position' field to conditionally show 'sub_position'
  const selectedPosition = watch('position');

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = { ...data };

      // If position is not 'Другое', remove sub_position from the payload
      if (payload.position !== 'Другое') {
        delete payload.sub_position;
      }

      console.log('Sending data to API:', payload);

      await axiosCopy.post('/register', payload);

      setSuccessMsg('Регистрация прошла успешно! Вы будете перенаправлены.');

      setTimeout(() => {
        router.push(paths.auth.jwt.signIn);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error.response?.data?.detail || error.message || 'Произошла ошибка при регистрации.';
      setErrorMsg(message);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Stack sx={{ px: 2, py: 5, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: '900', // Use a heavier font weight for "bolder"
            textTransform: 'uppercase', // Transform the text to uppercase
            letterSpacing: 1.5, // Add some spacing for a stylized look
          }}
        >
          Interlinked
        </Typography>
      </Stack>
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

      {/* Position is now a Select dropdown */}
      <Field.Select name="position" label="Должность">
        {positionOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Field.Select>

      {/* Conditionally render sub_position based on the selected position */}
      {selectedPosition == 'Другое' && (
        <Field.Select name="sub_position" label="Под-должность">
          {subPositionOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Field.Select>
      )}

      <Field.Text name="specialization" placeholder = "терапевт, педиатр, невролог и другие" label="Специализация" InputLabelProps={{ shrink: true }} />

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

      {/* {renderTerms} */}
    </>
  );
}
