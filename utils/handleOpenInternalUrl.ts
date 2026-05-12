import { router } from "expo-router";
import { LanguageCode, InternalLinkType } from "@/constants/Types";
import { getQuestionInternalURL } from "../db/queries/questions";

const ROUTES = {
  question: "/(displayQuestion)",
} as const;

const handleOpenInternalUrl = async (
  identifier: string,
  lang: LanguageCode,
  type: InternalLinkType,
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
            value,
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

      default: {
        console.warn(
          "handleOpenInternalUrl: Unsupported type:",
          type,
          "for identifier:",
          value,
        );
      }
    }
  } catch (error) {
    console.error(
      "handleOpenInternalUrl: Unexpected error while handling internal link:",
      { identifier: value, type, lang, error },
    );
  }
};

export default handleOpenInternalUrl;
