# Päivitykset

Tämä tiedosto on kertymäluettelo: uusimmat versiot on listattu ylhäällä. Vanhoja versioita ei poisteta.

**Nykyinen versio:** 1.0.4

---

## Versio 1.0.4 (2026-02-25)

Tämän päivityksen painopiste oli UI/UX-siistimisessä, pelivalikon kulun selkeyttämisessä ja taktisten merkkien sisällöntuessa.

- Lisätty tuki taktisten merkkien kuvien lataamiselle **.png**-tiedostoista ja päivitetty taktisten merkkien polkujen muodostus / generointityöflow.
- Muokattu pelivalikon hierarkiaa ja nimikkeitä (mukana numerointi- ja järjestysmuutoksia sekä uudelleennimeämisiä).
- Parannettu kerrostettujen valikkoponnahdusikkunoiden (popup) käytöstä ja päivitetty sulje/takaisin-toiminnot.
- Yhtenäistetty näkymien visuaalinen tyyli: fontit, tiiviimpi välistys, nappien reunukset ja värit.
- Päivitetty toimintanappien värikoodaus roolin mukaan:
  - koti/takaisin-napit **vihreiksi**
  - mykistysnapit **punaisiksi**
- Parannettu infosivujen otsakeasettelua (`Tietoa`, `Päivitykset`, `Lähteet ja lisenssit`) ja kohdistettu ohjaimet otsikoiden kanssa linjaan.
- Päivitetty otsikkoalueen “brändäys”/grafiikat (faviconin koko ja sijainti sekä Suomen/Ukrainan lippujen sijoittelu splash- ja valikkoruuduilla).
- Hienosäädetty pelin HUD-asettelua (koti/mykistys-nappien sijainti, otsikon näyttö, laskurit ja kertausnapin paikka).

Päivityksen tavoitteena on tehdä navigoinnista selkeämpää, visuaalisesta hierarkiasta rauhallisempi ja pelinäkymistä keskenään yhtenäisempiä.

---

## Versio 1.0.3

### Sanasto (Sotilasvenäjän sanasto)

- **Käännössuunta:** Käännössuunnan valinta on siirretty popup-ikkunaan. Suunta valitaan vasta, kun olet valinnut sanalistan (1.1 Sotilassanasto). Lyhenteet (1.2) eivät kysy suuntaa; peli käyttää suuntaa suomi → venäjä.
- **Numerointi:** Sanasto: 1.1 Sotilassanasto (1.1.1–1.1.8), 1.2 Lyhenteet (1.2.1–1.2.7). Yleissanasto (1.2 / 1.2.1) on poistettu.
- **Lyhenteet:** Lyhenteet-moduuli (1.2) on oma kategoriansa kuudella alilistalla + Kertaus (1.2.7). Jokainen lista lukee oman CSV-tiedostonsa (`lyhenteet-turvallisuus.csv` jne.) muodossa **prompt,ve1,ve2,ve3,ve4** (yksi kysymysrivi, neljä venäjänkielistä vaihtoehtoa; ve1 = oikea vastaus).
- **Popup:** Sanaston käännössuunta valitaan popup-ikkunasta: "Valitse sanaston käännössuunta" – "Vastaa suomeksi" / "Vastaa по-русски".
- **Lyhenteet-näkymä:** Lyhenteet-kysymysruudussa prompt-teksti näytetään samankokoisena kuin vastausnapit.

### Kertaus (kerrattavat listat)

- **Kertaus toteutettu:** Sanasto-, lyhenne-, sotilaspiiri- ja sotilasarvopelissä on oma kerrattava listansa. Voit lisätä kohdan listalle (vihreä nappi) tai poistaa (punainen nappi); Kertaus-valinnalla pelataan vain omalta listalta.
- **Yhtenäinen nimi:** Kaikki kerrattava-listat ovat nimeltään **Kertaus** jokaisessa moduulissa: 1.1.8 Kertaus (sanasto), 1.2.7 Kertaus (lyhenteet), Kertaus (sotilaspiirit), 3.1.3 Kertaus (Suomeksi) ja 3.1.4 Kertaus (Venäjäksi) (sotilasarvot).
- **Ei kierroslaskuria:** Kertaus-napissa ei näytetä x/100 -kierroslaskuria; Kertaus-pelit ovat rajattomia.

### Tekninen

- Sanastotiedostot: tuki 2-, 5- ja 8-sarakkeisille CSV-muodoille. 5-sarakkeinen muoto (prompt, ve1, ve2, ve3, ve4) käytössä Lyhenteet-listojen yhteydessä.
- Sanalistat latautuvat `public/data/` -kansiosta. UTF-8 -merkistö.

---

*Kun julkaiset uuden version: lisää uusi **## Versio X.Y.Z** -otsikko yllä (uusimman alle) ja kuvaa muutokset. Älä poista aiempien versioiden kuvauksia.*
