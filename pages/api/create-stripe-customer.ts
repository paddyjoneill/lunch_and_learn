import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServiceSupabase, supabase } from "../../utils/supabaseClient";

// this endpoint is called by a hook when a new supabase auth user is added
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // check this request is coming from the supabase function by checking secret
  if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  // create stripe client
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  // get a new customer from stripe
  const customer = await stripe.customers.create({
    email: req.body.record.email,
  });

  // get service supabase to update profile
  const serviceSupabase = getServiceSupabase();

  // update users profile with the stripe_customer id
  const { data, error } = await serviceSupabase
    .from("profile")
    .update({
      stripe_customer: customer.id,
    })
    .eq("id", req.body.record.id);

  res.send({ message: `stripe customer ${customer.id}` });
};

export default handler;
