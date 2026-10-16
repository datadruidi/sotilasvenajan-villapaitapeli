import { CASE_NAMES } from '../types/cases'
import type { RussianCase } from '../types/cases'

type EndingChange = { from: string; to: string; example: string }
type Bilingual = { fi: string; en: string }
interface CaseGuide {
  name: Bilingual
  russian: string
  questions: Bilingual
  use: Bilingual
  rules: { category: 'M' | 'F' | 'N' | 'Plural'; text: Bilingual; example: string }[]
  exceptions: Bilingual
}

export const CASE_GRAMMAR: Record<RussianCase, CaseGuide> = {
  nominative: {
    name: CASE_NAMES.nominative, russian: 'Именительный падеж',
    questions: { fi: 'Kuka? Mikä? Ketkä? Mitkä? — кто? что?', en: 'Who? What? — кто? что?' },
    use: { fi: 'Sanakirjan perusmuoto. Ilmaisee tavallisesti lauseen tekijän tai asian, joka nimetään: Это солдат.', en: 'The dictionary form. Usually names the subject or identifies something: Это солдат.' },
    rules: [
      { category: 'M', text: { fi: 'Tavallisesti konsonantti, -й tai -ь. Myös eräät -а/-я-sanat ovat maskuliineja.', en: 'Usually ends in a consonant, -й or -ь. Some masculine nouns end in -а/-я.' }, example: 'солдат, герой, словарь; мужчина' },
      { category: 'F', text: { fi: 'Tavallisesti -а/-я tai pehmeä merkki -ь. -ь ei yksin paljasta sukua.', en: 'Usually -а/-я or soft sign -ь. A soft sign alone does not identify gender.' }, example: 'машина, земля, ночь' },
      { category: 'N', text: { fi: 'Tavallisesti -о/-е; myös -ие ja poikkeusryhmä -мя.', en: 'Usually -о/-е, including -ие; also the irregular -мя class.' }, example: 'окно, море, здание, время' },
      { category: 'Plural', text: { fi: 'Usein -ы/-и; neutreilla -а/-я. Vartalo ja paino voivat muuttua.', en: 'Often -ы/-и; neuters often have -а/-я. Stems and stress may change.' }, example: 'солдат → солдаты; море → моря; город → города' },
    ],
    exceptions: { fi: 'Kirjainten г, к, х, ж, ч, ш, щ jälkeen kirjoitetaan и eikä ы. Epäsäännöllisiä: человек → люди, ребёнок → дети. Kaikilla sanoilla ei ole molempia lukuja; taipumattomat sanat eivät harjoita päätteitä.', en: 'After г, к, х, ж, ч, ш, щ, write и rather than ы. Irregular examples: человек → люди, ребёнок → дети. Some nouns lack one number; indeclinable nouns do not practise endings.' },
  },
  genitive: {
    name: CASE_NAMES.genitive, russian: 'Родительный падеж',
    questions: { fi: 'Kenen? Minkä? Keiden? — кого? чего?', en: 'Of whom? Of what? — кого? чего?' },
    use: { fi: 'Ilmaisee esimerkiksi omistusta, määrää ja puuttumista. Tässä pelissä нет tarkoittaa, ettei jotakin ole.', en: 'Used for possession, quantity and absence. Here нет expresses that someone or something is absent.' },
    rules: [
      { category: 'M', text: { fi: 'Tavallisesti -а/-я. Pehmeä merkki tai -й vaihtuu päätteeseen -я.', en: 'Usually -а/-я. Soft sign or -й is replaced by -я.' }, example: 'солдат → солдата; герой → героя; словарь → словаря' },
      { category: 'F', text: { fi: '-а → -ы/-и, -я → -и; kolmannen taivutuksen -ь → -и.', en: '-а → -ы/-и, -я → -и; third-declension -ь → -и.' }, example: 'машина → машины; земля → земли; ночь → ночи' },
      { category: 'N', text: { fi: '-о → -а, -е → -я; -ие → -ия.', en: '-о → -а, -е → -я; -ие → -ия.' }, example: 'окно → окна; море → моря; здание → здания' },
      { category: 'Plural', text: { fi: 'Mahdollisia ovat -ов, -ев, -ей ja nollapääte. Muoto opetellaan sanakohtaisesti.', en: 'Endings include -ов, -ев, -ей and zero. Learn the form for each noun.' }, example: 'танк → танков; море → морей; машина → машин; солдат → солдат' },
    ],
    exceptions: { fi: 'Katoavat vokaalit ja vartalonvaihtelut ovat yleisiä: день → дня, огонь → огня; окно → окон. -мя: время → времени. Partitiiviset -у/-ю-muodot (esim. чаю) eivät korvaa tämän pelin tavallista genetiiviä.', en: 'Fleeting vowels and stem changes are common: день → дня, огонь → огня; окно → окон. -мя: время → времени. Partitive -у/-ю forms such as чаю do not replace the ordinary genitive practised here.' },
  },
  dative: {
    name: CASE_NAMES.dative, russian: 'Дательный падеж',
    questions: { fi: 'Kenelle? Mille? — кому? чему?', en: 'To whom? To what? — кому? чему?' },
    use: { fi: 'Ilmaisee esimerkiksi vastaanottajaa. Prepositio к ilmaisee lähestymistä tai suuntaa jonkun tai jonkin luo.', en: 'Marks a recipient, among other uses. The preposition к expresses approach towards someone or something.' },
    rules: [
      { category: 'M', text: { fi: 'Tavallisesti -у/-ю; -а/-я-maskuliinit taipuvat kuten samaan päätteeseen loppuvat feminiinit.', en: 'Usually -у/-ю; masculine nouns in -а/-я follow the corresponding feminine pattern.' }, example: 'солдат → солдату; герой → герою; мужчина → мужчине' },
      { category: 'F', text: { fi: '-а/-я → -е; -ия → -ии; kolmannen taivutuksen -ь → -и.', en: '-а/-я → -е; -ия → -ии; third-declension -ь → -и.' }, example: 'машина → машине; армия → армии; ночь → ночи' },
      { category: 'N', text: { fi: '-о → -у, -е → -ю; -ие → -ию.', en: '-о → -у, -е → -ю; -ие → -ию.' }, example: 'окно → окну; море → морю; здание → зданию' },
      { category: 'Plural', text: { fi: 'Kaikilla suvuilla yleensä -ам/-ям.', en: 'Usually -ам/-ям in all genders.' }, example: 'солдатам; машинам; морям' },
    ],
    exceptions: { fi: '-мя-sanoihin tulee -ени: времени. Prepositio on tavallisesti к; eräiden vaikeiden konsonanttiyhtymien edellä ко, esim. ко всем. Kohtaa ilmaiseva к ei ole sama kuin sisään menemistä ilmaiseva в + akkusatiivi.', en: '-мя nouns take -ени: времени. The preposition is normally к; ко appears before some difficult clusters, as in ко всем. Approach with к differs from entering somewhere with в + accusative.' },
  },
  accusative: {
    name: CASE_NAMES.accusative, russian: 'Винительный падеж',
    questions: { fi: 'Kenet? Ketä? Mitä? — кого? что?', en: 'Whom? What? — кого? что?' },
    use: { fi: 'Tavallisesti suora objekti. Pelin вижу tarkoittaa ”näen”. Elollisuus vaikuttaa monien sanojen muotoon.', en: 'Usually marks the direct object. Here вижу means “I see”. Animacy determines the form of many nouns.' },
    rules: [
      { category: 'M', text: { fi: 'Konsonantti-, -й- ja maskuliinisilla -ь-sanoilla elollinen = genetiivi, eloton = nominatiivi.', en: 'For consonant, -й and masculine -ь nouns: animate = genitive, inanimate = nominative.' }, example: 'вижу солдата; вижу танк' },
      { category: 'F', text: { fi: '-а → -у, -я → -ю elollisuudesta riippumatta. Kolmannen taivutuksen -ь pysyy nominatiivin kaltaisena.', en: '-а → -у, -я → -ю regardless of animacy. Third-declension -ь stays identical to the nominative.' }, example: 'машина → машину; земля → землю; ночь → ночь' },
      { category: 'N', text: { fi: 'Tavallisesti sama kuin nominatiivi.', en: 'Normally identical to the nominative.' }, example: 'вижу окно; вижу море' },
      { category: 'Plural', text: { fi: 'Kaikissa suvuissa elollinen = monikon genetiivi; eloton = monikon nominatiivi.', en: 'In every gender, animate = plural genitive; inanimate = plural nominative.' }, example: 'вижу солдат; вижу машины; вижу моря' },
    ],
    exceptions: { fi: 'Maskuliiniset -а/-я-sanat noudattavat päätteitä -у/-ю: мужчина → мужчину. Elollisuus on kieliopillinen ominaisuus; kasvit ovat yleensä elottomia. Sama kirjoitusasu voi olla usean sijan muoto: ratkaise käyttö sijan ja kontekstin perusteella.', en: 'Masculine -а/-я nouns also take -у/-ю: мужчина → мужчину. Animacy is grammatical; plants are generally inanimate. One spelling may belong to several cases: use the requested case and context.' },
  },
  instrumental: {
    name: CASE_NAMES.instrumental, russian: 'Творительный падеж',
    questions: { fi: 'Kenen kanssa? Minkä avulla? — кем? чем?', en: 'With whom? With/by what? — кем? чем?' },
    use: { fi: 'Ilmaisee välinettä, roolia tai yhdessäoloa. Tässä käytetään с/со + instrumentaali: jonkun tai jonkin kanssa.', en: 'Expresses an instrument, role or accompaniment. Here с/со + instrumental means with someone or something.' },
    rules: [
      { category: 'M', text: { fi: 'Tavallisesti -ом/-ем; -й → -ем. Paino ja oikeinkirjoitus voivat tuoda ё:n.', en: 'Usually -ом/-ем; -й → -ем. Stress and spelling may require ё.' }, example: 'солдат → солдатом; герой → героем; боец → бойцом' },
      { category: 'F', text: { fi: '-а/-я → -ой/-ей/-ёй (myös -ою/-ею/-ёю). Kolmannen taivutuksen -ь → -ью.', en: '-а/-я → -ой/-ей/-ёй (also -ою/-ею/-ёю). Third-declension -ь → -ью.' }, example: 'машина → машиной; земля → землёй; ночь → ночью' },
      { category: 'N', text: { fi: '-о → -ом, -е → -ем; -ие → -ием.', en: '-о → -ом, -е → -ем; -ие → -ием.' }, example: 'окно → окном; море → морем; здание → зданием' },
      { category: 'Plural', text: { fi: 'Yleensä -ами/-ями kaikissa suvuissa.', en: 'Usually -ами/-ями in every gender.' }, example: 'солдатами; машинами; морями' },
    ],
    exceptions: { fi: 'Joillakin sanoilla on -ьми: люди → людьми, дети → детьми. -мя: время → временем. со helpottaa eräitä konsonanttiyhtymiä, esim. со взводом. Pelissä hyväksytään aineistoon tarkistetut rinnakkaismuodot.', en: 'Some nouns take -ьми: люди → людьми, дети → детьми. -мя: время → временем. со eases certain consonant clusters, as in со взводом. Verified alternative forms in the data are accepted.' },
  },
  prepositional: {
    name: CASE_NAMES.prepositional, russian: 'Предложный падеж',
    questions: { fi: 'Kenestä? Mistä? — о ком? о чём?', en: 'About whom? About what? — о ком? о чём?' },
    use: { fi: 'Käytetään aina preposition kanssa. Tässä о/об ilmaisee puheen tai ajatuksen aihetta. Sijainti käyttää usein в/на-prepositioita.', en: 'Always used with a preposition. Here о/об expresses the topic of speech or thought. Location often uses в/на.' },
    rules: [
      { category: 'M', text: { fi: 'Tavallisesti -е; -ий → -ии.', en: 'Usually -е; -ий → -ии.' }, example: 'о солдате; о герое; о санатории' },
      { category: 'F', text: { fi: '-а/-я → -е; -ия → -ии; kolmannen taivutuksen -ь → -и.', en: '-а/-я → -е; -ия → -ии; third-declension -ь → -и.' }, example: 'о машине; об армии; о ночи' },
      { category: 'N', text: { fi: '-о/-е → -е; -ие → -ии.', en: '-о/-е → -е; -ие → -ии.' }, example: 'об окне; о море; о здании' },
      { category: 'Plural', text: { fi: 'Yleensä -ах/-ях kaikissa suvuissa.', en: 'Usually -ах/-ях in every gender.' }, example: 'о солдатах; о машинах; о морях' },
    ],
    exceptions: { fi: 'об ennen vokaaliäännettä: об армии, об окне; о ennen konsonanttiäännettä, myös j-alkuisissa е/ё/ю/я-sanoissa: о юге. обо esiintyy eräiden pronominien edellä: обо мне. Paikallismuodot в лесу ja на мосту eivät sovi о-prepositioon: о лесе, о мосте. -мя → -ени: о времени.', en: 'Use об before a vowel sound: об армии, об окне; о before a consonant sound, including initial е/ё/ю/я with a /j/ sound: о юге. обо occurs before certain pronouns: обо мне. Locative forms в лесу and на мосту cannot follow о: о лесе, о мосте. -мя → -ени: о времени.' },
  },
}

