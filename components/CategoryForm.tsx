import React from "react";
import { BsCheck } from "react-icons/bs";
import { useForm, Controller } from "react-hook-form";
import { ImagePickerWithPreview } from "@/components/ImagePicker";
import classNames from "classnames";
import { AiOutlineDelete } from "react-icons/ai";

export type CategoryFormData = {
  name: string;
  image: File | string | null;
};

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  defaultData?: CategoryFormData;
  isSubmitting?: boolean;
  edit?: boolean;
  onDelete?: () => void;
}

function CategoryForm(props: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<CategoryFormData>({
    defaultValues: props.defaultData,
  });

  const onSave = handleSubmit((data) => {
    if (props.isSubmitting || (props.edit && !isDirty)) return;

    props.onSubmit(data);
  });

  return (
    <form className="flex w-full flex-1 flex-col" onSubmit={onSave}>
      <div className="mb-4 flex w-full flex-1">
        <div className="mr-12 w-6/12">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Nome
          </label>
          <input
            type="text"
            id="name"
            className={classNames(
              "input w-full px-4 py-2",
              errors.name && "border-red-600"
            )}
            placeholder="Inserisci nome categoria"
            autoComplete="off"
            {...register("name", {
              required: "Nome Categoria richiesto",
            })}
          />
          {errors.name && (
            <span className="mt-2 block text-red-600">
              {errors.name.message as string}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Immagine
          </label>
          <Controller
            name="image"
            control={control}
            rules={{ required: "Immagine richiesta" }}
            render={({ field: { value, onChange } }) => (
              <ImagePickerWithPreview
                value={value}
                onChange={onChange}
                error={errors.image?.message}
              />
            )}
          />
        </div>
      </div>
      <div className="flex justify-end">
        {props.edit && (
          <button
            className="btn btn-delete mx-4 flex items-center px-8 py-2 text-lg"
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

export default CategoryForm;
