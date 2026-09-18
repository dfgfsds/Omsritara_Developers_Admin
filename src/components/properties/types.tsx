export interface Location {
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface AmenityData {
  amenities: any;
  amenity_types: string[];
}

export interface NearbyPlace {
  name: string;
  distance: number;
  distance_unit: string;
  type: string;
}

export interface Property {
  _id: string;
  name: string;
  type: any;
  listing_type?: "sale" | "rent" | "lease";
  description?: string;
  location?: Location;
  area_size?: number;
  area_unit?: "sqft" | "sqm" | "acre" | "cent";
  price?: number;
  price_per_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floor_number?: number;
  total_floors?: number;
  furnishing?: "unfurnished" | "semi_furnished" | "fully_furnished";
  facing?: string;
  construction_status?: "ready_to_move" | "under_construction" | "new_launch" | "resale";
  possession_date?: string;
  property_age?: number;
  parking?: number;
  image_url?: string[];
  map_url?: string;
  media_url?: string;
  pincode?: string;
  amenities_data?: AmenityData[];
  nearby_places?: NearbyPlace[];
  owner_name?: string;
  developer_name?: string;
  project_name?: string;
  status: "available" | "sold" | "under_construction" | "draft";
  isFeatured?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyType {
  _id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface Amenity {
  _id: string;
  name: string;
}

export interface AmenityType {
  _id: string;
  name: string;
  amenity_id?: string;
}

export interface FormAmenityData {
  amenities: string;
  amenity_types: string[];
}

export interface FormNearbyPlace {
  name: string;
  type: string;
  distance: string;
  distance_unit: string;
}

export interface PropertyFormData {
  name: string;
  type: string;
  listing_type: "sale" | "rent" | "lease";
  description: string;
  address: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  area_size: string;
  area_unit: "sqft" | "sqm" | "acre" | "cent";
  price: string;
  price_per_sqft: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  floor_number: string;
  total_floors: string;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished" | "";
  facing: string;
  construction_status:
    | "ready_to_move"
    | "under_construction"
    | "new_launch"
    | "resale"
    | "";
  possession_date: string;
  property_age: string;
  parking: string;
  image_url: string[];
  map_url: string;
  media_url: string;
  amenities_data: FormAmenityData[];
  nearby_places: FormNearbyPlace[];
  owner_name: string;
  developer_name: string;
  project_name: string;
  status: "available" | "sold" | "under_construction" | "draft";
  isFeatured: boolean;
  isVerified: boolean;
}

export interface Stats {
  total: number;
  available: number;
  sold: number;
  underConstruction: number;
  featured: number;
  verified: number;
  draft?: number;
}

export interface PropertyTypeFields {
  bedrooms: boolean;
  bathrooms: boolean;
  balconies: boolean;
  floor_number: boolean;
  total_floors: boolean;
  furnishing: boolean;
  facing: boolean;
  parking: boolean;
  property_age: boolean;
  construction_status: boolean;
  possession_date: boolean;
  price_per_sqft: boolean;
}
