import React, { useState } from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
const questions = [
  ['Who can register as a blood donor?', 'You can create a donor profile through Sign Up. Whether you can actually donate must be assessed by qualified healthcare staff using current eligibility guidelines.'],
  ['How do I search for donors by blood group and location?', 'Use Find Donor to narrow your search by blood group and area. Always confirm a donor’s availability and suitability before making arrangements.'],
  ['What information is needed to request blood?', 'A blood request should include the required blood group, units, hospital, urgency and contact details. The requesting clinical team must confirm compatibility and next steps.'],
  ['How are donor profiles and blood availability verified?', 'BloodConnect is a developing platform. Donor verification and availability checks require real operational processes; a profile on its own is not proof of eligibility or available blood.'],
  ['What should I do if blood is needed urgently?', 'Contact your treating hospital or local emergency medical services immediately. This website is not an emergency response system or a substitute for clinical care.'],
];
export default function FAQPreview() {
  const [open,setOpen]=useState(0);
  return <section className="bc-faq bc-section" id="bc-faq">
    <div className="bc-container bc-faq-grid">
      <Reveal><div className="bc-section-kicker"><span/> GOOD TO KNOW</div>
        <h2>Answers to<br/><em>common questions.</em></h2>
        <p className="bc-faq-desc">Clear guidance on donor registration, blood requests and using BloodConnect responsibly.</p>
        <div className="bc-faq-decoration"><Icon name="heart" size={45}/><span>Helpful answers. Safer decisions.</span></div>
      </Reveal>
      <Reveal delay={120}><div className="bc-accordion">{questions.map(([q,a],i)=><div className={`bc-faq-item ${open===i?'is-open':''}`} key={q}>
        <button onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i} aria-controls={`bc-faq-answer-${i}`}>
          <span><b>{String(i+1).padStart(2,'0')}</b>{q}</span><Icon name="chevron" size={19}/>
        </button>
        <div id={`bc-faq-answer-${i}`} className="bc-faq-answer" hidden={open!==i}><p>{a}</p></div>
      </div>)}</div></Reveal>
    </div>
  </section>;
}
