import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import BackButton from "@/components/BackButton";
import CategoryForm, { CategoryFormData } from "@/components/CategoryForm";
import axios, { AxiosError } from "axios";
import { Category } from "@prisma/client";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import RefetchingIndicator from "@/components/RefetchingIndicator";
import Toast, {
  requestErrorToast,
  requestSuccessToast,
} from "@/components/Toast";
import DeletePopup, { DeleteCategoryPopup } from "@/components/DeletePopup";
import { CategoryDto } from "@/dto/categoryDto";
import Main from "@/components/Main";

function EditCategoryPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const {
    isLoading,
    isError,
    data: category,
    isRefetching,
  } = useQuery({
    queryKey: ["categories", id],
    queryFn: () =>
      axios.get<CategoryDto>(`/api/categories/${id}`).then(res => res.data),
    onError: (err: AxiosError) => {
      // If the category doesn't exist, redirect to the categories page
      if (err.response?.status === 400 || err.response?.status === 404) {
        router.replace("/admin/categories");
      }
    },
  });

  const editCategory = useMutation(
    async (data: CategoryFormData) => {
      const { name, image } = data;
      const formData = new FormData();
      formData.append("name", name);
      if (image instanceof File) {
        formData.append("image", image);
      }

      const res = await axios.put(`/api/categories/${id}`, formData);
      return res;
    },
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["categories"]);
        requestSuccessToast(res).fire();
        router.replace("/admin/categories");
      },
      onError: async (err: AxiosError) => {
        const result = await requestErrorToast(err).fire();
      },
    }
  );

  const deleteCategoryMutation = useMutation(
    (id: number) => axios.delete(`/api/categories/${id}`),
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["categories"]);
        requestSuccessToast(res).fire();
        router.replace("/admin/categories");
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  const deleteCategory = () => {
    if (!id || Array.isArray(id)) return;

    DeleteCategoryPopup.fire({
      preConfirm: async () => await deleteCategoryMutation.mutateAsync(+id),
    });
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorLoading />;

  return (
    <>
      <Head>
        <title>Modifica Categoria</title>
      </Head>
      <Main>
        <div className="mb-12 flex">
          <BackButton />
          <h1 className="title">Modifica Categoria</h1>
        </div>
        <CategoryForm
          edit
          onSubmit={data => editCategory.mutate(data)}
          isSubmitting={editCategory.isLoading}
          defaultData={{ image: category.imageUrl, name: category.name }}
          onDelete={deleteCategory}
        />
        {isRefetching && <RefetchingIndicator />}
      </Main>
    </>
  );
}

export default EditCategoryPage;
