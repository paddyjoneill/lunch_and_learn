import React, { ChangeEvent, useState } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useRouter } from "next/router";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { signUp } = useAuthContext();
  const router = useRouter();

  const updateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const updatePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const signUpUser = async () => {
    await signUp(email, password);
    await router.push("/signin");
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
        />
        <button onClick={signUpUser} className="bg-green-400 px-4 py-2 rounded">
          Sign Up
        </button>
      </div>
    </>
  );
};

export default Signup;
