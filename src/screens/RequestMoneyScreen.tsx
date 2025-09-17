import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

const RequestMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Mock contacts
  const contacts: Contact[] = [
    { id: '1', name: 'Sarah Johnson', username: '@sarah_j', avatar: 'SJ' },
    { id: '2', name: 'Mike Chen', username: '@mike_c', avatar: 'MC' },
    { id: '3', name: 'Alex Smith', username: '@alex_s', avatar: 'AS' },
    { id: '4', name: 'Emma Wilson', username: '@emma_w', avatar: 'EW' },
    { id: '5', name: 'David Brown', username: '@david_b', avatar: 'DB' },
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

  const handleRequestMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!recipient && !selectedContact) {
      Alert.alert('No Recipient', 'Please select someone to request money from');
      return;
    }

    const requestAmount = parseFloat(amount);
    const recipientName = selectedContact?.name || recipient;

    // Generate request link (in real app, this would be a deep link)
    const requestLink = `https://wallet.app/request/${encodeURIComponent(JSON.stringify({
      amount: requestAmount,
      currency: 'USD',
      recipient: recipientName,
      note: note,
      requestId: Date.now().toString()
    }))}`;

    Alert.alert(
      'Request Created',
      `Request $${requestAmount.toFixed(2)} from ${recipientName}?${note ? `\n\nNote: ${note}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          style: 'default',
          onPress: () => shareRequest(requestAmount, recipientName, requestLink),
        },
      ]
    );
  };

  const shareRequest = async (amount: number, recipientName: string, link: string) => {
    try {
      const message = `Hi ${recipientName}! I'm requesting $${amount.toFixed(2)}${note ? ` for ${note}` : ''}. You can pay me using this link: ${link}`;

      await Share.share({
        message,
        title: `Money Request - $${amount.toFixed(2)}`,
      });

      // Reset form after sharing
      setAmount('');
      setRecipient('');
      setNote('');
      setSelectedContact(null);
    } catch (error) {
      console.error('Error sharing request:', error);
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setRecipient('');
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
            <Text style={styles.headerTitle}>Request Money</Text>
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
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountSection}>
            {[5, 10, 20, 50].map((quickAmount) => (
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
            <Text style={styles.sectionTitle}>Request from</Text>

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
                  placeholder="Name, username, email, or phone"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />

                {/* Contacts List */}
                <View style={styles.contactsSection}>
                  <Text style={styles.contactsSectionTitle}>Contacts</Text>
                  {contacts.map((contact) => (
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
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Note Section */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>What's this for? (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Dinner, rent, gas money..."
              placeholderTextColor="#999"
              multiline
              maxLength={100}
            />
          </View>

          {/* Request Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>How do you want to request?</Text>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="chatbubble-outline" size={24} color="#00D2FF" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Send Message</Text>
                <Text style={styles.optionDescription}>Send a text message with payment link</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="mail-outline" size={24} color="#00D2FF" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Send Email</Text>
                <Text style={styles.optionDescription}>Send an email with payment request</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Ionicons name="qr-code-outline" size={24} color="#00D2FF" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>QR Code</Text>
                <Text style={styles.optionDescription}>Generate QR code for payment</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Request Button */}
        <View style={styles.requestButtonContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.requestButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.requestButtonContent}
              onPress={handleRequestMoney}
              disabled={!amount || (!recipient && !selectedContact)}
            >
              <Ionicons name="hand-left-outline" size={20} color="#fff" />
              <Text style={styles.requestButtonText}>
                Request{amount ? ` $${parseFloat(amount || '0').toFixed(2)}` : ''}
              </Text>
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
    color: '#FF6B6B',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
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
    backgroundColor: '#fff5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
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
    backgroundColor: '#fff5f5',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
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
    backgroundColor: '#FF6B6B',
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
  noteSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 120,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  requestButtonContainer: {
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
  requestButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  requestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RequestMoneyScreen;