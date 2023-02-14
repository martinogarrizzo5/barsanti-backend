import { useEffect } from "react";
import Layout from "@/layout/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { onAuthStateChanged } from "firebase/auth";
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
          return auth.clear();
        }

        // attach auth token to all requests
        const token = await user.getIdToken();
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;

        // verify user privilegies and update global state
        auth.handleFirebaseDashboardAuthState(user);
      }
    );

    return () => {
      unsubscribeAuthObserver();
    };
  }, []);

  useEffect(() => {
    if (auth.isLoading) return;

    // redirect if necessary after checking user
    if (auth.user != null) {
      if (router.pathname === "/login") {
        router.replace("/admin");
      }
    } else {
      if (router.pathname.startsWith("/admin")) {
        router.replace("/login");
      }
    }
  }, [auth]);

  if (auth.isLoading)
    return (
      <div className="flex h-[100vh] items-center justify-center text-xl">
        Loading Dashboard...
      </div>
    );

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
