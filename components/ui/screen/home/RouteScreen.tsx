import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';
import FuelEstimateModal from '@/components/ui/screen/home/components/FuelEstimateModal';
import {
  directDistanceNm,
  isRoutePoint,
  type RoutePoint,
} from '@/utils/routeEstimate';

type RouteSelection = { markers: RoutePoint[]; showEstimate: boolean };

export default function RouteScreen() {
  const [selection, setSelection] = useState<RouteSelection>({
    markers: [],
    showEstimate: false,
  });
  const [error, setError] = useState<string | null>(null);

  const distance = useMemo(
    () =>
      selection.markers.length === 2
        ? directDistanceNm(selection.markers[0], selection.markers[1])
        : null,
    [selection.markers],
  );

  const handleMapPress = (event: MapPressEvent) => {
    const point = event.nativeEvent.coordinate;
    if (!isRoutePoint(point)) {
      setError('This point has invalid coordinates. Select another point.');
      return;
    }
    setError(null);
    setSelection((previous) => {
      const markers =
        previous.markers.length === 2 ? [point] : [...previous.markers, point];
      return { markers, showEstimate: markers.length === 2 };
    });
  };

  const clearRoute = () => {
    setSelection({ markers: [], showEstimate: false });
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Control Sheet */}
      <View style={styles.topCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Route & Fuel Estimation</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>
              {selection.markers.length === 0
                ? 'TAP MAP'
                : selection.markers.length === 1
                ? 'WAYPOINT 1 PLACED'
                : 'CALCULATING'}
            </Text>
          </View>
        </View>

        <Text style={styles.instructionText}>
          Select two points for an approximate direct distance. A third point
          starts a new estimate.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          </View>
        )}

        {selection.markers.length > 0 && (
          <View style={styles.pointActionsRow}>
            <Text style={styles.pointCoordinates}>
              {selection.markers.length === 1
                ? `WP 1: ${selection.markers[0].latitude.toFixed(3)}°, ${selection.markers[0].longitude.toFixed(3)}°`
                : `2 Waypoints Active • Tap to recalculate`}
            </Text>
            <TouchableOpacity
              onPress={clearRoute}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear route points"
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Full Nautical Map Canvas */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }}
        onPress={handleMapPress}
      >
        {selection.markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            title={`Waypoint ${index + 1}`}
            description={`${marker.latitude.toFixed(4)}°, ${marker.longitude.toFixed(4)}°`}
            pinColor={index === 0 ? '#0284C7' : '#16A34A'}
          />
        ))}
      </MapView>

      {/* Fuel Estimate Sheet / Modal */}
      <FuelEstimateModal
        visible={selection.showEstimate}
        distance={distance}
        onClose={() =>
          setSelection((previous) => ({ ...previous, showEstimate: false }))
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    zIndex: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
  },
  pointActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  pointCoordinates: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  map: {
    flex: 1,
    width: '100%',
  },
});
