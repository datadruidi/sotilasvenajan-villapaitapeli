# 1.1 Military Operations vocabulary review

## Implementation status

The corrections below have now been applied with **Russian as the source of meaning**. The original audit is retained below as a record of the earlier data; its old line numbers and statements about unresolved issues describe the pre-cleanup files.

- Finnish and English now contain the same 518 Russian entries across all eight modules (1,036 rows total). The equipment lists were merged by Russian term; missing translations were supplied, with exact duplicates removed.
- Corrected mistranslations, mixed-script Finnish spellings, Russian answers in Finnish columns, misleading English headers and malformed cybersecurity rows. Split the two threat terms into independent entries, reusing the existing information-security threat row. Consolidated duplicated incident and automated-system entries.
- Separated airborne/amphibious landing senses, fire training/preparatory fire, defeat/target hit, elevation/terrain height, and sailing/armoured ship-of-the-line senses. Ship/vessel usage is qualified as military/civilian; these are learning contexts rather than a universal linguistic boundary.
- Used descriptive Finnish names for Russian warrant-officer ranks instead of claiming direct equivalence with Finnish commissioned-officer ranks. Used Eskarppi/Kontreskarppi rather than uncertain slope-direction translations.
- Changed countable plural headwords to singular in all three languages: munition, communication device, logistics service, competition, measure, information system/resource/technology, infrastructure object/structure/entity, and detection/remediation means. Singularizing the duplicate critical-object term reduced it to one entry.
- Preserved required or meaningful plurals: Войска / Joukot / Troops, Воздушнодесантные войска / Maahanlaskujoukot / Airborne forces, Данные / Tiedot / Data, Сведения / Tiedot / Information, Персональные данные / Henkilötiedot / Personal data, and Силы… / Joukot… / Forces…. Plural dependents remain in established multiword concepts where they describe multiple forces, data, resources, consequences or processes. English means is also a singular noun. Finnish collective and mass nouns follow natural Finnish usage.
- Repaired CSV parsing for quoted commas, semicolons and escaped quotes. Quiz option generation excludes other recorded valid translations for the same prompt, so synonyms such as Двигатель and Мотор cannot be offered as wrong answers to Moottori.

Validation: `npm run build` and `npm run lint` passed. `node scripts/check-military-vocabulary.mjs` exercises every entry in both quiz directions, checks vocabulary parity/capitalization/scripts, verifies the repaired long question, and covers quoted CSV and legacy abbreviation formats.

