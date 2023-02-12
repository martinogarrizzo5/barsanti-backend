import React, { useEffect } from "react";
import SideBar from "../components/SideBar";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebaseApp";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const router = useRouter();

  return (
    <div className="flex">
      {router.pathname.startsWith("/admin") && <SideBar />}
      {children}
    </div>
  );
}

export default Layout;
