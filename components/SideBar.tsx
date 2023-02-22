import Image from "next/image";
import React from "react";
import * as Label from "@radix-ui/react-label";
import Link from "next/link";
import { BsCalendar3 } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { BiCategory, BiUser } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import classnames from "classnames";
import { useRouter } from "next/router";
import logoImg from "@/public/barsanti.webp";
import useAuthStore from "@/store/authStore";

function SideBar() {
  const auth = useAuthStore();
  const router = useRouter();

  const links = [
    { name: "Eventi", icon: BsCalendar3, path: "/admin/events" },
    { name: "Categorie", icon: BiCategory, path: "/admin/categories" },
    { name: "Utenti", icon: BiUser, path: "/admin/users" },
    { name: "Impostazioni", icon: FiSettings, path: "/admin/settings" },
  ];

  const linkActiveStyle =
    "bg-controlActiveBackground text-primary border-r-4 border-primary";

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="flex h-[100vh]  w-72 flex-shrink-0 flex-col border-r-[1px] border-grayBorder bg-white">
      <Image
        alt="logo of the school"
        src={logoImg}
        className="mx-auto mt-16 mb-24 w-[120px]"
      />
      <div className="w-full">
        {links.map((link) => (
          <Link
            key={`link-${link.name}`}
            href={link.path}
            className={classnames(
              "flex cursor-pointer items-center p-4 text-controlForeground hover:bg-controlHoverBackground active:bg-controlActiveBackground",
              router.pathname.startsWith(link.path) && linkActiveStyle
            )}
          >
            <link.icon className="ml-8 mr-4 inline-block text-[24px]" />
            <Label.Root className="cursor-pointer text-base">
              {link.name}
            </Label.Root>
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className={
          "mt-auto flex cursor-pointer items-center p-4 text-left text-controlForeground hover:bg-controlHoverBackground active:bg-controlActiveBackground"
        }
      >
        <MdLogout className="ml-8 mr-4 inline-block text-[24px]" />
        <Label.Root className="cursor-pointer text-base">Logout</Label.Root>
      </button>
    </nav>
  );
}

export default SideBar;
