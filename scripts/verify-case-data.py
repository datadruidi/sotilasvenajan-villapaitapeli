"""Independently re-parse every stored form with the pinned OpenCorpora engine."""
import hashlib
import json
import re
from pathlib import Path
import pymorphy3

bank = json.loads(Path('public/data/cases/nouns.json').read_text())
morph = pymorphy3.MorphAnalyzer()
cases = dict(nominative='nomn', genitive='gent', dative='datv', accusative='accs', instrumental='ablt', prepositional='loct')
count = 0
for path, expected in bank['metadata']['sourceHashes'].items():
    assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == expected, f'Source vocabulary changed: {path}'
for noun in bank['nouns']:
    assert noun['forms']['singular']['nominative'][0] == noun['lemma']
    for number, tag in [('singular','sing'),('plural','plur')]:
        for case, case_tag in cases.items():
            for form in noun['forms'][number][case]:
                assert any(p.tag.POS == 'NOUN' and p.normal_form == noun['lemma'] and p.tag.number == tag and p.tag.case == case_tag and (p.tag.animacy == 'anim') == noun['animate'] for p in morph.parse(form)), (noun['lemma'], number, case, form)
                count += 1
print(f'OpenCorpora verified {count} stored forms; all original vocabulary hashes match.')
