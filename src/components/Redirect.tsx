import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';

const Redirect = () => {
  const sdk = useSDK();

  useEffect(() => {
    sdk.navigator.openAppConfig(); // ✅ Opens the app's configuration screen
  }, [sdk]);

  return null; // Nothing needs to be rendered
};

export default Redirect;
