
import Modal from './Modal.jsx';

export default function PolicyModal({
  topic,
  onClose
}) {
  return (
    <Modal title={topic} onClose={onClose}>
      {topic === 'Terms of Service' ? (
        <div className="policy-body">
          <p>
            BloodConnect is currently a frontend
            demonstration, not a live blood donation
            or hospital booking service.
          </p>

          <p>
            Creating a donor or recipient account
            saves a demo account in this browser only.
            It does not register you with a real hospital,
            donor network or backend database.
          </p>

          <p>
            Donor eligibility, blood compatibility and
            medical decisions must always be confirmed
            by qualified healthcare professionals.
          </p>
        </div>
      ) : (
        <div className="policy-body">
          <p>
            This classroom demo saves the account name,
            email, selected role, password salt and a
            derived password hash in this browser's
            local storage. A temporary login session
            is stored in session storage.
          </p>

          <p>
            Your phone number, blood group, location
            and last donation date are validated by
            the form but are not saved by this demo
            authentication module.
          </p>

          <p>
            No registration information is sent to
            a backend by this module. Browser storage
            is not suitable for real account security.
            Use test information only; do not enter
            a real password or sensitive details.
          </p>

          <p>
            A production service will need secure
            server-side authentication, storage
            controls and a full privacy policy.
          </p>
        </div>
      )}

      <p className="small-disclaimer">
        Demo notice only — not a production legal policy.
      </p>
    </Modal>
  );
}
