import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { BioForm } from './bio-fill-view.jsx';
import { useAppStore } from './store/useBoundStore.js';
import { PostPage } from './detail-post-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Профиль пользователя | Панель управления - ${CONFIG.site.name}` };

export default function Page() {
  const { user } = useAppStore();
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PostPage />
    </>
  );
}
