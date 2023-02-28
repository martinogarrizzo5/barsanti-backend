import classNames from "classnames";
import React, { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { BsCheck } from "react-icons/bs";

interface ICheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function Checkbox(props: ICheckboxProps) {
  return (
    <div
      className="flex w-max cursor-pointer items-center"
      onClick={() => props.onChange(!props.value)}
    >
      <div
        className={classNames(
          "input mr-3 flex h-6 w-6 items-center justify-center text-3xl",
          props.value && "bg-primary text-white"
        )}
      >
        {props.value && <BsCheck />}
      </div>
      <Label.Root className="cursor-pointer">{props.label}</Label.Root>
    </div>
  );
}

export default Checkbox;
