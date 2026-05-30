// ──────────────────────────────────────────────────────────────────────────────
// Questions page client — port of legacy script.js
// fetchPublicQuestions() + buildQuestionsPage() + setupQuestionForm().
//
// Fetches from a Google Apps Script endpoint, renders public questions
// reverse-chronologically, and wires the submission form. Honeypot field
// included to deter spam bots.
// ──────────────────────────────────────────────────────────────────────────────

const QUESTIONS_API_URL =
  'https://script.google.com/macros/s/AKfycbzxbY8YjtcawHMJpzdV4sc4slmI8-eqfv75MArLHGDiFRUx6TqVlbGLONh2UcVTm_Q7TQ/exec'

type Question = { id?: string; date: string; question: string; answer?: string }

function formatQuestionDate(dateString: string): string {
  const date = new Date(dateString)
  return date
    .toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
    })
    .replace(',', '  ')
}

let publicQuestions: Question[] = []

function renderList(): void {
  const container = document.getElementById('questions-list')
  if (!container) return

  const merged = [...publicQuestions]
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const seen = new Set<string>()
  const items = merged.filter((q) => {
    if (!q.question) return false
    const key = q.id ?? `${q.date}_${q.question}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  container.innerHTML = ''
  for (const item of items) {
    const entry = document.createElement('article')
    entry.className = 'question-entry'

    const meta = document.createElement('h3')
    meta.className = 'question-meta'
    meta.textContent = formatQuestionDate(item.date)
    entry.appendChild(meta)

    const question = document.createElement('div')
    question.className = 'question-text'
    question.textContent = item.question
    entry.appendChild(question)

    if (item.answer) {
      const answer = document.createElement('div')
      answer.className = 'question-answer'
      answer.textContent = item.answer
      entry.appendChild(answer)
    }

    container.appendChild(entry)
  }
}

async function fetchPublicQuestions(): Promise<void> {
  try {
    const res = await fetch(QUESTIONS_API_URL)
    if (!res.ok) throw new Error('Failed to fetch questions')
    const data = await res.json()
    publicQuestions = Array.isArray(data.questions) ? data.questions : []
  } catch (err) {
    console.error('Error fetching public questions:', err)
  } finally {
    renderList()
  }
}

function setupForm(): void {
  const form = document.getElementById('question-form') as HTMLFormElement | null
  const input = document.getElementById('question-input') as HTMLTextAreaElement | null
  const honeypot = document.getElementById('website-field') as HTMLInputElement | null
  const status = document.getElementById('question-status')
  if (!form || !input || !status) return
  if (form.dataset.bound === 'true') return
  form.dataset.bound = 'true'

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const question = input.value.trim()
    const website = honeypot ? honeypot.value.trim() : ''
    if (!question) return

    status.textContent = 'submitting...'
    try {
      const res = await fetch(QUESTIONS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ question, website }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Submission failed')

      input.value = ''
      if (honeypot) honeypot.value = ''
      status.textContent = 'submitted'
      await fetchPublicQuestions()
    } catch (err) {
      console.error('Error submitting question:', err)
      status.textContent = 'something went wrong'
    }
  })
}

function init(): void {
  setupForm()
  void fetchPublicQuestions()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
