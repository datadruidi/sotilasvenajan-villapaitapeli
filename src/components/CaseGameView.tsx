import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { AppLanguage } from '../types/game'
import { CASE_IDS, CASE_NAMES } from '../types/cases'
import type { CaseNoun, CaseQuestion, GrammaticalNumber, RussianCase } from '../types/cases'
import { CASE_ENDINGS, CASE_GRAMMAR } from '../data/caseGrammar'
import { loadCaseNouns } from '../lib/caseData'
import { caseTaskKey, checkCaseAnswer, createCaseRound } from '../lib/caseGameLogic'
import { caseSentenceText, getCaseSentence } from '../lib/caseSentences'
import { getCaseReviewList, toggleCaseReview } from '../lib/caseReviewStorage'
import { playCorrect, playWrong, playRoundComplete } from '../lib/sound'
import './CaseGameView.css'

interface Props {
  mode: GrammaticalNumber | 'review'
  caseId: RussianCase
  appLanguage: AppLanguage
  muted: boolean
  onToggleMute: () => void
  onBack: () => void
  onRoundComplete: () => void
}

function InfoDialog({ title, children, closeLabel, onClose }: { title: string; children: ReactNode; closeLabel: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const opener = document.activeElement
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])
  return (
    <dialog ref={ref} className="case-info-dialog" aria-labelledby="case-info-title" onCancel={event => { event.preventDefault(); onClose() }}>
      <div className="case-info-header"><h2 id="case-info-title">{title}</h2><button type="button" className="back-btn back-btn-small" onClick={onClose}>{closeLabel}</button></div>
      {children}
    </dialog>
  )
}

