import React from "react";
import { useLocalSearchParams } from "expo-router";
import PdfViewerScreen from "@/components/PdfViewerScreen";

const Pdfs = () => {
  const { filename } = useLocalSearchParams<{
    filename: string;
  }>(); 

    if (!filename) return null;


  return <PdfViewerScreen filename={filename} />;
};

export default Pdfs;
