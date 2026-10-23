import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api, ActivityItem } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function ActivityScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['activity'],
    queryFn: api.getActivity,
    // Poll every 5 seconds if there are pending items
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(item => item.status === 'pending');
      return hasPending ? 5000 : false;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
      case 'failed': return <Ionicons name="close-circle" size={24} color="#ef4444" />;
      default: return <ActivityIndicator size="small" color="#7C3AED" />;
    }
  };

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {getStatusIcon(item.status)}
      </View>
      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.assetText}>{item.amount} {item.asset}</Text>
          <Text style={[styles.statusText, styles[item.status]]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
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
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#7C3AED" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No claims yet</Text>
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
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pending: { color: '#7C3AED' },
  completed: { color: '#10b981' },
  failed: { color: '#ef4444' },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
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
