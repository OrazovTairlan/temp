import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtSignInView } from 'src/sections/auth/jwt';
import { JwtResetPassword } from '../../../sections/auth/jwt/jwt-reset-password-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in | Jwt - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtResetPassword />
    </>
  );
}
