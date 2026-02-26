/**
 * Russian military ranks: Finnish, English and Russian names per branch.
 * Used for Sotilasarvot game. One entry per rank (not per image).
 */

export type RanksBranchId = 'maavoimat' | 'merivoimat'

export interface RankEntry {
  /** Finnish rank name - matches image name. */
  fi: string
  /** English rank name used in ENG mode. */
  en?: string
  /** Russian rank name. */
  ru: string
}

export const RANKS_DATA: Record<RanksBranchId, RankEntry[]> = {
  maavoimat: [
    { fi: 'Sotamies', en: 'Private', ru: 'Рядовой' },
    { fi: 'Korpraali', en: 'Corporal', ru: 'Ефрейтор' },
    { fi: 'Alikersantti', en: 'Junior Sergeant', ru: 'Младший сержант' },
    { fi: 'Kersantti', en: 'Sergeant', ru: 'Сержант' },
    { fi: 'Ylikersantti', en: 'Senior Sergeant', ru: 'Старший сержант' },
    { fi: 'Vääpeli', en: 'Starshina', ru: 'Старшина' },
    { fi: 'Kadetti', en: 'Cadet', ru: 'Курсант' },
    { fi: 'Vänrikki', en: 'Praporshchik', ru: 'Прапорщик' },
    { fi: 'Ylivänrikki', en: 'Senior Praporshchik', ru: 'Старший прапорщик' },
    { fi: 'Aliluutnantti', en: 'Junior Lieutenant', ru: 'Младший лейтенант' },
    { fi: 'Luutnantti', en: 'Lieutenant', ru: 'Лейтенант' },
    { fi: 'Yliluutnantti', en: 'Senior Lieutenant', ru: 'Старший лейтенант' },
    { fi: 'Kapteeni', en: 'Captain', ru: 'Капитан' },
    { fi: 'Majuri', en: 'Major', ru: 'Майор' },
    { fi: 'Everstiluutnantti', en: 'Lieutenant Colonel', ru: 'Подполковник' },
    { fi: 'Eversti', en: 'Colonel', ru: 'Полковник' },
    { fi: 'Kenraalimajuri', en: 'Major General', ru: 'Генерал-майор' },
    { fi: 'Kenraaliluutnantti', en: 'Lieutenant General', ru: 'Генерал-лейтенант' },
    { fi: 'Kenraalieversti', en: 'Colonel General', ru: 'Генерал-полковник' },
    { fi: 'Armeijankenraali', en: 'General of the Army', ru: 'Генерал армии' },
    { fi: 'Venäjän federaation marsalkka', en: 'Marshal of the Russian Federation', ru: 'Маршал Российской Федерации' },
  ],
  merivoimat: [
    { fi: 'Matruusi', en: 'Seaman', ru: 'Матрос' },
    { fi: 'Ylimatruusi', en: 'Senior Seaman', ru: 'Старший матрос' },
    { fi: '2_luokan_starshina', en: 'Starshina 2nd Class', ru: 'Старшина 2 статьи' },
    { fi: '1_luokan_starshina', en: 'Starshina 1st Class', ru: 'Старшина 1 статьи' },
    { fi: 'Ylistarshina', en: 'Chief Starshina', ru: 'Главный старшина' },
    { fi: 'Laivaston_ylistarshina', en: 'Chief Ship Starshina', ru: 'Главный корабельный старшина' },
    { fi: 'Kadetti', en: 'Cadet', ru: 'Курсант' },
    { fi: 'Mitsin', en: 'Midshipman', ru: 'Мичман' },
    { fi: 'Ylimitsin', en: 'Senior Midshipman', ru: 'Старший мичман' },
    { fi: 'Aliluutnantti', en: 'Junior Lieutenant', ru: 'Младший лейтенант' },
    { fi: 'Luutnantti', en: 'Lieutenant', ru: 'Лейтенант' },
    { fi: 'Yliluutnantti', en: 'Senior Lieutenant', ru: 'Старший лейтенант' },
    { fi: 'Kapteeniluutnantti', en: 'Lieutenant Commander', ru: 'Капитан-лейтенант' },
    { fi: '3_rivin_kapteeni', en: 'Captain 3rd Rank', ru: 'Капитан 3 ранга' },
    { fi: '2_rivin_kapteeni', en: 'Captain 2nd Rank', ru: 'Капитан 2 ранга' },
    { fi: '1_rivin_kapteeni', en: 'Captain 1st Rank', ru: 'Капитан 1 ранга' },
    { fi: 'Kontraamiraali', en: 'Rear Admiral', ru: 'Контр-адмирал' },
    { fi: 'Varaamiraali', en: 'Vice Admiral', ru: 'Вице-адмирал' },
    { fi: 'Amiraali', en: 'Admiral', ru: 'Адмирал' },
    { fi: 'Laivastoamiraali', en: 'Admiral of the Fleet', ru: 'Адмирал флота' },
  ],
}
