export interface VillaConfig {
  brandName: string;
  tagline: string;
  shortDescription: string;
  aboutStory: string;
  whatsappNumber: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  heroImage: string;
  heroSubtitle: string;
  checkInTime: string;
  checkOutTime: string;
  instagram: string;
  adminPassword: string;
  googleSheetsUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  size: string;
  bed: string;
  image: string;
  description: string;
  features: string[];
  isAvailable: boolean;
}

export interface Facility {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export interface BookingRecord {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  notes: string;
  createdAt: string;
  status: 'Menunggu Konfirmasi' | 'Terkonfirmasi' | 'Selesai' | 'Dibatalkan';
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  stayDate: string;
  rating: number;
  comment: string;
  room: string;
}

export interface DatabaseData {
  villaConfig: VillaConfig;
  rooms: Room[];
  facilities: Facility[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  bookings: BookingRecord[];
}
