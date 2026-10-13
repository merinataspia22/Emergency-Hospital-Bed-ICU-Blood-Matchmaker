import { Facebook } from 'lucide-react';
export default function LoginSocial({ onSocial }) {
  return <>
    <div className="bc-social-divider"><span>Or continue with</span></div>
    <div className="bc-social-row">
      <button type="button" onClick={() => onSocial('Google')} className="bc-social-btn">
        <span className="bc-google-g" aria-hidden="true">G</span> Continue with Google
      </button>
      <button type="button" onClick={() => onSocial('Facebook')} className="bc-social-btn">
        <Facebook fill="#1877F2" stroke="#1877F2" size={23} aria-hidden="true" /> Continue with Facebook
      </button>
    </div>
  </>;
}
