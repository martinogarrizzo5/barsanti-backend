import BackButton from "@/components/BackButton";
import EventForm from "@/components/EventForm";
import Head from "next/head";
import React from "react";

function AddEventPage() {
  return (
    <>
      <Head>
        <title>Aggiungi evento</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex">
          <BackButton />
          <h1 className="title">Aggiungi Evento</h1>
        </div>
        <EventForm />
      </main>
    </>
  );
}

export default AddEventPage;
