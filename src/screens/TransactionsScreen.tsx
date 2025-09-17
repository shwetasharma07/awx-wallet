import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'purchase' | 'sale';
  amount: number;
  currency: 'ROBUX';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  user?: string;
  game?: string;
}

const TransactionsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'receive',
      amount: 500,
      currency: 'ROBUX',
      status: 'completed',
      timestamp: '2024-01-16 14:30',
      description: 'Received from friend',
      user: 'CoolGamer123',
    },
    {
      id: '2',
      type: 'send',
      amount: 250,
      currency: 'ROBUX',
      status: 'completed',
      timestamp: '2024-01-16 11:15',
      description: 'Sent to friend',
      user: 'BuilderPro',
    },
    {
      id: '3',
      type: 'purchase',
      amount: 100,
      currency: 'ROBUX',
      status: 'completed',
      timestamp: '2024-01-15 20:00',
      description: 'Game Pass Purchase',
      game: 'Adopt Me!',
    },
    {
      id: '4',
      type: 'sale',
      amount: 1500,
      currency: 'ROBUX',
      status: 'completed',
      timestamp: '2024-01-15 15:30',
      description: 'Limited Item Sale',
      game: 'Marketplace',
    },
    {
      id: '5',
      type: 'purchase',
      amount: 75,
      currency: 'ROBUX',
      status: 'pending',
      timestamp: '2024-01-15 10:00',
      description: 'VIP Server',
      game: 'Blox Fruits',
    },
    {
      id: '6',
      type: 'send',
      amount: 1000,
      currency: 'ROBUX',
      status: 'failed',
      timestamp: '2024-01-14 18:45',
      description: 'Failed transfer',
      user: 'Player456',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'sent', label: 'Sent', icon: 'arrow-up' },
    { id: 'received', label: 'Received', icon: 'arrow-down' },
    { id: 'purchases', label: 'Purchases', icon: 'cart' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'purchase':
        return 'cart';
      case 'sale':
        return 'trending-up';
      default:
        return 'help';
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'failed') return '#FF5252';
    if (status === 'pending') return '#FFA726';

    switch (type) {
      case 'receive':
      case 'sale':
        return '#4CAF50';
      case 'send':
      case 'purchase':
        return '#FF5252';
      default:
        return '#757575';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFA726';
      case 'failed':
        return '#FF5252';
      default:
        return '#757575';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${getTransactionColor(item.type, item.status)}20` },
          ]}
        >
          <Ionicons
            name={getTransactionIcon(item.type) as any}
            size={20}
            color={getTransactionColor(item.type, item.status)}
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={styles.transactionSubtitle}>
            {item.user || item.game} • {item.timestamp}
          </Text>
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: getTransactionColor(item.type, item.status) },
          ]}
        >
          {item.type === 'receive' || item.type === 'sale' ? '+' : '-'}
          {item.amount} R$
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusBadgeColor(item.status)}20` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusBadgeColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#4CAF50', '#45B7A8']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="arrow-down" size={24} color="#fff" />
          <Text style={styles.statAmount}>+2,500</Text>
          <Text style={styles.statLabel}>Received</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FF5252', '#FF8A80']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
          <Text style={styles.statAmount}>-1,425</Text>
          <Text style={styles.statLabel}>Sent</Text>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={selectedFilter === filter.id ? '#667eea' : '#95a5a6'}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  statAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: '#667eea',
  },
  filterText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#95a5a6',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default TransactionsScreen;