import { useEffect, useState } from "react";
import Layout from "@/layout/Layout";
import type { AppProps } from "next/app";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebaseApp";
import Router, { useRouter } from "next/router";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NProgress from "nprogress";
import "@/styles/globals.css";
import "@/styles/nprogress.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import InitialLoading from "@/components/InitialLoading";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const auth = useAuthStore();

  // setup auth effect on mount of the app
  useEffect(() => {
    const unsubscribeAuthObserver = onAuthStateChanged(
      firebaseAuth,
      async user => {
        if (!user) {
          return auth.clear();
        }

        // attach auth token to all requests
        const token = await user.getIdToken();
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;

        // on each request refresh token if necessary and attach it to the request
        axios.interceptors.request.use(async config => {
          const token = await user.getIdToken();
          axios.defaults.headers.common["Authorization"] = "Bearer " + token;
          return config;
        });

        // verify user privilegies and update global state
        auth.handleFirebaseDashboardAuthState(user);
      }
    );

    return () => {
      unsubscribeAuthObserver();
    };
  }, []);

  // redirect based on auth
  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.user === null) {
      if (router.pathname !== "/login") {
        router.replace("/login");
      }

      return;
    }

    if (router.pathname === "/login" && !router.pathname.startsWith("/admin")) {
      router.replace("/admin");
    }
  }, [auth]);

  // setup progress bar on route change
  useEffect(() => {
    const handleRouteChangeStart = (url: any) => {
      NProgress.start();
    };
    const handleRouteChangeEnd = (url: any) => {
      NProgress.done();
    };
    Router.events.on("routeChangeStart", handleRouteChangeStart);
    Router.events.on("routeChangeComplete", handleRouteChangeEnd);
    Router.events.on("routeChangeError", handleRouteChangeEnd);

    return () => {
      Router.events.off("routeChangeStart", handleRouteChangeStart);
      Router.events.off("routeChangeComplete", handleRouteChangeEnd);
      Router.events.off("routeChangeError", handleRouteChangeEnd);
    };
  }, []);

  if (auth.isLoading || (auth.user === null && router.pathname !== "/login"))
    return <InitialLoading />;

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
