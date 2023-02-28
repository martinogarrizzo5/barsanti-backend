import classNames from "classnames";
import Image from "next/image";
import React, { useRef } from "react";
import { BiImage } from "react-icons/bi";
import { MdUpload } from "react-icons/md";

interface IImagePickerProps {
  className?: string;
  onFilesChange: (newFiles: FileList | null) => void;
  multipleFiles?: boolean;
  accept?: string;
  showImageIcon?: boolean;
}

function FileInput(props: IImagePickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInput.current) {
      fileInput.current.value = ""; // allow to re-upload a deleted image
      fileInput.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInput}
        type="file"
        accept={props.accept}
        multiple={props.multipleFiles}
        onChange={event => props.onFilesChange(event.target.files)}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className={classNames("flex items-center", props.className)}
      >
        {props.showImageIcon ? (
          <BiImage className="mr-2 text-[1.5rem]" />
        ) : (
          <MdUpload className="mr-1 text-[1.4rem]" />
        )}
        <span>Carica</span>
      </button>
    </div>
  );
}

interface IImagePickerWithPreviewProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  error?: string;
}

export function ImagePickerWithPreview(props: IImagePickerWithPreviewProps) {
  return (
    <div>
      <div
        className={classNames(
          "flex h-56 w-44 overflow-hidden rounded-t-lg border-[1px] border-b-0 border-grayBorder",
          props.error && "border-red-600"
        )}
      >
        {props.value instanceof File && (
          <img
            src={URL.createObjectURL(props.value)}
            alt="preview"
            className="h-full w-full object-cover"
          />
        )}
        {typeof props.value === "string" && (
          <img
            src={props.value}
            alt="preview"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <FileInput
        onFilesChange={photos => {
          if (!photos) return;
          props.onChange(photos[0]);
        }}
        accept="image/*"
        showImageIcon
        className={
          "btn flex w-full items-center justify-center rounded-t-none rounded-b-xl px-4 py-1 text-base"
        }
      />
      {props.error && (
        <span className="mt-2 block text-red-600">{props.error}</span>
      )}
    </div>
  );
}

export default FileInput;
