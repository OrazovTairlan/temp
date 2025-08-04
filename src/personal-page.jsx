import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import InterlinkedLandingPage from './aboutUs-view.jsx';
import { AccountSettingsPage } from './personal-page-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Настройки страницы` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AccountSettingsPage/>
    </>
  );
}
