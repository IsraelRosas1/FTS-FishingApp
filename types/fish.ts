export interface Fish {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  habitat: string;
  imageUrl: string;
}

export interface Catch {
  id: string;
  fishId: string | null;
  fishName: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    name: string | null;
  };
  date: string;
  imageUri: string;
  notes: string;
  confidence?: number;
}