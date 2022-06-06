import { GetStaticPaths, GetStaticProps } from "next";
import { supabase } from "../../utils/supabaseClient";

interface Props {
  data: Subscription;
}

interface Subscription {
  id: number;
  created_at: string;
  title: string;
  description: string;
  price: number;
}

const SubscriptionDetails = (props: Props) => {
  return (
    <div>
      <h2>{props.data.title}</h2>
      <p>{props.data.description}</p>
      <p>£{(props.data.price / 100).toFixed(2)} per month</p>
    </div>
  );
};

export default SubscriptionDetails;

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await supabase.from("subscription_products").select("*");

  const paths = (data as any[]).map((d) => ({
    params: { id: d.id.toString() },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = parseInt(context!.params!.id!.toString());

  const { data } = await supabase
    .from("subscription_products")
    .select("*")
    .eq("id", id)
    .single();

  return {
    props: {
      data,
    },
  };
};
