import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UserProfileView } from 'src/sections/user/view';
import { OtherUserProfileView } from './other-user-view.jsx';

// ----------------------------------------------------------------------

const metadata = { title: `Профиль пользователя` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OtherUserProfileView />
    </>
  );
}
