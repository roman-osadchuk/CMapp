import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Balance, ClaimOptions } from '../../api/client';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { 
  calculateFee, 
  calculateReceivedAmount, 
  calculateUsdValue, 
  validateAmount 
} from '../../lib/amount-logic';

export default function ClaimScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const { data: balances, isLoading: loadingBalances } = useQuery({
    queryKey: ['balances'],
    queryFn: api.getBalances,
  });

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ['claim-options', selectedAsset],
    queryFn: () => selectedAsset ? api.getClaimOptions(selectedAsset) : Promise.reject('No asset selected'),
    enabled: !!selectedAsset,
  });

  const selectedBalance = useMemo(() => 
    balances?.items?.find(b => b.asset === selectedAsset),
    [balances, selectedAsset]
  );

  const fee = useMemo(() => 
    calculateFee(amount, options),
    [amount, options]
  );

  const receivedAmount = useMemo(() => 
    calculateReceivedAmount(amount, fee),
    [amount, fee]
  );

  const usdValue = useMemo(() => 
    calculateUsdValue(amount, selectedBalance || null),
    [amount, selectedBalance]
  );

  const isValid = useMemo(() => 
    validateAmount(amount, selectedAsset, selectedBalance || null, options || null).isValid,
    [amount, selectedAsset, selectedBalance, options]
  );

  const mutation = useMutation({
    mutationFn: (vars: { asset: string; amount: string; destinationId: string }) => 
      api.createClaim(vars, crypto.randomUUID()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      // Redirect to activity tab to follow the claim
      router.push('/activity');
    },
    onError: (error: Error) => {
      if (Platform.OS === 'web') {
        window.alert(`Claim failed: ${error.message}`);
      } else {
        Alert.alert('Claim Failed', error.message);
      }
    }
  });

  const handleClaim = () => {
    if (!isValid || !selectedAsset || !options) return;
    mutation.mutate({ 
      asset: selectedAsset, 
      amount: amount,
      destinationId: options.destinations[0].id // Picking first destination as per simplified task
    });
  };

  const handleMax = () => {
    if (selectedBalance) {
      setAmount(selectedBalance.available.toString());
    }
  };

  if (loadingBalances || loadingOptions) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Claim Payback</Text>
      
      <Text style={styles.label}>Select Asset</Text>
      <View style={styles.assetGrid}>
        {balances?.items?.map((item) => (
          <TouchableOpacity
            key={item.asset}
            style={[
              styles.assetButton,
              selectedAsset === item.asset && styles.selectedAssetButton
            ]}
            onPress={() => {
              setSelectedAsset(item.asset);
              setAmount('');
            }}
          >
            <Text style={[
              styles.assetButtonText,
              selectedAsset === item.asset && styles.selectedAssetButtonText
            ]}>
              {item.asset}
            </Text>
            <Text style={styles.assetSubtext}>
              {parseFloat(item.available).toFixed(4)} avail.
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedAsset && selectedBalance && (
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount to Claim</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.maxButton} onPress={handleMax}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              ≈ ${usdValue.toFixed(2)} USD
            </Text>
          </View>

          {options && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>-{fee.toFixed(6)} {selectedAsset}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>You will receive</Text>
                <Text style={styles.totalValue}>{receivedAmount.toFixed(6)} {selectedAsset}</Text>
              </View>
              
              {parseFloat(amount) > 0 && parseFloat(amount) < parseFloat(options.minAmount) && (
                <Text style={styles.errorText}>
                  Minimum claim is {options.minAmount} {selectedAsset}
                </Text>
              )}
              {parseFloat(amount) > parseFloat(selectedBalance.available) && (
                <Text style={styles.errorText}>
                  Insufficient balance
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.claimButton, !isValid && styles.disabledButton]}
            disabled={!isValid || mutation.isPending}
            onPress={handleClaim}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.claimButtonText}>Confirm & Submit Claim</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  assetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 20,
  },
  assetButton: {
    width: '30%',
    margin: '1.66%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  selectedAssetButton: {
    borderColor: '#7C3AED',
    backgroundColor: '#f5f3ff',
  },
  assetButtonText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  selectedAssetButtonText: {
    color: '#7C3AED',
  },
  assetSubtext: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  form: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
  },
  maxButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 5,
  },
  summary: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#6b7280',
  },
  summaryValue: {
    color: '#374151',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
  },
  claimButton: {
    backgroundColor: '#7C3AED',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
