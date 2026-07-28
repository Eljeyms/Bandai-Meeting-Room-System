import { useState } from 'react'
import {
  HiOutlineArrowRight,
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

const initialTemplates = [
  { id: 'standard', name: 'Standard Meeting', description: 'General team meetings with a 30-minute default duration.', duration: '30 min', buffer: '5 min buffer', icon: HiOutlineCalendarDays, active: true },
  { id: 'client', name: 'Client Presentation', description: 'Presentation-ready room setup with an arrival allowance.', duration: '60 min', buffer: '15 min buffer', icon: HiOutlineUserGroup, active: true },
  { id: 'workshop', name: 'Team Workshop', description: 'Long-form collaboration session with equipment preparation.', duration: '120 min', buffer: '15 min buffer', icon: HiOutlineBolt, active: true },
  { id: 'quick', name: 'Quick Huddle', description: 'Short discussion with no room preparation requirement.', duration: '15 min', buffer: 'No buffer', icon: HiOutlineClock, active: false },
]

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [message, setMessage] = useState('')

  const toggleTemplate = (id: string) => {
    setTemplates((current) => current.map((template) => (
      template.id === id ? { ...template, active: !template.active } : template
    )))
    setMessage('Template status updated.')
  }

  return (
    <div className="workflow-page">
      <section className="card workflow-intro">
        <div>
          <p className="eyebrow">Booking standards</p>
          <h2>Workflow Templates</h2>
          <p>Set consistent meeting lengths, room preparation time, and booking rules.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setMessage('A new workflow template can now be configured.')}>New template</button>
      </section>

      {message && <div className="form-message" role="status">{message}</div>}

      <section className="template-grid" aria-label="Workflow templates">
        {templates.map((template) => {
          const Icon = template.icon
          return (
            <article className="card template-card" key={template.id}>
              <header>
                <span className="template-icon"><Icon /></span>
                <span className={`template-status ${template.active ? 'active' : ''}`}>
                  <HiOutlineCheckCircle /> {template.active ? 'Active' : 'Paused'}
                </span>
              </header>
              <div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
              <dl>
                <div><dt>Default duration</dt><dd>{template.duration}</dd></div>
                <div><dt>Room preparation</dt><dd>{template.buffer}</dd></div>
              </dl>
              <footer>
                <button type="button" className="template-toggle" onClick={() => toggleTemplate(template.id)}>
                  {template.active ? 'Pause template' : 'Activate template'}
                </button>
                <a href="#/schedule">Use template <HiOutlineArrowRight /></a>
              </footer>
            </article>
          )
        })}
      </section>
    </div>
  )
}
