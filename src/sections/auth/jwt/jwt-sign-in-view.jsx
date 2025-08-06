/* eslint-disable */
import { useEffect, useState, useMemo } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

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

// --- (Ensure these imports point to your actual files) ---
import { axiosCopy, useAppStore } from '../../../store/useBoundStore.js';
import { translation } from 'src/translation.js';

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const { i18n } = useTranslation(); // Get the i18n object for language state

  // --- Dynamic Zod Schema ---
  // The schema is created inside the component using useMemo.
  // It rebuilds only when the language (`i18n.language`) changes.
  const SignInSchema = useMemo(() => (
    zod.object({
      username: zod.string().min(1, {
        message: translation[i18n.language].validationLogin.usernameRequired
      }),
      password: zod
        .string()
        .min(1, { message: translation[i18n.language].validationLogin.passwordRequired })
        .min(6, { message: translation[i18n.language].validationLogin.passwordMinLength }),
    })
  ), [i18n.language]); // Dependency array ensures reactivity to language changes

  const { setToken, setUser, token } = useAppStore();

  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();

  const defaultValues = {
    username: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', data.username);
      params.append('password', data.password);
      params.append('scope', '');
      params.append('client_id', '');
      params.append('client_secret', '');

      const response = await axiosCopy.post('/auth', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
      });

      const { access_token: authToken } = response.data;
      setToken(authToken);

      const res = await axiosCopy.get('/user/me');
      const user = res.data;
      setUser(user);

    } catch (error) {
      console.error('Login failed:', error);
      const message =
        error.response?.data?.message || error.message || translation[i18n.language].error;
      setErrorMsg(message);
    }
  });

  useEffect(() => {
    if (token?.length > 0) {
      router.push('/dashboard/user'); // Or your desired route
    }
  }, [token, router]);

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
      <Stack sx={{ px: 2, py: 5, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}
        >
          Interlinked
        </Typography>
      </Stack>

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Typography variant="h5">{translation[i18n.language].signIn}</Typography>
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {translation[i18n.language].noAccountQuestion}
          </Typography>
          <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
            {translation[i18n.language].signUp}
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="username" label={translation[i18n.language].login} InputLabelProps={{ shrink: true }} />
      <Stack spacing={1.5}>
        <Link
          component={RouterLink}
          href={"/auth/jwt/reset"} // Corrected path
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          {translation[i18n.language].forgetPassword}
        </Link>
        <Field.Text
          name="password"
          label={translation[i18n.language].password}
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
        loading={isSubmitting}
        loadingIndicator={translation[i18n.language].signInButtonLoading}
      >
        {translation[i18n.language].signInButton}
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <Alert severity="info" sx={{ mb: 5 }}>
        {translation[i18n.language].signInUseLoginAndPassword}
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