// Starting endings refer to the singular dictionary form, including plural rows.
export const CASE_ENDINGS: Record<RussianCase, Record<'M' | 'F' | 'N' | 'Plural', EndingChange[]>> = {
  nominative: {
    M: [{ from: '∅', to: '∅', example: 'солдат → солдат' }, { from: '-й', to: '-й', example: 'герой → герой' }, { from: '-ь', to: '-ь', example: 'словарь → словарь' }],
    F: [{ from: '-а', to: '-а', example: 'машина → машина' }, { from: '-я', to: '-я', example: 'земля → земля' }, { from: '-ь', to: '-ь', example: 'ночь → ночь' }],
    N: [{ from: '-о', to: '-о', example: 'окно → окно' }, { from: '-е', to: '-е', example: 'море → море' }, { from: '-ие', to: '-ие', example: 'здание → здание' }],
    Plural: [{ from: '∅', to: '-ы / -и', example: 'солдат → солдаты; танк → танки' }, { from: '-а / -я', to: '-ы / -и', example: 'машина → машины; земля → земли' }, { from: '-о / -е', to: '-а / -я', example: 'окно → окна; море → моря' }],
  },
  genitive: {
    M: [{ from: '∅', to: '-а', example: 'солдат → солдата' }, { from: '-й / -ь', to: '-я', example: 'герой → героя; словарь → словаря' }],
    F: [{ from: '-а', to: '-ы / -и', example: 'машина → машины; книга → книги' }, { from: '-я / -ь', to: '-и', example: 'земля → земли; ночь → ночи' }],
    N: [{ from: '-о', to: '-а', example: 'окно → окна' }, { from: '-е', to: '-я', example: 'море → моря' }, { from: '-ие', to: '-ия', example: 'здание → здания' }],
    Plural: [{ from: '∅', to: '-ов / ∅', example: 'танк → танков; солдат → солдат' }, { from: '-й', to: '-ев', example: 'герой → героев' }, { from: '-е / -ь', to: '-ей', example: 'море → морей; ночь → ночей' }, { from: '-а', to: '∅', example: 'машина → машин' }],
  },
  dative: {
    M: [{ from: '∅', to: '-у', example: 'солдат → солдату' }, { from: '-й / -ь', to: '-ю', example: 'герой → герою; словарь → словарю' }, { from: '-а / -я', to: '-е', example: 'мужчина → мужчине; дядя → дяде' }],
    F: [{ from: '-а / -я', to: '-е', example: 'машина → машине; земля → земле' }, { from: '-ия', to: '-ии', example: 'армия → армии' }, { from: '-ь', to: '-и', example: 'ночь → ночи' }],
    N: [{ from: '-о', to: '-у', example: 'окно → окну' }, { from: '-е', to: '-ю', example: 'море → морю' }, { from: '-ие', to: '-ию', example: 'здание → зданию' }],
    Plural: [{ from: '∅ / -а / -о', to: '-ам', example: 'солдат → солдатам; машина → машинам' }, { from: '-я / -е / -й / -ь', to: '-ям', example: 'земля → землям; море → морям' }],
  },
  accusative: {
    M: [{ from: '∅ / -й / -ь', to: '∅ / -й / -ь', example: 'танк → танк; словарь → словарь' }, { from: '∅ / -й / -ь', to: '-а / -я', example: 'солдат → солдата; герой → героя' }, { from: '-а / -я', to: '-у / -ю', example: 'мужчина → мужчину; дядя → дядю' }],
    F: [{ from: '-а', to: '-у', example: 'машина → машину' }, { from: '-я', to: '-ю', example: 'земля → землю' }, { from: '-ь', to: '-ь', example: 'ночь → ночь' }],
    N: [{ from: '-о / -е', to: '-о / -е', example: 'окно → окно; море → море' }],
    Plural: [{ from: '∅ / -а / -е', to: '-ы / -и / -а / -я', example: 'танк → танки; машина → машины; море → моря' }, { from: '∅ / -й', to: '∅ / -ов / -ев / -ей', example: 'солдат → солдат; герой → героев; боец → бойцов' }],
  },
  instrumental: {
    M: [{ from: '∅', to: '-ом / -ем / -ём', example: 'солдат → солдатом; день → днём' }, { from: '-й / -ь', to: '-ем / -ём', example: 'герой → героем; словарь → словарём' }, { from: '-а / -я', to: '-ой / -ей / -ёй', example: 'мужчина → мужчиной; дядя → дядей' }],
    F: [{ from: '-а', to: '-ой / -ей', example: 'машина → машиной; туча → тучей' }, { from: '-я', to: '-ей / -ёй', example: 'армия → армией; земля → землёй' }, { from: '-ь', to: '-ью', example: 'ночь → ночью' }],
    N: [{ from: '-о', to: '-ом', example: 'окно → окном' }, { from: '-е', to: '-ем', example: 'море → морем' }, { from: '-ие', to: '-ием', example: 'здание → зданием' }],
    Plural: [{ from: '∅ / -а / -о', to: '-ами', example: 'солдат → солдатами; машина → машинами' }, { from: '-я / -е / -й / -ь', to: '-ями', example: 'земля → землями; море → морями' }],
  },
  prepositional: {
    M: [{ from: '∅ / -й / -ь', to: '-е', example: 'солдат → солдате; герой → герое; словарь → словаре' }, { from: '-ий', to: '-ии', example: 'санаторий → санатории' }],
    F: [{ from: '-а / -я', to: '-е', example: 'машина → машине; земля → земле' }, { from: '-ия', to: '-ии', example: 'армия → армии' }, { from: '-ь', to: '-и', example: 'ночь → ночи' }],
    N: [{ from: '-о / -е', to: '-е', example: 'окно → окне; море → море' }, { from: '-ие', to: '-ии', example: 'здание → здании' }],
    Plural: [{ from: '∅ / -а / -о', to: '-ах', example: 'солдат → солдатах; машина → машинах' }, { from: '-я / -е / -й / -ь', to: '-ях', example: 'земля → землях; море → морях' }],
  },
}
