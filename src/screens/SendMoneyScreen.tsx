import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastTransaction?: string;
}

const SendMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { sendMoney, getTotalBalanceUSD, isLoading } = useWallet();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const balance = getTotalBalanceUSD();

  // Mock recent contacts
  const recentContacts: Contact[] = [
    { id: '1', name: 'Sarah Johnson', username: '@sarah_j', avatar: 'SJ', lastTransaction: 'Yesterday' },
    { id: '2', name: 'Mike Chen', username: '@mike_c', avatar: 'MC', lastTransaction: '3 days ago' },
    { id: '3', name: 'Alex Smith', username: '@alex_s', avatar: 'AS', lastTransaction: 'Last week' },
    { id: '4', name: 'Emma Wilson', username: '@emma_w', avatar: 'EW', lastTransaction: '2 weeks ago' },
  ];

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal points
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');

    if (parts.length <= 2) {
      let result = parts[0];
      if (parts.length === 2) {
        result += '.' + parts[1].slice(0, 2); // Limit to 2 decimal places
      }
      setAmount(result);
    }
  };

  const handleSendMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!recipient && !selectedContact) {
      Alert.alert('No Recipient', 'Please select a recipient or enter their details');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (sendAmount > balance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough money to send this amount');
      return;
    }

    const recipientId = selectedContact?.id || recipient;
    const recipientName = selectedContact?.name || recipient;

    Alert.alert(
      'Confirm Transfer',
      `Send $${sendAmount.toFixed(2)} to ${recipientName}?${note ? `\n\nNote: ${note}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: async () => {
            try {
              await sendMoney(recipientId, sendAmount, 'USD', note || 'Money transfer');
              Alert.alert('Success', `$${sendAmount.toFixed(2)} sent to ${recipientName}`);
              setAmount('');
              setRecipient('');
              setNote('');
              setSelectedContact(null);
            } catch (error) {
              Alert.alert('Transfer Failed', 'Please try again later');
            }
          },
        },
      ]
    );
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setRecipient('');
    Keyboard.dismiss();
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
            <Text style={styles.headerTitle}>Send Money</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
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
            <Text style={styles.balanceText}>Balance: ${balance.toFixed(2)}</Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountSection}>
            {[10, 25, 50, 100].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recipient Section */}
          <View style={styles.recipientSection}>
            <Text style={styles.sectionTitle}>Send to</Text>

            {selectedContact ? (
              <TouchableOpacity
                style={styles.selectedContact}
                onPress={() => setSelectedContact(null)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarText}>{selectedContact.avatar}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{selectedContact.name}</Text>
                  <Text style={styles.contactUsername}>{selectedContact.username}</Text>
                </View>
                <Ionicons name="close-circle" size={24} color="#ff4757" />
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={styles.recipientInput}
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder="Username, email, or phone number"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />

                {/* Recent Contacts */}
                <View style={styles.contactsSection}>
                  <Text style={styles.contactsSectionTitle}>Recent</Text>
                  {recentContacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.contactItem}
                      onPress={() => selectContact(contact)}
                    >
                      <View style={styles.contactAvatar}>
                        <Text style={styles.avatarText}>{contact.avatar}</Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactUsername}>{contact.username}</Text>
                      </View>
                      <Text style={styles.lastTransaction}>{contact.lastTransaction}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Note Section */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Add a note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
              placeholderTextColor="#999"
              multiline
              maxLength={100}
            />
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.sendButtonContainer}>
          <LinearGradient
            colors={['#00D2FF', '#3A7BD5']}
            style={styles.sendButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.sendButtonContent}
              onPress={handleSendMoney}
              disabled={isLoading || !amount || (!recipient && !selectedContact)}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>
                    Send{amount ? ` $${parseFloat(amount || '0').toFixed(2)}` : ''}
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
    color: '#000',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 100,
    textAlign: 'left',
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
  },
  quickAmountSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  quickAmountButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  recipientSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  selectedContact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D2FF',
  },
  recipientInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  contactsSection: {
    marginTop: 10,
  },
  contactsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#00D2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  contactUsername: {
    fontSize: 14,
    color: '#666',
  },
  lastTransaction: {
    fontSize: 12,
    color: '#999',
  },
  noteSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButtonContainer: {
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
  sendButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  sendButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SendMoneyScreen;