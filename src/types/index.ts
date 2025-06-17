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
  year: number;
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

