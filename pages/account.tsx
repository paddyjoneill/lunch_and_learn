import styles from "../styles/Home.module.css";
import { useAuthContext } from "../auth/AuthContext";
import { useRouter } from "next/router";
import Card from "../components/Card";

const Home = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const loadPortal = async () => {
    const res = await fetch("/api/portal");
    const data = await res.json();
    router.push(data.url);
  };

  const goToSubscription = () => router.push("/subscriptions");
  const goToSignUp = () => router.push("/signup");
  const goToSignIn = () => router.push("/signin");

  const isUserContent = user?.is_subscribed ? (
    <>
      <p className="mb-4">User is subscribed</p>
      <button
        className="bg-green-400 px-4 py-2 rounded w-64"
        onClick={loadPortal}
      >
        Manage Account
      </button>
    </>
  ) : (
    <>
      <p className="mb-4">User is not Subscribed</p>
      <button
        className="bg-green-400 px-4 py-2 rounded w-64"
        onClick={goToSubscription}
      >
        Choose Subscription
      </button>
    </>
  );

  return (
    <div className="m-8 flex flex-col">
      <h2 className="mb-8">Account Page</h2>
      <div className="w-96">
        <Card>
          <p className="mb-4">
            {user === null ? "Not Signed In" : "Signed in as: " + user?.email}
          </p>
          {!user ? (
            <>
              <button
                className="bg-green-400 px-4 py-2 rounded w-64 mb-4"
                onClick={goToSignIn}
              >
                Sign In
              </button>
              <button
                className="bg-green-400 px-4 py-2 rounded w-64"
                onClick={goToSignUp}
              >
                Sign Up
              </button>
            </>
          ) : (
            isUserContent
          )}
        </Card>
      </div>
    </div>
  );
};

export default Home;
