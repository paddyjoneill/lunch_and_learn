import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import cookie from "cookie";
import Stripe from "stripe";

// this route is requested from the client
// it will return a link where the user can go to stripe and manage their subscription
const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  const { user } = await supabase.auth.api.getUserByCookie(req);

  if (!user) return res.status(401).send("Unauthorized");

  // get token from cookie
  const token = cookie.parse(req.headers.cookie!)["sb-access-token"];

  // create a supabase session with the access token from the cookie.
  supabase.auth.session = () => ({
    access_token: token,
    token_type: "Bearer",
    user: user,
  });

  // we want stripe customer which isn't in the normal user object
  // fetch it from the profile table
  const data = await supabase
    .from("profile")
    .select("stripe_customer")
    .eq("id", user.id)
    .single();

  // get stripe client  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  // create a new account management sesssion
  const session = await stripe.billingPortal.sessions.create({
    customer: (data as any).data.stripe_customer,
    return_url: "https://supabase-test-five.vercel.app",
  });

  // send back the url to redirect the customer to
  res.send({ url: session.url });
};

export default handler;
