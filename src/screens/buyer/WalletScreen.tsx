import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getWallet, getLedger } from '../../api/wallet';
import { Wallet, LedgerEntry } from '../../types/models';
import { useFocusEffect } from '@react-navigation/native';

const WalletScreen: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletData, ledgerData] = await Promise.all([
        getWallet(),
        getLedger(20, 0),
      ]);
      setWallet(walletData);
      setLedger(ledgerData);
    } catch (error) {
      // handle
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  const formatCents = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <View style={styles.container}>
      {wallet && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Balance (KES)</Text>
          <Text style={styles.balanceAmount}>
            {formatCents(wallet.available_balance_cents)}
          </Text>
          {wallet.locked_balance_cents > 0 && (
            <Text style={styles.locked}>
              Locked: {formatCents(wallet.locked_balance_cents)}
            </Text>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={ledger}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.ledgerItem}>
            <View>
              <Text style={styles.entryType}>{item.entry_type}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.amount_cents >= 0 ? 'green' : 'red' },
              ]}
            >
              {item.amount_cents >= 0 ? '+' : ''}
              {formatCents(item.amount_cents)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  balanceCard: {
    backgroundColor: '#2E8B57',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceTitle: { color: '#fff', fontSize: 18 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 8 },
  locked: { color: '#FFD700', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  entryType: { fontWeight: '600', textTransform: 'capitalize' },
  description: { color: '#666' },
  amount: { fontWeight: '600', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 20 },
});

export default WalletScreen;