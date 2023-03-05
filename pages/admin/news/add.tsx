import BackButton from "@/components/BackButton";
import { EventFormData } from "@/components/EventForm";
import Main from "@/components/Main";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import { File as PrismaFile } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { requestErrorToast, requestSuccessToast } from "@/components/Toast";
import { useRouter } from "next/router";

const EventForm = dynamic(() => import("@/components/EventForm"), {
  ssr: false,
});

function AddEventPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const addEvent = useMutation(
    (data: EventFormData) => {
      console.log(data);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description.toString());
      formData.append("highlighted", data.highlited.toString());

      if (data.category) {
        formData.append("category", data.category.id.toString());
      }
      if (data.date) {
        formData.append("date", data.date.toString());
      }
      if (data.image && typeof data.image !== "string") {
        formData.append("image", data.image);
      }

      if (data.files) {
        // upload both prismaFiles and Files in different properties to avoid confusion
        data.files.forEach(file => {
          if (file instanceof File) {
            formData.append("newFiles", file);
          } else {
            formData.append("oldFiles", file.id.toString());
          }
        });
      }

      return axios.post("/api/news", formData);
    },
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["categories"]);
        requestSuccessToast(res).fire();
        router.replace("/admin/news");
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  return (
    <>
      <Head>
        <title>Aggiungi evento</title>
      </Head>
      <Main>
        <div className="mb-12 flex">
          <BackButton />
          <h1 className="title">Aggiungi Evento</h1>
        </div>
        <EventForm
          onSubmit={data => addEvent.mutate(data)}
          isSubmitting={addEvent.isLoading}
        />
      </Main>
    </>
  );
}

export default AddEventPage;
