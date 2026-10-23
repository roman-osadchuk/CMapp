import { useEffect, useState } from "react";
import { Text, View, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import { getToken, saveToken, removeToken } from "../utils/storage";

export function App() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialToken();
  }, []);

  const loadInitialToken = async () => {
    try {
      const storedToken = await getToken();
      setToken(storedToken);
    } catch (e) {
      console.error("Failed to load token", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = async () => {
    if (inputToken.trim()) {
      await saveToken(inputToken.trim());
      setToken(inputToken.trim());
      setInputToken("");
    }
  };

  const handleChangeToken = async () => {
    await removeToken();
    setToken(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to CashMine</Text>
        <Text style={styles.subtitle}>Please enter your API token to continue</Text>
        <TextInput
          style={styles.input}
          value={inputToken}
          onChangeText={setInputToken}
          placeholder="Enter Token"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button title="Save Token" onPress={handleSaveToken} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CashMine App</Text>
      <Text style={styles.info}>Authenticated with token: {token.substring(0, 4)}...</Text>
      
      <View style={styles.content}>
        <Text>Payback balances and claims will be here.</Text>
      </View>

      <View style={styles.footer}>
        <Button title="Change Token" onPress={handleChangeToken} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
  }
});

