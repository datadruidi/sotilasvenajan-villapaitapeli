# Cyrillic Typing Race — Implementation Instructions

## 1. First-phase scope

The first phase should focus on implementing the game mechanics, user interface, data loading, timing, animation, sound, and menu integration.

Do not spend significant development time producing a large sentence collection during this phase. Create only a few placeholder texts so that every difficulty level and game function can be tested. More texts will later be added manually to the same data file.

The typing texts should use vocabulary from the existing military vocabulary material, including weapons, equipment, organization, terrain, ranks, and commonly used abbreviations.

The language and recurring characters can follow the existing Ivan story project, but typing texts should be much shorter than the complete stories.

---

## 2. Sentence data file

All Russian typing texts and their Finnish and English translations must be stored in:

```text
public/data/typing/sentences.json
```

This is the only file that should normally need to be edited when new typing exercises are added.

The application must load the file dynamically rather than hard-coding sentences inside React components.

The initial implementation should contain only four placeholder entries: one for each difficulty level.

### Initial placeholder file

```json
[
  {
    "id": "beginner-001",
    "difficulty": "beginner",
    "russian": "Иван видит танк. Танк стоит у дороги.",
    "translations": {
      "fi": "Ivan näkee panssarivaunun. Panssarivaunu seisoo tien vieressä.",
      "en": "Ivan sees a tank. The tank is standing by the road."
    },
    "vocabulary": [
      "танк",
      "дорога"
    ],
    "enabled": true
  },
  {
    "id": "intermediate-001",
    "difficulty": "intermediate",
    "russian": "Утром Иван проверяет старый автомат и считает патроны. Потом он идёт к машине, но её двигатель снова не работает.",
    "translations": {
      "fi": "Aamulla Ivan tarkistaa vanhan rynnäkkökiväärin ja laskee patruunat. Sitten hän menee ajoneuvolle, mutta sen moottori ei taaskaan toimi.",
      "en": "In the morning, Ivan checks the old assault rifle and counts the cartridges. Then he goes to the vehicle, but its engine is not working again."
    },
    "vocabulary": [
      "утро",
      "автомат",
      "патрон",
      "машина",
      "двигатель"
    ],
    "enabled": true
  },
  {
    "id": "advanced-001",
    "difficulty": "advanced",
    "russian": "Иван понимает, что приказ звучит уверенно, хотя никто не знает, куда ведёт эта дорога.",
    "translations": {
      "fi": "Ivan ymmärtää, että käsky kuulostaa varmalta, vaikka kukaan ei tiedä, minne tämä tie johtaa.",
      "en": "Ivan understands that the order sounds confident, although nobody knows where this road leads."
    },
    "vocabulary": [
      "приказ",
      "дорога"
    ],
    "enabled": true
  },
  {
    "id": "superhuman-001",
    "difficulty": "superhuman",
    "russian": "Командир уверяет, что подразделение полностью готово к движению, хотя связь не работает и боеприпасов почти нет. Иван слушает доклад и понимает, что на бумаге всё выглядит лучше, чем в действительности.",
    "translations": {
      "fi": "Komentaja vakuuttaa, että yksikkö on täysin valmis liikkumaan, vaikka viestiyhteydet eivät toimi ja ampumatarvikkeita ei juuri ole. Ivan kuuntelee raporttia ja ymmärtää, että paperilla kaikki näyttää paremmalta kuin todellisuudessa.",
      "en": "The commander insists that the unit is completely ready to move, although communications do not work and there is almost no ammunition. Ivan listens to the report and understands that everything looks better on paper than it does in reality."
    },
    "vocabulary": [
      "командир",
      "подразделение",
      "связь",
      "боеприпасы",
      "доклад"
    ],
    "enabled": true
  }
]
```

The placeholder texts can be replaced later. Their purpose is to verify that all four difficulty levels, translations, and typing rules work.

Each entry must have a permanent unique `id`, because best times will be stored against that ID.

---

## 3. Difficulty levels

The game has four difficulty levels.

Text length is measured using the Russian target string, including spaces and punctuation.

| Level | Language level | Length | Sentence count |
|---|---|---:|---:|
| Beginner | A1–A2 | 30–90 characters | 1–2 sentences |
| Intermediate | A1–A2 | 100–220 characters | 1–2 sentences |
| Advanced | B1–B2 | 30–90 characters | 1–2 sentences |
| Superhuman | B1–B2 | 100–220 characters | 1–2 sentences |

