import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { estimateFuelLitres, parseFuelRate } from '@/utils/routeEstimate';
import useKeyboardHeight from '@/hooks/useKeyboardHeight';

type FuelEstimateModalProps = {
  visible: boolean;
  onClose: () => void;
  distance: number | null;
};

export default function FuelEstimateModal({
  visible,
  onClose,
  distance,
}: FuelEstimateModalProps) {
  const [fuelRate, setFuelRate] = useState('');
  const rate = parseFuelRate(fuelRate);
  const fuelNeeded = estimateFuelLitres(distance, rate);
  const validDistance =
    typeof distance === 'number' && Number.isFinite(distance) && distance >= 0;
  const formatAmount = (value: number) =>
    value > 0 && value < 0.01 ? '<0.01' : value.toFixed(2);

  const keyboardHeight = useKeyboardHeight();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.overlay,
          Platform.OS === 'android' && keyboardHeight > 0 && { paddingBottom: keyboardHeight },
        ]}
      >
        <View style={styles.modalCard}>
          {/* Modal Handle */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="gas-station" size={20} color="#EA580C" />
              </View>
              <Text style={styles.modalTitle}>Fuel Estimate</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Close estimate"
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* One-Way Distance Card */}
          <View style={styles.distanceBox}>
            <Text style={styles.distanceLabel}>APPROXIMATE DIRECT RUN</Text>
            <Text style={styles.distanceText}>
              {validDistance
                ? `Approximate direct distance: ${formatAmount(distance)} nm (one way)`
                : 'Distance unavailable'}
            </Text>
          </View>

          {/* Fuel Rate Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputGuide}>
              Enter your boat's measured fuel use in litres per nautical mile.
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                value={fuelRate}
                onChangeText={setFuelRate}
                keyboardType="decimal-pad"
                accessibilityLabel="Fuel rate in litres per nautical mile"
                placeholder="Fuel rate (e.g. 0.65)"
                placeholderTextColor="#94A3B8"
                maxLength={12}
                style={styles.rateInput}
              />
              <View style={styles.inputBadge}>
                <Text style={styles.inputBadgeText}>L/nm</Text>
              </View>
            </View>
            {fuelRate.trim() !== '' && rate === null && (
              <Text style={styles.validationError}>Enter a positive decimal fuel rate.</Text>
            )}
          </View>

          {/* Fuel Calculation Display */}
          <View style={styles.resultBox}>
            <Text style={styles.resultHeader}>ESTIMATED FUEL CONSUMPTION</Text>
            <View style={styles.fuelRow}>
              <MaterialCommunityIcons name="gas-station" size={26} color="#EA580C" />
              <Text style={styles.fuelText} accessibilityLiveRegion="polite">
                {fuelNeeded === null
                  ? 'Fuel estimate unavailable'
                  : `Estimated fuel: ${formatAmount(fuelNeeded)} L`}
              </Text>
            </View>
            <Text style={styles.resultSub}>Calculated for one-way direct passage</Text>
          </View>

          {/* Navigational Disclaimer */}
          <Text style={styles.noteText}>
            Direct distance does not check land, depth, weather or a navigable
            route. Fuel excludes the return trip, reserve and idling.
          </Text>

          {/* Footer Action */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.okBtn}
              accessibilityRole="button"
              accessibilityLabel="Close estimate"
            >
              <Text style={styles.okBtnText}>Dismiss Estimate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 390,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  distanceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  distanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  inputSection: {
    marginBottom: 14,
  },
  inputGuide: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 17,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  rateInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  inputBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inputBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  validationError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '500',
  },
  resultBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  resultHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  fuelText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9A3412',
  },
  resultSub: {
    fontSize: 11,
    color: '#EA580C',
    marginTop: 4,
  },
  noteText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  buttonRow: {
    width: '100%',
  },
  okBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
