// certificateService.js
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase.js';

// Collection name in Firestore
const COLLECTION_NAME = 'certificates';

// Generate unique ID for certificates (keeping your existing function)
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Save a new certificate to Firestore
export const saveCertificate = async (certificateData) => {
  try {
    const certificateWithId = {
      ...certificateData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRevoked: false
    };
    
    // Add document to Firestore with custom ID
    await addDoc(collection(db, COLLECTION_NAME), certificateWithId);
    
    return certificateWithId;
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw new Error('Failed to save certificate: ' + error.message);
  }
};

// Get all certificates (for admin purposes - use with caution)
export const getAllCertificates = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    );
    
    const certificates = [];
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data());
    });
    
    return certificates;
  } catch (error) {
    console.error('Error loading certificates:', error);
    throw new Error('Failed to load certificates: ' + error.message);
  }
};

// Get certificates by email
export const getCertificatesByEmail = async (email) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email.toLowerCase()),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const certificates = [];
    
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data());
    });
    
    return certificates;
  } catch (error) {
    console.error('Error loading certificates by email:', error);
    throw new Error('Failed to load certificates: ' + error.message);
  }
};

// Get a single certificate by ID
export const getCertificateById = async (id) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('id', '==', id)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching document
    return querySnapshot.docs[0].data();
  } catch (error) {
    console.error('Error loading certificate by ID:', error);
    throw new Error('Failed to load certificate: ' + error.message);
  }
};

// Update a certificate (for revoking, etc.)
export const updateCertificate = async (certificateId, updates) => {
  try {
    // First, find the document with the matching certificate ID
    const q = query(
      collection(db, COLLECTION_NAME),
      where('id', '==', certificateId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Certificate not found');
    }
    
    // Update the first matching document
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw new Error('Failed to update certificate: ' + error.message);
  }
};

// Revoke a certificate
export const revokeCertificate = async (certificateId) => {
  try {
    await updateCertificate(certificateId, { isRevoked: true });
    return true;
  } catch (error) {
    console.error('Error revoking certificate:', error);
    throw new Error('Failed to revoke certificate: ' + error.message);
  }
};

// Delete all certificates (for testing purposes)
export const clearAllCertificates = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error clearing certificates:', error);
    throw new Error('Failed to clear certificates: ' + error.message);
  }
};

// Search certificates by name (optional feature)
export const searchCertificatesByName = async (name) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('recipientName', '>=', name),
      where('recipientName', '<=', name + '\uf8ff'),
      orderBy('recipientName')
    );
    
    const querySnapshot = await getDocs(q);
    const certificates = [];
    
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data());
    });
    
    return certificates;
  } catch (error) {
    console.error('Error searching certificates:', error);
    throw new Error('Failed to search certificates: ' + error.message);
  }
};