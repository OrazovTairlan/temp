/* eslint-disable */
import { useState, useMemo } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { axiosCopy } from '../../../store/useBoundStore.js';

// ❗️ Adjust the path to your translation file
import { translation } from 'src/translation.js';

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const password = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Dynamic Schema Definition ---
  // Validation messages are translated, but the schema structure is static.
  const RegistrationSchema = useMemo(() => zod.object({
    login: zod.string().min(1, { message: translation[i18n.language].validationSignUp.loginRequired }),
    password: zod.string()
      .min(1, { message: translation[i18n.language].validationSignUp.passwordRequired })
      .min(6, { message: translation[i18n.language].validationSignUp.passwordMinLength }),
    email: zod.string()
      .min(1, { message: translation[i18n.language].validationSignUp.emailRequired })
      .email({ message: translation[i18n.language].validationSignUp.emailInvalid }),
    firstname: zod.string().min(1, { message: translation[i18n.language].validationSignUp.firstnameRequired }),
    surname: zod.string().min(1, { message: translation[i18n.language].validationSignUp.surnameRequired }),
    secondname: zod.string().optional(),
    birthday: zod.string().min(1, { message: translation[i18n.language].validationSignUp.birthdayRequired }),
    country: zod.string().min(1, { message: translation[i18n.language].validationSignUp.countryRequired }),
    city: zod.string().min(1, { message: translation[i18n.language].validationSignUp.cityRequired }),
    position: zod.string().min(1, { message: translation[i18n.language].validationSignUp.positionRequired }),
    sub_position: zod.string().optional(),
    specialization: zod.string().min(1, { message: translation[i18n.language].validationSignUp.specializationRequired }),
  }), [i18n.language]);


  // --- Static Russian Options as requested ---
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
    position: positionOptions[0],
    sub_position: subPositionOptions[0],
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

  const selectedPosition = watch('position');

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = { ...data };
      // Logic now compares against the static Russian string 'Другое'
      if (payload.position !== 'Другое') {
        delete payload.sub_position;
      }
      await axiosCopy.post('/register', payload);
      setSuccessMsg(translation[i18n.language].registrationSuccess);
      setTimeout(() => {
        router.push(paths.auth.jwt.signIn);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.detail || error.message || translation[i18n.language].registrationError;
      setErrorMsg(message);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Stack sx={{ px: 2, py: 5, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Interlinked
        </Typography>
      </Stack>
      <Typography variant="h5">{translation[i18n.language].createAccount}</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {translation[i18n.language].alreadyHaveAccount}
        </Typography>
        <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
          {translation[i18n.language].signIn}
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="login" label={translation[i18n.language].login} InputLabelProps={{ shrink: true }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text name="firstname" label={translation[i18n.language].firstname} InputLabelProps={{ shrink: true }} />
        <Field.Text name="surname" label={translation[i18n.language].surname} InputLabelProps={{ shrink: true }} />
        <Field.Text name="secondname" label={translation[i18n.language].secondname} InputLabelProps={{ shrink: true }} />
      </Stack>
      <Field.Text name="email" label={translation[i18n.language].email} InputLabelProps={{ shrink: true }} />
      <Field.Text
        name="password"
        label={translation[i18n.language].password}
        placeholder={translation[i18n.language].passwordPlaceholder}
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
      <Field.Text name="birthday" label={translation[i18n.language].birthDate} type="date" InputLabelProps={{ shrink: true }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text name="country" label={translation[i18n.language].country} InputLabelProps={{ shrink: true }} />
        <Field.Text name="city" label={translation[i18n.language].city} InputLabelProps={{ shrink: true }} />
      </Stack>

      {/* Position Dropdown (uses static Russian options) */}
      <Field.Select name="position" label={translation[i18n.language].position}>
        {positionOptions.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Field.Select>

      {/* Conditional Sub-Position Dropdown (uses static Russian options) */}
      {selectedPosition === 'Другое' && (
        <Field.Select name="sub_position" label={translation[i18n.language].subPosition}>
          {subPositionOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Field.Select>
      )}

      <Field.Text
        name="specialization"
        placeholder={translation[i18n.language].specializationPlaceholder}
        label={translation[i18n.language].specialization}
        InputLabelProps={{ shrink: true }}
      />
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={translation[i18n.language].inCreatingAccount}
      >
        {translation[i18n.language].createAccount}
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {!!successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
