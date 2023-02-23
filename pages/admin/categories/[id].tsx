import React from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import BackButton from "@/components/BackButton";
import CategoryForm, { CategoryFormData } from "@/components/CategoryForm";
import axios from "axios";
import { Category } from "@prisma/client";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import RefetchingIndicator from "@/components/RefetchingIndicator";

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
    queryFn: (data) =>
      axios
        .get<Category & { imageUrl: string }>(`/api/categories/${id}`)
        .then((res) => res.data),
  });

  const editCategory = useMutation(
    (data: CategoryFormData) => {
      const { name, image } = data;
      const formData = new FormData();
      formData.append("name", name);
      if (image instanceof File) {
        formData.append("image", image);
      }

      return axios.put(`/api/categories/${id}`, formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["categories"]);
        router.replace("/admin/categories");
      },
    }
  );

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorLoading />;

  return (
    <>
      <Head>
        <title>Modifica Categoria</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex">
          <BackButton />
          <h1 className="title">Modifica Categoria</h1>
        </div>
        <CategoryForm
          edit
          onSubmit={(data) => editCategory.mutate(data)}
          isSubmitting={editCategory.isLoading}
          defaultData={{ image: category.imageUrl, name: category.name }}
        />
        {isRefetching && <RefetchingIndicator />}
      </main>
    </>
  );
}

export default EditCategoryPage;
