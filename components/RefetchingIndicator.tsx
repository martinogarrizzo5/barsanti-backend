import React from "react";
import { BeatLoader } from "react-spinners";

function RefetchingIndicator() {
  return (
    <div className="fixed bottom-10 right-16 z-50 flex items-center border-[1px] border-grayBorder bg-primary p-2  text-white ">
      <BeatLoader size={8} className="mr-3" color="white" />
      <span>Caricamento...</span>
    </div>
  );
}

export default RefetchingIndicator;
