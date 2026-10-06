import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Avatar, Button, TextInput, Card } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore.js';
import { authApi } from '../../api/services.js';
import { colors, spacing, fontSize } from '../../constants/theme.js';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    if (typeof addr === 'string') return addr;
    const parts = [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated successfully' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={getInitials(user?.name)} style={styles.avatar} />
        <Text style={styles.name}>{user?.name || 'User Name'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Business Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Business Name:</Text>
            <Text style={styles.infoValue}>{user?.businessName || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{formatAddress(user?.address)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Change Password" />
        <Card.Content>
          <TextInput
            label="Current Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          <Button 
            mode="contained" 
            onPress={handleChangePassword} 
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Update Password
          </Button>
        </Card.Content>
      </Card>

      <Button 
        mode="outlined" 
        onPress={handleLogout} 
        style={styles.logoutButton}
        textColor={colors.error}
      >
        Logout
      </Button>

      <Text style={styles.version}>App Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  infoValue: {
    flex: 2,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: colors.error,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  }
});

export default ProfileScreen;
