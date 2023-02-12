import { firebaseAuth } from "@/firebase/firebaseApp";
import { User } from "@prisma/client";
import { User as FirebaseUser } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { create } from "zustand";

interface AuthState {
  isLoading: boolean;
  user: User | null;
  handleFirebaseAuthStateChanged: (user: FirebaseUser | null) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  user: null,
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err) {
      console.log(err);
      const error = err as FirebaseError;
      if (error.code !== "auth/popup-closed-by-user") {
      }
    }
  },
  signOut: async () => {
    set({ isLoading: true });
    await firebaseAuth.signOut();
    set({ isLoading: false, user: null });
  },
  handleFirebaseAuthStateChanged: async (user: FirebaseUser | null) => {
    if (!user) {
      set({ isLoading: false, user: null });
      return;
    }

    console.log(user);
    // TODO: check user on server
    set({ isLoading: false });
  },
}));

export default useAuthStore;
