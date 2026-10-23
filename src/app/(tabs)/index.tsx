import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, Balance } from '../../api/client';
import { useState, useEffect, useMemo } from 'react';
import { calculatePortfolioValue, calculateTotalUsdValue } from '../../lib/amount-logic';

export default function BalancesScreen() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const res = await api.getBalances();
      setLastUpdated(new Date(res.asOf));
      return res?.items || [];
    },
  });

  const totalUsd = useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return calculatePortfolioValue(data);
  }, [data]);

  const renderItem = ({ item }: { item: Balance }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.assetName}>{item.asset}</Text>
        <Text style={styles.assetPrice}>${parseFloat(item.usdPrice || '0').toLocaleString()}</Text>
      </View>
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.label}>Available</Text>
          <Text style={styles.value}>{item.available} {item.asset}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.label}>USD Value</Text>
          <Text style={styles.usdValue}>${calculateTotalUsdValue(item).toFixed(2)}</Text>
        </View>
      </View>
      {(parseFloat(item.pending || '0') > 0 || parseFloat(item.claiming || '0') > 0) && (
        <View style={styles.extraInfo}>
          {parseFloat(item.pending || '0') > 0 && (
            <Text style={styles.pendingText}>Pending: {item.pending} {item.asset}</Text>
          )}
          {parseFloat(item.claiming || '0') > 0 && (
            <Text style={styles.claimingText}>Claiming: {item.claiming} {item.asset}</Text>
          )}
        </View>
      )}
    </View>
  );

  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
      if (seconds < 60) setTimeAgo('just now');
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)} minutes ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)} hours ago`);
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load balances</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>${(totalUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        <Text style={styles.freshnessText}>Last updated: {timeAgo}</Text>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.asset}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No balances found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#7C3AED',
    padding: 30,
    alignItems: 'center',
  },
  headerLabel: {
    color: '#ddd6fe',
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  freshnessText: {
    color: '#ddd6fe',
    fontSize: 12,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  assetPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  usdValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: 'bold',
  },
  extraInfo: {
    marginTop: 10,
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#d97706',
    fontStyle: 'italic',
  },
  claimingText: {
    fontSize: 12,
    color: '#7C3AED',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6b7280',
  },
});
