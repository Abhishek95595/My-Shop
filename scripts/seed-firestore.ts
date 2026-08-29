import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { SAMPLE_PRODUCTS } from '../src/services/mockProducts';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function seed() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is missing.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Starting firestore seeding for project: ${firebaseConfig.projectId}...`);

  for (const product of SAMPLE_PRODUCTS) {
    const docRef = doc(db, 'products', product.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, product);
      console.log(`Successfully seeded product: ${product.name} (SKU: ${product.sku})`);
    } else {
      console.log(`Product already exists, skipping: ${product.name}`);
    }
  }

  console.log('Seeding completed successfully.');
}

seed().catch(console.error);
