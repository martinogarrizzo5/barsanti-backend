import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3, BsCheck, BsFileEarmark } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { DateRangePicker } from "react-date-range";
import Checkbox from "./Checkbox";
import { useQuery } from "@tanstack/react-query";
import { Value as QuillValue } from "react-quill";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <span>Loading...</span>,
});
import dynamic from "next/dynamic";
import FileInput from "./ImagePicker";
import { getFileShortName, getImageSrc } from "@/lib/fileUtils";
import axios from "axios";
import { GetCategoryResponse } from "@/pages/api/categories";
import LoadingIndicator from "./LoadingIndicator";
import ErrorLoading from "./ErrorLoading";
import { Category } from "@prisma/client";
import { File as PrismaFile } from "@prisma/client";
import { Calendar } from "react-date-range";
import useComponentVisible from "@/hooks/useComponentVisible";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "react-quill/dist/quill.snow.css";
import { NewsDto } from "@/dto/newsDto";
import classNames from "classnames";
import { getTodayDate } from "@/lib/dates";

export type EventFormData = {
  title: string;
  description: QuillValue;
  image: File | string | null;
  files: File[] | PrismaFile[];
  deletedFiles: number[];
  highlighted: boolean;
  category: Category | null;
  date: Date | undefined;
};

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  defaultData?: NewsDto;
  isSubmitting?: boolean;
  edit?: boolean;
  onDelete?: () => void;
}

function EventForm(props: EventFormProps) {
  // const [deletedFiles, setDeletedFiles] = React.useState<number[]>([]);

  const baseData = props.defaultData;

  const {
    ref: calendarRef,
    isComponentVisible: isCalendarShown,
    setIsComponentVisible: setCalendarShown,
  } = useComponentVisible(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<EventFormData>({
    defaultValues: {
      highlighted: baseData?.highlighted || false,
      category: baseData?.category || null,
      title: baseData?.title || "",
      description: baseData?.description || "",
      image: baseData?.imageUrl || null,
      files: baseData?.files || [],
      date: baseData?.date ? new Date(baseData?.date) : getTodayDate(),
      deletedFiles: [],
    },
  });

  const {
    isLoading: areCategoriesLoading,
    isError: categoriesError,
    data: categories,
    isRefetching: areCategoriesRefetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: data =>
      axios.get<GetCategoryResponse>("/api/categories").then(res => res.data),
    keepPreviousData: true,
  });

  const onSave = handleSubmit(data => {
    if (props.isSubmitting || (props.edit && !isDirty)) return;

    props.onSubmit(data);
  });

  if (areCategoriesLoading) {
    return <LoadingIndicator />;
  }

  if (categoriesError) {
    return <ErrorLoading />;
  }

  return (
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
          name="highlighted"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="ml-10 mb-2  flex-[2] ">
              <Checkbox label="In evidenza" value={value} onChange={onChange} />
            </div>
          )}
        />
      </div>
      <div className="mb-10 flex items-center">
        <div className="w-5/12">
          <label className="label mb-2" htmlFor="category">
            Categoria
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select
                options={categories}
                getOptionLabel={option => option.name}
                getOptionValue={option => option.id.toString()}
                classNames={{ ...dropDownStyles }}
                value={value}
                onChange={onChange}
                placeholder="Seleziona categoria"
              />
            )}
          />
        </div>
        <Controller
          name="date"
          control={control}
          render={({ field: { value: date, onChange } }) => (
            <div
              className="relative ml-12 w-4/12 cursor-pointer select-none xl:w-3/12"
              ref={calendarRef}
            >
              <label className="label mb-2">Data</label>
              <div
                className="input flex h-full items-center justify-between py-2 px-4"
                onClick={() => setCalendarShown(prevVal => !prevVal)}
              >
                <span className="font-normal">
                  {date != null ? (
                    date.toLocaleDateString()
                  ) : (
                    <span className="text-placeholder">Seleziona data</span>
                  )}
                </span>
                <BsCalendar3 />
              </div>
              {isCalendarShown && (
                <Calendar
                  className="absolute bottom-0 z-30 translate-y-[102%] shadow-lg"
                  onChange={date => {
                    setCalendarShown(false);
                    onChange(date);
                  }}
                  date={date}
                />
              )}
            </div>
          )}
        />
      </div>
      <div className="mb-12 flex w-full flex-col">
        <label className="label mb-2" htmlFor="description">
          Descrizione
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            // NOTE! there is a custom style for ql-editor in global.css
            <ReactQuill
              placeholder="Inserisci descrizione"
              theme="snow"
              value={value}
              onChange={onChange}
              className="bg-white"
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
      <div className="mb-12 flex h-60 items-stretch justify-between">
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
          render={({ field: { value: files, onChange } }) => (
            <div className="flex w-5/12 flex-col">
              <label className="label mb-2">File Relativi</label>
              <div className="input relative h-full w-full">
                <div className="h-full overflow-y-scroll">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="gridRow flex items-center pl-4 last:mb-12 "
                    >
                      <BsFileEarmark className="mr-2 text-xl" />
                      <span className="flex-1 text-sm">
                        {getFileShortName(file.name)}
                      </span>
                      <div
                        className="ml-auto cursor-pointer p-4 text-red-600 duration-200 hover:bg-red-600 hover:text-white"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(i, 1);
                          onChange(newFiles);
                        }}
                      >
                        <AiOutlineDelete className="text-[1.5rem] " />
                      </div>
                    </div>
                  ))}
                </div>
                <FileInput
                  onFilesChange={newFiles => {
                    if (!newFiles) return;
                    onChange([...files, ...newFiles]);
                  }}
                  multipleFiles
                  className="btn absolute bottom-0 right-0 rounded-tl-xl rounded-tr-none rounded-br-md rounded-bl-none px-5 py-2"
                />
              </div>
            </div>
          )}
        />
      </div>
      <div className="flex w-full justify-end">
        {props.edit && (
          <button
            type="button"
            className="btn btn-delete mx-6 flex items-center px-8 py-2 text-lg"
            onClick={props.onDelete}
          >
            <AiOutlineDelete className="mr-2 text-2xl" />
            <span>Elimina</span>
          </button>
        )}
        <button
          type="submit"
          className={classNames(
            "btn flex items-center self-end px-8 py-2 text-lg",
            props.edit && !isDirty && "btn-disabled"
          )}
        >
          {props.isSubmitting ? (
            <span>Attendi...</span>
          ) : (
            <>
              <BsCheck className="mr-2 text-[1.75rem]" />
              <span>Salva</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default EventForm;
