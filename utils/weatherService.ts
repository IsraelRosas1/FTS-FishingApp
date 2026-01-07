// Weather service for Open-Meteo API integration
// Provides weather data relevant to fishing conditions

export interface WeatherData {
  current: {
    cloudCover: number; // 0-100%
    pressure: number; // hPa
    windSpeed: number; // km/h
    windDirection: number; // degrees
    temperature: number; // °C
    time: string;
  };
  hourly: {
    time: string[];
    cloudCover: number[];
    pressure: number[];
    windSpeed: number[];
    windDirection: number[];
    temperature: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperatureMax: number[];
    temperatureMin: number[];
  };
}

export interface FishingWeatherConditions {
  cloudCover: {
    value: number;
    description: string;
    fishingImpact: string;
  };
  light: {
    isDawn: boolean;
    isDusk: boolean;
    description: string;
    fishingImpact: string;
  };
  barometricPressure: {
    value: number;
    trend: 'rising' | 'falling' | 'steady';
    description: string;
    fishingImpact: string;
  };
  wind: {
    speed: number;
    direction: number;
    description: string;
    fishingImpact: string;
  };
  warmFront: {
    isPresent: boolean;
    description: string;
    fishingImpact: string;
  };
}

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches weather data from Open-Meteo API
 * @param lat Latitude
 * @param lon Longitude
 * @param days Number of days for forecast (max 16)
 */
export async function fetchWeatherData(
  lat: number,
  lon: number,
  days = 3
): Promise<WeatherData> {
  const url = new URL(OPEN_METEO_BASE_URL);
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  url.searchParams.set('current', 'cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,temperature_2m');
  url.searchParams.set('hourly', 'cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,temperature_2m,precipitation');
  url.searchParams.set('daily', 'sunrise,sunset,temperature_2m_max,temperature_2m_min');
  url.searchParams.set('forecast_days', days.toString());
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    current: {
      cloudCover: data.current.cloud_cover,
      pressure: data.current.pressure_msl,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      temperature: data.current.temperature_2m,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time,
      cloudCover: data.hourly.cloud_cover,
      pressure: data.hourly.pressure_msl,
      windSpeed: data.hourly.wind_speed_10m,
      windDirection: data.hourly.wind_direction_10m,
      temperature: data.hourly.temperature_2m,
      precipitation: data.hourly.precipitation,
    },
    daily: {
      time: data.daily.time,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
    },
  };
}

/**
 * Analyzes weather data for fishing conditions
 * @param weatherData Weather data from Open-Meteo
 * @param currentTime Current timestamp
 */
