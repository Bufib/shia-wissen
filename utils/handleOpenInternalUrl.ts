// import { getQuestionInternalURL } from "@/db/queries/questions";
// import { router } from "expo-router";

// // Internal urls are the title (unique!) of the questions
// const handleOpenInternalUrl = async (
//   title: string,
//   language: string,
//   type: string
// ) => {
//   if (type === "questionLink") {
//     try {
//       const question = await getQuestionInternalURL(title, language);
//       if (!question) {
//         console.log("Question not found for title:", title);
//         return;
//       }

//       router.push({
//         pathname: "/(displayQuestion)",
//         params: {
//           category: question.question_category_name,
//           subcategory: question.question_subcategory_name,
//           questionId: question.id.toString(),
//           questionTitle: question.title,
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching question:", error);
//     }
//   }
// };
import { router } from "expo-router";
import { LanguageCode, InternalLinkType } from "@/constants/Types";
import { getQuestionInternalURL } from "../db/queries/questions";
import { getPrayerInternalURL } from "../db/queries/prayers";
import { getQuranInternalURL } from "../db/queries/quran";

const ROUTES = {
  question: "/(displayQuestion)",
  prayer: "/(displayPrayer)/prayer",
  quran: "/(displaySura)",
} as const;

const handleOpenInternalUrl = async (
  identifier: string,
  lang: LanguageCode,
  type: InternalLinkType
): Promise<void> => {
  const value = identifier.trim();
  if (!value) {
    console.warn("handleOpenInternalUrl: empty identifier.");
    return;
  }

  try {
    switch (type) {
      case "questionLink": {
        const id = Number(value);
        if (Number.isNaN(id)) {
          console.warn(
            "handleOpenInternalUrl: invalid questionLink identifier (expected numeric id):",
            value
          );
          return;
        }

        const question = await getQuestionInternalURL(id, lang);
        if (!question) {
          console.warn("handleOpenInternalUrl: Question not found for id:", id);
          return;
        }

        router.push({
          pathname: ROUTES.question,
          params: {
            category: question.question_category_name,
            subcategory: question.question_subcategory_name,
            questionId: String(question.id),
          },
        });
        return;
      }

      case "prayerLink": {
        const prayer = await getPrayerInternalURL(value, lang);
        if (!prayer) {
          console.warn(
            "handleOpenInternalUrl: Prayer not found for identifier:",
            value
          );
          return;
        }

        router.push({
          pathname: ROUTES.prayer,
          params: { prayer: String(prayer.id) },
        });
        return;
      }

      case "quranLink": {
        // value = "sura:aya"
        const verse = await getQuranInternalURL(value, lang);
        if (!verse) {
          console.warn(
            "handleOpenInternalUrl: Quran reference not resolved:",
            value
          );
          return;
        }

        router.push({
          pathname: ROUTES.quran,
          params: {
            suraId: String(verse.sura),
          },
        });
        return;
      }

      default: {
        console.warn(
          "handleOpenInternalUrl: Unsupported type:",
          type,
          "for identifier:",
          value
        );
      }
    }
  } catch (error) {
    console.error(
      "handleOpenInternalUrl: Unexpected error while handling internal link:",
      { identifier: value, type, lang, error }
    );
  }
};

export default handleOpenInternalUrl;
