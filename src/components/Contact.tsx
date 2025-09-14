import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import UnderlineGrow from "../components/UnderlineGrow";
import { useI18n } from "../i18n/I18nProvider";

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
}

// helper para form-urlencoded (Netlify Forms)
const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key] ?? ''))
    .join('&');

const Contact: React.FC<ContactProps> = ({ onPhoneCall, onWhatsApp, onEmail }) => {
  const { t } = useI18n();

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: 'info',
    message: '',
    // honeypot (Netlify)
    ['bot-field']: '',
  });

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('contact.errors.firstNameRequired');
    if (!formData.lastName.trim()) newErrors.lastName = t('contact.errors.lastNameRequired');

    if (!formData.email.trim()) newErrors.email = t('contact.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('contact.errors.emailInvalid');

    if (!formData.phone.trim()) newErrors.phone = t('contact.errors.phoneRequired');
    else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(formData.phone.replace(/\s/g, '')))
      newErrors.phone = t('contact.errors.phoneInvalid');

    if (!formData.message.trim()) newErrors.message = t('contact.errors.messageRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envío compatible con Netlify Forms
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

    if (name === 'phone') {
      const phoneValue = value.replace(/[^\d\s\-\+\(\)]/g, '');
      if (phoneValue.length <= 15) setFormData((prev) => ({ ...prev, [name]: phoneValue }));
    } else if (name === 'firstName' || name === 'lastName') {
      if (value.length <= 18) setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === 'email') {
      if (value.length <= 50) setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name === 'message') {
      if (value.length <= 500) setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGoogleMaps = () => {
    window.open('https://maps.app.goo.gl/TVEdNoY3SyXYKEyU8', '_blank');
  };

  const contactInfo = [
    { id: 'address', icon: MapPin, titleKey: 'contact.info.address', content: '297 Northwest 54th Street, Miami, FL 33127' },
    { id: 'phone',   icon: Phone,  titleKey: 'contact.info.phone',   content: '+1(786)2530995' },
    { id: 'email',   icon: Mail,   titleKey: 'contact.info.email',   content: 'onewaymotors2@gmail.com' },
    {
      id: 'hours',
      icon: Clock,
      titleKey: 'contact.info.hours',
      content: t('contact.info.hoursValue'),
    },
  ] as const;

  return (
    <section id="contacto" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            <UnderlineGrow>{t('contact.title')}</UnderlineGrow>
          </h2>
          <p className="text-white text-xl md:text-2xl max-w-3xl mx-auto font-bold">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-3xl font-black text-white mb-8">{t('contact.info.title')}</h3>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (info.id === 'phone') onPhoneCall();
                    else if (info.id === 'email') onEmail();
                    else if (info.id === 'address') handleGoogleMaps();
                  }}
                  className="flex items-start space-x-4 w-full text-left hover:bg-brand-600/10 p-3 rounded-lg transition-colors duration-300"
                  disabled={info.id === 'hours'}
                  aria-label={t(info.titleKey)}
                  title={t(info.titleKey)}
                >
                  <div className="bg-brand-600 p-3 rounded-lg">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">{t(info.titleKey)}</h4>
                    <p className="text-white text-lg font-bold whitespace-pre-line">{info.content}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-brand-600/90 backdrop-blur-md border border-brand-600/50 rounded-lg p-8 text-center shadow-2xl">
              <MapPin className="w-12 h-12 text-white mx-auto mb-4" />
              <h4 className="text-xl font-black text-white mb-2">{t('contact.map.title')}</h4>
              <p className="text-white text-lg font-bold mb-4">
                {t('contact.map.subtitle')}
              </p>
              <button
                onClick={handleGoogleMaps}
                className="bg-black/90 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                {t('contact.map.cta')}
              </button>
            </div>

            {/* WhatsApp Button */}
            <div className="mt-6">
              <button
                onClick={onWhatsApp}
                className="w-full bg-green-600/90 backdrop-blur-md border border-green-600/50 text-white px-8 py-4 rounded-lg text-xl font-black hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl"
                aria-label={t('contact.whats.cta')}
                title={t('contact.whats.cta')}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
                <span>{t('contact.whats.cta')}</span>
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-3xl font-black text-white mb-8">{t('contact.form.title')}</h3>

            {/* Banner de estado */}
            {status === 'sent' && (
              <div className="mb-4 rounded-lg border border-green-500 bg-green-600/20 text-green-200 px-4 py-3 font-semibold">
                {t('contact.form.success')}
              </div>
            )}
            {status === 'error' && (
              <div className="mb-4 rounded-lg border border-red-500 bg-red-600/20 text-red-200 px-4 py-3 font-semibold">
                {t('contact.form.error')}
              </div>
            )}

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmitForNetlify}
              className="space-y-6"
              aria-label={t('contact.form.title')}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" onChange={handleInputChange} />
                </label>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-2">{t('contact.form.firstName')} *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${
                      errors.firstName ? 'focus:ring-brand-300' : 'focus:ring-white'
                    }`}
                    placeholder={t('contact.form.firstName.placeholder')}
                    maxLength={18}
                    required
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'err-firstName' : undefined}
                  />
                  {errors.firstName && <p id="err-firstName" className="text-brand-300 text-sm mt-1">{errors.firstName}</p>}
                  <p className="text-white/60 text-sm mt-1">{formData.firstName.length}/18</p>
                </div>
                <div>
                  <label className="block text-lg font-bold text-white mb-2">{t('contact.form.lastName')} *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${
                      errors.lastName ? 'focus:ring-brand-300' : 'focus:ring-white'
                    }`}
                    placeholder={t('contact.form.lastName.placeholder')}
                    maxLength={18}
                    required
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? 'err-lastName' : undefined}
                  />
                  {errors.lastName && <p id="err-lastName" className="text-brand-300 text-sm mt-1">{errors.lastName}</p>}
                  <p className="text-white/60 text-sm mt-1">{formData.lastName.length}/18</p>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${
                    errors.email ? 'focus:ring-brand-300' : 'focus:ring-white'
                  }`}
                  placeholder="onewaymotors2@gmail.com"
                  maxLength={50}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'err-email' : undefined}
                />
                {errors.email && <p id="err-email" className="text-brand-300 text-sm mt-1">{errors.email}</p>}
                <p className="text-white/60 text-sm mt-1">{formData.email.length}/50</p>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">{t('contact.form.phone')} * ({t('contact.form.phone.hint')})</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'focus:ring-brand-300' : 'focus:ring-white'
                  }`}
                  placeholder="+17862530995"
                  maxLength={15}
                  required
                  pattern="[0-9+]*"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'err-phone' : undefined}
                />
                {errors.phone && <p id="err-phone" className="text-brand-300 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">{t('contact.form.reason')}</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="info">{t('contact.form.reason.info')}</option>
                  <option value="finance">{t('contact.form.reason.finance')}</option>
                  <option value="service">{t('contact.form.reason.service')}</option>
                  <option value="warranty">{t('contact.form.reason.warranty')}</option>
                  <option value="other">{t('contact.form.reason.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold text-white mb-2">
                  {t('contact.form.message')} * ({formData.message.length}/500)
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white rounded-lg px-4 py-3 text-lg font-bold placeholder-white/70 focus:outline-none focus:ring-2 ${
                    errors.message ? 'focus:ring-brand-300' : 'focus:ring-white'
                  }`}
                  placeholder={t('contact.form.message.placeholder')}
                  maxLength={500}
                  required
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'err-message' : undefined}
                ></textarea>
                {errors.message && <p id="err-message" className="text-brand-300 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-black/90 backdrop-blur-md border border-white/20 text-white py-4 rounded-lg text-xl font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:opacity-60"
                aria-label={status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                title={status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}</span>
              </button>
            </form>

            <div className="mt-8 p-4 bg-brand-600/90 backdrop-blur-md border border-brand-600/50 rounded-lg shadow-lg">
              <p className="text-lg text-white font-bold">
                <strong>{t('contact.form.sla.title')}</strong> {t('contact.form.sla.body')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
