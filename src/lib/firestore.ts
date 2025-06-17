import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Motor, RestoreCost } from '@/types';

// User operations
export const createUser = async (userData: Omit<User, 'createdAt' | 'updatedAt'>) => {
  const userRef = doc(db, 'users', userData.uid);
  const now = new Date();
  
  await setDoc(userRef, {
    ...userData,
    verified: false,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as User;
  }
  
  return null;
};

export const updateUser = async (uid: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

// Motor operations
export const createMotor = async (motorData: Omit<Motor, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const motorRef = await addDoc(collection(db, 'motors'), {
    ...motorData,
    boughtInDate: motorData.boughtInDate ? Timestamp.fromDate(motorData.boughtInDate) : null,
    listingDate: motorData.listingDate ? Timestamp.fromDate(motorData.listingDate) : null,
    soldDate: motorData.soldDate ? Timestamp.fromDate(motorData.soldDate) : null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  
  return motorRef.id;
};

export const getMotors = async (): Promise<Motor[]> => {
  const q = query(
    collection(db, 'motors'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      boughtInDate: data.boughtInDate?.toDate() || null,
      listingDate: data.listingDate?.toDate() || null,
      soldDate: data.soldDate?.toDate() || null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Motor;
  });
};

export const getMotorsByUser = async (): Promise<Motor[]> => {
  const q = query(
    collection(db, 'motors'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      boughtInDate: data.boughtInDate?.toDate() || null,
      listingDate: data.listingDate?.toDate() || null,
      soldDate: data.soldDate?.toDate() || null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Motor;
  });
};

export const getMotor = async (motorId: string): Promise<Motor | null> => {
  const motorRef = doc(db, 'motors', motorId);
  const motorSnap = await getDoc(motorRef);
  
  if (motorSnap.exists()) {
    const data = motorSnap.data();
    return {
      id: motorSnap.id,
      ...data,
      boughtInDate: data.boughtInDate?.toDate() || null,
      listingDate: data.listingDate?.toDate() || null,
      soldDate: data.soldDate?.toDate() || null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Motor;
  }
  
  return null;
};

export const updateMotor = async (motorId: string, updates: Partial<Motor>) => {
  const motorRef = doc(db, 'motors', motorId);
  const updateData: Record<string, any> = {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  
  // Convert dates to Timestamps
  if (updates.boughtInDate) {
    updateData.boughtInDate = Timestamp.fromDate(updates.boughtInDate);
  }
  if (updates.listingDate) {
    updateData.listingDate = Timestamp.fromDate(updates.listingDate);
  }
  if (updates.soldDate) {
    updateData.soldDate = Timestamp.fromDate(updates.soldDate);
  }
  
  await updateDoc(motorRef, updateData);
};

export const deleteMotor = async (motorId: string) => {
  // First delete all associated restore costs
  const costsQuery = query(
    collection(db, 'restoreCosts'),
    where('motorId', '==', motorId)
  );
  
  const costsSnapshot = await getDocs(costsQuery);
  const batch = writeBatch(db);
  
  // Add all cost deletions to batch
  costsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // Add motor deletion to batch
  const motorRef = doc(db, 'motors', motorId);
  batch.delete(motorRef);
  
  // Execute batch
  await batch.commit();
};

// Media operations
export const deleteImageFromMotor = async (motorId: string, imageUrl: string) => {
  const motor = await getMotor(motorId);
  if (!motor) throw new Error('Motor not found');
  
  const updatedImages = motor.images.filter(img => img !== imageUrl);
  let updatedPrimaryIndex = motor.primaryImageIndex;
  
  // Adjust primary image index if necessary
  if (motor.primaryImageIndex !== undefined) {
    const deletedIndex = motor.images.indexOf(imageUrl);
    if (deletedIndex !== -1) {
      if (deletedIndex === motor.primaryImageIndex) {
        // If primary image is deleted, reset to first image
        updatedPrimaryIndex = updatedImages.length > 0 ? 0 : undefined;
      } else if (deletedIndex < motor.primaryImageIndex) {
        // If deleted image is before primary, adjust index
        updatedPrimaryIndex = motor.primaryImageIndex - 1;
      }
    }
  }
  
  await updateMotor(motorId, { 
    images: updatedImages,
    primaryImageIndex: updatedPrimaryIndex
  });
};

export const deleteVideoFromMotor = async (motorId: string, videoUrl: string) => {
  const motor = await getMotor(motorId);
  if (!motor) throw new Error('Motor not found');
  
  const updatedVideos = motor.videos.filter(vid => vid !== videoUrl);
  await updateMotor(motorId, { videos: updatedVideos });
};

export const setPrimaryImage = async (motorId: string, imageIndex: number) => {
  await updateMotor(motorId, { primaryImageIndex: imageIndex });
};

// Restore cost operations
export const createRestoreCost = async (costData: Omit<RestoreCost, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const costRef = await addDoc(collection(db, 'restoreCosts'), {
    ...costData,
    date: Timestamp.fromDate(costData.date),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  
  return costRef.id;
};

export const getRestoreCostsByMotor = async (motorId: string): Promise<RestoreCost[]> => {
  const q = query(
    collection(db, 'restoreCosts'),
    where('motorId', '==', motorId),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as RestoreCost;
  });
};

export const updateRestoreCost = async (costId: string, updates: Partial<RestoreCost>) => {
  const costRef = doc(db, 'restoreCosts', costId);
  const updateData: Record<string, any> = {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  
  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }
  
  await updateDoc(costRef, updateData);
};

export const deleteRestoreCost = async (costId: string) => {
  const costRef = doc(db, 'restoreCosts', costId);
  await deleteDoc(costRef);
};

export const clearAllPayments = async (motorId: string) => {
  const costsQuery = query(
    collection(db, 'restoreCosts'),
    where('motorId', '==', motorId)
  );
  
  const costsSnapshot = await getDocs(costsQuery);
  const batch = writeBatch(db);
  
  costsSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      paymentClear: true,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  });
  
  await batch.commit();
};

