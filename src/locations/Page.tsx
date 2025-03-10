import React, { useEffect } from 'react';
import { Spinner } from '@contentful/f36-components';
import { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';

const Page = () => {
  const sdk = useSDK<PageAppSDK>();

  useEffect(() => {
    // Redirect to the app's configuration screen
    sdk.navigator.openAppConfig();
  }, [sdk]);

  return <Spinner size="large" />;
};

export default Page;
