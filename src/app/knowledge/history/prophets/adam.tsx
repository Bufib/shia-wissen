import React from "react";
import HistoryText from "@/components/HistoryText";

const index = () => {
  const titleDE = "Prophet Adam (a.)";
  const titleEN = "Prophet Adam (pbuh)";
  const titleAR = "النبي آدم (ع)";

  const textContentDE = `
  ## **Allgemeine Angaben**
  - Name: Adam (a.)
  - Arabisch: آدم
  - Beiname: „Vater der Menschheit“ [abul-baschar]
  <br />
  
  ## **Schöpfung und Stellung**
  - Erster Mensch, erster Gesandter [rasul] und zugleich Prophet im Islam.
  - Körper erschaffen aus Lehm, einer Mischung aus Wasser und Erde.
  - Seele und Geist wurden ihm von Allah (swt.) eingehaucht.
  - Von  Allah (swt.) als Kalif auf Erden erwählt.
  <br />

  ## **Leben im Paradies und auf Erden**
  - Zusammen mit Eva (a.) im Paradies.
  - Beide aßen durch Satans Verführung vom verbotenen Baum.
  - Folge: Schamgefühl und Beginn der Prüfung der Seele auf Erden.
  - Abstieg auf die Erde [ardh] gemäß Allah (swt.) Befehl.
  <br />

  ## **Wissen und Besonderheiten**
  - Adam kannte besondere Namen, die seine Überlegenheit gegenüber Engeln zeigen.
  - Mystiker sahen eine Verbindung zwischen Adam (a.) und dem Ritualgebet: Bewegungen des Gebets ähneln den Buchstaben "alif" (Stehen), "dal" (Verneigung) und "mim"(Niederwerfung), die zusammen den Namen „Adam“ ergeben.
  <br />

  ## **Religiöse Bauten und Orte**
  - Errichtete das erste Gebetshaus der Menschheit in Mekka.
  - Später von Abraham (a.) wiederaufgebaut (Quran 3:96).
  - Erste Begegnung mit Eva (a.) auf der Erde am Berg Arafat.
  - Verschiedene Orte beanspruchen sein Grab zu beherbergen: nach Überlieferungen der Ahl-ul-Bait (a.) liegt es im Mausoleum von Imam Ali in Nadschaf.
  <br />

## **Nachkommen**
  - Kinder: Kain und Abel, Symbole für das Gute und Schlechte im Menschen.
  - Sohn Seth gilt in manchen Überlieferungen ebenfalls als Prophet.
  <br />
  `;
  const textContentEN = `
  ## **General information**
  - Name: Adam (a.)
  - Arabic: آدم
  - Nickname: “Father of Mankind” [abul-baschar]
  <br />
  
  ## **Creation and status**
  - First human, first messenger [rasul] and also prophet in Islam.
  - Body created from clay, a mixture of water and earth.
  - Soul and spirit were breathed into him by Allah (swt.).
  - Chosen by Allah (swt.) as caliph on earth.
<br />

## **Life in Paradise and on Earth**
- Together with Eve (a.) in Paradise.
- Both ate from the forbidden tree through Satan's temptation.
- Consequence: sense of shame and beginning of the testing of the soul on earth.
  - Descent to Earth [ardh] according to Allah's (swt) command.
  <br />

## **Knowledge and special characteristics**
  - Adam knew special names that show his superiority over angels.
  - Mystics saw a connection between Adam (a.) and ritual prayer: The movements of prayer resemble the letters “alif” (standing), “dal” (bowing) and ‘mim’ (prostration), which together form the name “Adam.”
  <br />

## **Religious buildings and places**
- Built the first house of prayer for mankind in Mecca.
  - Later rebuilt by Abraham (a.) (Quran 3:96).
  - First encounter with Eve (a.) on earth at Mount Arafat.
  - Various places claim to house his grave: according to traditions of the Ahl-ul-Bait (a.), it is located in the mausoleum of Imam Ali in Najaf.
  <br />

## **Descendants**
  - Children: Cain and Abel, symbols of good and evil in mankind.
  - In some traditions, his son Seth is also considered a prophet.
  <br />
  `;

  const textContentAR = `
  ## **معلومات عامة**
  - الاسم: آدم (عليه السلام)
  - العربية: آدم
  - اللقب: ”أبو البشر“ [ابو البشر]
  <br />
  
  ## **الخلق والمكانة**
  - أول إنسان، أول رسول [رسول] ونبي في الإسلام.
  - خلق جسده من الطين، وهو مزيج من الماء والتراب.
  - نفخ الله (سبحانه وتعالى) فيه الروح والنفس.
  - اختاره الله (سبحانه وتعالى) خليفة على الأرض.
<br />

## **الحياة في الجنة وعلى الأرض**
- مع حواء (عليها السلام) في الجنة.
- أكل كلاهما من الشجرة المحرمة بإغواء من الشيطان.
- النتيجة: الشعور بالخجل وبدء اختبار الروح على الأرض.
  - نزول إلى الأرض [أرض] وفقًا لأمر الله (سبحانه وتعالى).
  <br />

## **المعرفة والخصائص**
- كان آدم يعرف أسماء خاصة تظهر تفوقه على الملائكة.
- رأى الصوفيون صلة بين آدم (عليه السلام) والصلاة الطقسية: تشبه حركات الصلاة الحروف ”ألف“ (الوقوف) و”دال“ (الانحناء) و”ميم“ (السجود)، والتي تشكل معًا اسم ”آدم“.
  <br />

## **المباني والأماكن الدينية**
- أقام أول بيت للصلاة للبشرية في مكة.
  - أعاد إبراهيم (عليه السلام) بنائه لاحقًا (القرآن 3:96).
  - أول لقاء مع حواء (عليها السلام) على الأرض في جبل عرفات.
  - تدعي عدة أماكن أنها تضم قبره: وفقًا لتقاليد أهل البيت (عليهم السلام)، يقع قبره في ضريح الإمام علي في النجف.
  <br />

## **الأحفاد**
- الأبناء: قابيل وهابيل، رمزا الخير والشر في الإنسان.
- يعتبر ابنه سيث نبيًا في بعض التقاليد.
<br />
`;

  return (
    <HistoryText
      titleDE={titleDE}
      titleEN={titleEN}
      titleAR={titleAR}
      textContentDE={textContentDE}
      textContentEN={textContentEN}
      textContentAR={textContentAR}
      prophetID={"adam"}
    />
  );
};

export default index;
