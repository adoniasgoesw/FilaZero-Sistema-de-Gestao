import React from "react";

const CounterBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute top-1 right-1 z-[100] bg-[#1A99BA] text-white text-xs font-semibold rounded-full px-2 py-0.5 shadow">
      {count}
    </span>
  );
};

export default CounterBadge;


