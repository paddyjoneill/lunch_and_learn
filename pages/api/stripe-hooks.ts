import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { getServiceSupabase } from "../../utils/supabaseClient";

// https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // this is for a request coming from strip to notify us when a subscription has been
  // updated (includes created) or deleted.

  // start stripe instance with secret key
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27",
  });

  const signature = req.headers["stripe-signature"];
  // signing secret available from the stripe webhook page
  const signingSecret = process.env.STRIPE_SIGNING_SECRET;
  // stripe needs to be passed the request as a buffer so need to do this...
  const reqBuffer = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature as string,
      signingSecret as string
    );
  } catch (err) {
    console.log({ err });
    res.status(400).send({ err: (err as Error).message });
  }

  // get service supabase as don't have a user and need to bypass
  // row level security
  const supabase = getServiceSupabase();

  const stripeSubscription = (event as Stripe.Event).data
    .object as Stripe.Subscription;

  // update supabase database with new details.

  switch ((event as Stripe.Event).type) {
    case "customer.subscription.updated":
      console.log(" about to update");
      await supabase
        .from("profile")
        .update({
          is_subscribed: true,
          interval: stripeSubscription.items.data[0].plan.interval,
        })
        .eq("stripe_customer", stripeSubscription.customer);
      break;
    case "customer.subscription.deleted":
      await supabase
        .from("profile")
        .update({
          is_subscribed: false,
          interval: null,
        })
        .eq("stripe_customer", stripeSubscription.customer);
      break;
  }

  res.send({ received: true });
};

export default handler;
