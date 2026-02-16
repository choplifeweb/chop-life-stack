import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface ContactPanelProps {
  isOpen: boolean;
  onClose: () => void;
}


function AnimatedCheckmark() {
  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.circle
        cx="32"
        cy="32"
        r="28"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M20 33L28 41L44 25"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

export function ContactPanel({ isOpen, onClose }: ContactPanelProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.staticforms.dev/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: import.meta.env.VITE_STATIC_FORMS_API_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitting(false);
        setIsSubmitted(true);

        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: "", email: "", message: "" });
          onClose();
        }, 2500);
      } else {
        setIsSubmitting(false);
        setIsSubmitted(false);
      }
    } catch {
      setIsSubmitting(false);
      setIsSubmitted(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="contact-panel__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="contact-panel"
            initial={{ opacity: 0, x: 100, y: "-50%", scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: 100, y: "-50%", scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              className="contact-panel__close"
              onClick={onClose}
              aria-label="Close contact panel"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="contact-panel__content">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* Success state */
                  <motion.div
                    key="success"
                    className="contact-panel__success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 250 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: "1.25rem",
                      minHeight: "300px",
                    }}
                  >
                    <AnimatedCheckmark />
                    <motion.h3
                      className="contact-panel__title"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Message Sent!
                    </motion.h3>
                    <motion.p
                      className="contact-panel__subtitle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                      style={{ marginBottom: 0 }}
                    >
                      We'll get back to you soon.
                    </motion.p>
                  </motion.div>
                ) : (
                  /* Form state */
                  <motion.div
                    key="form"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="contact-panel__title">
                      Get in Touch
                    </h3>
                    <p className="contact-panel__subtitle">
                      Send us a message and we'll get back to you soon.
                    </p>

                    <form onSubmit={handleSubmit} className="contact-panel__form">
                      <div className="contact-panel__field">
                        <label
                          htmlFor="panel-name"
                          className="contact-panel__label"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="panel-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="contact-panel__input"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      <div className="contact-panel__field">
                        <label
                          htmlFor="panel-email"
                          className="contact-panel__label"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="panel-email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="contact-panel__input"
                          placeholder="your@email.com"
                          required
                        />
                      </div>

                      <div className="contact-panel__field">
                        <label
                          htmlFor="panel-message"
                          className="contact-panel__label"
                        >
                          Message
                        </label>
                        <textarea
                          id="panel-message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="contact-panel__textarea"
                          placeholder="How can we help?"
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <motion.button
                          type="submit"
                          className="contact-panel__submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <AnimatePresence mode="wait">
                            {isSubmitting ? (
                              <motion.span
                                key="sending"
                                className="contact-panel__submit-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span>Sending...</span>
                                <motion.span
                                  className="contact-panel__spinner"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                  >
                                    <circle
                                      cx="8"
                                      cy="8"
                                      r="6"
                                      stroke="rgba(255,255,255,0.2)"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M14 8a6 6 0 0 0-6-6"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </motion.span>
                              </motion.span>
                            ) : (
                              <motion.span
                                key="idle"
                                className="contact-panel__submit-content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span>Send Message</span>
                                <Send className="w-4 h-4" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
