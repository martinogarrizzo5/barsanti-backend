import React from "react";
import { BeatLoader } from "react-spinners";

function LoadingIndicator() {
  return (
    <div className="flex w-full items-center justify-center text-xl">
      <BeatLoader color="var(--primaryColor)" size={12} className="mr-3" />
      <span>Caricamento...</span>
    </div>
  );
}

export default LoadingIndicator;
