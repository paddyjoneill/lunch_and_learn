import React, { useEffect } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useRouter } from "next/router";

const SignOut = () => {
  const { signOut } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const signOutOfAuth = async () => {
      await signOut();
      router.push("/signin");
    };
    signOutOfAuth();
  }, [router, signOut]);

  return (
    <>
      <p className="m-8">Signing Out...</p>
    </>
  );
};

export default SignOut;
