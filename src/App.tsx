import React, { Suspense, lazy, useMemo } from 'react';
import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Flex, Spinner } from '@contentful/f36-components';

const ConfigScreen = lazy(() => import('./locations/ConfigScreen'));
const Field = lazy(() => import('./locations/Field'));
const EntryEditor = lazy(() => import('./locations/EntryEditor'));
const Sidebar = lazy(() => import('./locations/Sidebar'));
const Page = lazy(() => import('./locations/Page'));

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: Page,
};

function LocationFallback() {
  return (
    <Flex justifyContent="center" alignItems="center" style={{ minHeight: '4rem' }}>
      <Spinner size="large" />
    </Flex>
  );
}

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(ComponentLocationSettings)) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={<LocationFallback />}>
      <Component />
    </Suspense>
  );
};

export default App;
