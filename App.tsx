import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkBanner from './src/components/NetworkBanner';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safe}>
        <NetworkBanner />
        <AppNavigator />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});