import React, { useState } from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
const empty = {name:'',email:'',message:''};
export default function ContactPreview() {
  const [form,setForm]=useState(empty);
  const [notice,setNotice]=useState('');
  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.message.trim().length<12) {
      setNotice('Please enter your name, a valid email, and a message of at least 12 characters.');return;
    }
    setNotice('Demo only: your message was not sent. Connect an email service or backend first.');
    setForm(empty);
  };
  return <section className="bc-contact bc-section" id="bc-contact">
    <div className="bc-container bc-contact-layout">
      <Reveal><div className="bc-section-kicker"><span/> GET IN TOUCH</div>
        <h2>Every conversation<br/><em>can make a difference.</em></h2>
        <p>Have a question, an idea or feedback for the team? We would love to hear from you.</p>
        <div className="bc-contact-mini"><Icon name="mail" size={19}/>
          <span>Contact details will be published when the team finalizes them.</span></div>
      </Reveal>
      <Reveal delay={120}><form className="bc-contact-form" onSubmit={submit} noValidate>
        <div className="bc-contact-row"><label>Your name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" required/></label>
          <label>Email address<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="you@example.com" required/></label></div>
        <label>How can we help?<textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us what is on your mind..." rows="3" minLength={12} required/></label>
        <div className="bc-form-bottom"><button className="bc-button bc-button--primary" type="submit">Send a message <Icon name="arrow" size={17}/></button>
          <small>Demo form. No message is sent.</small></div>
        {notice&&<div className="bc-form-note" role="status">{notice}</div>}
      </form></Reveal>
    </div>
  </section>;
}
