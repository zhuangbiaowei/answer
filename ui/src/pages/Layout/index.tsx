import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { SWRConfig } from 'swr';

import {
  userInfoStore,
  siteInfoStore,
  interfaceStore,
  toastStore,
} from '@answer/stores';
import { Header, AdminHeader, Footer, Toast } from '@answer/components';
import { useSiteSettings, useCheckUserStatus } from '@answer/api';

import Storage from '@/utils/storage';

let isMounted = false;
const Layout: FC = () => {
  const { siteInfo, update: siteStoreUpdate } = siteInfoStore();
  const { update: interfaceStoreUpdate } = interfaceStore();
  const { data: siteSettings } = useSiteSettings();
  const { data: userStatus } = useCheckUserStatus();
  useEffect(() => {
    if (siteSettings) {
      siteStoreUpdate(siteSettings.general);
      interfaceStoreUpdate(siteSettings.interface);
    }
  }, [siteSettings]);
  const updateUser = userInfoStore((state) => state.update);
  const { msg: toastMsg, variant, clear: toastClear } = toastStore();
  const { i18n } = useTranslation();

  const closeToast = () => {
    toastClear();
  };
  if (!isMounted) {
    isMounted = true;
    const lang = Storage.get('LANG');
    const user = Storage.get('userInfo');
    if (user) {
      updateUser(user);
    }
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }

  if (userStatus?.status) {
    const user = Storage.get('userInfo');
    if (userStatus.status !== user.status) {
      user.status = userStatus?.status;
      updateUser(user);
    }
  }

  return (
    <HelmetProvider>
      <Helmet>
        {siteInfo && <meta name="description" content={siteInfo.description} />}
      </Helmet>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
        }}>
        <Header />
        <AdminHeader />
        <div className="position-relative page-wrap">
          <Outlet />
        </div>
        <Toast msg={toastMsg} variant={variant} onClose={closeToast} />
        <Footer />
      </SWRConfig>
    </HelmetProvider>
  );
};

export default Layout;
