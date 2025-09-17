import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  accountNumber: string;
  routingNumber: string;
  isDefault?: boolean;
}

const CashOutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { withdrawFunds, getTotalBalanceUSD, isLoading } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const balance = getTotalBalanceUSD();

  // Mock bank accounts
  const bankAccounts: BankAccount[] = [
    {
      id: '1',
      bankName: 'Chase Bank',
      accountType: 'checking',
      accountNumber: '••••5678',
      routingNumber: '021000021',
      isDefault: true,
    },
    {
      id: '2',
      bankName: 'Bank of America',
      accountType: 'savings',
      accountNumber: '••••9012',
      routingNumber: '026009593',
    },
    {
      id: '3',
      bankName: 'Wells Fargo',
      accountType: 'checking',
      accountNumber: '••••3456',
      routingNumber: '121000248',
    },
  ];

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');

    if (parts.length <= 2) {
      let result = parts[0];
      if (parts.length === 2) {
        result += '.' + parts[1].slice(0, 2);
      }
      setAmount(result);
    }
  };

  const handleCashOut = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('No Bank Account', 'Please select a bank account');
      return;
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > balance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough money to cash out this amount');
      return;
    }

    if (withdrawAmount < 1) {
      Alert.alert('Minimum Amount', 'Minimum cash out amount is $1.00');
      return;
    }

    Alert.alert(
      'Confirm Cash Out',
      `Cash out $${withdrawAmount.toFixed(2)} to ${selectedAccount.bankName} ${selectedAccount.accountType}?\n\nYou should receive the money in 1-3 business days.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cash Out',
          style: 'default',
          onPress: async () => {
            try {
              await withdrawFunds(
                withdrawAmount,
                'USD',
                selectedAccount.id,
                `Cash out to ${selectedAccount.bankName}`
              );
              Alert.alert(
                'Cash Out Initiated',
                `$${withdrawAmount.toFixed(2)} is being transferred to your ${selectedAccount.bankName} account. You should receive it in 1-3 business days.`
              );
              setAmount('');
            } catch (error) {
              Alert.alert('Cash Out Failed', 'Please try again later');
            }
          },
        },
      ]
    );
  };

  const selectBankAccount = (account: BankAccount) => {
    setSelectedAccount(account);
  };

  const addNewBankAccount = () => {
    Alert.alert('Add Bank Account', 'This feature will be available soon!');
  };

  const cashOutAll = () => {
    setAmount(balance.toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cash Out</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Available Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
            <TouchableOpacity style={styles.cashOutAllButton} onPress={cashOutAll}>
              <Text style={styles.cashOutAllText}>Cash out all</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount to cash out</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
            </View>
            {amount && (
              <Text style={styles.remainingBalance}>
                Remaining balance: ${(balance - parseFloat(amount || '0')).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountSection}>
            {[25, 50, 100, 250].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  quickAmount > balance && styles.disabledButton,
                ]}
                onPress={() => quickAmount <= balance && setAmount(quickAmount.toString())}
                disabled={quickAmount > balance}
              >
                <Text style={[
                  styles.quickAmountText,
                  quickAmount > balance && styles.disabledText,
                ]}>
                  ${quickAmount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bank Accounts */}
          <View style={styles.bankAccountsSection}>
            <Text style={styles.sectionTitle}>Choose bank account</Text>

            {bankAccounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.bankAccountItem,
                  selectedAccount?.id === account.id && styles.selectedBankAccount,
                ]}
                onPress={() => selectBankAccount(account)}
              >
                <View style={styles.accountLeft}>
                  <View style={styles.accountIcon}>
                    <Ionicons name="business" size={24} color="#fff" />
                  </View>
                  <View style={styles.accountInfo}>
                    <View style={styles.accountHeader}>
                      <Text style={styles.bankName}>{account.bankName}</Text>
                      {account.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.accountDetails}>
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} {account.accountNumber}
                    </Text>
                    <Text style={styles.transferTime}>1-3 business days • Free</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  {selectedAccount?.id === account.id ? (
                    <Ionicons name="checkmark-circle" size={24} color="#FF9500" />
                  ) : (
                    <Ionicons name="radio-button-off" size={24} color="#ccc" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add New Bank Account */}
            <TouchableOpacity
              style={styles.addAccountButton}
              onPress={addNewBankAccount}
            >
              <View style={styles.addAccountIcon}>
                <Ionicons name="add" size={24} color="#007AFF" />
              </View>
              <Text style={styles.addAccountText}>Add new bank account</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Transfer Information */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Transfers typically take 1-3 business days</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Bank-level security and encryption</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color="#666" />
              <Text style={styles.infoText}>No fees for standard transfers</Text>
            </View>
          </View>

          {/* Limits Information */}
          <View style={styles.limitsSection}>
            <Text style={styles.limitsTitle}>Daily Limits</Text>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Standard transfer</Text>
              <Text style={styles.limitValue}>$25,000</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Instant transfer</Text>
              <Text style={styles.limitValue}>$1,000</Text>
            </View>
          </View>
        </ScrollView>

        {/* Cash Out Button */}
        <View style={styles.cashOutButtonContainer}>
          <LinearGradient
            colors={['#FF9500', '#FFAD33']}
            style={styles.cashOutButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.cashOutButtonContent}
              onPress={handleCashOut}
              disabled={isLoading || !amount || !selectedAccount}
            >
              {isLoading ? (
                <Text style={styles.cashOutButtonText}>Processing...</Text>
              ) : (
                <>
                  <Ionicons name="wallet-outline" size={20} color="#fff" />
                  <Text style={styles.cashOutButtonText}>
                    Cash Out{amount ? ` $${parseFloat(amount || '0').toFixed(2)}` : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff8f0',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe4b5',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 10,
  },
  cashOutAllButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  cashOutAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dollarSign: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9500',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9500',
    minWidth: 100,
    textAlign: 'left',
  },
  remainingBalance: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quickAmountSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  quickAmountButton: {
    backgroundColor: '#fff8f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffe4b5',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  disabledText: {
    color: '#ccc',
  },
  bankAccountsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  bankAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedBankAccount: {
    borderColor: '#FF9500',
    backgroundColor: '#fff8f0',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  accountDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transferTime: {
    fontSize: 12,
    color: '#999',
  },
  accountRight: {
    marginLeft: 10,
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addAccountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  addAccountText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  limitsSection: {
    paddingHorizontal: 20,
    marginBottom: 120,
  },
  limitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  limitLabel: {
    fontSize: 14,
    color: '#333',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  cashOutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cashOutButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cashOutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  cashOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CashOutScreen;