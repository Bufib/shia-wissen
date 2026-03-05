import i18n from "i18next"; // or wherever your configured instance lives

/**
 * Format a date as "May 10, 2025"
 */

export const formattedDate = (input: Date | string): string => {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a time as "15:45"
 */
export const formattedTime = (input: Date | string): string => {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleTimeString(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: i18n.language === "en" ? true : false,
  });
};