export function CaseGameView({ mode, caseId, appLanguage, muted, onToggleMute, onBack, onRoundComplete }: Props) {
  const en = appLanguage === 'eng'
  const lang = en ? 'en' : 'fi'
  const [nouns, setNouns] = useState<CaseNoun[]>([])
  const [questions, setQuestions] = useState<CaseQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [info, setInfo] = useState<'translation' | 'grammar' | null>(null)
  const [review, setReview] = useState(getCaseReviewList)
  const answerLocked = useRef(false)
  const completed = useRef(false)
  const number = mode === 'plural' ? 'plural' : 'singular'
  const title = mode === 'review' ? (en ? 'Case Practice · Review' : 'Sijamuotopeli · Kertaus')
    : `6.${mode === 'singular' ? 1 : 2}.${CASE_IDS.indexOf(caseId) + 1}. ${CASE_NAMES[caseId][lang]}`

  useEffect(() => {
    let cancelled = false
    setError(false)
    loadCaseNouns().then(items => {
      if (cancelled) return
      setNouns(items)
      setQuestions(createCaseRound(items, mode === 'plural' ? 'plural' : 'singular', caseId, mode === 'review' ? getCaseReviewList() : undefined))
    }).catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [mode, caseId, attempt])

  const restart = () => {
    setQuestions(createCaseRound(nouns, number, caseId, mode === 'review' ? getCaseReviewList() : undefined))
    setIndex(0); setScore(0); setSelected(null); setFinished(false); setInfo(null)
    answerLocked.current = false; completed.current = false
  }
  const homeButton = <button type="button" className="back-btn back-btn-small game-home-btn" onClick={onBack} title={en ? 'Main menu' : 'Päävalikko'} aria-label={en ? 'Main menu' : 'Päävalikko'}>🏠</button>
  const muteButton = <button type="button" className="mute-btn mute-btn-small" onClick={onToggleMute} aria-label={en ? 'Toggle sound' : 'Äänet'}>{muted ? '🔇' : '🔊'}</button>
  const question = questions[index]
  if (!question || error) return (
    <div className="app"><main className="game-view case-game"><div className="quiz-header-actions">{homeButton}{muteButton}</div><h1>{title}</h1>
      <p role={error ? 'alert' : 'status'}>{error ? (en ? 'Could not load case exercises.' : 'Sijamuotoharjoitusten lataus epäonnistui.')
        : nouns.length && mode === 'review' ? (en ? 'No saved case exercises. Add words to review while practising.' : 'Ei tallennettuja sijamuototehtäviä. Lisää sanoja kerrattavaksi harjoittelun aikana.')
          : (en ? 'Loading exercises…' : 'Ladataan harjoituksia…')}</p>
      {error && <button type="button" className="quiz-next-btn" onClick={() => setAttempt(value => value + 1)}>{en ? 'Try again' : 'Yritä uudelleen'}</button>}
      <button type="button" className="result-btn result-btn-menu" onClick={onBack}>{en ? 'Main menu' : 'Päävalikko'}</button>
    </main></div>
  )
  if (finished) return (
    <div className="app"><main className="game-view game-view-result case-game">
      <div className="result-header">{homeButton}{muteButton}</div><h1 className="quiz-title">{title}</h1>
      <div className="result-scores"><div className="result-score-line">{en ? 'Round' : 'Kierros'}: 10/10</div><div className="result-score-line">{en ? 'Correct' : 'Oikein'}: {score}/10</div></div>
      <img src={`${import.meta.env.BASE_URL}assets/complete.png`} alt="" className="result-complete-img" />
      <h2 className="result-title">{en ? 'Round complete!' : 'Kierros suoritettu!'}</h2>
      <p>{en ? `You answered ${score} out of 10 correctly.` : `Vastasit oikein ${score} kysymykseen kymmenestä.`}</p>
      <div className="result-actions"><button type="button" className="result-btn result-btn-retry" onClick={restart}>{en ? 'Try again' : 'Yritä uudelleen'}</button><button type="button" className="result-btn result-btn-menu" onClick={onBack}>{en ? 'Main menu' : 'Päävalikko'}</button></div>
    </main></div>
  )
  const guide = CASE_GRAMMAR[question.caseId]
  const sentence = getCaseSentence(question, lang)
  const answered = selected !== null
  const correct = answered && checkCaseAnswer(question.options[selected], question)
  const saved = review.some(entry => caseTaskKey(entry) === caseTaskKey(question))
  const choose = (optionIndex: number) => {
    if (answerLocked.current) return
    answerLocked.current = true
    setSelected(optionIndex)
    if (checkCaseAnswer(question.options[optionIndex], question)) { setScore(value => value + 1); playCorrect(muted) }
    else playWrong(muted)
  }
  const next = () => {
    if (!answerLocked.current || completed.current) return
    setInfo(null)
    if (index === 9) {
      completed.current = true; setFinished(true); playRoundComplete(muted); onRoundComplete()
    } else { setIndex(value => value + 1); setSelected(null); answerLocked.current = false }
  }
  return (
    <div className="app"><main className="game-view game-view-quiz case-game">
      <header className="quiz-header"><div className="quiz-header-actions case-header-actions">{homeButton}{muteButton}<button type="button" className="case-grammar-info-btn" aria-label={en ? 'Show case grammar' : 'Näytä sijamuodon ohje'} onClick={() => setInfo('grammar')}>INFO</button></div><h1 className="quiz-title">{title}</h1><div className="quiz-progress quiz-progress-card"><span className="quiz-progress-line">{en ? 'Round' : 'Kierros'}: {index + 1}/10</span><span className="quiz-progress-line">{en ? 'Correct' : 'Oikein'}: {score}/10</span></div></header>
      <p className="case-lemma-label">{en ? 'Nominative · dictionary form' : 'Nominatiivi · perusmuoto'}</p>
      <div className="case-word-row"><p className="quiz-words-prompt" lang={question.caseId === 'nominative' ? lang : 'ru'}>{question.caseId === 'nominative' ? question.noun.translations[lang] : question.noun.lemma}</p><button type="button" className="case-info-btn" aria-label={en ? 'Show word translation' : 'Näytä sanan käännös'} onClick={() => setInfo('translation')}>ⓘ</button></div>
      <div className="case-sentence">
        <p className="case-context" lang="ru">{sentence.prompt}</p>
        <p className="case-context-translation" lang={lang}>{sentence.translation}</p>
      </div>
      <button type="button" className={`quiz-review-btn ${saved ? 'quiz-review-btn--remove' : 'quiz-review-btn--add'}`} onClick={() => setReview(toggleCaseReview(question))}>{saved ? (en ? 'Remove word from review list' : 'Poista sana kerrattavalta listalta') : (en ? 'Add word to review list' : 'Lisää sana kerrattavalle listalle')}</button>
      <div className="quiz-options">{question.options.map((form, optionIndex) => {
        const state = !answered ? '' : checkCaseAnswer(form, question) ? 'correct' : optionIndex === selected ? 'incorrect' : 'revealed'
        return <button key={optionIndex} type="button" className={`quiz-option ${state}`} onClick={() => choose(optionIndex)} disabled={answered} lang="ru">{form}</button>
      })}</div>
      {answered && <div className={`quiz-feedback ${correct ? 'correct' : 'incorrect'}`} role="status">{correct ? (en ? 'Correct!' : 'Oikein!') : (en ? 'Incorrect. Correct answer:' : 'Väärin. Oikea vastaus:')} <span lang="ru">{question.acceptedForms.map(form => caseSentenceText(question, form)).join(' / ')}</span></div>}
      {answered && <button type="button" className="quiz-next-btn" onClick={next}>{index === 9 ? (en ? 'Show results' : 'Näytä tulokset') : (en ? 'Next question' : 'Seuraava kysymys')}</button>}
      {info && <InfoDialog title={info === 'translation' ? (en ? 'Translation' : 'Käännös') : guide.name[lang]} closeLabel={en ? 'Close' : 'Sulje'} onClose={() => setInfo(null)}>
        {info === 'translation' ? <><p lang="ru" className="case-translation-word">{question.noun.lemma}</p><p>{question.noun.translations[lang]}</p></> : <>
          <h3 lang="ru">{guide.russian}</h3><p>{guide.questions[lang]}</p><p>{guide.use[lang]}</p>
          <div className="case-grammar-rules">
            <p>{en ? 'Common ending changes from the singular dictionary form. ∅ means no ending. Specific patterns (such as -ия) take precedence over general ones. Plural forms may have exceptions.' : 'Tavalliset päätemuutokset yksikön perusmuodosta. ∅ tarkoittaa nollapäätettä. Tarkempi sääntö (esim. -ия) ohittaa yleisen. Monikkomuodoissa on poikkeuksia.'}</p>
            {guide.rules.map(rule => <section key={rule.category}>
              <div className="case-endings-scroll">
                <table className="case-endings-table">
                  <caption>{({ M: en ? 'Masculine (M)' : 'Maskuliini (M)', F: en ? 'Feminine (F)' : 'Feminiini (F)', N: en ? 'Neuter (N)' : 'Neutri (N)', Plural: en ? 'Plural · all genders' : 'Monikko · kaikki suvut' })[rule.category]}</caption>
                  <thead><tr><th scope="col">{en ? 'Dictionary ending' : 'Perusmuodon pääte'}</th><th scope="col" aria-label={en ? 'Changes to' : 'Muuttuu'}>→</th><th scope="col">{en ? 'Case ending' : 'Sijamuodon pääte'}</th><th scope="col">{en ? 'Example' : 'Esimerkki'}</th></tr></thead>
                  <tbody>{CASE_ENDINGS[question.caseId][rule.category].map((change, row) => <tr key={row}>
                    <td lang="ru">{change.from}</td><td aria-hidden="true">→</td><td><span lang="ru">{change.to}</span>{question.caseId === 'accusative' && (rule.category === 'Plural' || (rule.category === 'M' && row < 2)) && <small>{row === 0 ? (en ? 'inanimate' : 'eloton') : (en ? 'animate' : 'elollinen')}</small>}</td><td lang="ru">{change.example}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              <p className="case-ending-note">{rule.text[lang]}</p>
            </section>)}
          </div>
          <h3>{en ? 'Special rules and exceptions' : 'Erityissäännöt ja poikkeukset'}</h3><p>{guide.exceptions[lang]}</p>
        </>}
      </InfoDialog>}
    </main></div>
  )
}
