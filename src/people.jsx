import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import InterlinkedLandingPage from './aboutUs-view.jsx';
import { PeoplePage } from './people-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Люди` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PeoplePage/>
    </>
  );
}