The distinction is based on both language complexity and text length:

- **Beginner:** short and linguistically simple.
- **Intermediate:** longer but still linguistically simple.
- **Advanced:** short but grammatically and lexically more difficult.
- **Superhuman:** both longer and linguistically more difficult.

The game should provide a difficulty-selection screen before starting the first round.

Suggested labels:

```text
English:
Beginner
Intermediate
Advanced
Superhuman

Finnish:
Aloittelija
Keskitaso
Edistynyt
Yli-inhimillinen
```

---

## 4. Random sentence selection

After the user selects a difficulty, the game randomly selects an enabled sentence from that difficulty.

There is no vocabulary-category selection in the first phase.

After completion, the user receives these options:

```text
Try again
New sentence
Main menu
```

Finnish:

```text
Yritä uudelleen
Uusi teksti
Päävalikko
```

Behavior:

- **Try again** loads the same sentence.
- **New sentence** randomly selects another sentence from the same difficulty.
- The immediately previous sentence should be avoided when at least two sentences are available.
- Previously completed sentences may appear again in later rounds.
- Selecting another difficulty requires returning to the difficulty-selection screen.

---

## 5. Game screen

The game should resemble a TypeRacer-style typing test.

The screen contains:

1. Game title.
2. Mute button.
3. Difficulty indicator.
4. Timer.
5. Tank movement track.
6. Orc-on-a-tank image.
7. Russian target text.
8. Typing input.
9. Optional live CPM and accuracy indicators.
10. Cancel or back button.

The Finnish or English translation must not be visible while the user is typing.

The typing input should automatically receive focus when:

- a new sentence is loaded;
- the user selects Try again;
- the user selects New sentence.

---

## 6. Strict typing rules

Typing is always performed in Russian Cyrillic.

The comparison must be completely strict.

### Capitalization

Capitalization is always required.

For example:

```text
Иван
```

is correct, while:

```text
иван
```

is incorrect.

### Punctuation

All punctuation must be entered exactly as shown.

This includes:

- periods;
- commas;
- question marks;
- quotation marks;
- colons;
- hyphens;
- spaces.

Missing, additional, or incorrect punctuation counts as an error.

### Е and Ё

`е` and `ё` are always treated as different characters.

For example:

```text
ведёт
```

must be typed with `ё`.

The following is incorrect:

```text
ведет
```

No automatic substitution or normalization from `е` to `ё` is allowed.

### Pasting

Pasting must be completely disabled.

Disable:

- keyboard paste shortcuts;
- context-menu paste;
- drag-and-drop text insertion;
- mobile paste actions where the browser permits interception;
- programmatic multi-character insertion that clearly comes from pasted content.

Normal mobile keyboard composition must continue to work.

The implementation must distinguish genuine IME composition from pasted text so that Russian software keyboards remain usable.

---

## 7. Character comparison

The target text should remain visible above the typing field.

Each target character should have one of these states:

```text
completed correctly
current character
incorrect character
not yet typed
```

Recommended visual behavior:

- Correct characters: green or completed styling.
- Current character: underline or cursor indicator.
- Incorrect character: red background or red underline.
- Untyped characters: normal text.

Color must not be the only indicator. Incorrect characters should also be underlined or otherwise visually marked.

Progress is based on the correct prefix:

```ts
progress = correctPrefixLength / targetText.length;
```

The tank must not move beyond the first incorrect character.

The user can use Backspace to correct an error.

The text is completed only when:

```ts
userInput === targetText
```

No case folding, punctuation removal, whitespace trimming, or `е`/`ё` replacement should occur.

Unicode normalization to NFC may be applied to prevent technically different Unicode encodings, but it must not change visible letters.

---

## 8. Timer

The timer starts when the user enters the first valid character input.

It must not start when:

- the game screen opens;
- the user reads the text;
- the input receives focus;
- the user presses a non-character key.

Use timestamp-based timing:

```ts
elapsedMilliseconds = performance.now() - startTimestamp;
```

The timer stops immediately when the full target text is completed correctly.

Display the time with tenths of a second:

```text
00:27.4
```

---

## 9. CPM calculation

CPM means characters per minute.

Calculate CPM from the completed target text:

```ts
cpm =
  targetText.length /
  (elapsedMilliseconds / 60000);
```

The final CPM should be rounded to the nearest whole number.

