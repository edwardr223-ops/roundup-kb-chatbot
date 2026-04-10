import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-config';
import { CredentialsContext } from './SessionContext';
import Layout from './AppLayout';
import { fetchConfig } from './configService';

Amplify.configure(awsconfig);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        await fetchConfig();
      } catch (err) {
        console.error('Error loading application configuration:', err);
        setConfigError(err.message || 'Failed to load application configuration');
      } finally {
        setIsLoading(false);
      }
    }
    initializeApp();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (configError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Configuration Error</h2>
        <p>{configError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <CredentialsContext.Provider value={null}>
      <div className="App">
        <Layout />
      </div>
    </CredentialsContext.Provider>
  );
}

export default App;
