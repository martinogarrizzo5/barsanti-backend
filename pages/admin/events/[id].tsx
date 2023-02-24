import BackButton from "@/components/BackButton";
import Head from "next/head";
import React from "react";

function ModifyEventPage() {
  return (
    <>
      <Head>
        <title>Modifica evento</title>
      </Head>
      <main className="main">
        <div className="mb-12 flex ">
          <BackButton />
          <h1 className="title">Modifica Evento</h1>
        </div>
      </main>
    </>
  );
}

export default ModifyEventPage;
