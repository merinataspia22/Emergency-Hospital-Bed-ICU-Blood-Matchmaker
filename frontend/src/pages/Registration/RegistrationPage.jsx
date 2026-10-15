
import {
  useEffect,
  useRef,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import RegistrationForm from '../../components/RegistrationForm.jsx';
import HeroPanel from '../../components/HeroPanel.jsx';
import PolicyModal from '../../components/PolicyModal.jsx';
import Toast from '../../components/Toast.jsx';

import { useAuth } from '../../auth/AuthContext.jsx';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [topic, setTopic] = useState(null);
  const [notice, setNotice] = useState(null);

  const noticeId = useRef(0);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(redirectTimer.current);
    };
  }, []);

  const notify = value => {
    setNotice({
      ...value,
      id: ++noticeId.current
    });
  };

  const success = async data => {
    // Create the donor/recipient demo account
    await register(data);

    notify({
      type: 'success',
      title: 'Account created!',
      description:
        `Welcome, ${data.name.split(' ')[0]}! ` +
        `Your ${data.role} demo account is saved ` +
        'in this browser. Redirecting to login...'
    });

    // Give the user time to see the success toast
    redirectTimer.current = window.setTimeout(() => {
      navigate('/login', {
        replace: true
      });
    }, 2200);
  };

  const error = message => {
    notify({
      type: 'error',
      title: message
        ? 'Registration failed'
        : 'Please complete the form',
      description:
        message ||
        'Check the highlighted fields and try again.'
    });
  };

  return (
    <>
      <div className="page-backdrop">
        <div className="site-shell registration-shell">
          <main className="page-content">
            <RegistrationForm
              onSuccess={success}
              onError={error}
              openPolicy={setTopic}
              openLogin={() => navigate('/login')}
            />

            <HeroPanel />
          </main>
        </div>

        <div
          className="background-orb orb-a"
          aria-hidden="true"
        />
        <div
          className="background-orb orb-b"
          aria-hidden="true"
        />

        {topic && (
          <PolicyModal
            topic={topic}
            onClose={() => setTopic(null)}
          />
        )}
      </div>

      {notice && (
        <Toast
          key={notice.id}
          {...notice}
          onClose={() => setNotice(null)}
        />
      )}
    </>
  );
}
