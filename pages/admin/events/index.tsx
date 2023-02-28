import Head from "next/head";
import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useRouter } from "next/router";
import Select from "react-select";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetCategoryResponse } from "@/pages/api/categories";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3 } from "react-icons/bs";
import { DateRangePicker, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import useComponentVisible from "@/hooks/useComponentVisible";
import RefetchingIndicator from "@/components/RefetchingIndicator";
import Main from "@/components/Main";

interface CategoryOption {
  id: number;
  name: string;
}

const dropDownResetOption = {
  id: 0,
  name: "Tutte le categorie",
};

const dropDownHighlightOption = {
  id: -1,
  name: "In evidenza",
};

function EventsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption>(dropDownResetOption);
  const [datesRange, setDatesRange] = useState<Range[]>([
    {
      key: "selectionDates",
      color: "var(--primaryColor)",
      endDate: new Date(""),
    },
  ]);
  const router = useRouter();
  const {
    isComponentVisible: isCalendarShown,
    setIsComponentVisible: showCalendar,
    ref: calendarRef,
  } = useComponentVisible(false);

  const {
    isLoading: areNewsLoading,
    isError: newsError,
    data: news,
    isRefetching: areNewsRefetching,
  } = useQuery({
    queryKey: [
      "news",
      selectedCategory?.id,
      datesRange[0].startDate,
      datesRange[0].endDate,
    ],
    queryFn: async config => {
      return axios.get("/api/news").then(res => res.data);
    },
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

  const dropDownOptions = [
    dropDownResetOption,
    dropDownHighlightOption,
    ...categories,
  ];

  return (
    <>
      <Head>
        <title>Eventi</title>
      </Head>
      <Main>
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
              className="input mr-8 w-4/12 px-4 py-2 xl:mr-12"
              placeholder="Cerca Evento"
              autoComplete="off"
            />
            <Select
              defaultValue={dropDownOptions[0]}
              value={selectedCategory}
              onChange={item => setSelectedCategory(item!)}
              options={dropDownOptions}
              getOptionLabel={option => option.name}
              getOptionValue={option => option.id.toString()}
              classNames={{
                ...dropDownStyles,
                container: _ => "w-3/12 ",
              }}
              placeholder="Seleziona categoria"
            />
            <div
              className="relative ml-auto w-4/12 cursor-pointer select-none xl:w-3/12"
              ref={calendarRef}
            >
              <div
                className="input flex h-full items-center justify-between py-2 px-4"
                onClick={() => showCalendar(prevVal => !prevVal)}
              >
                {datesRange[0].startDate && datesRange[0].endDate ? (
                  <span className="font-normal">
                    {datesRange[0].startDate.toLocaleDateString()}-
                    {datesRange[0].endDate.toLocaleDateString()}
                  </span>
                ) : (
                  <span>Tutte</span>
                )}
                <BsCalendar3 />
              </div>
              {isCalendarShown && (
                <div className="absolute top-0 right-0 translate-y-12 shadow-lg">
                  <DateRangePicker
                    onChange={item => setDatesRange([item.selectionDates])}
                    editableDateInputs
                    dateDisplayFormat="d MMM, yyyy"
                    ranges={datesRange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {areCategoriesRefetching && areNewsRefetching && (
          <RefetchingIndicator />
        )}
      </Main>
    </>
  );
}

export default EventsPage;
