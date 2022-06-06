import React from "react";
import { GetStaticProps } from "next";
import Stripe from "stripe";
import { useAuthContext } from "../auth/AuthContext";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";
import Card from "../components/Card";

interface Props {
  plans: Plans[];
}

interface Plans {
  id: string;
  product: string;
  price: number;
  interval: string;
  currency: string;
}

const Subscriptions = (props: Props) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  const showSubscribeButton = !!user && !user.is_subscribed;
  const showCreateAccountButton = !user;
  const showManageAccountButton = !!user && user.is_subscribed;

  const postRequestSettings = (body: object = {}) => {
    const requestHeaders: HeadersInit = new Headers({
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    }) as HeadersInit;
    return {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(body),
    };
  };

  const processSubscription = async (planId: string) => {
    const body = {
      event: user ? "SIGNED_IN" : "SIGNED_OUT",
      session: supabase.auth.session(),
    };
    const header = postRequestSettings(body);
    const res = await fetch(`/api/subscription/${planId}`, header);
    const data = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
    await stripe!.redirectToCheckout({ sessionId: data.id });
  };

  const goToSignUp = () => router.push("/signup");

  const loadPortal = async () => {
    const res = await fetch("/api/portal");
    const data = await res.json();
    router.push(data.url);
  };

  const products = props.plans.map((p, idx) => {
    return (
      <div key={idx}>
        <Card>
          <div className="flex justify-between">
            <div>
              <h3>{p.product}</h3>
              <h4>£{(p.price / 100).toFixed(2)}</h4>
            </div>
            {!loading && (
              <div className="flex align-center">
                {showSubscribeButton && (
                  <button
                    className="mr-4 bg-green-400 px-4 rounded"
                    onClick={() => processSubscription(p.id)}
                  >
                    Subscribe
                  </button>
                )}
                {showCreateAccountButton && (
                  <button
                    className="mr-4 bg-green-400 px-4 rounded"
                    onClick={goToSignUp}
                  >
                    Create Account
                  </button>
                )}
                {showManageAccountButton && (
                  <button
                    className="mr-4 bg-green-400 px-4 rounded"
                    onClick={loadPortal}
                  >
                    Manage Account
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  });

  return (
    <div className="m-8">
      <h1 className="mb-4">Available Subscriptions</h1>
      <div className="flex flex-col">{products}</div>
    </div>
  );
};

export default Subscriptions;

export const getStaticProps: GetStaticProps = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  const { data } = await stripe.prices.list();

  const plans = await Promise.all(
    data.map(async (price) => {
      const product = await stripe.products.retrieve(price.product as string);
      return {
        id: price.id,
        product: product.name,
        price: price.unit_amount,
        interval: price.recurring?.interval,
        currency: price.currency,
      };
    })
  );

  // const { data } = await supabase.from("subscription_products").select("*");

  const sortedPlans = plans.sort((a, b) => a.price! - b.price!);

  return {
    props: { plans: sortedPlans },
  };
};
