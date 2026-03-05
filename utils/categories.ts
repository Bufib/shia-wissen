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

// Prayer categories using translations
export const prayerCategories: PrayerQuestionLinksType[] = [
  {
    id: 0,
    name: "dua",
    image: require("@/assets/images/dua.png"),
    value: "Dua",
  },
  {
    id: 1,
    name: "salat",
    image: require("@/assets/images/salat.png"),
    value: "Salat",
  },
  {
    id: 2,
    name: "ziyarat",
    image: require("@/assets/images/ziyarat.png"),
    value: "Ziyarat",
  },

  {
    id: 3,
    name: "munajat",
    image: require("@/assets/images/munajat.png"),
    value: "Munajat",
  },
  {
    id: 4,
    name: "special",
    image: require("@/assets/images/special.png"),
    value: "Special",
  },

  {
    id: 5,
    name: "names",
    image: require("@/assets/images/names.png"),
    value: "Names",
  },
];

// Tasbih for single button
export const tasbihCategory: PrayerQuestionLinksType[] = [
  {
    id: 0,
    name: "tasbih",
    image: require("@/assets/images/tasbih.png"),
    value: "Tasbih",
  },
];
