/**
 * Russian military ranks: Finnish and Russian names per branch.
 * Used for Sotilasarvot game. One entry per rank (not per image).
 *
 * Image naming:
 * - One image per rank:  Sotamies.jpg  → rank "Sotamies"
 * - Multiple images:     Sotamies_1.jpg, Sotamies_2.jpg  → same rank "Sotamies"
 *   (the _1, _2 etc. are only to keep filenames unique; the correct answer is still the rank name.)
 *
 * How to add:
 * 1. Add image(s) in public/assets/sotilasarvot/Maavoimat/ or .../Merivoimat/
 * 2. Add one entry here per rank (fi = rank name as in filename before _1/_2; ru = Russian name).
 * 3. Run: node scripts/list-ranks-images.cjs
 */

export type RanksBranchId = 'maavoimat' | 'merivoimat'

export interface RankEntry {
  /** Finnish rank name – matches image name (e.g. Sotamies for Sotamies.jpg or Sotamies_1.jpg) */
  fi: string
  /** Russian rank name (e.g. "Рядовой") */
  ru: string
}

export const RANKS_DATA: Record<RanksBranchId, RankEntry[]> = {
  maavoimat: [
    { fi: 'Sotamies', ru: 'Рядовой' },
    { fi: 'Korpraali', ru: 'Ефрейтор' },
    { fi: 'Alikersantti', ru: 'Младший сержант' },
    { fi: 'Kersantti', ru: 'Сержант' },
    { fi: 'Ylikersantti', ru: 'Старший сержант' },
    { fi: 'Vääpeli', ru: 'Старшина' },  
    { fi: 'Kadetti', ru: 'Курса́нт' },
    { fi: 'Vänrikki', ru: 'Прапорщик' },
    { fi: 'Ylivänrikki', ru: 'Старший прапорщик' },
    { fi: 'Aliluutnantti', ru: 'Младший лейтенант' },
    { fi: 'Luutnantti', ru: 'Лейтенант' },
    { fi: 'Yliluutnantti', ru: 'Старший лейтенант' },
    { fi: 'Kapteeni', ru: 'Капитан' },
    { fi: 'Majuri', ru: 'Майор' },
    { fi: 'Everstiluutnantti', ru: 'Подполковник' },
    { fi: 'Eversti', ru: 'Полковник' },
    { fi: 'Kenraalimajuri', ru: 'Генерал-майор' },
    { fi: 'Kenraaliluutnantti', ru: 'Генерал-лейтенант' },
    { fi: 'Kenraalieversti', ru: 'Генерал-полковник' },
    { fi: 'Armeijankenraali', ru: 'Генерал армии' },
    { fi: 'Venäjän federaation marsalkka', ru: 'Маршал Российской Федерации' },
  ],
  merivoimat: [
    { fi: 'Matruusi', ru: 'Матрос' },
    { fi: 'Ylimatruusi', ru: 'Старший матрос' },
    { fi: '2_luokan_starshina', ru: 'Старшина 2 статьи' },
    { fi: '1_luokan_starshina', ru: 'Старшина 1 статьи' },
    { fi: 'Ylistarshina', ru: 'Главный старшина' },
    { fi: 'Laivaston_ylistarshina', ru: 'Главный корабельный старшина' },
    { fi: 'Kadetti', ru: 'Курса́нт' },
    { fi: 'Mitsin', ru: 'Мичман' },
    { fi: 'Ylimitsin', ru: 'Старший мичман' },
    { fi: 'Aliluutnantti', ru: 'Младший лейтенант' },
    { fi: 'Luutnantti', ru: 'Лейтенант' },
    { fi: 'Yliluutnantti', ru: 'Старший лейтенант' },
    { fi: 'Kapteeniluutnantti', ru: 'Капитан-лейтенант' },
    { fi: '3_rivin_kapteeni', ru: 'Капитан 3 ранга' },
    { fi: '2_rivin_kapteeni', ru: 'Капитан 2 ранга' },
    { fi: '1_rivin_kapteeni', ru: 'Капитан 1 ранга' },
    { fi: 'Kontraamiraali', ru: 'Контр-адмирал' },
    { fi: 'Varaamiraali', ru: 'Вице-адмирал' },
    { fi: 'Amiraali', ru: 'Адмирал' },
    { fi: 'Laivastoamiraali', ru: 'Адмирал флота' },
  ],
}
