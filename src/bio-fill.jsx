import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BioForm } from './bio-fill-view.jsx';
import { useAppStore } from './store/useBoundStore.js';

// ----------------------------------------------------------------------

const metadata = { title: `Заполнение личной информации` };

export default function Page() {
  const { user } = useAppStore();
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BioForm userId={user?.id} />
    </>
  );
}
