import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import {
  formatUtc,
  formatValue,
  marineCoordinates,
  readMarine,
  readWeather,
  selectedInstant,
  selectForecast,
  weatherFreshness,
  type WeatherConditions,
  type MarineConditions,
} from '@/utils/conditions';
import useConditionRequest from '@/utils/useConditionRequest';
import useConditionsClock from '@/utils/useConditionsClock';
import { logFailure } from '@/utils/logging';

type Props = {
  route?: {
    params?: {
      section?: 'weather' | 'sea';
      latitude?: number;
      longitude?: number;
    };
  };
};

export default function ConditionsScreen({ route }: Props) {
  const initialSection = route?.params?.section === 'sea' ? 'sea' : 'weather';
  const [activeTab, setActiveTab] = useState<'weather' | 'sea'>(initialSection);
  const [searchCity, setSearchCity] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  // React to section param change from navigation
  useEffect(() => {
    if (route?.params?.section) {
      setActiveTab(route.params.section);
    }
  }, [route?.params?.section]);

  // Weather Request Hook
  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherRequestError,
    load: loadWeather,
  } = useConditionRequest<WeatherConditions>('weatherLogs/weather', readWeather);

  // Sea Marine Request Hook
  const {
    data: marineData,
    loading: marineLoading,
    error: marineRequestError,
    load: loadMarine,
    cancel: cancelMarine,
  } = useConditionRequest<MarineConditions>('riskPredictions/risk-prediction', readMarine);

  const now = useConditionsClock();

  // Cache weather to AsyncStorage whenever loaded
  useEffect(() => {
    if (weatherData) {
      AsyncStorage.setItem('cached_weather', JSON.stringify(weatherData)).catch(err =>
        logFailure('conditions.cache_weather', err)
      );
    }
  }, [weatherData]);

  // Cache marine to AsyncStorage whenever loaded
  useEffect(() => {
    if (marineData) {
      AsyncStorage.setItem('cached_marine', JSON.stringify(marineData)).catch(err =>
        logFailure('conditions.cache_marine', err)
      );
    }
  }, [marineData]);

  // Auto-load Sea Wave on mount or when explicit coordinates are passed
  useEffect(() => {
    const latitude = route?.params?.latitude;
    const longitude = route?.params?.longitude;
    void loadMarine(() => marineCoordinates(latitude, longitude, Location));
    return cancelMarine;
  }, [route?.params?.latitude, route?.params?.longitude, loadMarine, cancelMarine]);

  // Weather handlers
  const handleWeatherSearch = () => {
    const city = searchCity.trim();
    if (!city) {
      setValidationError('Please enter a coastal city or harbor name.');
      return;
    }
    setValidationError(null);
    void loadWeather({ city });
  };

  const weatherError = validationError || weatherRequestError;
  const freshness = weatherData ? weatherFreshness(weatherData, now) : null;

  // Sea wave calculations
  const selectedTime = selectedInstant(undefined, now);
  const forecast = selectForecast(marineData?.hourly || [], selectedTime);

  const handleRefreshMarine = () => {
    void loadMarine(() =>
      marineCoordinates(route?.params?.latitude, route?.params?.longitude, Location)
    );
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: 36,
        paddingHorizontal: 16,
        gap: 16,
        maxWidth: theme.layout.webMaxWidth,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      {/* 1. Header & Segmented Tab Switch */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <AppText variant="title" accessibilityRole="header" style={{ fontSize: 24, lineHeight: 30 }}>
              Marine Conditions
            </AppText>
            <AppText variant="caption" style={{ color: theme.colors.muted }}>
              Live coastal meteorology & ocean swell
            </AppText>
          </View>
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.accentSurface,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary }} />
            <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 11 }}>
              LIVE TELEMETRY
            </AppText>
          </View>
        </View>

        {/* Segmented Control Bar */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#E2E8F0',
          padding: 4,
          borderRadius: 12,
          gap: 4,
        }}>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Coastal Weather section"
            accessibilityState={{ selected: activeTab === 'weather' }}
            onPress={() => setActiveTab('weather')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'weather' ? theme.colors.surface : 'transparent',
              shadowColor: activeTab === 'weather' ? '#000000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'weather' ? 2 : 0,
            }}>
            <Ionicons
              name={activeTab === 'weather' ? 'partly-sunny' : 'partly-sunny-outline'}
              size={18}
              color={activeTab === 'weather' ? theme.colors.primary : theme.colors.muted}
              accessible={false}
            />
            <AppText
              variant="label"
              style={{
                fontSize: 13,
                color: activeTab === 'weather' ? theme.colors.primary : theme.colors.muted,
                fontWeight: activeTab === 'weather' ? '700' : '600',
              }}>
              Coastal Weather
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityLabel="Sea Conditions section"
            accessibilityState={{ selected: activeTab === 'sea' }}
            onPress={() => setActiveTab('sea')}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: activeTab === 'sea' ? theme.colors.surface : 'transparent',
              shadowColor: activeTab === 'sea' ? '#000000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: activeTab === 'sea' ? 2 : 0,
            }}>
            <Ionicons
              name={activeTab === 'sea' ? 'water' : 'water-outline'}
              size={18}
              color={activeTab === 'sea' ? theme.colors.primary : theme.colors.muted}
              accessible={false}
            />
            <AppText
              variant="label"
              style={{
                fontSize: 13,
                color: activeTab === 'sea' ? theme.colors.primary : theme.colors.muted,
                fontWeight: activeTab === 'sea' ? '700' : '600',
              }}>
              Sea & Waves
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* ============================================================ */}
      {/* 2. COASTAL WEATHER SECTION                                   */}
      {/* ============================================================ */}
      {activeTab === 'weather' && (
        <View style={{ gap: 14 }}>
          {/* Search Box */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 48,
            gap: 8,
          }}>
            <Ionicons name="search" size={20} color={theme.colors.muted} accessible={false} />
            <TextInput
              placeholder="Search coastal harbor or city..."
              placeholderTextColor={theme.colors.muted}
              value={searchCity}
              onChangeText={val => {
                setSearchCity(val);
                setValidationError(null);
              }}
              onSubmitEditing={handleWeatherSearch}
              style={{
                flex: 1,
                fontSize: 14,
                color: theme.colors.text,
                height: '100%',
              }}
            />
            {searchCity.length > 0 && (
              <Pressable
                onPress={() => setSearchCity('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={theme.colors.muted} accessible={false} />
              </Pressable>
            )}
            <Pressable
              onPress={handleWeatherSearch}
              accessibilityRole="button"
              accessibilityLabel="Search weather"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#0369A1' : theme.colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              })}>
              <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                Search
              </AppText>
            </Pressable>
          </View>

          {/* Validation or Request Error */}
          {weatherError && (
            <Card style={{ backgroundColor: theme.colors.dangerSurface, borderColor: theme.colors.danger, padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle" size={18} color={theme.colors.danger} accessible={false} />
                <AppText variant="caption" style={{ color: theme.colors.danger, flex: 1 }}>{weatherError}</AppText>
              </View>
            </Card>
          )}

          {/* Loading Indicator */}
          {weatherLoading && (
            <Card style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText variant="caption" style={{ color: theme.colors.muted }}>Retrieving coastal meteorology...</AppText>
            </Card>
          )}

          {/* Weather Content */}
          {!weatherLoading && weatherData && (
            <View style={{ gap: 14 }}>
              {/* Location Card */}
              <Card style={{ gap: 6, padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="location-sharp" size={18} color={theme.colors.primary} accessible={false} />
                    <AppText variant="section" style={{ fontSize: 18, color: theme.colors.text }}>
                      {weatherData.location.name || 'Selected Harbor'}{weatherData.location.country ? `, ${weatherData.location.country}` : ''}
                    </AppText>
                  </View>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: theme.radius.full,
                    backgroundColor: theme.colors.accentSurface,
                  }}>
                    <AppText variant="caption" style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '700' }}>
                      STATION DATA
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 12 }}>
                  Coordinates: {weatherData.location.latitude.toFixed(4)}° N, {weatherData.location.longitude.toFixed(4)}° E
                </AppText>
              </Card>

              {/* Main Weather Hero Card */}
              <View style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                padding: 18,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
                gap: 12,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <AppText variant="caption" style={{ color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, fontWeight: '700' }}>
                      CURRENT TEMPERATURE
                    </AppText>
                    <AppText variant="display" style={{ color: '#FFFFFF', fontSize: 44, lineHeight: 52 }}>
                      {weatherData.temperatureC === null ? '--' : `${Math.round(weatherData.temperatureC)}°C`}
                    </AppText>
                  </View>
                  {weatherData.icon ? (
                    <Image
                      source={{ uri: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` }}
                      style={{ width: 64, height: 64 }}
                      resizeMode="contain"
                      accessible={false}
                    />
                  ) : (
                    <Ionicons name="partly-sunny" size={54} color="#FFFFFF" accessible={false} />
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#86EFAC' }} />
                  <AppText variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    {weatherData.description ? weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1) : 'Normal conditions'}
                  </AppText>
                </View>
              </View>

              {/* 3-Column Metrics Grid */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Wind */}
                <Card style={{ flex: 1, padding: 12, gap: 6, alignItems: 'center' }}>
                  <Ionicons name="navigate-outline" size={22} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Wind Speed</AppText>
                  <AppText variant="label" style={{ fontSize: 14 }}>
                    {formatValue(weatherData.windSpeedMps, 'm/s')}
                  </AppText>
                </Card>

                {/* Humidity */}
                <Card style={{ flex: 1, padding: 12, gap: 6, alignItems: 'center' }}>
                  <Ionicons name="water-outline" size={22} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Humidity</AppText>
                  <AppText variant="label" style={{ fontSize: 14 }}>
                    {formatValue(weatherData.humidityPercent, '%')}
                  </AppText>
                </Card>

                {/* Cloudiness */}
                <Card style={{ flex: 1, padding: 12, gap: 6, alignItems: 'center' }}>
                  <Ionicons name="cloud-outline" size={22} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Cloudiness</AppText>
                  <AppText variant="label" style={{ fontSize: 14 }}>
                    {formatValue(weatherData.cloudCoverPercent, '%')}
                  </AppText>
                </Card>
              </View>

              {/* Freshness & Metadata */}
              <Card style={{ padding: 12, gap: 6, backgroundColor: theme.colors.surface }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Observation Time</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600', fontSize: 11 }}>
                    {weatherData.dataTime ? formatUtc(weatherData.dataTime) : 'Unavailable'}
                  </AppText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Retrieved At</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600', fontSize: 11 }}>
                    {formatUtc(weatherData.fetchedAt)}
                  </AppText>
                </View>
                {freshness === 'stale' && (
                  <AppText variant="caption" style={{ color: theme.colors.warning, fontSize: 11, marginTop: 4 }}>
                    Weather data is over 1 hour old. Search again to refresh.
                  </AppText>
                )}
                <Pressable
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(weatherData.source.url)}
                  style={{ paddingTop: 4 }}>
                  <AppText variant="caption" style={{ color: theme.colors.primary, fontSize: 11, textDecorationLine: 'underline' }}>
                    {weatherData.source.attribution}
                  </AppText>
                </Pressable>
              </Card>
            </View>
          )}

          {/* Initial Empty State Prompt */}
          {!weatherLoading && !weatherData && !weatherError && (
            <Card style={{ padding: 20, alignItems: 'center', gap: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="partly-sunny" size={26} color={theme.colors.primary} accessible={false} />
              </View>
              <AppText variant="label" style={{ textAlign: 'center' }}>Search Coastal Location</AppText>
              <AppText variant="caption" style={{ textAlign: 'center', color: theme.colors.muted }}>
                Enter a Sri Lankan harbor or coastal city name above (e.g. Kalpitiya, Colombo, Trincomalee, Galle) to load live temperature, wind speed, and humidity.
              </AppText>
            </Card>
          )}
        </View>
      )}

      {/* ============================================================ */}
      {/* 3. SEA CONDITIONS & WAVES SECTION                            */}
      {/* ============================================================ */}
      {activeTab === 'sea' && (
        <View style={{ gap: 14 }}>
          {/* Action & Refresh Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <AppText variant="section" style={{ fontSize: 18, color: theme.colors.text }}>Wave Telemetry</AppText>
              <AppText variant="caption" style={{ color: theme.colors.muted }}>Open-Meteo marine wave model</AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh marine wave forecast"
              disabled={marineLoading}
              onPress={handleRefreshMarine}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: pressed ? '#0369A1' : theme.colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                opacity: marineLoading ? 0.6 : 1,
              })}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" accessible={false} />
              <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
                {marineLoading ? 'Refreshing...' : 'Refresh Waves'}
              </AppText>
            </Pressable>
          </View>

          {/* Error Banner */}
          {marineRequestError && (
            <Card style={{ backgroundColor: theme.colors.dangerSurface, borderColor: theme.colors.danger, padding: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="alert-circle" size={18} color={theme.colors.danger} accessible={false} />
                <AppText variant="caption" style={{ color: theme.colors.danger, flex: 1 }}>{marineRequestError}</AppText>
              </View>
            </Card>
          )}

          {/* Loading Indicator */}
          {marineLoading && (
            <Card style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText variant="caption" style={{ color: theme.colors.muted }}>Resolving GPS position & wave telemetry...</AppText>
            </Card>
          )}

          {/* Marine Data Content */}
          {!marineLoading && marineData && (
            <View style={{ gap: 14 }}>
              {/* Hero Wave Height Card */}
              <Card style={{
                backgroundColor: theme.colors.accentSurface,
                borderColor: '#BAE6FD',
                borderWidth: 1.5,
                borderRadius: 16,
                padding: 18,
                gap: 12,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <AppText variant="caption" style={{ color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11, fontWeight: '700' }}>
                      SIGNIFICANT WAVE HEIGHT
                    </AppText>
                    <AppText variant="display" style={{ color: theme.colors.primary, fontSize: 44, lineHeight: 52 }}>
                      {forecast.selected?.waveHeightM !== null && forecast.selected?.waveHeightM !== undefined
                        ? `${forecast.selected.waveHeightM.toFixed(1)} m`
                        : 'Unavailable'}
                    </AppText>
                  </View>
                  <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="water" size={32} color={theme.colors.primary} accessible={false} />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#BAE6FD' }}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.primary} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 12 }}>
                    Forecast Hour: {forecast.selected?.time ? formatUtc(forecast.selected.time) : 'Instantaneous'}
                  </AppText>
                </View>
              </Card>

              {/* Coordinates Section (2-Column) */}
              <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 10 }}>
                <Card style={{ flex: 1, padding: 12, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="pin" size={14} color={theme.colors.primary} accessible={false} />
                    <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                      Requested Position
                    </AppText>
                  </View>
                  <AppText variant="label" style={{ fontSize: 13 }}>
                    {marineData.requestedLocation.latitude.toFixed(4)}° N{'\n'}
                    {marineData.requestedLocation.longitude.toFixed(4)}° E
                  </AppText>
                </Card>

                <Card style={{ flex: 1, padding: 12, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="grid" size={14} color={theme.colors.primary} accessible={false} />
                    <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                      Model Grid Point
                    </AppText>
                  </View>
                  <AppText variant="label" style={{ fontSize: 13 }}>
                    {marineData.location.latitude.toFixed(4)}° N{'\n'}
                    {marineData.location.longitude.toFixed(4)}° E
                  </AppText>
                </Card>
              </View>

              {/* Following Forecast Hours (Next 4 Hours Outlook) */}
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AppText variant="label" style={{ fontSize: 14 }}>Following Forecast Hours (UTC)</AppText>
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Hourly Swell</AppText>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {forecast.next.map((hour, idx) => (
                    <Card key={hour.time || idx} style={{ flex: 1, padding: 10, alignItems: 'center', gap: 4 }}>
                      <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11, fontWeight: '600' }}>
                        {hour.time ? hour.time.slice(11, 16) : '--:--'}
                      </AppText>
                      <Ionicons name="water" size={18} color={theme.colors.primary} accessible={false} />
                      <AppText variant="label" style={{ fontSize: 13 }}>
                        {hour.waveHeightM !== null ? `${hour.waveHeightM.toFixed(1)}m` : '--'}
                      </AppText>
                    </Card>
                  ))}
                </View>
              </View>

              {/* Truthful Maritime Disclaimer */}
              <Card style={{ backgroundColor: theme.colors.warningSurface, borderColor: theme.colors.warning, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="information-circle" size={18} color={theme.colors.warning} accessible={false} />
                  <AppText variant="caption" style={{ color: theme.colors.warning, flex: 1, fontSize: 11 }}>
                    Significant wave height forecast only. OceanPulse does not assess fishing suitability or sea state safety.
                  </AppText>
                </View>
              </Card>

              {/* Metadata & Attribution Footer */}
              <Card style={{ padding: 12, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="caption" style={{ color: theme.colors.muted, fontSize: 11 }}>Retrieved At</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600', fontSize: 11 }}>
                    {formatUtc(marineData.fetchedAt)}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(marineData.source.url)}
                  style={{ paddingTop: 4 }}>
                  <AppText variant="caption" style={{ color: theme.colors.primary, fontSize: 11, textDecorationLine: 'underline' }}>
                    {marineData.source.attribution}
                  </AppText>
                </Pressable>
              </Card>
            </View>
          )}

          {/* Empty State Prompt */}
          {!marineLoading && !marineData && !marineRequestError && (
            <Card style={{ padding: 20, alignItems: 'center', gap: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.accentSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="boat" size={26} color={theme.colors.primary} accessible={false} />
              </View>
              <AppText variant="label" style={{ textAlign: 'center' }}>Load Marine Wave Forecast</AppText>
              <AppText variant="caption" style={{ textAlign: 'center', color: theme.colors.muted }}>
                Marine wave telemetry requires coordinates or location permission. Tap "Refresh Waves" to fetch the latest ocean telemetry.
              </AppText>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
}
