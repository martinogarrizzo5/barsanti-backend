import React from "react";

interface PageControlProps {
  elementsOnPage: number;
  pageSize: number;
  pageIndex: number;
  goToFirstPage: () => void;
  goBack: () => void;
  goForward: () => void;
  changePageSize: (size: number) => void;
}

function PageControl(props: PageControlProps) {
  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        className="btn py-1 px-4 disabled:bg-gray-100 disabled:text-gray-300"
        onClick={props.goToFirstPage}
        disabled={props.pageIndex <= 0}
      >
        {"<<"}
      </button>
      <button
        className="btn py-1 px-4 disabled:bg-gray-100 disabled:text-gray-300"
        onClick={props.goBack}
        disabled={props.pageIndex <= 0}
      >
        {"<"}
      </button>
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>{props.pageIndex + 1}</strong>
      </span>
      <button
        className="btn py-1 px-4 text-white disabled:bg-gray-100 disabled:text-gray-300 "
        onClick={props.goForward}
        disabled={props.elementsOnPage < props.pageSize}
      >
        {">"}
      </button>
      <select
        value={props.pageSize}
        onChange={e => {
          props.changePageSize(Number(e.target.value));
        }}
      >
        {[5, 10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PageControl;
