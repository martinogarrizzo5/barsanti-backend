import React from "react";
import { BeatLoader } from "react-spinners";

function RefetchingIndicator() {
  return (
    <div className="fixed bottom-6 right-16 z-50 flex items-center border-[1px] border-grayBorder bg-white p-2">
      <BeatLoader size={8} className="mr-3" color="var(--primaryColor)" />
      <span>Caricamento...</span>
    </div>
  );
}

export default RefetchingIndicator;
