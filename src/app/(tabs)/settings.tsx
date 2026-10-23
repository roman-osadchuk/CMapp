import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth-context';

export default function SettingsScreen() {
  const { signOut, token } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Authenticated with token:</Text>
        <Text style={styles.token}>{token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : 'N/A'}</Text>
      </View>
      <Button title="Change Token" onPress={signOut} color="#ef4444" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  token: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
  },
});
