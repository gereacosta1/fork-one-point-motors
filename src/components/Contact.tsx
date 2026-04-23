import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';
import UnderlineGrow from './UnderlineGrow';
import { useI18n } from '../i18n/I18nProvider';

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
}

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key] ?? ''))
    .join('&');

const Contact: React.FC<ContactProps> = ({ onPhoneCall, onWhatsApp }) => {
  const { t } = useI18n();

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: 'info',
    message: '',
    ['bot-field']: '',
  });

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('contact.errors.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('contact.errors.lastNameRequired');

    if (!formData.email.trim()) newErrors.email = t('contact.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid');
    }

    if (!formData.phone.trim()) newErrors.phone = t('contact.errors.phoneRequired');
    if (!formData.message.trim()) newErrors.message = t('contact.errors.messageRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setStatus('sending');

      const payload = {
        'form-name': 'contact',
        ...formData,
      };

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload),
      });

      if (res.ok) {
        setStatus('sent');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          reason: 'info',
          message: '',
          ['bot-field']: '',
        });
        setErrors({});
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const STORE_ADDRESS = '821 NE 79th St, Miami, FL 33138';

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-brand/40 focus:bg-white/[0.05]';

  return (
    <section id="contacto" className="relative overflow-hidden bg-[#0b0b0c] py-24 md:py-32">
      {/* background detalle */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#39ff14,transparent_18%),radial-gradient(circle_at_bottom_right,#ffffff,transparent_15%)]" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* HEADER */}
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
            Contact & financing
          </p>

          <h2 className="mb-6 text-4xl font-black leading-none text-white md:text-6xl">
            <UnderlineGrow>{t('contact.title')}</UnderlineGrow>
          </h2>

          <p className="text-lg font-medium text-white/65 md:text-xl">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          {/* LEFT INFO */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
            <h3 className="mb-6 text-2xl font-black text-white md:text-3xl">
              {t('contact.info.title')}
            </h3>

            <div className="space-y-4">
              {/* Address */}
              <button
                onClick={() =>
                  window.open(
                    'https://www.google.com/maps/search/?api=1&query=' +
                      encodeURIComponent(STORE_ADDRESS),
                    '_blank'
                  )
                }
                className="flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20"
              >
                <MapPin className="text-brand" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Address
                  </p>
                  <p className="text-white font-semibold">{STORE_ADDRESS}</p>
                </div>
              </button>

              {/* Phone */}
              <button
                onClick={onPhoneCall}
                className="flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20"
              >
                <Phone className="text-brand" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Phone
                  </p>
                  <p className="text-white font-semibold">+1 (786) 253-0995</p>
                </div>
              </button>

              {/* Hours */}
              <div className="flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <Clock className="text-brand" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Hours
                  </p>
                  <p className="text-white font-semibold">
                    {t('contact.info.hoursValue')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onWhatsApp}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-brand"
            >
              <MessageCircle className="h-5 w-5" />
              {t('contact.whats.cta')}
            </button>
          </div>

          {/* FORM */}
          <div className="rounded-[32px] border border-white/10 bg-[#111215] p-8">
            <div className="mb-8 flex items-end justify-between">
              <h3 className="text-2xl font-black text-white md:text-3xl">
                {t('contact.form.title')}
              </h3>

              <span className="text-sm uppercase tracking-[0.2em] text-brand flex items-center gap-2">
                Secure form <ArrowUpRight size={14} />
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  className={inputClass}
                />
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className={inputClass}
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className={inputClass}
                />
              </div>

              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="info">General information</option>
                <option value="pricing">Pricing</option>
                <option value="financing">Financing</option>
              </select>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                placeholder="Tell us what you're looking for"
                className={`${inputClass} resize-none`}
              />

              <button
                type="submit"
                className="w-full rounded-full bg-white py-4 font-extrabold text-black transition hover:bg-brand"
              >
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                  ? 'Sent'
                  : status === 'error'
                  ? 'Try again'
                  : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;