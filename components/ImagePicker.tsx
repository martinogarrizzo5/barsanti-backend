import classNames from "classnames";
import Image from "next/image";
import React, { useRef } from "react";
import { BiImage } from "react-icons/bi";

interface IImagePickerProps {
  className?: string;
  onImagesChange: (newPhotos: FileList | null) => void;
  multipleFiles?: boolean;
  onImageDelete?: (index: number) => void;
}

function ImagePicker(props: IImagePickerProps) {
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
        accept="image/*"
        multiple={props.multipleFiles}
        onChange={(event) => props.onImagesChange(event.target.files)}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className="btn flex w-full items-center justify-center rounded-t-none rounded-b-xl px-4 py-1 text-base"
      >
        <BiImage className="mr-2 text-[1.5rem]" />
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
          <Image
            src={URL.createObjectURL(props.value)}
            alt="preview"
            width={176}
            height={224}
            style={{ objectFit: "cover" }}
          />
        )}
        {typeof props.value === "string" && (
          <Image
            src={props.value}
            alt="preview"
            width={176}
            height={224}
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <ImagePicker
        onImagesChange={(photos) => {
          if (!photos) return;
          props.onChange(photos[0]);
        }}
      />
      {props.error && (
        <span className="mt-2 block text-red-600">{props.error}</span>
      )}
    </div>
  );
}

export default ImagePicker;
