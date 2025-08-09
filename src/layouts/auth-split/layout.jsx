import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Section } from './section';
import { Main, Content } from './main';
import { HeaderBase } from '../core/header-base';
import { LayoutSection } from '../core/layout-section';
import { ChangePopover } from '../../ChangePopover.jsx';
import { useTranslation } from 'react-i18next';
import { translation } from '../../translation.js';

// ----------------------------------------------------------------------

export function AuthSplitLayout({ sx, section, children }) {
  const mobileNavOpen = useBoolean();
  const { i18n } = useTranslation();

  const layoutQuery = 'md';

  return (
    <LayoutSection
      headerSection={
        /** **************************************
         * Header
         *************************************** */
        <HeaderBase
          disableElevation
          layoutQuery={layoutQuery}
          onOpenNav={mobileNavOpen.onTrue}
          slotsDisplay={{
            signIn: false,
            account: false,
            purchase: false,
            contacts: false,
            searchbar: false,
            workspaces: false,
            menuButton: false,
            localization: false,
            notifications: false,
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
          }}
          slotProps={{ container: { maxWidth: false } }}
          sx={{ position: { [layoutQuery]: 'fixed' } }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      sx={sx}
      cssVars={{
        '--layout-auth-content-width': '420px',
      }}
    >
      <Main layoutQuery={layoutQuery}>
        <Section
          title={translation[i18n.language].registrationTitle}
          layoutQuery={layoutQuery}
          imgUrl={section?.imgUrl}
          method={CONFIG.auth.method}
          subtitle={section?.subtitle}
          methods={[]}
        />
        <Content layoutQuery={layoutQuery}>{children}</Content>
      </Main>
    </LayoutSection>
  );
}
