import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3, BsCheck } from "react-icons/bs";
import { DateRangePicker } from "react-date-range";
import Checkbox from "./Checkbox";
import { useQuery } from "@tanstack/react-query";
import { Value as QuillValue } from "react-quill";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <span>Loading...</span>,
});
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import FileInput from "./ImagePicker";
import { getImageSrc } from "@/lib/image";

export type EventFormData = {
  title: string;
  description: QuillValue;
  image: File | string | null;
  files: File[];
  highlited: boolean;
  category: string | null; // TODO: change type
};

function EventForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EventFormData>({
    defaultValues: {
      highlited: false,
      category: null,
      title: "",
      description: "",
      image: null,
      files: [],
    },
  });

  const onSave = handleSubmit(data => {
    console.log(data);
  });

  return (
    <div>
      <form onSubmit={onSave}>
        <div className="mb-10 flex items-end">
          <div className="flex-[4]">
            <label className="label mb-2" htmlFor="title">
              Titolo
            </label>
            <input
              type="text"
              id="title"
              className="input w-full px-4 py-2"
              placeholder="Inserisci titolo"
              {...register("title")}
            />
          </div>
          <Controller
            name="highlited"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="ml-10 mb-2  flex-[2] ">
                <Checkbox
                  label="In evidenza"
                  value={value}
                  onChange={onChange}
                />
              </div>
            )}
          />
        </div>
        <div className="mb-10 flex items-center">
          <div className="w-5/12">
            <label className="label mb-2" htmlFor="category">
              Categoria
            </label>
            <Select
              classNames={{
                ...dropDownStyles,
                container: _ => "w-full",
              }}
              {...register("category")}
            />
          </div>
          <div className="relative ml-12 w-4/12 cursor-pointer select-none xl:w-3/12">
            <label className="label mb-2">Data</label>
            <div className="input flex h-full items-center justify-between py-2 px-4">
              <span className="font-normal">Some</span>
              <BsCalendar3 />
            </div>
          </div>
        </div>
        <div className="mb-12 flex h-80 w-full flex-col">
          <label className="label mb-2" htmlFor="description">
            Descrizione
          </label>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => (
              <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                className="flex h-full flex-col bg-white"
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            )}
          />
        </div>
        <div className="mb-12 flex h-72 items-stretch justify-between">
          <Controller
            control={control}
            name="image"
            render={({ field: { value: image, onChange } }) => (
              <div className="flex h-full w-4/12 flex-col">
                <label className="label mb-2">Immagine</label>
                <div className="input relative h-full w-full overflow-hidden">
                  {image && (
                    <img
                      src={getImageSrc(image)}
                      className="absolute h-full w-full object-cover"
                    />
                  )}
                  <FileInput
                    showImageIcon
                    onFilesChange={val => onChange(val ? val[0] : null)}
                    className="btn absolute bottom-0 right-0 rounded-tl-xl rounded-tr-none rounded-br-md rounded-bl-none px-5 py-2"
                    accept="image/*"
                  />
                </div>
              </div>
            )}
          />
          <Controller
            control={control}
            name="files"
            render={({ field: { value: image, onChange } }) => (
              <div className="flex h-full w-5/12 flex-col">
                <label className="label mb-2">File Relativi</label>
                <div className="input relative h-full w-full overflow-hidden">
                  <div></div>
                  <FileInput
                    onFilesChange={() => {}}
                    className="btn absolute bottom-0 right-0 rounded-tl-xl rounded-tr-none rounded-br-md rounded-bl-none px-5 py-2"
                  />
                </div>
              </div>
            )}
          />
        </div>
        <div className="flex w-full justify-end">
          <button
            onClick={onSave}
            type="submit"
            className="btn flex items-center self-end px-8 py-2 text-lg"
          >
            <BsCheck className="mr-2 text-[1.75rem]" />
            <span>Salva</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;
