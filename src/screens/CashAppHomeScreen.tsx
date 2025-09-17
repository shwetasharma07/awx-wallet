import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';

const { width } = Dimensions.get('window');

const CashAppHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    wallet,
    balances,
    transactions,
    isLoading,
    error,
    refreshBalances,
    refreshTransactions,
    getTotalBalanceUSD,
    getRecentTransactions
  } = useWallet();

  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  const balance = getTotalBalanceUSD();
  const recentTransactions = getRecentTransactions(5);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshBalances(), refreshTransactions()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBalances, refreshTransactions]);

  const quickActions = [
    {
      id: 1,
      name: 'Send',
      icon: 'paper-plane',
      color: '#00D2FF',
      onPress: () => navigation.navigate('SendMoney' as never)
    },
    {
      id: 2,
      name: 'Request',
      icon: 'hand-left',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('RequestMoney' as never)
    },
    {
      id: 3,
      name: 'Add',
      icon: 'add-circle',
      color: '#4CAF50',
      onPress: () => navigation.navigate('AddMoney' as never)
    },
    {
      id: 4,
      name: 'Cash Out',
      icon: 'wallet',
      color: '#FF9500',
      onPress: () => navigation.navigate('CashOut' as never)
    },
  ];

  const formatTransactionForDisplay = (transaction: any) => {
    return {
      id: transaction.id,
      type: transaction.type.includes('in') ? 'received' :
            transaction.type.includes('out') ? 'sent' : 'purchase',
      description: transaction.description,
      amount: transaction.amount,
      time: new Date(transaction.timestamp).toLocaleDateString(),
      user: transaction.counterparty?.name || 'Unknown'
    };
  };

  const displayTransactions = recentTransactions.length > 0
    ? recentTransactions.map(formatTransactionForDisplay)
    : [
        {
          id: '1',
          type: 'received',
          user: 'Welcome Bonus',
          amount: 25,
          time: 'Today',
          description: 'Welcome to your digital wallet!'
        },
      ];

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  useEffect(() => {
    const checkMockMode = async () => {
      const mockMode = await AsyncStorage.getItem('mock_mode');
      setIsMockMode(mockMode === 'true');
    };
    checkMockMode();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Demo Mode Badge */}
        {isMockMode && (
          <View style={styles.demoBadge}>
            <Ionicons name="play-circle" size={16} color="#fff" />
            <Text style={styles.demoBadgeText}>DEMO MODE - Using Mock Data</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>RW</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Cash App Style Balance Display */}
        <View style={styles.balanceSection}>
          <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.balanceToggle}>
            <Text style={styles.balanceLabel}>Cash App Balance</Text>
            <Ionicons
              name={balanceVisible ? "eye" : "eye-off"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          <Text style={styles.mainBalance}>
            {balanceVisible ? `$${balance.toFixed(2)}` : '••••'}
          </Text>

          {/* Multi-currency display */}
          {balances.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.otherBalances}>
              {balances.filter(b => b.currency !== 'USD').map(bal => (
                <View key={bal.currency} style={styles.otherBalanceItem}>
                  <Text style={styles.otherBalanceCurrency}>{bal.currency}</Text>
                  <Text style={styles.otherBalanceAmount}>
                    {balanceVisible ? bal.available_amount.toFixed(2) : '••••'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions Grid - Cash App Style */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={[action.color, `${action.color}CC`]}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {displayTransactions.map((activity) => (
            <TouchableOpacity key={activity.id} style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View style={[
                  styles.activityIcon,
                  {
                    backgroundColor: activity.type === 'received' ? '#4CAF50' :
                                   activity.type === 'sent' ? '#FF5252' : '#FFA726'
                  }
                ]}>
                  <Ionicons
                    name={
                      activity.type === 'received' ? 'arrow-down' :
                      activity.type === 'sent' ? 'arrow-up' : 'cart'
                    }
                    size={20}
                    color="#fff"
                  />
                </View>

                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>
                    {activity.description || (
                      activity.type === 'received'
                        ? `From ${activity.user}`
                        : activity.type === 'sent'
                        ? `To ${activity.user}`
                        : `Purchase`
                    )}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>

              <Text style={[
                styles.activityAmount,
                {
                  color: activity.type === 'received' ? '#4CAF50' : '#000',
                  fontWeight: activity.type === 'received' ? 'bold' : '600'
                }
              ]}>
                {activity.type === 'received' ? '+' : ''}${activity.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}

          {displayTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your transactions will appear here</Text>
            </View>
          )}
        </View>


        {/* Spending Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>This Week</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Money In</Text>
              <Text style={styles.insightValue}>$127.50</Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Money Out</Text>
              <Text style={styles.insightValue}>$89.25</Text>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightRow}>
              <Text style={styles.insightLabelBold}>Net Change</Text>
              <Text style={[styles.insightValue, { color: '#4CAF50', fontWeight: 'bold' }]}>
                +$38.25
              </Text>
            </View>
          </View>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="warning" size={24} color="#FF5252" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  demoBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileButton: {
    padding: 5,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  balanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  mainBalance: {
    fontSize: 64,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 20,
  },
  otherBalances: {
    marginTop: 10,
  },
  otherBalanceItem: {
    alignItems: 'center',
    marginHorizontal: 15,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  otherBalanceCurrency: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  otherBalanceAmount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  activitySection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 25,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 16,
    color: '#00D2FF',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityDetails: {
    flex: 1,
  },
  activityTime: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightLabel: {
    fontSize: 16,
    color: '#666',
  },
  insightLabelBold: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  insightDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    marginLeft: 12,
    flex: 1,
  },
});

export default CashAppHomeScreen;