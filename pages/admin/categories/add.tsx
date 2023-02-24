import Head from "next/head";
import React from "react";
import BackButton from "@/components/BackButton";
import CategoryForm, { CategoryFormData } from "@/components/CategoryForm";
import axios, { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { requestErrorToast, requestSuccessToast } from "@/components/Toast";

function AddCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addCategory = useMutation(
    (data: CategoryFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.image) {
        formData.append("image", data.image);
      }
      return axios.post("/api/categories", formData);
    },
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries(["categories"]);
        requestSuccessToast(res).fire();
        router.replace("/admin/categories");
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  return (
    <>
      <Head>
        <title>Aggiungi Categoria</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex">
          <BackButton />
          <h1 className="title">Aggiungi Categoria</h1>
        </div>
        <CategoryForm
          onSubmit={(data) => addCategory.mutate(data)}
          isSubmitting={addCategory.isLoading}
        />
      </main>
    </>
  );
}

export default AddCategoryPage;
