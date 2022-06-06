import React from "react";
import { Fireworks } from "fireworks/lib/react";

const Success = () => {
  let fxProps = {
    count: 3,
    interval: 200,
    colors: ["#cc3333", "#4CAF50", "#81C784"],
    calc: (props, i) => ({
      ...props,
      x: (i + 1) * (window.innerWidth / 3) - (i + 1) * 100,
      y: 300 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0),
    }),
  };

  return (
    <div className="m-8">
      <p>Success</p>

      <Fireworks {...fxProps} />
    </div>
  );
};

export default Success;
