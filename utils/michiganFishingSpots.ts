import * as Location from 'expo-location';

export interface MichiganFishingSpot {
  id: string;
  name: string;
  type: 'lake' | 'river' | 'stream' | 'pond' | 'great_lake';
  distance: number;
  fishTypes: {
    name: string;
    bestTime: string;
    season: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    abundance: 'Low' | 'Medium' | 'High';
  }[];
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bestTimes: {
    morning: string;
    evening: string;
    season: string;
  };
  conditions: {
    bestWeather: string;
    pressure: string;
    temperature: string;
    wind: string;
  };
  tips: string[];
  baitRecommendations: string[];
  depth: string;
  access: string;
  facilities: string[];
  county: string;
  size: string;
  regulations: string[];
}

// Michigan fishing spots database - comprehensive list of real locations
const MICHIGAN_FISHING_SPOTS: Omit<MichiganFishingSpot, 'distance'>[] = [
  // Great Lakes
  {
    id: 'gl-1',
    name: 'Lake Michigan - Grand Haven',
    type: 'great_lake',
    fishTypes: [
      { name: 'Chinook Salmon', bestTime: '5:30-8:00 AM', season: 'April-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Coho Salmon', bestTime: '6:00-9:00 AM', season: 'June-September', difficulty: 'Medium', abundance: 'High' },
      { name: 'Lake Trout', bestTime: '5:00-7:00 AM', season: 'Year-round', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Steelhead', bestTime: 'Dawn-10:00 AM', season: 'October-April', difficulty: 'Hard', abundance: 'High' },
      { name: 'Brown Trout', bestTime: '6:00-8:30 AM', season: 'April-October', difficulty: 'Hard', abundance: 'Medium' }
    ],
    description: 'Premier Great Lakes fishing destination with excellent salmon and trout runs.',
    coordinates: { latitude: 43.0642, longitude: -86.2284 },
    bestTimes: {
      morning: '5:30-8:00 AM (Peak salmon activity)',
      evening: '6:00-8:30 PM (Secondary peak)',
      season: 'April-October (Best: May-September)'
    },
    conditions: {
      bestWeather: 'Overcast with light wind',
      pressure: 'Stable or rising barometric pressure',
      temperature: '55-70°F water temp optimal',
      wind: 'Light offshore breeze (5-10 mph)'
    },
    tips: [
      'Fish near river mouths during salmon runs',
      'Use downriggers for deeper water',
      'Early morning produces best results',
      'Watch for bird activity indicating baitfish'
    ],
    baitRecommendations: ['Spoons (silver/blue)', 'Plugs', 'Alewives', 'Spawn bags'],
    depth: '15-100 feet depending on season',
    access: 'Multiple public piers and boat launches',
    facilities: ['Parking', 'Restrooms', 'Bait shops', 'Boat rental', 'Charter services'],
    county: 'Ottawa',
    size: 'Great Lake',
    regulations: ['Michigan fishing license required', 'Salmon/trout stamp required', 'Daily limits apply']
  },
  {
    id: 'gl-2',
    name: 'Lake Huron - Tawas Bay',
    type: 'great_lake',
    fishTypes: [
      { name: 'Walleye', bestTime: '5:00-8:00 AM', season: 'April-November', difficulty: 'Medium', abundance: 'High' },
      { name: 'Yellow Perch', bestTime: '9:00 AM-3:00 PM', season: 'Year-round', difficulty: 'Easy', abundance: 'High' },
      { name: 'Smallmouth Bass', bestTime: '6:00-9:00 AM', season: 'May-October', difficulty: 'Medium', abundance: 'Medium' },
      { name: 'Northern Pike', bestTime: '7:00-10:00 AM', season: 'May-October', difficulty: 'Medium', abundance: 'Medium' }
    ],
    description: 'Excellent walleye and perch fishing in protected bay waters.',
    coordinates: { latitude: 44.2531, longitude: -83.5158 },
    bestTimes: {
      morning: '5:00-8:00 AM (Prime walleye time)',
      evening: '6:30-8:30 PM (Good walleye activity)',
      season: 'April-November (Best: May-June, September-October)'
    },
    conditions: {
      bestWeather: 'Stable weather, light chop',
      pressure: 'Rising pressure preferred',
      temperature: '60-72°F water temp',
      wind: 'Light to moderate wind'
    },
    tips: [
      'Fish rocky reefs for walleye',
      'Use jigs with minnows',
      'Try trolling for suspended fish',
      'Focus on drop-offs and structure'
    ],
    baitRecommendations: ['Jigs with minnows', 'Crawler harnesses', 'Crankbaits', 'Live perch'],
    depth: '10-40 feet average',
    access: 'Public boat launches and shore access',
    facilities: ['Boat launches', 'Parking', 'Restrooms', 'Bait shops'],
    county: 'Iosco',
    size: 'Great Lake Bay',
    regulations: ['Michigan fishing license required', 'Walleye size and bag limits', 'No night fishing restrictions']
  },
  // Inland Lakes
  {
    id: 'il-1',
    name: 'Houghton Lake',
    type: 'lake',
    fishTypes: [
      { name: 'Walleye', bestTime: '5:30-8:30 AM', season: 'Year-round', difficulty: 'Medium', abundance: 'High' },
      { name: 'Northern Pike', bestTime: '7:00-10:00 AM', season: 'Year-round', difficulty: 'Medium', abundance: 'High' },
      { name: 'Bluegill', bestTime: '10:00 AM-3:00 PM', season: 'May-September', difficulty: 'Easy', abundance: 'High' },
      { name: 'Largemouth Bass', bestTime: '6:00-9:00 AM', season: 'May-October', difficulty: 'Easy', abundance: 'Medium' },
      { name: 'Yellow Perch', bestTime: '9:00 AM-2:00 PM', season: 'Year-round', difficulty: 'Easy', abundance: 'High' }
    ],
    description: 'Michigan\'s largest inland lake, famous for walleye and northern pike.',
    coordinates: { latitude: 44.3197, longitude: -84.7614 },
    bestTimes: {
      morning: '5:30-8:30 AM (Peak walleye activity)',
      evening: '6:00-8:00 PM (Good bass fishing)',
      season: 'Year-round (Ice fishing popular December-March)'
    },
    conditions: {
      bestWeather: 'Stable conditions, light wind',
      pressure: 'Stable to rising pressure',
      temperature: '65-75°F for summer species',
      wind: 'Light wind creates good conditions'
    },
    tips: [
      'Fish weed edges for pike and bass',
      'Use slip bobbers for panfish',
      'Try jigging for walleye',
      'Ice fishing excellent in winter'
    ],
    baitRecommendations: ['Jigs with minnows', 'Spinnerbaits', 'Live worms', 'Crankbaits'],
    depth: '5-20 feet average, 21 feet maximum',
    access: 'Multiple public access sites around lake',
    facilities: ['Boat launches', 'Parking', 'Restrooms', 'Bait shops', 'Resorts'],
    county: 'Roscommon',
    size: '20,044 acres',
    regulations: ['Michigan fishing license required', 'Standard inland limits apply']
  },
  {
    id: 'il-2',
    name: 'Torch Lake',
    type: 'lake',
    fishTypes: [
      { name: 'Lake Trout', bestTime: '5:00-7:00 AM', season: 'Year-round', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Smallmouth Bass', bestTime: '6:30-9:30 AM', season: 'May-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Northern Pike', bestTime: '7:00-10:00 AM', season: 'May-October', difficulty: 'Medium', abundance: 'Medium' },
      { name: 'Yellow Perch', bestTime: '9:00 AM-1:00 PM', season: 'Year-round', difficulty: 'Easy', abundance: 'Medium' }
    ],
    description: 'Crystal clear deep lake known for its beauty and excellent smallmouth bass fishing.',
    coordinates: { latitude: 44.9761, longitude: -85.2039 },
    bestTimes: {
      morning: '6:00-9:00 AM (Best smallmouth activity)',
      evening: '6:30-8:30 PM (Good bass fishing)',
      season: 'May-October (Best: June-September)'
    },
    conditions: {
      bestWeather: 'Partly cloudy, calm conditions',
      pressure: 'Stable pressure',
      temperature: '65-75°F optimal',
      wind: 'Light wind preferred'
    },
    tips: [
      'Fish rocky points for smallmouth',
      'Use clear water tactics',
      'Try deep water for lake trout',
      'Focus on structure and drop-offs'
    ],
    baitRecommendations: ['Tube jigs', 'Drop shot rigs', 'Small crankbaits', 'Live minnows'],
    depth: 'Very deep - up to 285 feet',
    access: 'Public access sites available',
    facilities: ['Boat launches', 'Parking', 'Limited facilities'],
    county: 'Antrim',
    size: '18,770 acres',
    regulations: ['Michigan fishing license required', 'Lake trout regulations apply']
  },
  {
    id: 'il-3',
    name: 'Gull Lake',
    type: 'lake',
    fishTypes: [
      { name: 'Largemouth Bass', bestTime: '6:00-9:00 AM', season: 'April-October', difficulty: 'Easy', abundance: 'High' },
      { name: 'Smallmouth Bass', bestTime: '6:30-9:30 AM', season: 'May-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Bluegill', bestTime: '10:00 AM-3:00 PM', season: 'May-August', difficulty: 'Easy', abundance: 'High' },
      { name: 'Northern Pike', bestTime: '7:00-10:00 AM', season: 'April-October', difficulty: 'Medium', abundance: 'Medium' }
    ],
    description: 'Popular southwest Michigan lake with excellent bass fishing.',
    coordinates: { latitude: 42.3928, longitude: -85.4131 },
    bestTimes: {
      morning: '6:00-9:00 AM (Peak bass activity)',
      evening: '6:00-8:30 PM (Good evening bite)',
      season: 'April-October (Best: May-September)'
    },
    conditions: {
      bestWeather: 'Partly cloudy, stable conditions',
      pressure: 'Stable pressure',
      temperature: '68-78°F ideal',
      wind: 'Light breeze helpful'
    },
    tips: [
      'Fish weed lines and structure',
      'Use topwater lures early morning',
      'Try drop shots for smallmouth',
      'Focus on points and coves'
    ],
    baitRecommendations: ['Spinnerbaits', 'Plastic worms', 'Topwater lures', 'Jigs'],
    depth: '10-110 feet maximum',
    access: 'Multiple public access points',
    facilities: ['Boat launches', 'Parking', 'Restrooms', 'Marinas'],
    county: 'Kalamazoo',
    size: '2,030 acres',
    regulations: ['Michigan fishing license required', 'Standard bass regulations']
  },
  // Rivers
  {
    id: 'r-1',
    name: 'Au Sable River',
    type: 'river',
    fishTypes: [
      { name: 'Brown Trout', bestTime: '5:30-8:00 AM', season: 'April-October', difficulty: 'Hard', abundance: 'High' },
      { name: 'Rainbow Trout', bestTime: '6:00-8:30 AM', season: 'April-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Brook Trout', bestTime: '5:00-7:30 AM', season: 'April-September', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Smallmouth Bass', bestTime: '6:30-9:30 AM', season: 'May-October', difficulty: 'Medium', abundance: 'Medium' }
    ],
    description: 'World-famous trout stream with excellent fly fishing opportunities.',
    coordinates: { latitude: 44.6614, longitude: -84.1336 },
    bestTimes: {
      morning: '5:30-8:00 AM (Prime trout time)',
      evening: '6:00-8:30 PM (Good evening hatch)',
      season: 'April-October (Best: May-June, September)'
    },
    conditions: {
      bestWeather: 'Overcast, cool conditions',
      pressure: 'Stable pressure',
      temperature: '55-68°F water temp',
      wind: 'Light wind or calm'
    },
    tips: [
      'Use fly fishing techniques',
      'Match the hatch for best results',
      'Wade carefully on sandy bottom',
      'Focus on deeper pools and runs'
    ],
    baitRecommendations: ['Dry flies', 'Nymphs', 'Small spinners', 'Worms'],
    depth: '2-8 feet typical',
    access: 'Multiple public access points',
    facilities: ['Parking', 'Canoe rentals', 'Fly shops', 'Guides available'],
    county: 'Crawford/Oscoda',
    size: '240 miles total',
    regulations: ['Michigan fishing license required', 'Trout stamp required', 'Special trout regulations']
  },
  {
    id: 'r-2',
    name: 'Manistee River',
    type: 'river',
    fishTypes: [
      { name: 'Steelhead', bestTime: '6:00-9:00 AM', season: 'October-April', difficulty: 'Hard', abundance: 'High' },
      { name: 'Chinook Salmon', bestTime: '5:30-8:00 AM', season: 'September-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Brown Trout', bestTime: '6:00-8:30 AM', season: 'Year-round', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Coho Salmon', bestTime: '6:30-9:00 AM', season: 'September-October', difficulty: 'Medium', abundance: 'Medium' }
    ],
    description: 'Excellent salmon and steelhead river with good access.',
    coordinates: { latitude: 44.2442, longitude: -85.8711 },
    bestTimes: {
      morning: '6:00-9:00 AM (Peak salmon/steelhead)',
      evening: '5:30-7:30 PM (Good activity)',
      season: 'September-April (Best: October-November, March-April)'
    },
    conditions: {
      bestWeather: 'Overcast, stable conditions',
      pressure: 'Rising pressure after rain',
      temperature: '45-60°F water temp',
      wind: 'Wind not critical'
    },
    tips: [
      'Fish after rain for best salmon runs',
      'Use spawn bags and flies',
      'Focus on deeper pools',
      'Wade carefully in current'
    ],
    baitRecommendations: ['Spawn bags', 'Flies', 'Spoons', 'Jigs'],
    depth: '3-12 feet in pools',
    access: 'Good public access throughout',
    facilities: ['Parking', 'Restrooms', 'Bait shops', 'Guide services'],
    county: 'Manistee',
    size: '190 miles',
    regulations: ['Michigan fishing license required', 'Salmon/trout stamp required', 'Special salmon regulations']
  },
  // More inland lakes
  {
    id: 'il-4',
    name: 'Higgins Lake',
    type: 'lake',
    fishTypes: [
      { name: 'Lake Trout', bestTime: '5:00-7:00 AM', season: 'Year-round', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Smallmouth Bass', bestTime: '6:30-9:30 AM', season: 'May-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Yellow Perch', bestTime: '9:00 AM-2:00 PM', season: 'Year-round', difficulty: 'Easy', abundance: 'Medium' },
      { name: 'Bluegill', bestTime: '10:00 AM-3:00 PM', season: 'May-August', difficulty: 'Easy', abundance: 'Medium' }
    ],
    description: 'Crystal clear lake known for its beauty and excellent water quality.',
    coordinates: { latitude: 44.4697, longitude: -84.6711 },
    bestTimes: {
      morning: '6:00-9:00 AM (Best smallmouth activity)',
      evening: '6:30-8:00 PM (Good bass fishing)',
      season: 'May-October (Year-round for lake trout)'
    },
    conditions: {
      bestWeather: 'Clear to partly cloudy',
      pressure: 'Stable pressure',
      temperature: '65-75°F for bass',
      wind: 'Light wind preferred'
    },
    tips: [
      'Fish rocky areas for smallmouth',
      'Use clear water presentations',
      'Try deep water for lake trout',
      'Focus on structure'
    ],
    baitRecommendations: ['Tube jigs', 'Drop shot rigs', 'Small crankbaits', 'Live bait'],
    depth: 'Very deep - up to 135 feet',
    access: 'State park and public access',
    facilities: ['State park', 'Boat launches', 'Camping', 'Restrooms'],
    county: 'Roscommon',
    size: '9,600 acres',
    regulations: ['Michigan fishing license required', 'State park entry fee']
  },
  {
    id: 'il-5',
    name: 'Lake St. Clair',
    type: 'lake',
    fishTypes: [
      { name: 'Smallmouth Bass', bestTime: '6:00-9:00 AM', season: 'May-October', difficulty: 'Medium', abundance: 'High' },
      { name: 'Largemouth Bass', bestTime: '6:30-9:30 AM', season: 'April-October', difficulty: 'Easy', abundance: 'High' },
      { name: 'Walleye', bestTime: '5:30-8:30 AM', season: 'April-November', difficulty: 'Medium', abundance: 'High' },
      { name: 'Muskie', bestTime: '7:00-10:00 AM', season: 'June-October', difficulty: 'Hard', abundance: 'Medium' },
      { name: 'Yellow Perch', bestTime: '9:00 AM-3:00 PM', season: 'Year-round', difficulty: 'Easy', abundance: 'High' }
    ],
    description: 'Excellent multi-species fishery between Lake Huron and Detroit River.',
    coordinates: { latitude: 42.4072, longitude: -82.7183 },
    bestTimes: {
      morning: '6:00-9:00 AM (Peak activity for most species)',
      evening: '6:00-8:30 PM (Good bass and walleye)',
      season: 'April-November (Best: May-October)'
    },
    conditions: {
      bestWeather: 'Stable conditions, light chop',
      pressure: 'Stable to rising pressure',
      temperature: '65-78°F optimal',
      wind: 'Light to moderate wind'
    },
    tips: [
      'Fish grass beds for bass',
      'Try deeper water for walleye',
      'Use large baits for muskie',
      'Focus on structure and drop-offs'
    ],
    baitRecommendations: ['Spinnerbaits', 'Crankbaits', 'Jigs', 'Large lures for muskie'],
    depth: '3-27 feet average',
    access: 'Numerous public launches',
    facilities: ['Boat launches', 'Marinas', 'Bait shops', 'Charter services'],
    county: 'Macomb/St. Clair',
    size: '430 square miles',
    regulations: ['Michigan fishing license required', 'Special muskie regulations']
  }
];

export async function getNearbyFishingSpots(
  userLocation: Location.LocationObject,
  radiusMiles: number = 50
): Promise<MichiganFishingSpot[]> {
  const spotsWithDistance = MICHIGAN_FISHING_SPOTS.map(spot => {
    const distance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      spot.coordinates.latitude,
      spot.coordinates.longitude
    );
    
    return {
      ...spot,
      distance: Math.round(distance * 10) / 10
    };
  })
  .filter(spot => spot.distance <= radiusMiles)
  .sort((a, b) => a.distance - b.distance);

  return spotsWithDistance;
}

export async function getAllMichiganFishingSpots(
  userLocation?: Location.LocationObject
): Promise<MichiganFishingSpot[]> {
  if (!userLocation) {
    return MICHIGAN_FISHING_SPOTS.map(spot => ({ ...spot, distance: 0 }));
  }

  const spotsWithDistance = MICHIGAN_FISHING_SPOTS.map(spot => {
    const distance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      spot.coordinates.latitude,
      spot.coordinates.longitude
    );
    
    return {
      ...spot,
      distance: Math.round(distance * 10) / 10
    };
  })
  .sort((a, b) => a.distance - b.distance);

  return spotsWithDistance;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getFishingSpotsByType(type: MichiganFishingSpot['type']): MichiganFishingSpot[] {
  return MICHIGAN_FISHING_SPOTS
    .filter(spot => spot.type === type)
    .map(spot => ({ ...spot, distance: 0 }));
}

export function searchFishingSpots(query: string): MichiganFishingSpot[] {
  const lowercaseQuery = query.toLowerCase();
  return MICHIGAN_FISHING_SPOTS
    .filter(spot => 
      spot.name.toLowerCase().includes(lowercaseQuery) ||
      spot.county.toLowerCase().includes(lowercaseQuery) ||
      spot.fishTypes.some(fish => fish.name.toLowerCase().includes(lowercaseQuery))
    )
    .map(spot => ({ ...spot, distance: 0 }));
}