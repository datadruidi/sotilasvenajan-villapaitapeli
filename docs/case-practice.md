# 6. Sijamuotopeli / Case Practice

The sixth quiz module offers Singular Forms and Plural Forms, each followed by a six-case selection grid (6.1.1–6.1.6 and 6.2.1–6.2.6), plus a task-specific Review list. Each case has its own round counter; completing a case round also increments the parent number’s total. It uses the existing ten-question scoring, mute/feedback sounds, round-count storage, button styles and three-second loading screen. The component and its data are loaded on demand, with prefetching during that loading screen.

## Vocabulary and morphology

`public/data/cases/nouns.json` is a separately generated, versioned bank of **174 nouns** from the existing vocabulary. Each has gender, grammatical animacy, twelve case/number cells (arrays of accepted variants), bilingual translations and exact source CSV/row references. Translations are copied unchanged; when a lemma occurs in multiple lists, the first source supplies the displayed translation and all references remain in `sources`.

All 656 source rows across the 15 root vocabulary CSVs were audited, including the unused basic-phrases list and abbreviation prompt lists, and matched to their English versions. See `docs/case-vocabulary-audit.json`: 179 accepted source rows produce 174 distinct lemmas, while 477 rows are excluded with reasons. Abbreviation expansions and phrases are inspected but not broken into isolated words without independent translations.

The bank was generated using **pymorphy3 2.0.6** and **pymorphy3-dicts-ru 2.4.417150.4580142**, based on OpenCorpora dictionary revision 417150. It uses dictionary lexemes, never guessed suffix replacements or predicted unknown words. Every accepted spelling is parsed back to the same noun lemma, number, case and animacy. Alternate feminine instrumental endings are preserved; stylistic -ье variants of -ие nouns are excluded.

Conservative exclusions include:

- Non-nouns and noun homographs whose source meaning is another part of speech: справа, течь, левый, правый, военный, взрывной.
- Indeclinables such as шасси; plural-only forms such as данные/сведения/войска; singular-only, mass and collective senses whose plural would require another meaning.
- Multiword terms and abbreviations, missing bilingual translations, unknown words and ambiguous dictionary paradigms.
- Судно has different ship/bedpan paradigms; it is excluded rather than selecting by frequency. Корпус is excluded because the pinned dictionary's preferred plural корпусы does not match military корпуса.

The accepted set deliberately contains only nouns supported in **both** numbers, so the two normal submodes use the same vocabulary. There is no attempt to manufacture a missing singular/plural. Additional manually verified terms can later be admitted by extending the generator's explicit policy and validation fixtures.

Data retains ё. Cases distinguish ordinary prepositional from the special locative: **о лесе**, not *о лесу*; **о мосте**, not *о мосту*. Partitive/genitive-2 forms are not substituted for the ordinary genitive. Irregular reference fixtures include солдат, боец, день, ночь, море, крыло, армия and орудие.

## Questions, contexts and duplicate answers

A normal round selects ten different nouns when the bank allows it, all in the case and number selected from the menu. Retry preserves that selection. Review rounds use the exact saved noun, case and number, shuffle unique saved tasks first, and repeat only if fewer than ten tasks are available. The original lemma is always shown in Russian; translations appear only in the word-info dialog.

The prompt labels the dictionary form as nominative. Nominative tasks show the word in the selected Finnish/English interface language, with Russian answer options, so the prompt does not reveal the answer. Other case tasks show the Russian lemma as before. This also applies to nominative tasks in Review. The selected case appears in the level title. A rectangular INFO button directly below the Home and Sound buttons spans their combined width and opens the case guide. The noun is followed by a short Russian sentence with exactly one noun blank. Each case has multiple templates covering different uses: identification and existence, genitive absence/purpose/description/possession/origin, dative recipient/approach, accusative objects/direction, instrumental means/accompaniment, and prepositional topics/location. Rounds balance compatible templates instead of repeating a single context. Location templates use an explicit noun allowlist to avoid special locatives; some contexts are limited to singular or animate nouns. The chosen template stays fixed while answering and appears in full in feedback. A smaller, complete Finnish or English translation appears immediately below, using the task's grammatical number. Finnish inflections and English plural labels are explicitly maintained in `src/data/caseSentenceWords.ts`; source parenthetical vocabulary notes are omitted from sentences. There is no separate number label: the submode title supplies it. Review sentence translations follow each saved task's number.

Options show only the inflected noun, never an incompatible preposition. The prepositional sentence chooses о/об using the accepted form, before replacing that noun with the blank. Feedback shows the complete correct Russian sentence and any accepted variants.

Options come from the same noun's case forms in the selected number. Syncretic spellings are intentionally **not deduplicated**. Buttons use positional React keys, but correctness uses membership in the requested case's accepted spelling set. Thus any button displaying a valid spelling earns one point, and an invalid spelling never becomes valid because another option repeats it. A ref lock prevents rapid double-clicks from incrementing the score twice.

## Review and accessibility

`localStorage['sotilasvenaja_cases_kerrattava_v1']` stores noun ID, original lemma, case, number and correct form. Keys deduplicate by noun/case/number; records from other modules are untouched. Review re-resolves tasks against current verified data rather than trusting saved answers. Invalid JSON/records and unavailable storage are handled without a crash.

The translation and grammar buttons open separate native modal dialogs with accessible labels, focus handling, Escape dismissal and scrollable mobile content. Every case guide has Finnish/English names, Russian name, questions, purpose, and M/F/N/Plural ending tables (dictionary ending → case ending, with examples), explanatory notes and exceptions. Accusative tables distinguish animate and inanimate patterns; plural tables start from the singular dictionary form. The source/attribution page is available through the existing Sources & Licenses menu.

## Rebuilding and validation

Install the developer-only pinned dependencies from `scripts/case-data-requirements.txt` in a virtual environment, then run:

```sh
python scripts/build-case-data.py
python scripts/verify-case-data.py
node scripts/check-case-practice.mjs
node scripts/check-military-vocabulary.mjs
npm run lint
npm run build
```

Production Chromium checks also passed for Finnish singular and English plural ten-question rounds (including a deliberately wrong answer), scoring and round counters, translation/grammar dialogs, Escape and focus restoration, 390px mobile layout, retry, persisted task review, both identical correct buttons, review removal/empty state, one-time data fetching and zero runtime exceptions. Existing modules 1–5 and Tank Racer also passed launch/navigation smoke checks; the external memory-game link was checked without navigating away.

Python/morphology is not a runtime dependency and the full dictionary is not shipped. The verifier checks all stored forms and the original vocabulary hashes. JavaScript checks cover all 2,088 noun/number/case combinations, accepted and rejected spellings, duplicate options, irregular fixtures, both numbers, context, bilingual guide completeness, ten-question uniqueness and review persistence/recovery.

## Attribution

OpenCorpora contributors: <https://opencorpora.org/>. OpenCorpora-derived inflection data is distributed under **CC BY-SA 3.0**: <https://creativecommons.org/licenses/by-sa/3.0/>. See the in-app source page for grammar references and the distinction between morphology and the existing translations.