export function analyzeFishingConditions(
  weatherData: WeatherData,
  currentTime: Date = new Date()
): FishingWeatherConditions {
  const currentHour = currentTime.getHours();

  // Cloud Cover Analysis
  const cloudCover = weatherData.current.cloudCover;
  let cloudDescription = '';
  let cloudFishingImpact = '';

  if (cloudCover < 20) {
    cloudDescription = 'Clear skies';
    cloudFishingImpact = 'Fish may be less active due to bright sunlight';
  } else if (cloudCover < 50) {
    cloudDescription = 'Partly cloudy';
    cloudFishingImpact = 'Good fishing conditions - optimal light levels';
  } else if (cloudCover < 80) {
    cloudDescription = 'Mostly cloudy';
    cloudFishingImpact = 'Excellent fishing - fish feel more secure';
  } else {
    cloudDescription = 'Overcast';
    cloudFishingImpact = 'Very good fishing - low light encourages feeding';
  }

  // Light Conditions (Dawn/Dusk)
  const isDawn = currentHour >= 5 && currentHour <= 8;
  const isDusk = currentHour >= 17 && currentHour <= 20;
  const lightDescription = isDawn ? 'Dawn' : isDusk ? 'Dusk' : 'Daytime';
  const lightFishingImpact = isDawn || isDusk
    ? 'Prime fishing time - fish are most active during low light periods'
    : 'Fish activity may be reduced during bright daylight';

  // Barometric Pressure Analysis
  const pressure = weatherData.current.pressure;
  let pressureTrend: 'rising' | 'falling' | 'steady' = 'steady';
  let pressureDescription = '';
  let pressureFishingImpact = '';

  // Simple trend analysis using recent hourly data
  if (weatherData.hourly.pressure.length >= 3) {
    const recent = weatherData.hourly.pressure.slice(-3);
    const trend = recent[2] - recent[0];
    if (trend > 2) pressureTrend = 'rising';
    else if (trend < -2) pressureTrend = 'falling';
  }

  if (pressure < 1000) {
    pressureDescription = 'Low pressure';
    pressureFishingImpact = 'Poor fishing - fish may be lethargic';
  } else if (pressure < 1013) {
    pressureDescription = 'Normal pressure';
    pressureFishingImpact = 'Good fishing conditions';
  } else {
    pressureDescription = 'High pressure';
    pressureFishingImpact = 'Variable fishing - may need to adjust techniques';
  }

  // Wind Analysis
  const windSpeed = weatherData.current.windSpeed;
  const windDirection = weatherData.current.windDirection;
  let windDescription = '';
  let windFishingImpact = '';

  if (windSpeed < 5) {
    windDescription = 'Calm';
    windFishingImpact = 'Excellent fishing - calm waters, easy casting';
  } else if (windSpeed < 15) {
    windDescription = 'Light breeze';
    windFishingImpact = 'Good fishing - gentle wind can help with bait presentation';
  } else if (windSpeed < 25) {
    windDescription = 'Moderate wind';
    windFishingImpact = 'Fair fishing - may create surface activity';
  } else {
    windDescription = 'Strong wind';
    windFishingImpact = 'Poor fishing - difficult casting, safety concerns';
  }

  // Wind direction description
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const directionIndex = Math.round(windDirection / 22.5) % 16;
  windDescription += ` from ${directions[directionIndex]}`;

  // Warm Front Detection (simplified)
  // In reality, this would require more complex analysis of pressure and temperature gradients
  const hasPrecipitation = weatherData.hourly.precipitation.some(p => p > 0);
  const isWarmFront = hasPrecipitation && pressure < 1013 && weatherData.hourly.temperature.some(t => t > 15);

  return {
    cloudCover: {
      value: cloudCover,
      description: cloudDescription,
      fishingImpact: cloudFishingImpact,
    },
    light: {
      isDawn,
      isDusk,
      description: lightDescription,
      fishingImpact: lightFishingImpact,
    },
    barometricPressure: {
      value: pressure,
      trend: pressureTrend,
      description: pressureDescription,
      fishingImpact: pressureFishingImpact,
    },
    wind: {
      speed: windSpeed,
      direction: windDirection,
      description: windDescription,
      fishingImpact: windFishingImpact,
    },
    warmFront: {
      isPresent: isWarmFront,
      description: isWarmFront ? 'Warm front approaching' : 'No warm front detected',
      fishingImpact: isWarmFront
        ? 'Can bring gentle rain and increased fish activity as they move shallower'
        : 'Stable weather patterns',
    },
  };
}

/**
 * Gets hourly forecast data for the next few days
 * @param weatherData Weather data
 * @param days Number of days
 */
export function getHourlyForecast(weatherData: WeatherData, days: number = 3) {
  const now = new Date();
  const forecasts = [];

  for (let day = 0; day < days; day++) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() + day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayForecast = weatherData.hourly.time
      .map((time, index) => ({
        time: new Date(time),
        cloudCover: weatherData.hourly.cloudCover[index],
        pressure: weatherData.hourly.pressure[index],
        windSpeed: weatherData.hourly.windSpeed[index],
        windDirection: weatherData.hourly.windDirection[index],
        temperature: weatherData.hourly.temperature[index],
        precipitation: weatherData.hourly.precipitation[index],
      }))
      .filter(item => item.time >= dayStart && item.time <= dayEnd)
      .slice(0, 24); // Limit to 24 hours per day

    forecasts.push({
      date: dayStart,
      hours: dayForecast,
    });
  }

  return forecasts;
}