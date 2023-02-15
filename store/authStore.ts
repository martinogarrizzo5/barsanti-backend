import { firebaseAuth } from "@/firebase/firebaseApp";
import { User } from "@prisma/client";
import { User as FirebaseUser } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { create } from "zustand";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";

interface AuthState {
  isLoading: boolean;
  user: User | null;
  handleFirebaseDashboardAuthState: (
    user: FirebaseUser | null
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clear: () => void;
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
        // TODO: show popup of error if necessary
      }
    }
  },
  signOut: async () => {
    await firebaseAuth.signOut();
    set({ isLoading: false, user: null });
  },
  handleFirebaseDashboardAuthState: async (user: FirebaseUser | null) => {
    if (!user) {
      set({ isLoading: false, user: null });
      return;
    }

    try {
      const res = await axios.post("/api/auth/login");
      console.log(res.data.user);
      set({ user: res.data.user });
    } catch (err) {
      const error = err as AxiosError;
      const ErrorMessage403 =
        "Hai un account valido ma non possiedi i privilegi per accedere alla dashboard. Cambia account o contatta un amministratore";
      const ErrorMessage401 =
        "Credenziali non valide. Cambia account o contatta un amministratore";
      const errorMessage =
        error.response?.status === 403 ? ErrorMessage403 : ErrorMessage401;

      Swal.fire({
        icon: "error",
        title: "Accesso non consentito",
        text: errorMessage,
        confirmButtonText: "Ho capito",
        confirmButtonColor: "var(--primaryColor)",
        didClose: async () => {
          set({ user: null });
          await firebaseAuth.signOut();
        },
      });
    }

    set({ isLoading: false });
  },
  clear: () => {
    set({ isLoading: false, user: null });
  },
}));

export default useAuthStore;
