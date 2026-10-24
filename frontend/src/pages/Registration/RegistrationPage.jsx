
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import RegistrationForm from "../../components/RegistrationForm.jsx";
import HeroPanel from "../../components/HeroPanel.jsx";
import PolicyModal from "../../components/PolicyModal.jsx";
import Toast from "../../components/Toast.jsx";

import { useAuth } from "../../auth/AuthContext.jsx";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [topic, setTopic] = useState(null);
  const [notice, setNotice] = useState(null);

  const noticeId = useRef(0);
  const redirectTimer = useRef(null);

  // Clear the redirect timer when leaving the page.
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const notify = (value) => {
    setNotice({
      ...value,
      id: ++noticeId.current,
    });
  };

  // Register donor or recipient through MongoDB Backend.
  const success = async (data) => {
    // This calls POST /api/auth/register
    // through the AuthContext.
    await register(data);

    // Clear any previous redirect timer.
    if (redirectTimer.current) {
      window.clearTimeout(redirectTimer.current);
    }

    // Show success notification.
    notify({
      type: "success",
      title: "Account created!",
      description:
        `Welcome, ${data.name.trim().split(/\s+/)[0]}! ` +
        "Your account has been created successfully. " +
        "Redirecting to login...",
    });

    // Redirect to login after showing the toast.
    redirectTimer.current = window.setTimeout(() => {
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: data.email,
        },
      });
    }, 2200);
  };

  // Display registration errors.
  const error = (message) => {
    notify({
      type: "error",
      title: message
        ? "Registration failed"
        : "Please complete the form",
      description:
        message ||
        "Check the highlighted fields and try again.",
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
              openLogin={() => navigate("/login")}
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
