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

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  details: string;
  icon: string;
  isDefault?: boolean;
}

const AddMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addFunds, getTotalBalanceUSD, isLoading } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const balance = getTotalBalanceUSD();

  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Chase Debit',
      details: '•••• 4242',
      icon: 'card-outline',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa Credit',
      details: '•••• 1234',
      icon: 'card-outline',
    },
    {
      id: '3',
      type: 'bank',
      name: 'Bank of America',
      details: 'Checking ••••5678',
      icon: 'business-outline',
    },
    {
      id: '4',
      type: 'bank',
      name: 'Wells Fargo',
      details: 'Savings ••••9012',
      icon: 'business-outline',
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

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('No Payment Method', 'Please select a payment method');
      return;
    }

    const addAmount = parseFloat(amount);
    const maxAmount = selectedMethod.type === 'card' ? 2500 : 10000;

    if (addAmount > maxAmount) {
      Alert.alert(
        'Amount Limit Exceeded',
        `Maximum amount for ${selectedMethod.type === 'card' ? 'card' : 'bank transfer'} is $${maxAmount.toLocaleString()}`
      );
      return;
    }

    Alert.alert(
      'Confirm Addition',
      `Add $${addAmount.toFixed(2)} from ${selectedMethod.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Money',
          style: 'default',
          onPress: async () => {
            try {
              await addFunds(addAmount, 'USD', selectedMethod.type, selectedMethod.id);
              Alert.alert(
                'Success',
                `$${addAmount.toFixed(2)} has been added to your wallet from ${selectedMethod.name}`
              );
              setAmount('');
            } catch (error) {
              Alert.alert('Add Money Failed', 'Please try again later');
            }
          },
        },
      ]
    );
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const addNewPaymentMethod = () => {
    Alert.alert('Add Payment Method', 'This feature will be available soon!');
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
            <Text style={styles.headerTitle}>Add Money</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Current Balance */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount to add</Text>
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
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountSection}>
            {[25, 50, 100, 200].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethodsSection}>
            <Text style={styles.sectionTitle}>Choose payment method</Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedMethod?.id === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => selectPaymentMethod(method)}
              >
                <View style={styles.methodLeft}>
                  <View style={[
                    styles.methodIcon,
                    { backgroundColor: method.type === 'card' ? '#4CAF50' : '#2196F3' }
                  ]}>
                    <Ionicons name={method.icon as any} size={24} color="#fff" />
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodHeader}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.methodDetails}>{method.details}</Text>
                    <Text style={styles.methodLimits}>
                      {method.type === 'card'
                        ? 'Instant • Up to $2,500'
                        : '1-3 business days • Up to $10,000'}
                    </Text>
                  </View>
                </View>
                <View style={styles.methodRight}>
                  {selectedMethod?.id === method.id ? (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="radio-button-off" size={24} color="#ccc" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Add New Payment Method */}
            <TouchableOpacity
              style={styles.addMethodButton}
              onPress={addNewPaymentMethod}
            >
              <View style={styles.addMethodIcon}>
                <Ionicons name="add" size={24} color="#007AFF" />
              </View>
              <Text style={styles.addMethodText}>Add new payment method</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.securitySection}>
            <View style={styles.securityIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            </View>
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Bank-level security</Text>
              <Text style={styles.securityDescription}>
                Your financial information is protected with 256-bit encryption and never stored on your device.
              </Text>
            </View>
          </View>

          {/* Fees Information */}
          <View style={styles.feesSection}>
            <Text style={styles.feesTitle}>Fees</Text>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Debit card</Text>
              <Text style={styles.feeValue}>Free</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Credit card</Text>
              <Text style={styles.feeValue}>3%</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Bank transfer</Text>
              <Text style={styles.feeValue}>Free</Text>
            </View>
          </View>
        </ScrollView>

        {/* Add Money Button */}
        <View style={styles.addButtonContainer}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.addButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.addButtonContent}
              onPress={handleAddMoney}
              disabled={isLoading || !amount || !selectedMethod}
            >
              {isLoading ? (
                <Text style={styles.addButtonText}>Processing...</Text>
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.addButtonText}>
                    Add{amount ? ` $${parseFloat(amount || '0').toFixed(2)}` : ' Money'}
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
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    color: '#4CAF50',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 100,
    textAlign: 'left',
  },
  quickAmountSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  quickAmountButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  paymentMethodsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  paymentMethodItem: {
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
  selectedPaymentMethod: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  methodDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  methodLimits: {
    fontSize: 12,
    color: '#999',
  },
  methodRight: {
    marginLeft: 10,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addMethodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  addMethodText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  securitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  securityIcon: {
    marginRight: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  feesSection: {
    paddingHorizontal: 20,
    marginBottom: 120,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feeLabel: {
    fontSize: 14,
    color: '#333',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  addButtonContainer: {
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
  addButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddMoneyScreen;