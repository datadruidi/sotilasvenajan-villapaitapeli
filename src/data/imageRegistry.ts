/**
 * Image registry – source of truth for all quiz images.
 * Each image is explicitly associated with country, branch, and correct class name.
 * Folder structure is for asset organization only; game logic uses this list.
 */

import type { ImageEntry } from '../types/game'

const PLACEHOLDER = '/assets/vehicles/placeholder.svg'

/**
 * All images that may appear in the game. Only entries with active: true
 * are included in the filtered pool. Add or remove entries here to control
 * which images are used; ensure each branch has enough distinct class names
 * to generate 4 options (1 correct + 3 plausible wrong).
 */
export const IMAGE_REGISTRY: ImageEntry[] = [
  // Russia – Navy
{ id: 'ru-navy-admiral-gorshkov-01', assetPath: '/assets/vehicles/russia/navy/admiral_gorshkov/admiral_gorshkov_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Admiral Gorshkov class', active: true },
{ id: 'ru-navy-admiral-gorshkov-02', assetPath: '/assets/vehicles/russia/navy/admiral_gorshkov/admiral_gorshkov_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Admiral Gorshkov class', active: true },
{ id: 'ru-navy-admiral-gorshkov-03', assetPath: '/assets/vehicles/russia/navy/admiral_gorshkov/admiral_gorshkov_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Admiral Gorshkov class', active: true },

{ id: 'ru-navy-borei-01', assetPath: '/assets/vehicles/russia/navy/borei/borei_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Borei class', active: true },
{ id: 'ru-navy-borei-02', assetPath: '/assets/vehicles/russia/navy/borei/borei_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Borei class', active: true },
{ id: 'ru-navy-borei-03', assetPath: '/assets/vehicles/russia/navy/borei/borei_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Borei class', active: true },

{ id: 'ru-navy-buyan-m-01', assetPath: '/assets/vehicles/russia/navy/buyan_m/buyan_m_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Buyan-M class', active: true },
{ id: 'ru-navy-buyan-m-02', assetPath: '/assets/vehicles/russia/navy/buyan_m/buyan_m_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Buyan-M class', active: true },
{ id: 'ru-navy-buyan-m-03', assetPath: '/assets/vehicles/russia/navy/buyan_m/buyan_m_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Buyan-M class', active: true },

{ id: 'ru-navy-ivan-gren-01', assetPath: '/assets/vehicles/russia/navy/ivan_gren/ivan_gren_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ivan Gren class', active: true },
{ id: 'ru-navy-ivan-gren-02', assetPath: '/assets/vehicles/russia/navy/ivan_gren/ivan_gren_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ivan Gren class', active: true },
{ id: 'ru-navy-ivan-gren-03', assetPath: '/assets/vehicles/russia/navy/ivan_gren/ivan_gren_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ivan Gren class', active: true },

{ id: 'ru-navy-karakurt-01', assetPath: '/assets/vehicles/russia/navy/karakurt/karakurt_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Karakurt class', active: true },
{ id: 'ru-navy-karakurt-02', assetPath: '/assets/vehicles/russia/navy/karakurt/karakurt_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Karakurt class', active: true },
{ id: 'ru-navy-karakurt-03', assetPath: '/assets/vehicles/russia/navy/karakurt/karakurt_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Karakurt class', active: true },

{ id: 'ru-navy-kilo-01', assetPath: '/assets/vehicles/russia/navy/kilo/kilo_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kilo class', active: true },
{ id: 'ru-navy-kilo-02', assetPath: '/assets/vehicles/russia/navy/kilo/kilo_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kilo class', active: true },
{ id: 'ru-navy-kilo-03', assetPath: '/assets/vehicles/russia/navy/kilo/kilo_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kilo class', active: true },

{ id: 'ru-navy-kirov-01', assetPath: '/assets/vehicles/russia/navy/kirov/kirov_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kirov class', active: true },
{ id: 'ru-navy-kirov-02', assetPath: '/assets/vehicles/russia/navy/kirov/kirov_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kirov class', active: true },
{ id: 'ru-navy-kirov-03', assetPath: '/assets/vehicles/russia/navy/kirov/kirov_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Kirov class', active: true },

{ id: 'ru-navy-krivak-01', assetPath: '/assets/vehicles/russia/navy/krivak/krivak_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Krivak class', active: true },
{ id: 'ru-navy-krivak-02', assetPath: '/assets/vehicles/russia/navy/krivak/krivak_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Krivak class', active: true },
{ id: 'ru-navy-krivak-03', assetPath: '/assets/vehicles/russia/navy/krivak/krivak_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Krivak class', active: true },

{ id: 'ru-navy-lada-01', assetPath: '/assets/vehicles/russia/navy/lada/lada_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Lada class', active: true },
{ id: 'ru-navy-lada-02', assetPath: '/assets/vehicles/russia/navy/lada/lada_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Lada class', active: true },
{ id: 'ru-navy-lada-03', assetPath: '/assets/vehicles/russia/navy/lada/lada_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Lada class', active: true },

{ id: 'ru-navy-neustrashimy-01', assetPath: '/assets/vehicles/russia/navy/neutrashimy/neutrashimy_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Neustrashimy class', active: true },
{ id: 'ru-navy-neustrashimy-02', assetPath: '/assets/vehicles/russia/navy/neutrashimy/neutrashimy_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Neustrashimy class', active: true },
{ id: 'ru-navy-neustrashimy-03', assetPath: '/assets/vehicles/russia/navy/neutrashimy/neutrashimy_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Neustrashimy class', active: true },

{ id: 'ru-navy-ropucha-01', assetPath: '/assets/vehicles/russia/navy/ropucha/ropucha_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ropucha class', active: true },
{ id: 'ru-navy-ropucha-02', assetPath: '/assets/vehicles/russia/navy/ropucha/ropucha_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ropucha class', active: true },
{ id: 'ru-navy-ropucha-03', assetPath: '/assets/vehicles/russia/navy/ropucha/ropucha_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Ropucha class', active: true },

{ id: 'ru-navy-slava-01', assetPath: '/assets/vehicles/russia/navy/slava/slava_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Slava class', active: true },
{ id: 'ru-navy-slava-02', assetPath: '/assets/vehicles/russia/navy/slava/slava_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Slava class', active: true },
{ id: 'ru-navy-slava-03', assetPath: '/assets/vehicles/russia/navy/slava/slava_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Slava class', active: true },

{ id: 'ru-navy-sovremenny-01', assetPath: '/assets/vehicles/russia/navy/sovremenny/sovremenny_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Sovremenny class', active: true },
{ id: 'ru-navy-sovremenny-02', assetPath: '/assets/vehicles/russia/navy/sovremenny/sovremenny_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Sovremenny class', active: true },
{ id: 'ru-navy-sovremenny-03', assetPath: '/assets/vehicles/russia/navy/sovremenny/sovremenny_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Sovremenny class', active: true },

{ id: 'ru-navy-steregushchiy-01', assetPath: '/assets/vehicles/russia/navy/steregushchiy/steregushchiy_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Steregushchiy class', active: true },
{ id: 'ru-navy-steregushchiy-02', assetPath: '/assets/vehicles/russia/navy/steregushchiy/steregushchiy_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Steregushchiy class', active: true },
{ id: 'ru-navy-steregushchiy-03', assetPath: '/assets/vehicles/russia/navy/steregushchiy/steregushchiy_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Steregushchiy class', active: true },

{ id: 'ru-navy-typhoon-01', assetPath: '/assets/vehicles/russia/navy/typhoon/typhoon_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Typhoon class', active: true },
{ id: 'ru-navy-typhoon-02', assetPath: '/assets/vehicles/russia/navy/typhoon/typhoon_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Typhoon class', active: true },
{ id: 'ru-navy-typhoon-03', assetPath: '/assets/vehicles/russia/navy/typhoon/typhoon_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Typhoon class', active: true },

{ id: 'ru-navy-udaloy-01', assetPath: '/assets/vehicles/russia/navy/udaloy/udaloy_01.jpg', country: 'russia', branch: 'navy', correctClassName: 'Udaloy class', active: true },
{ id: 'ru-navy-udaloy-02', assetPath: '/assets/vehicles/russia/navy/udaloy/udaloy_02.jpg', country: 'russia', branch: 'navy', correctClassName: 'Udaloy class', active: true },
{ id: 'ru-navy-udaloy-03', assetPath: '/assets/vehicles/russia/navy/udaloy/udaloy_03.jpg', country: 'russia', branch: 'navy', correctClassName: 'Udaloy class', active: true },


  // Russia – Army
  { id: 'ru-army-1', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'T-90 class', active: true },
  { id: 'ru-army-2', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'T-72 class', active: true },
  { id: 'ru-army-3', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'BMP-3 class', active: true },
  { id: 'ru-army-4', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'BTR-82A class', active: true },
  { id: 'ru-army-5', assetPath: PLACEHOLDER, country: 'russia', branch: 'army', correctClassName: 'Kurganets class', active: true },
  // Russia – Air Force (Ilmavoimat)
  { id: 'ru-airforce-a50-01', assetPath: '/assets/vehicles/russia/airforce/A-50/A-50_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'A-50 class', active: true },
  { id: 'ru-airforce-a50-02', assetPath: '/assets/vehicles/russia/airforce/A-50/A-50_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'A-50 class', active: true },
  { id: 'ru-airforce-an124-01', assetPath: '/assets/vehicles/russia/airforce/An-124/An-124_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'An-124 class', active: true },
  { id: 'ru-airforce-an124-02', assetPath: '/assets/vehicles/russia/airforce/An-124/An-124_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'An-124 class', active: true },
  { id: 'ru-airforce-il20-01', assetPath: '/assets/vehicles/russia/airforce/Il-20/Il-20_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-20 class', active: true },
  { id: 'ru-airforce-il20-02', assetPath: '/assets/vehicles/russia/airforce/Il-20/Il-20_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-20 class', active: true },
  { id: 'ru-airforce-il76-01', assetPath: '/assets/vehicles/russia/airforce/Il-76/Il-76_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-76 class', active: true },
  { id: 'ru-airforce-il76-02', assetPath: '/assets/vehicles/russia/airforce/Il-76/Il-76_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-76 class', active: true },
  { id: 'ru-airforce-il78-01', assetPath: '/assets/vehicles/russia/airforce/Il-78/Il-78_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-78 class', active: true },
  { id: 'ru-airforce-il78-02', assetPath: '/assets/vehicles/russia/airforce/Il-78/Il-78_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Il-78 class', active: true },
  { id: 'ru-airforce-mig31-01', assetPath: '/assets/vehicles/russia/airforce/Mig-31/MiG-31_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'MiG-31 class', active: true },
  { id: 'ru-airforce-mig31-02', assetPath: '/assets/vehicles/russia/airforce/Mig-31/MiG-31_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'MiG-31 class', active: true },
  { id: 'ru-airforce-su25-01', assetPath: '/assets/vehicles/russia/airforce/Su-25/su-25_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-25 class', active: true },
  { id: 'ru-airforce-su25-02', assetPath: '/assets/vehicles/russia/airforce/Su-25/su-25_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-25 class', active: true },
  { id: 'ru-airforce-su27-01', assetPath: '/assets/vehicles/russia/airforce/Su-27/su-27_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-27 class', active: true },
  { id: 'ru-airforce-su27-02', assetPath: '/assets/vehicles/russia/airforce/Su-27/su-27_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-27 class', active: true },
  { id: 'ru-airforce-su30-01', assetPath: '/assets/vehicles/russia/airforce/Su-30/su-30_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-30 class', active: true },
  { id: 'ru-airforce-su30-02', assetPath: '/assets/vehicles/russia/airforce/Su-30/su-30_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-30 class', active: true },
  { id: 'ru-airforce-su34-01', assetPath: '/assets/vehicles/russia/airforce/Su-34/su-34_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-34 class', active: true },
  { id: 'ru-airforce-su34-02', assetPath: '/assets/vehicles/russia/airforce/Su-34/su-34_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-34 class', active: true },
  { id: 'ru-airforce-su35-01', assetPath: '/assets/vehicles/russia/airforce/Su-35/su-35_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-35 class', active: true },
  { id: 'ru-airforce-su35-02', assetPath: '/assets/vehicles/russia/airforce/Su-35/su-35_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-35 class', active: true },
  { id: 'ru-airforce-su57-01', assetPath: '/assets/vehicles/russia/airforce/Su-57/Su-57_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-57 class', active: true },
  { id: 'ru-airforce-su57-02', assetPath: '/assets/vehicles/russia/airforce/Su-57/Su-57_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Su-57 class', active: true },
  { id: 'ru-airforce-tu160-01', assetPath: '/assets/vehicles/russia/airforce/Tu-160/Tu-160_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-160 class', active: true },
  { id: 'ru-airforce-tu160-02', assetPath: '/assets/vehicles/russia/airforce/Tu-160/Tu-160_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-160 class', active: true },
  { id: 'ru-airforce-tu214r-01', assetPath: '/assets/vehicles/russia/airforce/Tu-214R/Tu-214_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-214R class', active: true },
  { id: 'ru-airforce-tu214r-02', assetPath: '/assets/vehicles/russia/airforce/Tu-214R/Tu-214_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-214R class', active: true },
  { id: 'ru-airforce-tu22m-01', assetPath: '/assets/vehicles/russia/airforce/Tu-22M/Tu-22M_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-22M class', active: true },
  { id: 'ru-airforce-tu22m-02', assetPath: '/assets/vehicles/russia/airforce/Tu-22M/Tu-22M_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-22M class', active: true },
  { id: 'ru-airforce-tu95-01', assetPath: '/assets/vehicles/russia/airforce/Tu-95/Tu-95_01.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-95 class', active: true },
  { id: 'ru-airforce-tu95-02', assetPath: '/assets/vehicles/russia/airforce/Tu-95/Tu-95_02.jpg', country: 'russia', branch: 'airforce', correctClassName: 'Tu-95 class', active: true },
  // Russia – Other / Joint / Support
  { id: 'ru-other-1', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'S-400 class', active: true },
  { id: 'ru-other-2', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Iskander class', active: true },
  { id: 'ru-other-3', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Buk class', active: true },
  { id: 'ru-other-4', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Pantsir class', active: true },
  { id: 'ru-other-5', assetPath: PLACEHOLDER, country: 'russia', branch: 'other', correctClassName: 'Orlan class', active: true },
]