Spaces and punctuation count as characters because the user must type them.

Example:

```text
112 CPM
```

---

## 10. Accuracy calculation

Accuracy must reflect mistakes made during the attempt. It must not automatically become 100 percent merely because the final corrected text is correct.

Track:

```ts
totalCharacterAttempts
correctCharacterAttempts
incorrectCharacterAttempts
```

Count printable character-entry attempts, including incorrect ones.

Do not count:

- Backspace;
- Shift;
- Control;
- Alt;
- arrow keys;
- function keys;
- focus events.

Suggested calculation:

```ts
accuracy =
  correctCharacterAttempts /
  totalCharacterAttempts *
  100;
```

Round the final accuracy to one decimal place.

Example:

```text
96.4%
```

---

## 11. Tank movement

The orc-on-a-tank image replaces the TypeRacer car.

Suggested asset location:

```text
public/assets/typing/orc-tank.webp
```

The tank begins on the left side of the track and moves toward the right according to the correctly completed percentage.

Use a responsive container rather than fixed screen coordinates.

The tank reaches the end only when the entire target text has been typed correctly.

CSS transforms are sufficient:

```ts
const progressPercentage =
  correctPrefixLength / targetText.length * 100;
```

```css
transform: translateX(...);
transition: transform 120ms linear;
```

---

## 12. Completion explosion and sound

When the text is completed:

1. Stop the timer.
2. Move the tank to the finish.
3. Hide or replace the tank.
4. Play an animated explosion image.
5. Play the explosion sound unless muted.
6. Display the result panel.
7. Display the translation.

Suggested files:

```text
public/assets/typing/orc-tank.webp
public/assets/typing/explosion.webp
public/assets/typing/explosion.mp3
```

The explosion should be an animated image or sprite animation. No video is required.

The explosion must trigger only once per completed attempt.

The sound must use the same global mute behavior and mute-button style as the other game sections.

When muted:

- no explosion sound plays;
- the animation still appears;
- the mute selection should remain active when the user starts another round.

A reduced-motion mode should show a static explosion frame rather than a rapidly animated effect.

---

## 13. Completion screen

After the explosion, display:

```text
Completed!
Time: 00:27.4
Speed: 112 CPM
Accuracy: 96.4%
Best time: 00:25.8
```

Finnish:

```text
Valmis!
Aika: 00:27.4
Nopeus: 112 merkkiä/min
Tarkkuus: 96.4 %
Paras aika: 00:25.8
```

The Finnish or English translation appears underneath the result.

Example:

```text
Translation

Ivan sees a tank. The tank is standing by the road.
```

The result buttons appear underneath:

```text
Try again
New sentence
Main menu
```

---

## 14. Best-time storage

Store one best time for each sentence ID.

Suggested local-storage key:

```text
military-cyrillic-typing-best-times
```

Suggested data:

```json
{
  "beginner-001": 25840,
  "intermediate-001": 62120
}
```

Times should be stored in milliseconds.

A new result replaces the saved best time only when it is faster.

Cancelled runs must not update the best time.

Accuracy and CPM do not need to be stored during the first phase.

---

## 15. Backgrounding cancels the run

Moving the application into the background cancels the current attempt.

Examples:

- switching browser tabs;
- minimizing the browser;
- locking the phone;
- opening another Android application;
- placing the Capacitor application in the background.

When backgrounding is detected:

1. Stop the timer.
2. Mark the run as cancelled.
3. Do not save a result.
4. Do not update the best time.
5. Reset typed input and statistics.
6. Return to the ready state for the same sentence.

When the user returns, display:

```text
Run cancelled because the application was placed in the background.
Press Start to try the same sentence again.
```

Finnish:

```text
Suoritus keskeytettiin, koska sovellus siirrettiin taustalle.
Paina Aloita yrittääksesi samaa tekstiä uudelleen.
```

For web builds, listen for events such as:

```ts
document.visibilitychange
window.pagehide
```

For the Capacitor build, also use the application state-change listener supported by the project.

---

## 16. Splash-screen integration

The new Cyrillic typing game button must appear on the main splash screen.

It should take the current color, size, and placement of the existing:

```text
Play Military Memory Game
```

button.

In other words, the Cyrillic typing game becomes the second-highest prominent button where the memory game currently appears.

Suggested labels:

```text
English:
Play Cyrillic Typing Race

Finnish:
Pelaa kyrillistä kirjoituspeliä
```

