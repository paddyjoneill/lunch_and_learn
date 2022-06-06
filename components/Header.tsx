import Link from "next/link";
import React from "react";
import { useAuthContext } from "../auth/AuthContext";

const Header = () => {
  const { loading, user } = useAuthContext();

  const signInSignOut =
    user === null ? (
      <Link href="/signin">
        <a>
          <p className="font-bold uppercase mx-8 my-2">Sign In</p>
        </a>
      </Link>
    ) : (
      <Link href="/signout">
        <a>
          <p className="font-bold uppercase mx-8 my-2">Sign Out</p>
        </a>
      </Link>
    );

  return (
    <div>
      <nav className="flex justify-between">
        <div className="flex">
          <Link href="/">
            <a>
              <p className="font-bold uppercase mx-8 my-2">Home</p>
            </a>
          </Link>
          <Link href="/subscriptions">
            <a>
              <p className="font-bold uppercase mx-8 my-2">Subscriptions</p>
            </a>
          </Link>
          <Link href="/account">
            <a>
              <p className="font-bold uppercase mx-8 my-2">My Account</p>
            </a>
          </Link>
        </div>
        <div className="flex">
          <>{loading ? <p>....</p> : signInSignOut}</>
        </div>
      </nav>
    </div>
  );
};

export default Header;
