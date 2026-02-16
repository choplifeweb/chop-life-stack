import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useCursor } from "../Animations";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactInfo() {
  const { setIsHoveringClickable } = useCursor();

  const contactDetails = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "hello@choplife.com",
      href: "mailto:hello@choplife.com",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Location",
      value: "Lagos, Nigeria",
      href: null,
    },
  ];

  return (
    <motion.div
      className="contact-form__info"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="contact-form__info-title">Get in Touch</h2>
      <p className="contact-form__info-description">
        Have a question or want to collaborate? We'd love to hear from you.
        Reach out and let's create something amazing together.
      </p>

      <div className="contact-form__details">
        {contactDetails.map((detail, index) => (
          <motion.div
            key={detail.label}
            className="contact-form__detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <div className="contact-form__detail-icon">{detail.icon}</div>
            <div className="contact-form__detail-content">
              <span className="contact-form__detail-label">{detail.label}</span>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="contact-form__detail-value contact-form__detail-value--link"
                  onMouseEnter={() => setIsHoveringClickable(true)}
                  onMouseLeave={() => setIsHoveringClickable(false)}
                >
                  {detail.value}
                </a>
              ) : (
                <span className="contact-form__detail-value">{detail.value}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function ContactForm() {
  const { setIsHoveringClickable } = useCursor();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
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
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitting(false);
        setIsSubmitted(true);

        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: "", email: "", subject: "", message: "" });
        }, 3000);
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
    <div className="contact-form">
      <div className="contact-form__container">
        <ContactInfo />

        <motion.div
          className="contact-form__card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="contact-form__card-glow" />

          <form onSubmit={handleSubmit} className="contact-form__form">
            <motion.h3
              className="contact-form__title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Send us a Message
            </motion.h3>

            <div className="contact-form__fields">
              <motion.div
                className="contact-form__field"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label htmlFor="name" className="contact-form__label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="contact-form__input"
                  placeholder="Your name"
                  required
                  onFocus={() => setIsHoveringClickable(true)}
                  onBlur={() => setIsHoveringClickable(false)}
                />
              </motion.div>

              <motion.div
                className="contact-form__field"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <label htmlFor="email" className="contact-form__label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="contact-form__input"
                  placeholder="your@email.com"
                  required
                  onFocus={() => setIsHoveringClickable(true)}
                  onBlur={() => setIsHoveringClickable(false)}
                />
              </motion.div>

              <motion.div
                className="contact-form__field contact-form__field--full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label htmlFor="subject" className="contact-form__label">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-form__input"
                  placeholder="What's this about?"
                  required
                  onFocus={() => setIsHoveringClickable(true)}
                  onBlur={() => setIsHoveringClickable(false)}
                />
              </motion.div>

              <motion.div
                className="contact-form__field contact-form__field--full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
              >
                <label htmlFor="message" className="contact-form__label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="contact-form__textarea"
                  placeholder="Tell us more..."
                  rows={5}
                  required
                  onFocus={() => setIsHoveringClickable(true)}
                  onBlur={() => setIsHoveringClickable(false)}
                />
              </motion.div>
            </div>

            <motion.button
              type="submit"
              className="contact-form__submit"
              disabled={isSubmitting || isSubmitted}
              onMouseEnter={() => setIsHoveringClickable(true)}
              onMouseLeave={() => setIsHoveringClickable(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitted ? (
                <>
                  <span>Message Sent!</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="contact-form__submit-icon"
                  >
                    ✓
                  </motion.span>
                </>
              ) : isSubmitting ? (
                <>
                  <span>Sending...</span>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="contact-form__submit-icon"
                  >
                    ◌
                  </motion.span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
