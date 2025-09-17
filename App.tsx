import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import { WalletProvider } from './src/hooks/useWallet';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <AppNavigator />
        </WalletProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
