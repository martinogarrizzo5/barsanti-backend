import React from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3 } from "react-icons/bs";
import { DateRangePicker } from "react-date-range";

export type EventFormData = {
  title: string;
  description: string;
  image: File | string | null;
  category: string;
};

function EventForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<EventFormData>({});

  const onSave = handleSubmit(data => {
    console.log(data);
  });

  return (
    <div>
      <form onSubmit={onSave}>
        <div className="mb-10 flex items-center">
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
          <div className="ml-10 flex h-0 flex-[2] cursor-pointer">
            <div className="input mr-3 p-3"></div>
            <span>In evidenza</span>
          </div>
        </div>
        <div className="flex items-center">
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
      </form>
    </div>
  );
}

export default EventForm;
