import { PrayerQuestionLinksType } from "@/constants/Types";

export const questionCategories: PrayerQuestionLinksType[] = [
  {
    id: 0,
    name: "rechtsfragen",
    image: require("@/assets/images/rechtsfragen.png"),
    value: "Rechtsfragen",
  },
  {
    id: 1,

    name: "quran",
    image: require("@/assets/images/quran.png"),
    value: "Quran",
  },
  {
    id: 2,

    name: "geschichte",
    image: require("@/assets/images/geschichte.png"),
    value: "Geschichte",
  },
  {
    id: 3,

    name: "glaubensfragen",
    image: require("@/assets/images/glaubensfragen.png"),
    value: "Glaubensfragen",
  },
  {
    id: 4,

    name: "ethik",
    image: require("@/assets/images/ethik.png"),
    value: "Ethik",
  },
  {
    id: 5,

    name: "ratschläge",
    image: require("@/assets/images/ratschlaege.png"),
    value: "Ratschläge",
  },
];
