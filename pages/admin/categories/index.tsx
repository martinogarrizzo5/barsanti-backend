import Head from "next/head";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import axios, { AxiosError } from "axios";
import { BeatLoader } from "react-spinners";
import { GetCategoryResponse as GetCategoriesResponse } from "../../api/categories";
import { BiPlus } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import RefetchingIndicator from "@/components/RefetchingIndicator";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import DeletePopup, { DeleteCategoryPopup } from "@/components/DeletePopup";
import Toast, {
  requestErrorToast,
  requestSuccessToast,
} from "@/components/Toast";

function CategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    data: categories,
    isRefetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: (data) =>
      axios
        .get<GetCategoriesResponse>("/api/categories")
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const deleteCategoryMutation = useMutation(
    (id: number) => axios.delete(`/api/categories/${id}`),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries(["categories"]);
        requestSuccessToast(res).fire();
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  const showDeletePopup = (id: number) => {
    DeleteCategoryPopup.fire({
      preConfirm: async () => await deleteCategoryMutation.mutateAsync(id),
    });
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorLoading />;

  return (
    <>
      <Head>
        <title>Categories</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex justify-between">
          <h1 className="title">Categorie</h1>
          <button
            className="btn flex items-center px-6 py-2 text-lg"
            onClick={() => router.push("/admin/categories/add")}
          >
            <BiPlus className="mr-2 text-[24px]" />
            <span>Aggiungi</span>
          </button>
        </div>
        <div>
          {categories.length === 0 && (
            <div className="mt-4 w-full text-lg">Nessuna categoria trovata</div>
          )}
          {categories.map((category) => (
            <div
              key={`category-${category.id}`}
              className="gridRow flex cursor-pointer items-center"
            >
              <div
                className="flex flex-1 border-r-2 border-grayBorder py-5 px-8 "
                onClick={() => router.push(`/admin/categories/${category.id}`)}
              >
                <h2 className="w-6/12">{category.name}</h2>
                <span className="mr-auto">
                  {category._count.news} element
                  {category._count.news === 1 ? "o" : "i"}
                </span>
              </div>
              <button
                className="self-stretch p-4 text-red-600 duration-200 hover:bg-red-600 hover:text-white"
                onClick={() => showDeletePopup(category.id)}
              >
                <AiOutlineDelete className="text-[24px]" />
              </button>
            </div>
          ))}
        </div>
        {isRefetching && <RefetchingIndicator />}
      </main>
    </>
  );
}

export default CategoriesPage;
