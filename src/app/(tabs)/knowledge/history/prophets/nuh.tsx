import React from "react";
import HistoryText from "@/components/HistoryText";

const index = () => {
  const titleDE = "Prophet Nuh (a.)";
  const titleEN = "Prophet Nuh (pbuh)";
  const titleAR = "النبي نوح (ع)";

  const textContentDE = `
## **Stellung**
- Erster großer Prophet den Allah (swt.) mit einem himmlischen Buch und einem detaillierten Religionsgesetz entsandte 
- Erster der Erzpropheten (Ulul-Azm)  
- Sure 71 nach ihm benannt  
- 43 Mal in 28 Suren erwähnt  
<br />

## **Merkmale**
- Deutlicher Warner, ruft zum Monotheismus  
- Extrem hohes Alter (Quran 57:26; 29:14 → 950 Jahre Predigtzeit)  
- Beinamen: Abd al-Ghaffar, Abd al-Malik, Abd al-Ali  
- Name verweist auf Weinen & Trauern  
<br />

## **Abstammung**
- Neunte Generation nach Adam (a.)  
- Sohn von Lamak – Stammbaum über Idris bis Adam  
- Geburtsort: Mesopotamien (v. a. Kufa)  
<br />

## **Familie**
- Söhne: Sem, Ham, Japheth (gläubig)  
- Kanaan (ungläubig, ertrank)  
- Eine Frau abtrünnig  
- Nachkommenschaft über Sem  
<br />

## **Volk & Botschaft**
- Götzendienst: Wadd, Suwa, Yaghuth, Yauq, Nasr (Quran 71:23)  
- Spott & Bedrohung durch Ungläubige  
- Auftrag: Arche an Land bauen (Kufa-Moschee)  
- Arche rettete Familie & Tiere vor Sintflut  
<br />

## **Bedeutung**
- Beispiel: Abstammung schützt nicht vor Untreue  
- Prophet Muhammad (s.): Ahl-ul-Bait wie Arche Noah (Rettungsschiff)  
- Erster Prophet mit Scharia (Sieben Gebote Noahs)  
- Titel: „Scheich al-Anbiya“ (Ältester der Propheten)  
<br />

## **Grabstätten (verschiedene Orte beanspruchen)**
- Mossul (Thamanin-Dorf)  
- Nachitschewan  
- Indien (Budh-Berg)  
- Mekka  
- Baalbek (Libanon)  
- Kufa  
- Nahewand  
- Am häufigsten: Imam-Ali-Mausoleum (Nadschaf)  
  `;

  const textContentEN = `
## **Position**
- First great Prophet whom Allah (swt) sent with a heavenly Book and a detailed religious law  
- First of the Arch-Prophets (Ulul-Azm)  
- Surah 71 named after him  
- Mentioned 43 times in 28 Surahs  
<br />

## **Characteristics**
- Clear warner, calling to monotheism  
- Extremely long age (Quran 57:26; 29:14 → 950 years of preaching)  
- Epithets: Abd al-Ghaffar, Abd al-Malik, Abd al-Ali  
- Name refers to weeping & mourning  
<br />

## **Lineage**
- Ninth generation after Adam (a.)  
- Son of Lamech – genealogy through Idris up to Adam  
- Birthplace: Mesopotamia (especially Kufa)  
<br />

## **Family**
- Sons: Shem, Ham, Japheth (believers)  
- Canaan (unbeliever, drowned)  
- A wife apostatized  
- Descendants through Shem  
<br />

## **People & Message**
- Idolatry: Wadd, Suwa, Yaghuth, Yauq, Nasr (Quran 71:23)  
- Mockery & threats from unbelievers  
- Command: Build the Ark on land (Kufa Mosque)  
- Ark saved family & animals from the Flood  
<br />

## **Significance**
- Example: Lineage does not protect from betrayal  
- Prophet Muhammad (s.): Ahl-ul-Bayt like the Ark of Noah (ship of salvation)  
- First Prophet with Sharia (Seven Laws of Noah)  
- Title: “Shaykh al-Anbiya” (Elder of the Prophets)  
<br />

## **Tombs (different places claimed)**
- Mosul (Thamanin village)  
- Nakhchivan  
- India (Budh Mountain)  
- Mecca  
- Baalbek (Lebanon)  
- Kufa  
- Nahavand  
- Most common: Imam Ali Shrine (Najaf)  
  `;

  const textContentAR = `
## **المقام**
- أول نبي عظيم بعثه الله (سبحانه وتعالى) بكتاب سماوي وشريعة مفصلة  
- أول أولي العزم من الرسل  
- سُمّيت السورة 71 باسمه  
- ذُكر 43 مرة في 28 سورة  
<br />

## **الصفات**
- نذير مبين، يدعو إلى التوحيد  
- عُمُر طويل جداً (القرآن 57:26؛ 29:14 → 950 سنة دعوة)  
- ألقاب: عبد الغفار، عبد المالك، عبد العلي  
- الاسم يشير إلى البكاء والحزن  
<br />

## **النسب**
- تاسع جيل بعد آدم (عليه السلام)  
- ابن لامك – نسبه عبر إدريس إلى آدم  
- مكان الولادة: بلاد الرافدين (خصوصاً الكوفة)  
<br />

## **العائلة**
- الأبناء: سام، حام، يافث (مؤمنون)  
- كنعان (كافر، غرق)  
- زوجة ارتدت  
- الذرية عبر سام  
<br />

## **القوم والرسالة**
- عبادة الأصنام: ود، سواع، يغوث، يعوق، نسر (القرآن 71:23)  
- سخرية وتهديد من الكافرين  
- أمر: بناء السفينة على اليابسة (مسجد الكوفة)  
- أنقذت السفينة العائلة والحيوانات من الطوفان  
<br />

## **الأهمية**
- مثال: النسب لا يحمي من الخيانة  
- النبي محمد (صلى الله عليه وآله): أهل البيت كسفينة نوح (سفينة النجاة)  
- أول نبي بشريعة (شرائع نوح السبع)  
- اللقب: "شيخ الأنبياء"  
<br />

## **القبور (أماكن متعددة منسوبة)**
- الموصل (قرية ثمانين)  
- نخجوان  
- الهند (جبل بوده)  
- مكة  
- بعلبك (لبنان)  
- الكوفة  
- نهاوند  
- الأشهر: مرقد الإمام علي (النجف)  
`;

  return (
    <HistoryText
      titleDE={titleDE}
      titleEN={titleEN}
      titleAR={titleAR}
      textContentDE={textContentDE}
      textContentEN={textContentEN}
      textContentAR={textContentAR}
      prophetID={"nuh"}
    />
  );
};

export default index;
