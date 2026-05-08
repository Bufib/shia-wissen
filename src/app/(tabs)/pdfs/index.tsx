import React from "react";
import PdfSection from "@/components/PdfSection";
import { usePdfs } from "../../../../hooks/usePdfs";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { PdfType } from "@/constants/Types";

const Search = () => {
  const { lang } = useLanguage();
  const {
    data: pdfPages,
    isLoading: pdfsLoading,
    isError: pdfsError,
    error: pdfsErrorObj,
    fetchNextPage: pdfsFetchNextPage,
    hasNextPage: pdfsHasNextPage,
    isFetchingNextPage: pdfsIsFetchingNextPage,
  } = usePdfs(lang);
  const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

  return (
    <PdfSection
      pdfs={pdfs}
      isLoading={pdfsLoading}
      isError={pdfsError}
      errorMessage={pdfsErrorObj?.message}
      fetchNextPage={pdfsFetchNextPage}
      hasNextPage={pdfsHasNextPage}
      isFetchingNextPage={pdfsIsFetchingNextPage}
    />
  );
};

export default Search;
