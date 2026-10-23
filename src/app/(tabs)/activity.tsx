import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api, ActivityItem } from '../../api/client';
import { deduplicateActivityItems } from '../../lib/activity-logic';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['activity'],
    queryFn: async ({ pageParam }) => {
      const res = await api.getActivity(pageParam);
      return res;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // Poll every 5 seconds if there are pending items in the first page
    refetchInterval: (query) => {
      const firstPage = (query.state.data as any)?.pages[0];
      const hasPending = firstPage?.items.some((item: ActivityItem) => item.status === 'pending');
      return hasPending ? 5000 : false;
    },
  });

  const activityItems = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) || [];
    return deduplicateActivityItems(allItems);
  }, [data?.pages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
      case 'confirmed': return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
      case 'failed': return <Ionicons name="close-circle" size={24} color="#ef4444" />;
      default: return <ActivityIndicator size="small" color="#7C3AED" />;
    }
  };

  const getAmountSign = (type: ActivityItem['type']) => {
    switch (type) {
      case 'accrual': return '+';
      case 'reversal':
      case 'claim': return '-';
      default: return '';
    }
  };

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {getStatusIcon(item.status)}
      </View>
      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={[styles.assetText, item.type === 'accrual' ? styles.accrualAmount : styles.reductionAmount]}>
            {getAmountSign(item.type)}{item.amount} {item.asset}
          </Text>
          <Text style={[styles.statusText, styles[item.status as keyof typeof styles] || styles.pending]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.errorText}>Failed to load activity</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activityItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#7C3AED" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        }
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
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  accrualAmount: {
    color: '#10b981',
  },
  reductionAmount: {
    color: '#374151',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pending: { color: '#7C3AED' },
  confirmed: { color: '#10b981' },
  completed: { color: '#10b981' },
  failed: { color: '#ef4444' },
  typeText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: '#9ca3af',
    fontSize: 16,
  },
});
