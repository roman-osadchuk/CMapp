import { useState } from "react";
import { Text, View, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "../../context/auth-context";

export default function LoginScreen() {
  const [inputToken, setInputToken] = useState("");
  const { signIn } = useAuth();

  const handleSaveToken = async () => {
    if (inputToken.trim()) {
      await signIn(inputToken.trim());
    }
  };

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
});
