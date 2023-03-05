import BackButton from "@/components/BackButton";
import ErrorLoading from "@/components/ErrorLoading";
import LoadingIndicator from "@/components/LoadingIndicator";
import Main from "@/components/Main";
import { NewsDto } from "@/dto/newsDto";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const EventForm = dynamic(() => import("@/components/EventForm"), {
  ssr: false,
});

function ModifyEventPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    isLoading,
    isError,
    data: event,
    isRefetching,
  } = useQuery({
    queryKey: ["news", id],
    queryFn: () => axios.get<NewsDto>(`/api/news/${id}`).then(res => res.data),
    onError: (err: AxiosError) => {
      // If the event doesn't exist, redirect to the news page
      if (err.response?.status === 400 || err.response?.status === 404) {
        router.replace("/admin/news");
      }
    },
  });

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorLoading />;

  return (
    <>
      <Head>
        <title>Modifica evento</title>
      </Head>
      <Main>
        <div className="mb-12 flex ">
          <BackButton />
          <h1 className="title">Modifica Evento</h1>
        </div>
        <EventForm onSubmit={() => {}} defaultData={event} edit />
      </Main>
    </>
  );
}

export default ModifyEventPage;
