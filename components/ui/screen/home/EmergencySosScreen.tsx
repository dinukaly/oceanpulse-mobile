import React, { useRef } from "react";
import * as RN from "react-native";
import ActionButton from "@/components/ui/ActionButton";
import StatusBanner from "@/components/ui/StatusBanner";
import { theme } from "@/constants/theme";
import useSosRequest from "@/utils/useSosRequest";

const { ActivityIndicator, Alert, Linking, Platform, ScrollView, StyleSheet, Text } = RN;
const View: any = (RN as any).View || Text;

export default function EmergencySosScreen({ navigation }: any) {
  const { phase, receipt, errorMessage, locationDenied, uncertain, send, checkReceipt } = useSosRequest();
  const confirmationOpen = useRef(false);

  const confirmSend = () => {
    if (confirmationOpen.current || (phase !== "ready" && phase !== "error")) return;
    confirmationOpen.current = true;
    if (Platform.OS === 'web') {
      try {
        if (
          typeof window !== 'undefined' &&
          window.confirm(
            'Broadcast Emergency SOS Distress Alert? This transmits your vessel position and coordinates to coastal maritime operations. Maintain simultaneous VHF Channel 16 watch.'
          )
        ) {
          void send();
        }
      } finally {
        confirmationOpen.current = false;
      }
      return;
    }
    Alert.alert(
      "Broadcast SOS Distress Alert?",
      "OceanPulse will transmit your vessel position and coordinates to coastal maritime operations. Maintain simultaneous VHF Channel 16 watch.",
      [
        { text: "Go back", style: "cancel", onPress: () => { confirmationOpen.current = false; } },
        { text: "Record request", onPress: () => { confirmationOpen.current = false; void send(); } },
      ],
      { cancelable: true, onDismiss: () => { confirmationOpen.current = false; } }
    );
  };

  const receivedAt = receipt?.receivedAt && !Number.isNaN(Date.parse(receipt.receivedAt))
    ? new Date(receipt.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Visual GPS / Status Pill */}
      <View style={styles.telemetryBadge}>
        <View style={styles.pulseDot} />
        <Text style={styles.telemetryText}>
          {phase === "recorded"
            ? "✓ BEACON TRANSMITTED"
            : phase === "locating"
            ? "🛰️ ACQUIRING GPS LOCK..."
            : "🟢 GPS LOCKED • READY"}
        </Text>
      </View>

      {/* PHASE: READY */}
      {phase === "ready" && (
        <View style={styles.contentWrapper}>
          <Text style={styles.title} accessibilityRole="header">Emergency SOS Beacon</Text>
          <Text style={styles.subtitle}>Tap button to send vessel distress signal</Text>

          {/* High-visibility Yellow Radio Card */}
          <View style={styles.radioBox}>
            <View style={styles.radioHeaderRow}>
              <Text style={styles.radioIcon}>📻</Text>
              <Text style={styles.radioTitle}>RADIO MAYDAY: VHF CH 16</Text>
            </View>
            <Text style={styles.radioBody}>
              Hail MAYDAY on VHF Channel 16 (156.8 MHz) or switch on 406 MHz EPIRB beacon for immediate rescue dispatch.
            </Text>
          </View>

          {/* Action buttons with large touch targets */}
          <View style={styles.actionsContainer}>
            <ActionButton
              label="Record SOS request"
              variant="danger"
              onPress={confirmSend}
              style={styles.primaryAction}
            />
            <ActionButton
              label="Check existing receipt"
              variant="secondary"
              onPress={checkReceipt}
              style={styles.secondaryAction}
            />
            <ActionButton
              label="Back to home"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.secondaryAction}
            />
          </View>
        </View>
      )}

      {/* PHASE: BUSY / IN-FLIGHT */}
      {(phase === "locating" || phase === "submitting" || phase === "checking") && (
        <View style={styles.busyWrapper}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.title} accessibilityRole="header" accessibilityLiveRegion="polite">
            {phase === "locating"
              ? "Locking GPS Position"
              : phase === "checking"
              ? "Checking Server Receipt"
              : "Transmitting SOS Beacon"}
          </Text>
          <Text style={styles.body}>
            {phase === "locating"
              ? "Connecting to GPS satellites. Please wait..."
              : phase === "checking"
              ? "Checking operations manifest for active distress records."
              : "Transmitting emergency distress coordinates to maritime dispatch."}
          </Text>
          <View style={styles.radioBox}>
            <Text style={styles.radioTitle}>KEEP RADIO ON VHF CH 16</Text>
          </View>
        </View>
      )}

      {/* PHASE: RECORDED / CONFIRMED */}
      {phase === "recorded" && receipt && (
        <View style={styles.contentWrapper}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successCheckText}>✓</Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">Distress Beacon Recorded</Text>
          <Text style={styles.subtitle}>
            {receipt.alreadyActive
              ? "Active distress record retrieved from operations server."
              : "Vessel position confirmed on maritime operations manifest."}
          </Text>

          {/* Receipt Box */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>RECEIPT ID</Text>
              <Text style={styles.receiptValueBold} selectable>{receipt.id}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>TIME LOGGED</Text>
              <Text style={styles.receiptValue}>{receivedAt || "Recorded"}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>POSITION</Text>
              <Text style={styles.receiptValue}>
                {receipt.location
                  ? `${receipt.location.latitude.toFixed(3)}°, ${receipt.location.longitude.toFixed(3)}°`
                  : "GPS Position Saved"}
              </Text>
            </View>
          </View>

          {/* High visibility reminder */}
          <View style={styles.radioBox}>
            <Text style={styles.radioTitle}>MAINTAIN RADIO WATCH: VHF CH 16</Text>
            <Text style={styles.radioBody}>Keep continuous watch on VHF 16 and prepare flares or horn signaling.</Text>
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton
              label="Back to home"
              onPress={() => navigation.goBack()}
              style={styles.primaryAction}
            />
          </View>
        </View>
      )}

      {/* PHASE: ERROR / UNCERTAIN */}
      {phase === "error" && (
        <View style={styles.contentWrapper}>
          <Text style={styles.title} accessibilityRole="header">Transmission Warning</Text>
          <StatusBanner
            tone="error"
            title={uncertain ? "Handshake Outcome Unknown" : "Signal Not Confirmed"}
            message={errorMessage || "Unable to confirm distress signal with maritime server."}
            style={styles.banner}
          />

          <View style={styles.criticalGuidanceBox}>
            <Text style={styles.criticalGuidanceTitle}>🚨 IMMEDIATE ACTION:</Text>
            <Text style={styles.criticalGuidanceText}>
              Hail MAYDAY immediately on VHF Marine Channel 16 (156.8 MHz) or activate your 406 MHz EPIRB beacon.
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <ActionButton
              label={uncertain ? "Retry same request" : "Try again"}
              variant="danger"
              onPress={confirmSend}
              style={styles.primaryAction}
            />
            <ActionButton
              label="Check server receipt"
              variant="secondary"
              onPress={checkReceipt}
              style={styles.secondaryAction}
            />
            {locationDenied && (
              <ActionButton
                label="Open device settings"
                variant="secondary"
                onPress={() => Linking.openSettings()}
                style={styles.secondaryAction}
              />
            )}
            <ActionButton
              label="Back to home"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.secondaryAction}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  busyWrapper: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  telemetryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 8,
  },
  telemetryText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
  },
  body: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  radioBox: {
    width: "100%",
    backgroundColor: "#FEFCE8",
    borderWidth: 2,
    borderColor: "#FACC15",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    shadowColor: "#CA8A04",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  radioHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  radioIcon: {
    fontSize: 20,
  },
  radioTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#854D0E",
    letterSpacing: 0.5,
  },
  radioBody: {
    fontSize: 13,
    fontWeight: "600",
    color: "#713F12",
    lineHeight: 18,
  },
  banner: {
    width: "100%",
    marginTop: 16,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCFCE7",
    borderWidth: 2,
    borderColor: "#86EFAC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  successCheckText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#16A34A",
  },
  receiptCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  receiptRow: {
    paddingVertical: 6,
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  receiptValueBold: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 2,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  criticalGuidanceBox: {
    width: "100%",
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#F87171",
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  criticalGuidanceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 4,
  },
  criticalGuidanceText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#B91C1C",
    fontWeight: "600",
  },
  actionsContainer: {
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  primaryAction: {
    width: "100%",
  },
  secondaryAction: {
    width: "100%",
  },
});