The former Military Memory Game button must be moved below the Military Quiz button.

It becomes the fifth numbered game button.

English:

```text
5. Military Memory Game
```

Finnish:

```text
5. Sotilasmuistipeli
```

The required relative order is:

```text
...
Military Quiz
5. Military Memory Game
...
```

All remaining splash-screen buttons should retain their existing order unless numbering needs to be updated to prevent duplicate numbers.

The new typing-game button should inherit the exact styling previously used by the memory-game button:

- background color;
- text color;
- width;
- height;
- border radius;
- icon placement;
- margin;
- responsive behavior.

---

## 17. Suggested source-code structure

```text
src/components/CyrillicTypingGameView.tsx
src/components/CyrillicTypingGameView.css
src/components/TypingDifficultySelect.tsx
src/components/TypingResultView.tsx

src/lib/typingData.ts
src/lib/typingLogic.ts
src/lib/typingStorage.ts

src/types/typing.ts

public/data/typing/sentences.json

public/assets/typing/orc-tank.webp
public/assets/typing/explosion.webp
public/assets/typing/explosion.mp3
```

### Responsibilities

#### `typingData.ts`

```text
Load sentences.json
Validate required fields
Validate difficulty values
Validate character lengths
Filter disabled entries
Select random entries
Avoid immediate repetition
```

#### `typingLogic.ts`

```text
Compare input strictly
Calculate correct prefix
Calculate tank progress
Track character attempts
Calculate CPM
Calculate accuracy
Detect completion
```

#### `typingStorage.ts`

```text
Load best times
Save best times
Compare new time with previous best
Handle corrupt local-storage data safely
```

#### `CyrillicTypingGameView.tsx`

```text
Manage ready, running, cancelled, finishing, and finished states
Handle input and paste prevention
Control timer
Control tank movement
Handle background cancellation
Play explosion animation and sound
Display translation and results
```

---

## 18. Recommended game states

```ts
type TypingGameState =
  | "difficulty-selection"
  | "ready"
  | "running"
  | "cancelled"
  | "finishing"
  | "finished";
```

Typical flow:

```text
difficulty-selection
        ↓
      ready
        ↓
     running
        ↓
    finishing
        ↓
     finished
```

Backgrounding:

```text
running
   ↓
cancelled
   ↓
ready
```

Try again:

```text
finished
   ↓
ready with the same sentence
```

New sentence:

```text
finished
   ↓
ready with another random sentence
```

---

## 19. Data validation

The sentence loader should reject or report entries that contain:

- an unknown difficulty;
- a duplicate ID;
- a missing Russian text;
- a missing Finnish translation;
- a missing English translation;
- text outside the permitted length range;
- more than two sentences;
- leading or trailing spaces;
- repeated spaces;
- line breaks;
- combining stress marks;
- accidental Latin look-alike characters;
- unsupported control characters.

The content file may intentionally contain the Russian letter `ё`. It must not be removed or converted to `е`.

Validation errors should identify the entry:

```text
Invalid typing entry "advanced-004":
Russian text has 102 characters, but Advanced permits 30–90.
```

One invalid entry should not necessarily prevent all valid entries from loading. Invalid entries can be excluded and logged during development.

---

## 20. First-phase acceptance criteria

The first phase is complete when:

- The new game appears in the former memory-game button position on the splash screen.
- The memory game appears below Military Quiz as the fifth game.
- The game loads texts from `public/data/typing/sentences.json`.
- The initial file contains at least one placeholder for every difficulty.
- The user can select Beginner, Intermediate, Advanced, or Superhuman.
- A random text is selected from the chosen difficulty.
- The user can replay the same text.
- The user can request another random text.
- Typing always uses Cyrillic.
- Capitalization is strict.
- Punctuation is strict.
- `е` is not accepted for `ё`.
- Pasting and drag-and-drop insertion are disabled.
- Correct input advances the tank.
- Incorrect input stops progress at the first error.
- The timer starts with the first typed character.
- Backgrounding cancels the attempt.
- Completion stops the timer.
- The explosion animation plays once.
- The explosion sound respects the mute setting.
- The result displays time, CPM, accuracy, and best time.
- The selected Finnish or English translation appears only after completion.
- Best times remain available after restarting the application.
- The feature works in both the browser and the Android build.
- Additional texts can be added later by editing only `public/data/typing/sentences.json`.
