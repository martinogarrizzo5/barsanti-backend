import Head from "next/head";
import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useRouter } from "next/router";
import Select from "react-select";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CategoryDto } from "@/dto/categoryDto";
import { GetCategoryResponse } from "@/pages/api/categories";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";

interface DatesRange {
  startDate: Date;
  endDate: Date;
  key: string;
}

function EventsPage() {
  const [datesRange, setDatesRange] = useState<DatesRange>();
  const router = useRouter();

  const {
    isLoading: areNewsLoading,
    isError: newsError,
    data: news,
    isRefetching: areNewsRefetching,
  } = useQuery({
    queryKey: ["news"],
    queryFn: data => axios.get("/api/news").then(res => res.data),
    keepPreviousData: true,
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

  if (areNewsLoading || areCategoriesLoading) return <LoadingIndicator />;

  if (newsError || categoriesError) return <ErrorLoading />;

  return (
    <>
      <Head>
        <title>Eventi</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex justify-between">
          <h1 className="title">Eventi</h1>
          <button
            className="btn flex items-center px-6 py-2 text-lg"
            onClick={() => router.push("/admin/events/add")}
          >
            <BiPlus className="mr-2 text-[24px]" />
            <span>Aggiungi</span>
          </button>
        </div>
        <div>
          <div className="flex items-stretch">
            <input
              name="search"
              type="text"
              className="input mr-12 w-4/12 px-4 py-2"
              placeholder="Cerca Evento"
              autoComplete="off"
            />
            <Select
              options={categories}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id.toString()}
              classNames={{ ...dropDownStyles, container: _ => "w-3/12" }}
              placeholder="Seleziona categoria"
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default EventsPage;
