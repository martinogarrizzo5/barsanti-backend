import Head from "next/head";
import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useRouter } from "next/router";
import Select from "react-select";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorLoading from "@/components/ErrorLoading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { GetCategoryResponse } from "@/pages/api/categories";
import { dropDownStyles } from "@/lib/dropDownDefaultStyle";
import { BsCalendar3 } from "react-icons/bs";
import { DateRangePicker, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import useComponentVisible from "@/hooks/useComponentVisible";
import RefetchingIndicator from "@/components/RefetchingIndicator";
import Main from "@/components/Main";
import { MinimumNews } from "@/dto/newsDto";
import {
  AiOutlineDelete,
  AiOutlineEyeInvisible,
  AiOutlineEye,
} from "react-icons/ai";
import useDebounce from "@/hooks/useDebounce";
import { isValidDate } from "@/lib/dates";
import {
  deleteNewsPopup,
  hideNewsPopup,
  showNewsPopup,
} from "@/components/DeletePopup";
import PageControl from "@/components/PageControl";
import { requestErrorToast, requestSuccessToast } from "@/components/Toast";

interface CategoryOption {
  id: number;
  name: string;
}

interface Pagination {
  index: number;
  size: number;
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
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchedNews, setSearchedNews] = useState("");
  const debouncedNews = useDebounce(searchedNews);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption>(dropDownResetOption);
  const [datesRange, setDatesRange] = useState<Range[]>([
    { key: "selectionDates", endDate: new Date("") },
  ]);

  const [pagination, setPagination] = useState({
    index: 0,
    size: 20,
  });

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
      debouncedNews,
      pagination,
    ],
    queryFn: async config => {
      let highlighted = undefined;
      let category = config.queryKey[1] || undefined;
      let showHidden = true;

      if (selectedCategory?.id === -1) {
        highlighted = true;
        category = undefined;
      } else if (selectedCategory?.id === 0) {
        category = undefined;
      }

      const startDate = config.queryKey[2] as Date;
      const endDate = config.queryKey[3] as Date;
      const search = config.queryKey[4] as string | undefined;
      const page = config.queryKey[5] as Pagination;

      return axios
        .get<MinimumNews[]>("/api/news", {
          params: {
            category: category,
            search: config.queryKey[4] || undefined,
            startDate: isValidDate(startDate) ? startDate : undefined,
            endDate: isValidDate(endDate) ? endDate : undefined,
            highlighted: highlighted,
            page: page.index,
            take: page.size,
            showHidden: showHidden,
          },
        })
        .then(res => res.data);
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

  const deleteNewsMutation = useMutation(
    (id: number) => axios.delete(`/api/news/${id}`),
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["news"]);
        requestSuccessToast(res).fire();
        router.replace("/admin/news");
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  const hideNewsMutation = useMutation(
    async (id: number) => {
      const data = new FormData();
      data.append("hidden", "true");
      return axios.put(`/api/news/${id}`, data);
    },
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["news"]);
        requestSuccessToast(res).fire();
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  const showNewsMutation = useMutation(
    async (id: number) => {
      const data = new FormData();
      data.append("hidden", "false");
      return axios.put(`/api/news/${id}`, data);
    },
    {
      onSuccess: res => {
        queryClient.invalidateQueries(["news"]);
        requestSuccessToast(res).fire();
      },
      onError: (err: AxiosError) => {
        requestErrorToast(err).fire();
      },
    }
  );

  const showDeletePopup = (id: number) => {
    deleteNewsPopup.fire({
      preConfirm: async () => {
        await deleteNewsMutation.mutateAsync(id);
      },
    });
  };

  const toggleHidden = async (news: MinimumNews) => {
    if (news.hidden) {
      showNewsPopup.fire({
        preConfirm: async () => {
          await showNewsMutation.mutateAsync(news.id);
        },
      });
    } else {
      hideNewsPopup.fire({
        preConfirm: async () => {
          await hideNewsMutation.mutateAsync(news.id);
        },
      });
    }
  };

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
            onClick={() => router.push("/admin/news/add")}
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
              value={searchedNews}
              onChange={e => setSearchedNews(e.target.value)}
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
                <div className="absolute bottom-0 right-0 z-30 translate-y-[102%] shadow-lg">
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
        <div className="mt-10">
          {news.map(item => (
            <div
              key={`news-${item.id}`}
              className="gridRow flex cursor-pointer items-center"
            >
              <div
                className="flex flex-1 items-center border-r-2 border-grayBorder py-5 px-8 "
                onClick={() => router.push(`/admin/news/${item.id}`)}
              >
                <img
                  src={item.imageUrl}
                  width={80}
                  height={80}
                  alt="event representation"
                  className="mr-4 h-20 w-20 object-cover"
                />
                <h2 className="mr-4 w-9/12 font-medium">{item.title}</h2>
                <h3 className="flex w-3/12 items-center">
                  <BsCalendar3 className="mr-2 text-lg text-primary" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </h3>
              </div>
              <button
                className="self-stretch border-r-2 border-grayBorder p-4 text-gray-600 duration-200 hover:bg-gray-600 hover:text-white"
                onClick={() => toggleHidden(item)}
              >
                {item.hidden ? (
                  <AiOutlineEyeInvisible className="text-[24px]" />
                ) : (
                  <AiOutlineEye className="text-[24px]" />
                )}
              </button>
              <button
                className="self-stretch p-4 text-red-600 duration-200 hover:bg-red-600 hover:text-white"
                onClick={() => showDeletePopup(item.id)}
              >
                <AiOutlineDelete className="text-[24px]" />
              </button>
            </div>
          ))}
          {news.length === 0 && (
            <div className="mb-16 mt-4 text-xl font-medium">
              Nessuna news presente
            </div>
          )}
        </div>
        <PageControl
          changePageSize={size => {
            setPagination({ ...pagination, size: size });
          }}
          elementsOnPage={news.length}
          goBack={() => {
            setPagination({ ...pagination, index: pagination.index - 1 });
          }}
          goForward={() => {
            setPagination({ ...pagination, index: pagination.index + 1 });
          }}
          goToFirstPage={() => {
            setPagination({ ...pagination, index: 0 });
          }}
          pageIndex={pagination.index}
          pageSize={pagination.size}
        />
        {(areCategoriesRefetching || areNewsRefetching) && (
          <RefetchingIndicator />
        )}
      </Main>
    </>
  );
}

export default EventsPage;
