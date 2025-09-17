import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const profileData = {
    username: user?.name || 'User',
    email: user?.email || 'user@example.com',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    verificationStatus: 'Verified',
    accountLevel: 'Premium',
  };


  const menuItems = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: 'person-circle-outline',
      items: [
        { label: 'Edit Profile', icon: 'create-outline', action: () => Alert.alert('Edit Profile', 'Coming soon!') },
        { label: 'Change Password', icon: 'key-outline', action: () => Alert.alert('Change Password', 'Coming soon!') },
        { label: 'Email Preferences', icon: 'mail-outline', action: () => Alert.alert('Email Preferences', 'Coming soon!') },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'shield-checkmark-outline',
      items: [
        {
          label: 'Biometric Authentication',
          icon: 'finger-print',
          toggle: true,
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        { label: '2-Factor Authentication', icon: 'phone-portrait-outline', action: () => Alert.alert('2FA', 'Configure 2FA settings') },
        { label: 'Login History', icon: 'time-outline', action: () => Alert.alert('Login History', 'View recent login activity') },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: 'settings-outline',
      items: [
        {
          label: 'Push Notifications',
          icon: 'notifications-outline',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          label: 'Dark Mode',
          icon: 'moon-outline',
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        { label: 'Language', icon: 'language-outline', value: 'English', action: () => Alert.alert('Language', 'Select your preferred language') },
        { label: 'Currency Display', icon: 'cash-outline', value: 'USD', action: () => Alert.alert('Currency', 'Select display currency') },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'help-circle-outline',
      items: [
        { label: 'Help Center', icon: 'help-outline', action: () => Alert.alert('Help', 'Opening help center...') },
        { label: 'Contact Support', icon: 'chatbubbles-outline', action: () => Alert.alert('Support', 'Contact our support team') },
        { label: 'Report a Problem', icon: 'warning-outline', action: () => Alert.alert('Report', 'Report an issue') },
        { label: 'FAQ', icon: 'information-circle-outline', action: () => Alert.alert('FAQ', 'View frequently asked questions') },
      ],
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      items: [
        { label: 'Terms of Service', icon: 'document-text-outline', action: () => Alert.alert('Terms', 'View terms of service') },
        { label: 'Privacy Policy', icon: 'lock-closed-outline', action: () => Alert.alert('Privacy', 'View privacy policy') },
        { label: 'App Version', icon: 'information-outline', value: '1.0.0' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.profileHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RP</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        </View>

        <Text style={styles.username}>{profileData.username}</Text>
        <Text style={styles.userId}>{profileData.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.accountLevel}</Text>
            <Text style={styles.statLabel}>Account</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.verificationStatus}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.joinDate}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Sections */}
      {menuItems.map((section) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={section.icon as any} size={20} color="#667eea" />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>

          <View style={styles.sectionContent}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === section.items.length - 1 && styles.lastMenuItem,
                ]}
                onPress={item.action}
                disabled={item.toggle}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={20} color="#7f8c8d" />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>

                <View style={styles.menuItemRight}>
                  {item.value && !item.toggle && (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  )}
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#e0e0e0', true: '#667eea' }}
                      thumbColor={item.value ? '#fff' : '#f4f3f4'}
                    />
                  ) : (
                    !item.value && (
                      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
                    )
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={['#FF5252', '#FF8A80']}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Digital Wallet v1.0.0</Text>
        <Text style={styles.footerSubtext}>Secure & Simple</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  profileHeader: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#95a5a6',
    marginRight: 5,
  },
  logoutButton: {
    margin: 20,
    marginTop: 30,
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default ProfileScreen;