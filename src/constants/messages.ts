import Toast from "react-native-toast-message";
import { router } from "expo-router";
import i18n from "../../utils/i18n";

// Internet
export const noInternetHeader = "Keine Internetverbindung!";
export const noInternetBody =
  "Bitte stelle sicher, dass du mit dem Internet verbunden bist, damit du updates erhalten kannst!";

// SignUp
export const signUpErrorGeneral = "Fehler beim Registrieren!";

export const signUpUserNameMin =
  "Benutzername muss mindestens 3 Zeichen lang sein";
export const signUpUserEmail = "Ungültige E-Mail-Adresse";
export const signUpUserPasswordMin =
  "Passwort muss mindestens 8 Zeichen lang sein";
export const signUpUserPasswordFormat =
  "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten";
export const signUpUserPasswordConformation =
  "Passwörter stimmen nicht überein";
export const signUpUserNameAlreadyInUsage =
  "Dieser Benutzername ist bereits vergeben!";
export const signUpUserEmailAlreadyInUsage =
  "Diese Email wird bereis verwendet!";

export const signUpUsernameNotEmpty = "Benutzername darf nicht leer sein.";
export const signUpEmailNotEmpty = "Email darf nicht leer sein.";
export const signUpPasswordNotEmpty = "Passwort darf nicht leer sein.";

// Login
export const loginError = "Fehler beim login";

export const loginEmailNotEmpty = "Bitte gib deine E-Mail-Adresse ein!";
export const loginPasswordNotEmpty = "Bitte gib dein Passwort ein!";

// Logout
export const logoutErrorGeneral = "Fehler beim Abmelden";
export const logoutSuccess = () => {
  return Toast.show({
    type: "success",
    text1: "Du wurdest erfolgreich abgemeldet!",
    text1Style: { fontSize: 14, fontWeight: "600" },
    topOffset: 60,
  });
};

// Favorites
export const removeFavoriteToast = () => {
  return Toast.show({
    type: "error",
    text1: i18n.t("removedFromFavorites"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

export const addFavoriteToast = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("addedToFavorites"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

// news

export const newsAddedSuccessToast = () => {
  return Toast.show({
    type: "success",
    text1: "Nachricht erfolgreich hinzugefügt!",
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

export const newsDeletedSuccessToast = () => {
  return Toast.show({
    type: "success",
    text1: "Nachricht erfolgreich gelöscht!",
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

// userQuestions

export const userQuestionsNewAnswerForQuestions = () => {
  return Toast.show({
    type: "info",
    text1: i18n.t("noAnswereToQuestion"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
    onPress() {
      router.push("/(askQuestion)");
    },
  });
};

export const userQuestionInputNewQuestion = () => {
  return Toast.show({
    type: "info",
    text1: "Deine Frage wurde abgeschickt!",
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

export const userQuestionErrorLoadingQuestions =
  "Fehler beim laden deiner Fragen!";

// send question
export const askQuestionQuestionSendSuccess = () => {
  return Toast.show({
    type: "success",
    text1: "Die Frage wurde erfolgreich gesendet!",
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

// Database update
export const databaseUpdateQuestions = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("databaseUpdateQuestions"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};
export const databaseUpdateQuran = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("databaseUpdateQuran"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};
export const databaseUpdatePrayer = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("databaseUpdatePrayer"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};
export const databaseUpdateCalendar = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("databaseUpdateCalendar"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};
export const databaseUpdatePaypal = () => {
  return Toast.show({
    type: "success",
    text1: i18n.t("databaseUpdatePaypal"),
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

// no internet

export const noInternet = () => {
  return Toast.show({
    type: "error",
    text1: "Keine Internetverbindung!",
    text2: "Du erhälst keine updates und Benachrichtigungen!",
    text1Style: { fontWeight: "500" },
    topOffset: 60,
  });
};

export const cancleCaptcha =
  "Bitte nicht wegklicken, da die Überprüfung sonst abgebrochen wird!";
