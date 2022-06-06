import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthContextProvider } from "../auth/AuthContext";
import Header from "../components/Header";

import "../styles/mystyles.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <Header />
      <Component {...pageProps} />
    </AuthContextProvider>
  );
}

export default MyApp;
