# Merivoimien kuvien nimeäminen (Alusluokat / Alusten nimet)

Kuvat sijaitsevat kansiossa `public/assets/vehicles/russia/navy/`. Nimen perusteella päätellään, miten **Alusluokat**- ja **Alusten nimet** -moduulissa näytetään oikea vastaus.

## Sääntö

- **Alaviiva (`_`)** on ainoa erotin **alusluokan** ja **aluksen nimen** välillä.
- **Loppunumero** (kuvan järjestys) voi olla joko **välilyönti + numero** tai **alaviiva + numero**.

### 1. Vain alusluokka (sama nimi molemmissa moduuleissa)

Kun kuvassa ei ole tiettyä alusta, vaan vain luokka:

- Käytä **välilyöntiä** ennen numeroa: `ivan gren 01.jpg`, `kilo 01.jpg`, `admiral gorshkov 02.jpg`
- Tai ilman numeroa: `ondatra.jpg`

**Tulos:** Nimi näkyy samana sekä Alusluokat- että Alusten nimet -moduulissa (esim. "Ivan Gren", "Kilo").

**Esimerkkejä:**

| Tiedosto            | Alusluokat  | Alusten nimet |
|---------------------|------------|---------------|
| ivan gren 01.jpg    | Ivan Gren  | Ivan Gren     |
| ivan gren 02.jpg    | Ivan Gren  | Ivan Gren     |
| admiral gorshkov 01.jpg | Admiral Gorshkov | Admiral Gorshkov |
| kilo 01.jpg         | Kilo       | Kilo          |

### 2. Alusluokka + aluksen nimi (eri moduuleissa eri nimi)

Kun kuvassa on tietty alus:

- Erotin luokan ja nimen välillä on **alaviiva**: `kilo_dimitrov_02.jpg`, `buyan-m_grad sviyazhsk.jpg`
- Loppunumero (kuvaindeksi) on **alaviiva + numero**: `_01`, `_02` (poistetaan automaattisesti)

**Tulos:** Alusluokat näyttää luokan, Alusten nimet aluksen nimen.

**Esimerkkejä:**

| Tiedosto                    | Alusluokat | Alusten nimet   |
|----------------------------|------------|-----------------|
| kilo_dimitrov_02.jpg       | Kilo       | Dimitrov        |
| buyan-m_grad sviyazhsk.jpg | Buyan-M    | Grad Sviyazhsk  |
| buyan-m_zelenyy dol .jpg   | Buyan-M    | Zelenyy Dol     |
| nanuchka_geyzer.jpg        | Nanuchka   | Geyzer          |

## Yhteenveto

- **Välilyönti ennen numeroa** (tai ei numeroa) → vain luokka, sama nimi molemmissa.
- **Alaviiva luokan ja nimen välissä** → Alusluokat = luokka, Alusten nimet = aluksen nimi.

Uusien kuvien jälkeen aja: `node scripts/list-navy-images.cjs` ja käynnistä sovellus uudelleen.
