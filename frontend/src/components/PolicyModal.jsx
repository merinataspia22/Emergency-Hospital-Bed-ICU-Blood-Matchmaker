import Modal from './Modal.jsx';
export default function PolicyModal({ topic, onClose }) {
  return <Modal title={topic} onClose={onClose}>
    {topic === 'Terms of Service' ? <div className="policy-body">
      <p>This is a frontend demonstration of BloodConnect. Submitting the registration form does not create a real account.</p>
      <p>When the full service is launched, users should provide accurate contact information, respect other community members, and follow medical professionals' guidance.</p>
      <p>Blood donation eligibility must be assessed by qualified healthcare professionals, not by this demo form.</p>
    </div> : <div className="policy-body">
      <p>This demo keeps the information you type in your browser's current page state only. It does not send your details to any server.</p>
      <p>Data will disappear when you reload or leave the page. Registration passwords and phone numbers are not stored. On the Login Page, selecting Remember me may save only the email address in browser storage; passwords are never saved.</p>
      <p>A live service will need a complete privacy policy, secure database and authentication implementation before public use.</p>
    </div>}
    <p className="small-disclaimer">Sample information for the UI preview — not a production legal policy.</p>
  </Modal>;
}
