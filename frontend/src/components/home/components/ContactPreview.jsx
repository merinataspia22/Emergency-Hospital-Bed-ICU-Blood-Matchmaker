
import { useState } from "react";
import Icon from "./Icon";
import Reveal from "./Reveal";
import { apiRequest } from "../../../services/api.js";

const emptyForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactPreview() {
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setNotice("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    if (
      form.name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      ) ||
      form.message.trim().length < 12
    ) {
      setNotice(
        "Please enter a valid name, email and a message of at least 12 characters."
      );
      return;
    }

    setBusy(true);
    setNotice("");

    try {
      await apiRequest("/contact", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        },
      });

      setNotice("Your message was sent successfully!");
      setForm(emptyForm);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to send your message."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="bc-contact bc-section"
      id="bc-contact"
    >
      <div className="bc-container bc-contact-layout">
        <Reveal>
          <div className="bc-section-kicker">
            <span /> GET IN TOUCH
          </div>

          <h2>
            Every conversation
            <br />
            <em>can make a difference.</em>
          </h2>

          <p>
            Have a question, an idea or feedback for
            the team? We would love to hear from you.
          </p>

          <div className="bc-contact-mini">
            <Icon name="mail" size={19} />
            <span>
              Contact details will be published
              when the team finalizes them.
            </span>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form
            className="bc-contact-form"
            onSubmit={submit}
            noValidate
          >
            <div className="bc-contact-row">
              <label>
                Your name
                <input
                  value={form.name}
                  onChange={(e) =>
                    update("name", e.target.value)
                  }
                  placeholder="Your full name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <label>
              How can we help?
              <textarea
                value={form.message}
                onChange={(e) =>
                  update("message", e.target.value)
                }
                placeholder="Tell us what is on your mind..."
                rows={3}
                minLength={12}
                maxLength={2000}
                required
              />
            </label>

            <div className="bc-form-bottom">
              <button
                className="bc-button bc-button--primary"
                type="submit"
                disabled={busy}
              >
                {busy ? "Sending..." : "Send a message"}
                <Icon name="arrow" size={17} />
              </button>

              <small>
                Your message will be saved
                for the BloodConnect team.
              </small>
            </div>

            {notice && (
              <div className="bc-form-note" role="status">
                {notice}
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
