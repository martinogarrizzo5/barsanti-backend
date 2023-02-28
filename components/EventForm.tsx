import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3, BsCheck } from "react-icons/bs";
import { DateRangePicker } from "react-date-range";
import Checkbox from "./Checkbox";

export type EventFormData = {
  title: string;
  description: string;
  image: File | string | null;
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
              <Checkbox label="In evidenza" value={value} onChange={onChange} />
            )}
          />
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
        <div className="mt-12 flex w-full justify-end">
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
