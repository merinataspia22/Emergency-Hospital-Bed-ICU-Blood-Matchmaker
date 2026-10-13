import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/RegistrationForm.jsx';
import HeroPanel from '../../components/HeroPanel.jsx';
import PolicyModal from '../../components/PolicyModal.jsx';
import Toast from '../../components/Toast.jsx';
export default function RegistrationPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [notice, setNotice] = useState(null);
  const index = useRef(0);
  const notify = value => setNotice({ ...value, id: ++index.current });
  const success = data => notify({ type: 'success', title: 'Registration form submitted!',
    description: `Thank you, ${data.name.split(' ')[0]}! Form cleared. Demo only — no account was saved.` });
  const error = () => notify({ type: 'error', title: 'Please complete the form',
    description: 'Check the highlighted fields and try again.' });
  return <>
    <div className="page-backdrop">
      <div className="site-shell registration-shell">
        <main className="page-content">
          <RegistrationForm onSuccess={success} onError={error}
            openPolicy={setTopic} openLogin={() => navigate('/login')} />
          <HeroPanel />
        </main>
      </div>
      <div className="background-orb orb-a" aria-hidden="true" />
      <div className="background-orb orb-b" aria-hidden="true" />
      {topic && <PolicyModal topic={topic} onClose={() => setTopic(null)} />}
    </div>
    {notice && <Toast key={notice.id} {...notice} onClose={() => setNotice(null)} />}
  </>;
}
