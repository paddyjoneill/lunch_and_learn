import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";
import cookie from "cookie";
import Stripe from "stripe";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) return res.status(401).send("Unauthorized");

  // get token from cookie
  const token = cookie.parse(req.headers.cookie!)["sb-access-token"];

  // create supabase session from the cookie access token
  supabase.auth.session = () => ({
    access_token: token,
    token_type: "Bearer",
    user: user,
  });

  // we want stripe customer which isn't in the normal user object
  const data = await supabase
    .from("profile")
    .select("stripe_customer")
    .eq("id", user.id)
    .single();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  const { priceId } = req.query;

  const lineItems = [
    {
      price: priceId as string,
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    customer: data.data.stripe_customer,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: "https://supabase-test-five.vercel.app/payment/success",
    cancel_url: "https://supabase-test-five.vercel.app/payment/cancelled",
  });

  res.send({
    id: session.id,
  });
};

export default handler;
