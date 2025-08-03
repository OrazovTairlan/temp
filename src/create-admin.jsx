import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import InterlinkedLandingPage from './aboutUs-view.jsx';
import { AdminCreationPage } from './create-admin-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Профиль пользователя | Панель управления - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AdminCreationPage />
    </>
  );
}