Additional terminology references: [Finnish fortification glossary (Finnish Heritage Agency)](https://akp.nba.fi/artikkelit%3Blinnoitussanastoa), [Russian ranks and Finnish descriptions (Reservin Sanomat)](https://arkisto.reservinsanomat.fi/wp-content/uploads/reservinsanomat_2009_1_web.pdf).

## Original audit


Reviewed all 507 entries per language (1,014 rows total) in the eight module CSVs, comparing Russian–Finnish, Russian–English and the two language versions. Capitalized the first letter of each entry in both columns; phrases use sentence capitalization. No translation, spelling, punctuation, row structure or header corrections were made. The user-maintained Review list is stored in browser localStorage and is not available in the repository. The unused rintamavenajan-alkeet list and 1.2 abbreviation lists are outside this scope.

The findings below are review candidates, not an authoritative certification of every military equivalent. Context-dependent meanings and Finnish rank equivalents need particular care.

## Structural problems affecting displayed translations

The app reads the first two CSV cells as the Russian term and its translation. Unquoted commas therefore break these cybersecurity rows in both language versions:

- Line 62: the second Компьютерный инцидент row has an extra translation cell. Only `Tietoturvatapahtuma` / `Security incident` is read, losing the following alternative. The same Russian prompt also occurs on line 61 with a different answer.
- Line 63: `Угроза в информационном пространстве, Угроза информационной безопасности` is split into two cells. The displayed Finnish/English answer is actually the second Russian phrase; the intended translations are ignored.
- Line 64: the long `Государственная система обнаружения, Предупреждения и ликвидации последствий…` term is split at its comma. The Russian prompt is truncated and the answer is a Russian continuation; the intended Finnish/English translation is ignored.

Several English CSV headers say `Russian,Finnish`. The loader accepts them, so this is a misleading header rather than a broken translation.

## 1.1.1 Weapons and Ammunition

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Гранатомёт | Sinko / Rocket launcher | Generic grenade launcher; rocket launcher is too narrow for this generic word. |
| Безоткатное орудие | Sinko / Rocket launcher | Recoilless gun/rifle; the English answer identifies a different weapon mechanism. Finnish sinko can cover recoilless weapons. |
| Ручной | Käsikäyttöinen / Hand-held | Manual/hand-operated versus hand-held: context is needed, particularly for weapon compounds. |
| Боеприпасы | Ampumatarvike / Ammunition | Russian is plural/collective; Finnish singular is a normalization, not an exact number match. |

## 1.1.2 Equipment and Platforms

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Флот | Equipment (EN only) | Fleet/navy, rather than equipment. |
| Плавсредство | Platform (EN only) | Watercraft/floating craft is more specific. |
| Устройство | Equipment (EN only) | Device/apparatus is the closer standalone meaning. |
| Ходовая часть | Alusta / Platform | Running gear/chassis/undercarriage; English platform is vague. |
| Фюзеляж | Runko / Hull | Fuselage is the normal aircraft term; hull applies to particular aircraft types. |
| Сторожевой корабль | Fregatti (FI only) | Patrol/escort ship; frigate may fit a class but is not universal. |
| Корабль / Судно | Alus / Laiva; Ship / Vessel | Finnish and English distinguish these inconsistently; context may justify overlap. |

The lists each have 46 rows but contain different Russian vocabulary:

- Finnish only: Аппарат, Артиллерийский катер, Летательный, Линейный корабль, Мотор, Оперение, Сторожевой корабль, Техника, Эскадренный миноносец, Эсминец.
- English only: Канонерская лодка, Оборудование, Плавсредство, Полёт, Устройство, Флот, Фрегат, Хвост.
- The English list repeats Судно → Vessel and Корабль → Ship, accounting for the unequal number of unique terms.

## 1.1.3 Organization Structure

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Мотострелковый | Moottoroitu / Motorized rifle | Finnish omits the rifle/infantry component. |
| Объединение | Armeijaryhmä / Operational-strategic formation | Russian is a broader operational formation category; Finnish army group is too specific. |
| Десантный; Десант | Maihinnousu; Maahanlasku / Airborne; Assault landing | Russian can refer to airborne or amphibious landings; the versions choose different scopes. |
| Обеспечение | Huolto / Support | Finnish narrows a broad support concept to logistics. |
| Разведгруппа | Tiedusteluryhmä / Reconnaissance patrol | Reconnaissance group/team is closer; a patrol is a contextual interpretation. |
| Род войск | Aselaji / Service branch | English is ambiguous between a branch within a service and a whole armed service. |

## 1.1.4 Training and Tasks

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Поставить задачу; Ставить задачу | Поручить; Поручать (FI) / Assign (EN) | The Finnish answers are Russian synonyms, not Finnish translations. Finnish would be along the lines of antaa tehtävä. |
| Соревнования | Suunnistuskilpailut / Orienteering competitions | Competitions generally; nothing in the Russian specifies orienteering. |
| Практика | Käytäntö / Procedure | Practice/practical experience; procedure is a narrower and usually different concept. |
| Огневая подготовка | Ampumakoulutus / Marksmanship training | Can mean firearms/fire training or fire preparation in combat; marksmanship training narrows the term. |
| Занятие | Harjoitus / Exercise | Also lesson/training session; exercise is context-dependent. |

## 1.1.5 Combat and Tactics

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Позиция | Aseма / Position | Finnish mixes Latin and Cyrillic letters: the final ма is Cyrillic. Intended spelling appears to be Asema. |
| Упреждение | Ennakко / Pre-emption | Finnish mixes scripts: final ко is Cyrillic. Intended spelling appears to be Ennakko. |
| Вступить в бой | Ryhtyä / Engage | Finnish omits the combat complement: ryhtyä taisteluun. |
| Завязать бой | Aloittaa / Initiate combat | Finnish omits what is initiated: aloittaa taistelu. |
| Поражать | Tuhota / Engage | Hit/strike/inflict damage; Finnish destroy is stronger than the Russian requires, while English engage does not imply a hit. |
| Поражение | Tuho / Destruction | Can mean defeat or damage/hitting a target; destruction is one contextual interpretation. |
| Форсирование; Форсировать | Ylitys; Ylittää / Crossing (assault); Conduct an assault crossing | Finnish omits the forced/assault aspect. |
| Змейка | Avojono / File | Literally a snake/zigzag formation; ordinary file needs context. |
| Застигать | Yllättää / Surprise | Catch/come upon, often with a qualifier; surprise is contextual. |
| Упредить | Ennättää / Pre-empt | Finnish ennättää is broader; ennättää ensin/ennakoida may better express the intended sense. |

## 1.1.6 Terrain and Fortifications

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Проволока | Piikkilanka / Barbed wire | Usually wire generally; barbed wire is Колючая проволока (also present). A contextual shorthand is possible. |
| Невзрывной | Räjähtämätön / Non-explosive | Finnish can suggest unexploded; here a non-explosive obstacle is meant, e.g. räjähteetön. |
| Противотранспортный | Tientuhoaminen / Anti-vehicle | Finnish is road destruction, rather than an adjective meaning anti-transport/anti-vehicle. |
| Грунтовая дорога | Soratie / Gravel road | Unpaved/dirt road; not necessarily gravel. |
| Шоссе; Шоссейная дорога | Valtatie / Highway | Does not necessarily imply Finnish valtatie road classification. |
| Оборудовать | Rakentaa / Prepare | Equip/fit out; building or preparing a position is contextual. |
| Эскарп; Контрэскарп | Vastarinneleikkaus; Myötärinneleikkaus / Escarp; Counterscarp | Verify Finnish obstacle terminology and slope orientation against the course reference; potentially reversed or nonstandard equivalents. |
| Высота | Korkeus / Elevation | Also a hill/height in military terrain descriptions; standalone translations are narrower. |

## 1.1.7 Military Ranks

Прапорщик → Vänrikki / Warrant officer and Старший прапорщик → Ylivänrikki / Senior warrant officer require review. The Russian ranks are warrant-officer ranks; Finnish vänrikki is a commissioned-officer rank, and ylivänrikki is not a current standard Finnish Defence Forces rank. These may reflect a deliberate course equivalence convention, but the Finnish and English versions do not express the same rank category. Other rank pairs appear consistent as approximate equivalents; national rank systems are not identical.

## 1.1.8 Cybersecurity Terminology

In addition to the parsing failures above:

| Russian | Existing translation(s) | Review concern |
| --- | --- | --- |
| Компьютерный инцидент | Tietokoneonnettomuus / Computer incident | Onnettomuus implies an accident; incident need not be accidental. Duplicate also offers Tietoturvatapahtuma. |
| Средства ликвидации последствий компьютерных инцидентов… | …tietokonehyökkäysten…vaikutusten likvidoinnin välineet / Means for eliminating the consequences of computer incidents… | Finnish changes incidents to attacks and uses awkward literal likvidointi. |
| Силы ликвидации последствий компьютерных инцидентов… | Tietokonehyökkäysten seurausten likvidoinnin voimat… / Forces for eliminating the consequences of computer incidents… | Same incidents → attacks shift in Finnish. |
| Провайдер хостинга | Palveluntarjoaja / Hosting provider | Finnish omits hosting and becomes any service provider. |
| Владелец сайта в сети «Интернет» | Sivun omistaja / Website owner on the Internet | Finnish page owner is less precise than website owner. |
| Электронное сообщение | Elektroninen ilmoitus / Electronic message | Viesti is a more general equivalent; ilmoitus narrows this to notification. |
| Обладатель информации | Informaation omistaja / Information owner | Holder/possessor need not imply ownership; verify the intended legal terminology. |
| Субъекты критической информационной инфраструктуры… | …subjektit / Subjects… | Literal equivalents are opaque; may refer to responsible entities/operators rather than subjects in ordinary usage. |

The very long Автоматизированная система управления… concept appears twice with initial capitalization differences and slightly different Finnish formulations; the English answers are identical. The four versions should be reconciled in a later content edit.

## Verification and references

An automated comparison confirmed that every changed CSV cell differs only in capitalization, with all row and cell counts preserved. All nonempty vocabulary cells begin with an uppercase letter. No app code changed.

Reference spot-checks supporting the review (other items are linguistic/contextual review candidates):

- [Gramota: соревнование](https://gramota.ru/meta/sorevnovanie): competition, without an orienteering restriction.
- [Wiktionary: флот](https://en.wiktionary.org/wiki/флот): fleet/navy.
- [Wiktionary: проволока](https://ru.wiktionary.org/wiki/проволока): wire generally; also records contextual barbed-wire usage.
- [Recoilless weapon terminology](https://ru.wikipedia.org/wiki/Безоткатное_орудие): distinction from rocket launchers.
