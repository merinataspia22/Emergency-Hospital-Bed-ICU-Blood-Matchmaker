import { useRef, useState } from 'react';
import LoginForm from './LoginForm.jsx';
import LoginArtwork from './LoginArtwork.jsx';
import Toast from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';
export default function LoginPage() {
  const [notice, setNotice] = useState(null);
  const [forgot, setForgot] = useState(false);
  const id = useRef(0);
  const notify = value => setNotice({ ...value, id: ++id.current });
  return <>
    <div className="bc-login-page">
      <div className="bc-deco bc-deco-one" aria-hidden="true" />
      <div className="bc-deco bc-deco-two" aria-hidden="true" />
      <main className="bc-login-shell">
        <LoginForm onNotice={notify} onForgot={() => setForgot(true)} />
        <LoginArtwork />
      </main>
    </div>
    {forgot && <Modal title="Reset your password" onClose={() => setForgot(false)}>
      <p className="modal-muted">Password reset needs an authentication backend and email service.</p>
      <p className="modal-muted">This preview has not sent a reset email or changed your password.</p>
      <button type="button" className="submit-button" onClick={() => setForgot(false)}>Got it</button>
    </Modal>}
    {notice && <Toast key={notice.id} {...notice} onClose={() => setNotice(null)} />}
  </>;
}
