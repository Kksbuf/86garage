export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Motor {
  id: string;
  carPlate: string;
  name: string;
  year?: number;
  previousOwner: string;
  boughtInDate?: Date;
  listingDate?: Date;
  soldDate?: Date;
  boughtInCost?: number;
  soldPrice?: number;
  changedName: boolean;
  images: string[];
  videos: string[];
  restoreCost: number;
  primaryImageIndex?: number; // Index of the primary image to display in motor cards
  paidBy?: 'dh' | 'ks' | 'zc';
  clear: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestoreCost {
  id: string;
  motorId: string;
  description: string;
  amount: number;
  paidBy: 'dh' | 'ks' | 'zc';
  date: Date;
  paymentClear: boolean;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  publicId: string;
  type: 'image' | 'video';
  filename: string;
  uploadedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  cost: number; // <--- ADD THIS LINE
  paidBy: 'dh' | 'ks' | 'zc'; // <--- ADD THIS LINE
  paymentClear: boolean; // <--- ADD THIS LINE
  createdAt: Date;
  updatedAt: Date;
}
