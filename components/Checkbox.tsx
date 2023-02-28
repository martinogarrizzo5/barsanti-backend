import classNames from "classnames";
import React, { useState } from "react";

interface ICheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function Checkbox(props: ICheckboxProps) {
  return (
    <div
      className="ml-10 mb-2 flex flex-[2] cursor-pointer select-none"
      onClick={() => props.onChange(!props.value)}
    >
      <div
        className={classNames("input mr-3 p-3", props.value && "bg-primary")}
      >
        {/* TODO: add icon */}
      </div>
      <span>{props.label}</span>
    </div>
  );
}

export default Checkbox;
