import BackButton from "@/components/BackButton";
import EventForm from "@/components/EventForm";
import Main from "@/components/Main";
import Head from "next/head";
import React from "react";

function ModifyEventPage() {
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
        <EventForm />
      </Main>
    </>
  );
}

export default ModifyEventPage;
