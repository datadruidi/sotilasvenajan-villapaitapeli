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

The accepted set deliberately contains only nouns supported in **both** numbers, so the two normal submodes use the same vocabulary. In addition to the CSV-derived bank, `src/data/caseExamples.ts` supplies 30 new nouns with explicit Russian paradigms and bilingual translations. All 30 are available in each of the 12 case and number combinations, including saved review. Each single-case round samples three of the new nouns. There is no attempt to manufacture a missing singular/plural. Additional manually verified terms can later be admitted by extending the generator's explicit policy and validation fixtures.

Data retains ё. Cases distinguish ordinary prepositional from the special locative: **о лесе**, not *о лесу*; **о мосте**, not *о мосту*. Partitive/genitive-2 forms are not substituted for the ordinary genitive. Irregular reference fixtures include солдат, боец, день, ночь, море, крыло, армия and орудие.

## Singular exercises, feedback and keyboard controls

Each singular case has 140 exercises in `src/data/singularExercises.ts`: fourteen different sentence frames, each paired with ten operational contexts. Each frame has an explicit Russian sentence, Finnish and English translation, and Finnish explanation of the governing construction. There are 42 easy, 56 medium and 42 hard exercises per case. Each round has three easy, four medium and three hard slots. One slot in each group uses a new noun with a compatible sentence template. All six banks include masculine, feminine and neuter nouns and both animate and inanimate nouns.

Frames cover subjects and identification; absence, ownership, quantity and genitive prepositions; dative recipients, assistance and approach; accusative objects and destinations; instrumental verb government, equipment and accompaniment; and prepositional locations and topics. Location-specific `в лесу` and `на мосту` override ordinary prepositional forms only in those sentences. Topic constructions retain ordinary forms.

Singular, plural and saved-review rounds contain ten questions, with progress and scores shown as X/10. The dictionary form is always shown in Russian, including nominative tasks. Each curated singular task has four distinct spellings from the same noun’s singular paradigm and exactly one accepted answer. Syncretic forms appear once. Every question has four distinct options and one accepted answer. If the selected number supplies fewer than three distinct distractors, additional distractors come from the same noun’s other number.

A wrong answer gives a retry without revealing the solution. A correct answer shows the completed sentence and a short explanation followed by `lemma → form`. Scoring counts answers that were correct on the first attempt. The Next button appears after success. Keys 1–4 select options from top to bottom; Enter advances after success and shows results after the final question. Held keys, modifier combinations, text fields and open dialogs do not trigger game actions.

The existing word-translation and grammar dialogs remain available. Each plural round samples two feminine and two neuter examples from `caseExamples.ts`, plus a masculine example where available. Three questions draw from the 30 new nouns. The remaining questions use compatible templates in `caseSentenceTemplates.ts` and explicit Finnish inflections in `caseSentenceWords.ts`. Saved review reuses a curated example when it matches the saved noun, number and case.

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

The JavaScript verifier checks morphology reference fixtures, all 2,448 noun/number/case combinations from the CSV-derived bank and the new vocabulary, bilingual legacy contexts, round construction and review persistence. It also checks all 840 curated singular tasks for difficulty counts, gender and animacy coverage, four distinct options, exactly one accepted answer, sentence blanks, translations and explanations. Python/morphology is not a runtime dependency.

## Attribution

OpenCorpora contributors: <https://opencorpora.org/>. OpenCorpora-derived inflection data is distributed under **CC BY-SA 3.0**: <https://creativecommons.org/licenses/by-sa/3.0/>. See the in-app source page for grammar references and the distinction between morphology and the existing translations.
