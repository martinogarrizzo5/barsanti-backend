import Head from "next/head";
import React from "react";

function InitialLoading() {
  return (
    <>
      <Head>
        <title>Loading...</title>
      </Head>
      <div className="h-[100vh] flex items-center justify-center text-xl">
        Loading Dashboard...
      </div>
    </>
  );
}

export default InitialLoading;
