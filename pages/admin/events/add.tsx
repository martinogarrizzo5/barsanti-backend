import BackButton from "@/components/BackButton";
import Main from "@/components/Main";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
const EventForm = dynamic(() => import("@/components/EventForm"), {
  ssr: false,
});

function AddEventPage() {
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
        <EventForm />
      </Main>
    </>
  );
}

export default AddEventPage;
