/* eslint-disable */
import { useEffect, useState } from 'react';
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
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// --- Import the Zustand store and custom axios ---
import { axiosCopy, useAppStore } from '../../../store/useBoundStore.js';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  username: zod.string().min(1, { message: 'Логин обязателен!' }),
  password: zod
    .string()
    .min(1, { message: 'Пароль обязателен!' })
    .min(6, { message: 'Пароль должен содержать не менее 6 символов!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  // Get state and actions from the Zustand store

  const { setToken, setUser, token } = useAppStore();

  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const defaultValues = {
    username: 'user',
    password: 'password123',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting }, // Use isSubmitting for loading state
  } = methods;

  // The onSubmit function now calls the API and then the Zustand store
  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg(''); // Reset local error on new submission

    try {
      // 1. Create the URL-encoded form data payload using URLSearchParams.
      // This matches the 'Content-Type: application/x-www-form-urlencoded' requirement.
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', data.username);
      params.append('password', data.password);
      params.append('scope', '');
      params.append('client_id', '');
      params.append('client_secret', '');

      // 2. Make a POST request with the correct headers and URL-encoded data.
      const response = await axiosCopy.post('/auth', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
      });


      // 3. Extract user data and token from the API response
      //    (Assuming the API returns { user: {...}, token: '...' })
      const { access_token: authToken } = response.data;

      // 4. Call the login action from the Zustand store to save the state
      setToken(authToken);

      const res = await axiosCopy.get('/user/me');
      const user = res.data;
      setUser(user);
    } catch (error) {
      // 5. Catch and display errors from the API call
      console.error('Login failed:', error);
      const message =
        error.response?.data?.message || error.message || 'Ошибка входа. Проверьте данные.';
      setErrorMsg(message);
    }
  });

  // This effect listens to the Zustand store for successful login and redirects
  useEffect(() => {
    if (token?.length > 0) {
      router.push("/dashboard/user");
    }
  }, [token, router]);

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Войти в аккаунт</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Нет аккаунта?
        </Typography>
        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Зарегистрироваться
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="username" label="Логин" InputLabelProps={{ shrink: true }} />
      <Stack spacing={1.5}>
        {/* <Link */}
        {/*   component={RouterLink} */}
        {/*   href="/auth/jwt/reset" */}
        {/*   variant="body2" */}
        {/*   color="inherit" */}
        {/*   sx={{ alignSelf: 'flex-end' }} */}
        {/* > */}
        {/*   Забыли пароль? */}
        {/* </Link> */}
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
      </Stack>
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting} // Loading state is now controlled by the form state
        loadingIndicator="Вход..."
      >
        Войти
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <Alert severity="info" sx={{ mb: 5 }}>
        Используйте логин и пароль для входа.
      </Alert>

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
