import { useEffect } from "react";
import Layout from "@/layout/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebaseApp";
import { useRouter } from "next/router";
import useAuthStore from "@/store/authStore";
import axios from "axios";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const auth = useAuthStore();

  useEffect(() => {
    const unsubscribeAuthObserver = onAuthStateChanged(
      firebaseAuth,
      async (user) => {
        if (!user) {
          // TODO: put this redirect in middleware
          if (router.pathname.startsWith("/admin")) {
            router.replace("/login");
          }
          return;
        }

        console.log(user);
        // TODO: check user on server

        if (router.pathname === "/login") {
          router.replace("/admin");
        }

        // attach auth token to all requests
        const token = await user.getIdToken();
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;

        // update global auth state
        auth.handleFirebaseAuthStateChanged(user);
      }
    );

    return () => {
      unsubscribeAuthObserver();
    };
  }, []);

  if (auth.isLoading) return <div>Loading...</div>;

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
