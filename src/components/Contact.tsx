import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, ArrowUpRight } from 'lucide-react';
import UnderlineGrow from './UnderlineGrow';
import { useI18n } from '../i18n/I18nProvider';

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
  onEmail?: () => void;
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

  const handleSubmitForNetlify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setStatus('sending');

      const payload: Record<string, string> = {
        'form-name': 'contact',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        message: formData.message,
        ['bot-field']: formData['bot-field'],
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const STORE_ADDRESS_TEXT = '821 NE 79th St, Miami, FL 33138';

  const handleGoogleMaps = () => {
    window.open(
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(STORE_ADDRESS_TEXT),
      '_blank'
    );
  };

  const contactInfo = [
    { id: 'address', icon: MapPin, titleKey: 'contact.info.address', content: STORE_ADDRESS_TEXT },
    { id: 'phone', icon: Phone, titleKey: 'contact.info.phone', content: '+1(786)2530995' },
    {
      id: 'hours',
      icon: Clock,
      titleKey: 'contact.info.hours',
      content: t('contact.info.hoursValue'),
    },
  ] as const;

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-brand/40 focus:bg-white/[0.05]';

  return (
    <section id="contacto" className="bg-[#0b0b0c] py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
            Contact & financing
          </p>
          <h2 className="mb-6 text-4xl font-black leading-none text-white md:text-6xl">
            <UnderlineGrow>{t('contact.title')}</UnderlineGrow>
          </h2>
          <p className="text-lg font-medium text-white/65 md:text-xl">{t('contact.subtitle')}</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <div className="mb-10">
              <h3 className="mb-4 text-2xl font-black text-white md:text-3xl">
                {t('contact.info.title')}
              </h3>
              <p className="max-w-md text-white/60">
                Reach our team directly for product questions, financing details and availability.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (info.id === 'phone') onPhoneCall();
                    else if (info.id === 'address') handleGoogleMaps();
                  }}
                  className="flex w-full items-start gap-4 rounded-[22px] border border-white/8 bg-black/20 p-4 text-left transition hover:border-white/15 hover:bg-white/[0.03]"
                  disabled={info.id === 'hours'}
                >
                  <div className="rounded-2xl border border-brand/20 bg-brand/10 p-3 text-brand">
                    <info.icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-white/45">
                      {t(info.titleKey)}
                    </h4>
                    <p className="text-base font-semibold text-white md:text-lg">{info.content}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onWhatsApp}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-brand"
            >
              <MessageCircle className="h-5 w-5" />
              {t('contact.whats.cta')}
            </button>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#111215] p-7 md:p-8">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-black text-white md:text-3xl">
                  {t('contact.form.title')}
                </h3>
                <p className="mt-2 max-w-lg text-white/55">
                  Send us your details and we’ll get back to you with pricing, financing and product information.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Secure form <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <form
              onSubmit={handleSubmitForNetlify}
              className="space-y-5"
              name="contact"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" value={formData['bot-field']} />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className={inputClass}
                    required
                  />
                  {errors.firstName && <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>}
                </div>

                <div>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className={inputClass}
                    required
                  />
                  {errors.lastName && <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className={inputClass}
                    required
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className={inputClass}
                    required
                  />
                  {errors.phone && <p className="mt-2 text-sm text-red-400">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="info">General information</option>
                  <option value="pricing">Pricing</option>
                  <option value="financing">Financing</option>
                  <option value="availability">Availability</option>
                </select>
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what you're looking for"
                  rows={6}
                  className={`${inputClass} resize-none`}
                  required
                />
                {errors.message && <p className="mt-2 text-sm text-red-400">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-black transition hover:bg-brand disabled:opacity-70"
                disabled={status === 'sending'}
              >
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                  ? 'Message sent'
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