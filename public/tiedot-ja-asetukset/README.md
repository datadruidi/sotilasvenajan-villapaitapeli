# All Things Russian Military 101 / Sotilasvenäjän villapaitapeli

![Military Russian 101 banner](docs/banner.png)

All Things Russian Military 101 (Sotilasvenäjän villapaitapeli) is a learning game. It teaches Russian military words and topics. The app is available in Finnish and English.

Play in a browser at [villapaitapeli.fi](https://villapaitapeli.fi).

## Main screen

![Main screen](docs/main-screen.png)

## 1. Military Quiz

The Military Quiz menu has five games:

1. Military Vocabulary
2. Military Organization
3. Military Symbology
4. Military Ranks
5. Military Memory Game

Most games have ten questions. Each question has four choices. The app saves the number of completed rounds.

![Military Quiz main menu](docs/military-quiz-menu.png)

### 1.1 Military Vocabulary

This section has two parts. They are Military Operations and Military Abbreviations.

#### Military Operations

This part has eight word lists:

- Weapons and Ammunition
- Equipment and Platforms
- Organization Structure
- Training and Tasks
- Combat and Tactics
- Terrain and Fortifications
- Military Ranks
- Cybersecurity Terminology
- Review

You can answer in Finnish or English. You can also answer in Russian. You can add difficult words to the Review list.

![Military Operations game](docs/words-game.png)

#### Military Abbreviations

This part has six lists:

- Security and Intelligence Agencies
- Defense Administration and Command
- Main Branches and Special Forces
- Operational Capabilities
- Equipment Capabilities
- Leadership, Administration and Daily Terms
- Review

The game shows a prompt in Finnish or English. You choose the correct Russian abbreviation. Abbreviations have their own Review list.


![Military Abbreviations game](docs/military-abbreviations-game.png)

### 1.2 Military Organization

This section has two parts. They are Military Capabilities and Military Districts.

#### Military Capabilities

This is an image quiz. You identify military equipment from a picture.

The available branches are:

- Ground Forces
- Navy
- Aerospace Forces
- Strategic Missile Forces
- Airborne Forces
- Unmanned Systems Forces

![Military Capabilities game](docs/vehicles-game.png)


#### Military Districts

This part has two games:

- Military District Bases
- Military District Insignia

##### Military District Bases

The current game covers the Leningrad Military District. You identify a base on a map. You can save bases to the Review list.

The Central, Eastern, Moscow, and Southern military districts are shown as future options. They can be added by request.

![Military District Bases game](docs/garrisons-game.png)

##### Military District Insignia

This is an image quiz. You identify a military district insignia.

![Military District Insignia game](docs/military-district-insignia-game.png)

### 1.3 Military Symbology

You see a military symbol. You choose its correct meaning.

![Military Symbology menu](docs/military-symbology-menu.png)

### 1.4 Military Ranks

This section uses Russian Ground Forces rank insignia.

![Military Ranks game](docs/ranks-game.png)

### 1.5 Military Memory Game

The Memory Game opens in a new page. You match military images and names.

![Military Memory Game](docs/memory-game.png)

## 2. Tank Racer

Tank Racer is a Cyrillic typing game with three levels: Easy, Harder, and SVO. The former A1–A2 exercises are under Easy, while the former B1–B2 exercises are under Harder. Type the Russian exercise exactly as shown to move the tank toward the mine. Capital letters, punctuation, spaces, and the distinction between `е` and `ё` all count.

To add exercises with a browser form, run `npm run text-editor`, open the displayed localhost address, and enter the Russian text, Finnish and English translations, and level. Saving adds the exercise directly to `public/data/typing/sentences.json`; refresh the game to load it. The editor is deliberately available only on your own computer and is not included in the published website.

The timer begins with the first typed character. After completing a text, the game shows elapsed time, characters per minute, accuracy, the saved best time, and a Finnish or English translation. You can retry the same exercise or load another exercise from the selected level.

![Tank Racer game](docs/tank-racer.png)

## 3. Short War Stories

These stories follow Private Ivan near the front in Ukraine. The text is in Russian. English translations help you study each sentence. Each available story has audio. You can play, pause, restart, and seek the audio. The full story is also available as one long recording.

Exercise PDFs are added automatically to the menus during `npm run dev` or `npm run build`. Put fill-the-blank files in `public/learning-materials/fill-the-blank/` and reading-comprehension files in `public/learning-materials/reading-comprehension/`. The PDF filename, without its extension, becomes the button label; underscores and hyphens are shown as spaces.

Looping soundtrack files work the same way: put MP3 files in `public/learning-materials/soundtrack-loop/`. Starting development or building the app creates their menu buttons automatically.

![Short War Stories menu](docs/short-war-stories-menu.png)

## 4. Daily OSINT Brief

The brief gathers information from Russian-language sources. AI translates and analyzes it.
The browser brief updates every day. You can also read older briefs.

![Daily OSINT Brief](docs/daily-osint-brief.png)

## 5. Equipment Catalog

The catalog is a study reference. It has pictures and short equipment details.

The catalog has six sections:

- Ground Forces
- Navy
- Aerospace Forces
- Unmanned Systems
- Airborne Forces
- Strategic Missile Forces

![Equipment Catalog page](docs/equipment-catalog-page.png)

## 6. Information & Settings

This menu has four sections:

- About
- Updates
- Sources & Licenses
- Soundtrack


## Source code

The source code is on [GitHub](https://github.com/datadruidi/sotilasvenajan-villapaitapeli).

The project has one main developer. Some parts may still be unfinished.

## Feedback

Send email to **villapaitapeli.shaky136@passmail.net**.

You can also use the [anonymous feedback pad](https://pad.riseup.net/p/MqxWfBo7cIo-x0yPks6g-keep).

## Disclaimer

The information comes from open sources. Follow the law and your organization rules.

## Privacy

The website uses Cloudflare Web Analytics. It counts visits and page use. It does not use cookies. It does not collect personal data or store unique IDs. The app has no user accounts, logins, or forms.

![Military Russian 101](docs/end.png)
