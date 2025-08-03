/* eslint-disable */
import { useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from '../../../store/useBoundStore.js';

// ----------------------------------------------------------------------

// --- Zod Schemas ---
const ForgotPasswordSchema = zod.object({
  email: zod.string().min(1, 'Email обязателен').email('Неверный формат email'),
});

const ResetPasswordSchema = zod.object({
  token: zod.string().min(1, 'Токен обязателен'),
  new_password: zod.string().min(6, 'Пароль должен быть не менее 6 символов'),
});


// --- Child Component for the Forgot Password Form ---
function ForgotPasswordForm({ onSetError, onSetSuccess, onSwitchView }) {
  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    onSetError('');
    onSetSuccess('');
    try {
      await axiosCopy.post('/auth/forgot-password', { email: data.email });
      onSetSuccess('Инструкции по сбросу пароля отправлены на вашу почту.');
      onSwitchView('resetPassword');
    } catch (error) {
      onSetError(error.response?.data?.detail || 'Не удалось отправить инструкции. Проверьте email.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Link component={RouterLink} href={"/auth/"} variant="subtitle2" sx={{ alignSelf: 'center' }}>
          Вернуться ко входу
        </Link>
        <Typography sx={{ color: 'text.secondary' }}>
          Введите ваш email, и мы вышлем вам токен для сброса пароля.
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="email" label="Email" />
          <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting}>
            Отправить
          </LoadingButton>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2" sx={{ alignSelf: 'center' }}>
            Вернуться ко входу
          </Link>
        </Stack>
      </Form>
    </>
  );
}


// --- Child Component for the Reset Password Form ---
function ResetPasswordForm({ onSetError, onSetSuccess }) {
  const password = useBoolean();
  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token: '', new_password: '' },
  });
  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(async (data) => {
    onSetError('');
    onSetSuccess('');
    try {
      await axiosCopy.post('/auth/reset-password', data);
      onSetSuccess('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
    } catch (error)      {
      onSetError(error.response?.data?.detail || 'Неверный токен или произошла ошибка.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">Сброс пароля</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Введите токен из письма и ваш новый пароль.
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="token" label="Токен" />
          <Field.Text
            name="new_password"
            label="Новый пароль"
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
          <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained" loading={isSubmitting}>
            Установить новый пароль
          </LoadingButton>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2" sx={{ alignSelf: 'center' }}>
            Вернуться ко входу
          </Link>
        </Stack>
      </Form>
    </>
  );
}


// --- Main Parent Component ---
export function JwtResetPassword() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [view, setView] = useState('forgotPassword'); // 'forgotPassword' | 'resetPassword'

  return (
    <>
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {!!successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      {view === 'forgotPassword' && (
        <ForgotPasswordForm
          onSetError={setErrorMsg}
          onSetSuccess={setSuccessMsg}
          onSwitchView={setView}
        />
      )}

      {view === 'resetPassword' && (
        <ResetPasswordForm
          onSetError={setErrorMsg}
          onSetSuccess={setSuccessMsg}
        />
      )}
    </>
  );
}
