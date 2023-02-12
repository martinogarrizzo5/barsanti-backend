import React from "react";
import Image from "next/image";
import Head from "next/head";
import logoImg from "@/public/barsanti.webp";
import { BsGoogle } from "react-icons/bs";
import useAuthStore from "@/store/authStore";

function Login() {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const auth = useAuthStore();

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await auth.signInWithGoogle();
    setIsLoggingIn(false);
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="mx-auto flex h-[100vh] w-[600px] flex-col items-center justify-center">
        <Image alt="logo of the school" src={logoImg} height={90} />
        <button
          className="btn mt-6 flex items-center px-8 py-3"
          onClick={handleLogin}
        >
          <BsGoogle className="mr-3" />
          <span>
            {isLoggingIn ? "In Attesa Di Google..." : "Login Con Google"}
          </span>
        </button>
        <p className="mt-8">Sono accettate solo email @barsanti.edu.it</p>
      </div>
    </>
  );
}

export default Login;
