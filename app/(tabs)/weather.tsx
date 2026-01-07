import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  Cloud,
  Sun,
  Wind,
  Thermometer,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Sunrise,
  Sunset,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import {
  fetchWeatherData,
  analyzeFishingConditions,
  getHourlyForecast,
  type FishingWeatherConditions,
  type WeatherData,
} from '@/utils/weatherService';

interface HourlyForecastItem {
  time: Date;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  temperature: number;
  precipitation: number;
}

export default function WeatherScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [fishingConditions, setFishingConditions] = useState<FishingWeatherConditions | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadWeatherData();
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to get weather conditions for your area'
        );
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location');
      setIsLoading(false);
    }
  };

  const loadWeatherData = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const data = await fetchWeatherData(lat, lon, 3);
      const conditions = analyzeFishingConditions(data);
      const forecast = getHourlyForecast(data, 3);

      setWeatherData(data);
      setFishingConditions(conditions);
      setHourlyForecast(forecast);
    } catch (error) {
      console.error('Error loading weather data:', error);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getWindDirectionIcon = (degrees: number) => {
    // Convert degrees to direction
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const renderCurrentConditions = () => {
    if (!fishingConditions || !weatherData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Fishing Conditions</Text>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <Cloud size={24} color={Colors.primary} />
            <Text style={styles.conditionTitle}>Cloud Cover</Text>
          </View>
          <Text style={styles.conditionValue}>{fishingConditions.cloudCover.value}%</Text>
          <Text style={styles.conditionDescription}>{fishingConditions.cloudCover.description}</Text>
          <Text style={styles.fishingImpact}>{fishingConditions.cloudCover.fishingImpact}</Text>
        </View>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            {fishingConditions.light.isDawn || fishingConditions.light.isDusk ? (
              <Sunset size={24} color={Colors.primary} />
            ) : (
              <Sun size={24} color={Colors.primary} />
            )}
            <Text style={styles.conditionTitle}>Light Conditions</Text>
          </View>
          <Text style={styles.conditionValue}>{fishingConditions.light.description}</Text>
          <Text style={styles.fishingImpact}>{fishingConditions.light.fishingImpact}</Text>
        </View>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <Thermometer size={24} color={Colors.primary} />
            <Text style={styles.conditionTitle}>Barometric Pressure</Text>
          </View>
          <View style={styles.pressureContainer}>
            <Text style={styles.conditionValue}>{fishingConditions.barometricPressure.value.toFixed(1)} hPa</Text>
            {fishingConditions.barometricPressure.trend === 'rising' && (
              <TrendingUp size={16} color={Colors.success} />
            )}
            {fishingConditions.barometricPressure.trend === 'falling' && (
              <TrendingDown size={16} color={Colors.error} />
            )}
            {fishingConditions.barometricPressure.trend === 'steady' && (
              <Minus size={16} color={Colors.textLight} />
            )}
          </View>
          <Text style={styles.conditionDescription}>{fishingConditions.barometricPressure.description}</Text>
          <Text style={styles.fishingImpact}>{fishingConditions.barometricPressure.fishingImpact}</Text>
        </View>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <Wind size={24} color={Colors.primary} />
            <Text style={styles.conditionTitle}>Wind</Text>
          </View>
          <Text style={styles.conditionValue}>
            {fishingConditions.wind.speed.toFixed(1)} km/h {getWindDirectionIcon(fishingConditions.wind.direction)}
          </Text>
          <Text style={styles.conditionDescription}>{fishingConditions.wind.description}</Text>
          <Text style={styles.fishingImpact}>{fishingConditions.wind.fishingImpact}</Text>
        </View>

        <View style={styles.conditionCard}>
          <View style={styles.conditionHeader}>
            <Droplets size={24} color={Colors.primary} />
            <Text style={styles.conditionTitle}>Warm Fronts</Text>
          </View>
          <Text style={styles.conditionValue}>
            {fishingConditions.warmFront.isPresent ? 'Present' : 'Not Detected'}
          </Text>
          <Text style={styles.conditionDescription}>{fishingConditions.warmFront.description}</Text>
          <Text style={styles.fishingImpact}>{fishingConditions.warmFront.fishingImpact}</Text>
        </View>
      </View>
    );
  };

  const renderHourlyForecast = () => {
    if (!hourlyForecast.length) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3-Day Hourly Forecast</Text>

        {hourlyForecast.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{formatDate(day.date)}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hourlyScroll}
            >
              {day.hours.map((hour: HourlyForecastItem, hourIndex: number) => (
                <View key={hourIndex} style={styles.hourCard}>
                  <Text style={styles.hourTime}>{formatTime(hour.time)}</Text>
                  <Text style={styles.hourTemp}>{hour.temperature.toFixed(1)}°C</Text>
                  <View style={styles.hourDetails}>
                    <Text style={styles.hourDetail}>☁️ {hour.cloudCover}%</Text>
                    <Text style={styles.hourDetail}>💨 {hour.windSpeed.toFixed(1)} km/h</Text>
                    <Text style={styles.hourDetail}>📊 {hour.pressure.toFixed(0)}</Text>
                    {hour.precipitation > 0 && (
                      <Text style={styles.hourDetail}>🌧️ {hour.precipitation.toFixed(1)}mm</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading weather conditions...</Text>
        <Text style={styles.loadingSubtext}>Getting the best fishing weather data</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Cloud size={48} color={Colors.textLight} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWeatherData}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Cloud size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Weather Conditions</Text>
        <Text style={styles.headerSubtitle}>Optimized for fishing</Text>
      </View>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Weather for: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {renderCurrentConditions()}
      {renderHourlyForecast()}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
  },
  locationInfo: {
    backgroundColor: Colors.card,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  conditionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  conditionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  fishingImpact: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  pressureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  hourlyScroll: {
    marginBottom: 8,
  },
  hourCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  hourTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  hourTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  hourDetails: {
    alignItems: 'center',
  },
  hourDetail: {
    fontSize: 10,
    color: Colors.text,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '500',
  },
});