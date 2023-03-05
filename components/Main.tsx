import React from "react";

interface IMainProps {
  children?: React.ReactNode;
}

function Main(props: IMainProps) {
  return (
    <main className="h-full w-full flex-col overflow-y-auto py-16 px-8 lg:px-12 xl:p-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        {props.children}
      </div>
    </main>
  );
}

export default Main;
