// frontend/pages/_app.js
import "../styles/globals.css";
import ProtectedRoute from "../utils/ProtectedRoute";
import { useRouter } from "next/router";

const noAuthRequired = ["/auth", "/"]; // public pages

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const isProtected = !noAuthRequired.includes(router.pathname);

  return isProtected ? (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  ) : (
    <Component {...pageProps} />
  );
}

export default MyApp;
