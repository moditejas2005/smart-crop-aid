// Script to create the initial admin user in Firebase
// Run this once to set up the admin account

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';

export async function createAdminUser() {
  const adminEmail = 'admin@smartcrop.com';
  const adminPassword = 'admin123456';
  
  try {
    console.log('Creating admin user...');
    
    // Create Firebase Authentication user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );
    
    const user = userCredential.user;
    console.log('Admin user created in Firebase Auth:', user.uid);
    
    // Create Firestore user document
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      name: 'System Administrator',
      email: adminEmail,
      role: 'admin',
      phone: '+91-1234567890',
      profileImage: '',
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      },
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
    
    console.log('Admin profile created in Firestore');
    console.log('✅ Admin user setup complete!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('User ID:', user.uid);
    
    return user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error.message);
      throw error;
    }
  }
}

// Uncomment to run this script
// createAdminUser();
