"""Build the reviewed case bank. Requires scripts/case-data-requirements.txt.

Only dictionary-backed single nouns with a unique full twelve-cell paradigm enter
this bank. Every source CSV row is audited, including abbreviation/prompt lists.
No source vocabulary files are modified. Run from the repository root.
"""
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
import pymorphy3

ROOT = Path('public/data')
OUT = ROOT / 'cases'
CASES = dict(nominative='nomn', genitive='gent', dative='datv', accusative='accs', instrumental='ablt', prepositional='loct')
NUMBERS = dict(singular='sing', plural='plur')
# These senses are mass/collective or abstract in this bank. Dictionary plurals
# may denote different senses (weapons, waters, weather patterns, etc.).
EXCLUDED_SENSES = set('''оружие техника оборудование электрооборудование вооружение пехота артиллерия погода помощь сопротивление информация безопасность кибербезопасность терроризм преступность инфраструктура снабжение обслуживание обеспечение поддержка топография рельеф проволока тыл листва еда вода данные сведения войска оперение киберпространство восток запад север юг огонь участие внезапность стрельба'''.split())
BAD_TAGS = {'Sgtm', 'Pltm', 'Fixd', 'Name', 'Surn', 'Patr', 'Geox', 'Orgn', 'Trad', 'Abbr'}
BAD_FORMS = {'Infr', 'Slng', 'Arch', 'Erro', 'Dist', 'Vulg', 'Litr', 'V-be', 'V-bi'}
morph = pymorphy3.MorphAnalyzer()

def normalized(text):
    return re.sub('[\u0300-\u036f]', '', text).lower().strip()

def paradigm(parse):
    result = {}
    for number, num in NUMBERS.items():
        result[number] = {}
        for case, tag in CASES.items():
            required = {num, tag}
            preferred = parse.inflect(required)
            variants = [p for p in parse.lexeme if required <= p.tag.grammemes and not (BAD_FORMS & p.tag.grammemes)]
            if not preferred or not variants:
                return None
            forms = [preferred.word] + [p.word for p in variants]
            # Validate each spelling against the same dictionary lemma, number,
            # case and animacy. No suffix synthesis or predicted-word parses.
            checked = []
            for form in dict.fromkeys(forms):
                if any(p.normal_form == parse.normal_form and p.tag.POS == 'NOUN' and required <= p.tag.grammemes and p.tag.animacy == parse.tag.animacy for p in morph.parse(form)):
                    checked.append(form)
            if not checked:
                return None
            result[number][case] = checked
    return result

entries, audit = {}, []
for source in sorted(ROOT.glob('*.csv')):
    with source.open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    english_path = ROOT / 'en' / source.name
    en_rows = []
    if english_path.exists():
        with english_path.open(encoding='utf-8-sig', newline='') as f:
            en_rows = list(csv.reader(f))
    prompt_format = rows[0][0].strip().lower() == 'prompt'
    has_header = rows[0][0].strip().lower() in {'russian', 'ru', 'prompt'}
    en_map = {normalized(r[0]): r[1].strip() for r in en_rows if len(r) >= 2}
    for index, row in enumerate(rows[int(has_header):], start=2 if has_header else 1):
        if len(row) < 2:
            audit.append(dict(file=source.name, row=index, status='excluded', reason='Malformed row'))
            continue
        original = row[1].strip() if prompt_format else row[0].strip()
        record = dict(file=source.name, row=index, russian=original)
        def exclude(reason):
            audit.append(dict(record, status='excluded', reason=reason))
        if prompt_format:
            exclude('Abbreviation expansion; no independent noun translation'); continue
        # Context notes remain in source references and translations, not in the lemma.
        word = normalized(re.sub(r'\s*\([^)]*\)', '', original))
        if not re.fullmatch('[а-яё]+(?:-[а-яё]+)*', word):
            exclude('Phrase, abbreviation or non-noun expression; not a standalone noun'); continue
        if word in EXCLUDED_SENSES:
            exclude('Mass/collective sense or restricted number; unsuitable for shared singular/plural bank'); continue
        if word in {'справа', 'течь', 'левый', 'правый', 'взрывной', 'военный'}:
            exclude('Source meaning is an adverb, verb or adjective, not the dictionary noun homograph'); continue
        if word == 'корпус':
            exclude('Military corps needs корпуса; installed dictionary prefers корпусы for a different sense'); continue
        fi, en = row[1].strip(), en_map.get(normalized(original))
        if not en or re.search('[А-Яа-яЁё]', fi + en):
            exclude('Missing or invalid bilingual translation'); continue
        parses = [p for p in morph.parse(word) if p.tag.POS == 'NOUN' and p.normal_form == word and p.tag.case == 'nomn' and p.tag.number == 'sing' and not (BAD_TAGS & p.tag.grammemes) and p.tag.gender in {'masc', 'femn', 'neut'} and p.tag.animacy in {'anim', 'inan'} and all(method[0].__class__.__name__ == 'DictionaryAnalyzer' for method in p.methods_stack)]
        if not parses:
            exclude('No eligible dictionary-backed singular nominative noun (non-noun, plural-only, indeclinable or unknown)'); continue
        choices = {}
        for parse in parses:
            forms = paradigm(parse)
            if forms and len({v for cells in forms.values() for variants in cells.values() for v in variants}) > 2:
                key = json.dumps([parse.tag.gender, parse.tag.animacy, forms], sort_keys=True)
                choices[key] = (parse, forms)
        if len(choices) != 1:
            exclude('Incomplete or ambiguous dictionary paradigm'); continue
        parse, forms = next(iter(choices.values()))
        source_ref = dict(file=source.name, row=index, russian=original, finnish=fi, english=en)
        if word not in entries:
            entries[word] = dict(id='noun-' + hashlib.sha256(word.encode()).hexdigest()[:12], lemma=word, gender={'masc':'masculine','femn':'feminine','neut':'neuter'}[parse.tag.gender], animate=parse.tag.animacy == 'anim', translations=dict(fi=fi,en=en), sources=[], forms=forms)
        # Different source senses must not silently replace translations.
        entries[word]['sources'].append(source_ref)
        audit.append(dict(record, status='included', nounId=entries[word]['id'], reason='Dictionary paradigm verified in all 12 cells'))
OUT.mkdir(exist_ok=True)
metadata = dict(engine='pymorphy3 2.0.6', dictionary='pymorphy3-dicts-ru 2.4.417150.4580142 / OpenCorpora', license='CC BY-SA 3.0 (OpenCorpora-derived inflection data)', attribution='OpenCorpora contributors, https://opencorpora.org/; compiled with pymorphy3', sourceHashes={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(ROOT.glob('*.csv')) + sorted((ROOT/'en').glob('*.csv'))}, cases=list(CASES), notes='Only dictionary-backed forms; native Russian spelling including ё. See docs/case-practice.md.')
(OUT/'nouns.json').write_text(json.dumps(dict(metadata=metadata, nouns=list(entries.values())), ensure_ascii=False, indent=2)+'\n')
Path('docs/case-vocabulary-audit.json').write_text(json.dumps(dict(summary=dict(Counter(r['status'] for r in audit)), uniqueNouns=len(entries), rows=audit), ensure_ascii=False, indent=2)+'\n')
print('Included nouns:',len(entries),'Audit:',dict(Counter(r['status'] for r in audit)))
for word, e in entries.items():
    print(word, e['gender'], e['animate'], '; '.join('/'.join(e['forms'][num][case]) for num in NUMBERS for case in CASES))
