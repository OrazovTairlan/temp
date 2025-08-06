/* eslint-disable */
import { useState, useMemo } from 'react';
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
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from '../../../store/useBoundStore.js';
// ❗️ Make sure this path to your translation file is correct
import { translation } from 'src/translation.js';

// --- Zod Schemas are now defined inside their respective components ---

// --- Child Component for the Forgot Password Form ---
function ForgotPasswordForm({ onSetError, onSetSuccess, onSwitchView }) {
  const { i18n } = useTranslation();

  const ForgotPasswordSchema = useMemo(
    () =>
      zod.object({
        email: zod
          .string()
          .min(1, translation[i18n.language].resetPassword.validation.emailRequired)
          .email(translation[i18n.language].resetPassword.validation.emailInvalid),
      }),
    [i18n.language]
  );

  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    onSetError('');
    onSetSuccess('');
    try {
      await axiosCopy.post('/auth/forgot-password', { email: data.email });
      onSetSuccess(translation[i18n.language].resetPassword.instructionsSent);
      onSwitchView('resetPassword');
    } catch (error) {
      onSetError(
        error.response?.data?.detail || translation[i18n.language].resetPassword.instructionsFailed
      );
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">{translation[i18n.language].resetPassword.title}</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {translation[i18n.language].resetPassword.forgotPasswordInstruction}
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="email" label={translation[i18n.language].resetPassword.emailLabel} />
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {translation[i18n.language].resetPassword.sendButton}
          </LoadingButton>
          <Link
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            variant="subtitle2"
            sx={{ alignSelf: 'center' }}
          >
            {translation[i18n.language].resetPassword.returnToSignIn}
          </Link>
        </Stack>
      </Form>
    </>
  );
}

// --- Child Component for the Reset Password Form ---
function ResetPasswordForm({ onSetError, onSetSuccess }) {
  const { i18n } = useTranslation();
  const password = useBoolean();

  const ResetPasswordSchema = useMemo(
    () =>
      zod.object({
        token: zod
          .string()
          .min(1, translation[i18n.language].resetPassword.validation.tokenRequired),
        new_password: zod
          .string()
          .min(6, translation[i18n.language].resetPassword.validation.passwordMin),
      }),
    [i18n.language]
  );

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token: '', new_password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    onSetError('');
    onSetSuccess('');
    try {
      await axiosCopy.post('/auth/reset-password', data);
      onSetSuccess(translation[i18n.language].resetPassword.passwordResetSuccess);
    } catch (error) {
      onSetError(
        error.response?.data?.detail || translation[i18n.language].resetPassword.resetFailed
      );
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">{translation[i18n.language].resetPassword.title}</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {translation[i18n.language].resetPassword.resetPasswordInstruction}
        </Typography>
      </Stack>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text name="token" label={translation[i18n.language].resetPassword.tokenLabel} />
          <Field.Text
            name="new_password"
            label={translation[i18n.language].resetPassword.newPasswordLabel}
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
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {translation[i18n.language].resetPassword.setNewPasswordButton}
          </LoadingButton>
          <Link
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            variant="subtitle2"
            sx={{ alignSelf: 'center' }}
          >
            {translation[i18n.language].resetPassword.returnToSignIn}
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

      {view === 'forgotPassword' && (
        <ForgotPasswordForm
          onSetError={setErrorMsg}
          onSetSuccess={setSuccessMsg}
          onSwitchView={setView}
        />
      )}

      {view === 'resetPassword' && (
        <ResetPasswordForm onSetError={setErrorMsg} onSetSuccess={setSuccessMsg} />
      )}
    </>
  );
}
