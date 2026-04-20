import React from 'react';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import UnderlineGrow from "../components/UnderlineGrow";
import { useI18n } from "../i18n/I18nProvider";

interface ContactProps {
  onPhoneCall: () => void;
  onWhatsApp: () => void;
  onEmail?: () => void; // ✅ ahora opcional
}

// helper para form-urlencoded (Netlify Forms)
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('contact.errors.emailInvalid');

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
      'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent(STORE_ADDRESS_TEXT),
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
          <div>
            <h3 className="text-3xl font-black text-white mb-8">
              {t('contact.info.title')}
            </h3>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (info.id === 'phone') onPhoneCall();
                    else if (info.id === 'address') handleGoogleMaps();
                  }}
                  className="flex items-start space-x-4 w-full text-left hover:bg-brand-600/10 p-3 rounded-lg"
                  disabled={info.id === 'hours'}
                >
                  <div className="bg-brand-600 p-3 rounded-lg">
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white mb-1">
                      {t(info.titleKey)}
                    </h4>
                    <p className="text-white text-lg font-bold">
                      {info.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onWhatsApp}
              className="w-full bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-black hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {t('contact.whats.cta')}
            </button>
          </div>

          <div>
            <h3 className="text-3xl font-black text-white mb-8">
              {t('contact.form.title')}
            </h3>

            <form onSubmit={handleSubmitForNetlify} className="space-y-6">
              <input type="hidden" name="form-name" value="contact" />

              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="w-full p-3 rounded"
                required
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-3 rounded"
                required
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Message"
                className="w-full p-3 rounded"
                required
              />

              <button
                type="submit"
                className="w-full bg-white text-black py-3 font-bold"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;