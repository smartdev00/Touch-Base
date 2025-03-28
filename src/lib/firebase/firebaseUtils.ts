import { auth, db, storage } from "./firebase";
import { signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const addUser = async (collectionName: string, data: any) => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    const userDoc = await getUserByEmail(collectionName, data?.email);
    console.log("Found User: ", userDoc);
    if (!!userDoc === false) {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        signinAt: new Date().toISOString(),
      });
      console.log("Successfully saved: ", docRef.id);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        // Convert DocumentSnapshot to DocumentData
        const data = docSnapshot.data();
        return {id: docSnapshot.id, ...data}; // This is of type DocumentData
      } else {
        console.warn("No such document!");
        return null;
      }
    }
    {
      return userDoc;
    }
  } catch (error) {}
};

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    console.log("Adding document to collection:", collectionName, data); // Debug log
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    console.log("Document written with ID:", docRef.id); // Debug log
    return docRef;
  } catch (error) {
    console.error("Error adding document:", error);
    // More specific error handling
    if (error instanceof Error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }
    throw new Error("Failed to save document");
  }
};

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getUserByEmail = async (collectionName: string, email: string) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where("email", "==", email));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    } else {
      const userDoc = querySnapshot.docs.find((doc) => (doc.get("email") as string) === email);
      return {
        id: userDoc?.id,
        ...userDoc?.data()
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getIdByEmail = async (collectionName: string, email: string) => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where("email", "==", email));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    } else {
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`); // Log the user data
      });
      return querySnapshot.docs.find((doc) => (doc.get("email") as string) === email)?.id;
    }
  } catch (error) {
    console.error("Error fetching user id by email: ", error);
    return null;
  }
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) => deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
