import React, { ChangeEvent, KeyboardEvent, useState } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useRouter } from "next/router";

const SignIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { signIn } = useAuthContext();
  const router = useRouter();

  const updateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const updatePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const signInUser = async () => {
    await signIn(email, password);
    await router.push("/account");
  };

  const goToSignUp = () => router.push("/signup");

  const onEnter = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      await signInUser();
    }
  };

  return (
    <>
      <div className="m-8 flex flex-col w-64">
        <input
          className="my-4 p-2"
          value={email}
          onChange={updateEmail}
          placeholder={"email"}
        />
        <input
          className="my-4 p-2"
          value={password}
          onChange={updatePassword}
          placeholder={"password"}
          type="password"
          onKeyDown={onEnter}
        />
        <button onClick={signInUser} className="bg-green-400 px-4 py-2 rounded">
          Sign In
        </button>
      </div>

      <hr />
      <div className="m-8 w-64 flex flex-col">
        <button className="bg-green-400 px-4 py-2 rounded" onClick={goToSignUp}>
          Sign Up
        </button>
      </div>
    </>
  );
};

export default SignIn;
