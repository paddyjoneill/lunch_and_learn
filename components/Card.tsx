import React from "react";

interface Props {
  children: React.ReactNode;
}

const Card = (props: Props) => {
  return <div className="bg-gray-100 rounded p-2 mb-4">{props.children}</div>;
};

export default Card;
