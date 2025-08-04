import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import InterlinkedLandingPage from './aboutUs-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Манифест` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InterlinkedLandingPage />
    </>
  );
}
