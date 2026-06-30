'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { Mail, Dealership } from '@/utils/types';
import OpeningHours from '@/sections/home/OpeningHours';

interface FormStyleProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  embedded?: boolean;
}

const ContactForm = ({ title, subtitle, bgColor, textColor, accentColor, embedded = false }: FormStyleProps = {}) => {
  // When builder passes bgColor, use inline styles. Otherwise use default Tailwind classes.
  const hasBuilderStyles = !!bgColor;
  const isDarkBg = bgColor && (bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2'));
  const cardStyle = hasBuilderStyles
    ? { backgroundColor: bgColor, borderColor: textColor ? `${textColor}15` : undefined }
    : undefined;
  const cardClass = hasBuilderStyles
    ? 'rounded-xl shadow-lg p-8 border'
    : 'bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border';
  const infoCardStyle = hasBuilderStyles
    ? { backgroundColor: bgColor ? `${bgColor}f0` : undefined, borderColor: textColor ? `${textColor}15` : undefined }
    : undefined;
  const infoCardClass = hasBuilderStyles
    ? 'rounded-xl p-8 border'
    : 'bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border';
  const titleStyle = hasBuilderStyles ? { color: textColor } : undefined;
  const titleClass = hasBuilderStyles ? 'text-3xl sm:text-4xl font-extrabold' : 'text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white';
  const subtitleStyle = hasBuilderStyles ? { color: textColor, opacity: 0.6 } : undefined;
  const subtitleClass = hasBuilderStyles ? 'mt-4 text-lg' : 'mt-4 text-lg text-gray-500 dark:text-gray-400';
  const headingStyle = hasBuilderStyles ? { color: textColor } : undefined;
  const headingClass = hasBuilderStyles ? 'text-2xl font-bold' : 'text-2xl font-bold text-gray-900 dark:text-white';
  const subHeadingClass = hasBuilderStyles ? 'text-lg font-medium' : 'text-lg font-medium text-gray-900 dark:text-white';
  const bodyStyle = hasBuilderStyles ? { color: textColor, opacity: 0.7 } : undefined;
  const bodyClass = hasBuilderStyles ? '' : 'text-gray-600 dark:text-gray-400';

  // HeroUI input classNames to match builder theme
  const inputClassNames = (hasBuilderStyles || embedded) ? {
    label: isDarkBg ? '!text-white/60' : '!text-black/50',
    input: isDarkBg ? '!text-white !placeholder-white/40' : '!text-gray-900',
    inputWrapper: isDarkBg
      ? '!bg-[#262626] !border-[#3a3a3a] hover:!border-[#4a4a4a] !rounded-lg'
      : '!bg-white !border-[#d1d5db] hover:!border-gray-400 !rounded-lg',
  } : undefined;
  const buttonStyle = (hasBuilderStyles || embedded) && accentColor ? { backgroundColor: accentColor } : undefined;

  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [dealership, setDealership] = useState<Dealership | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    reason: '',
    message: '',
  });

  // Trae la sucursal para mostrar dirección/teléfono/email/horario reales desde
  // la plataforma (dealerships), igual que el componente "¿Cómo llegar?".
  useEffect(() => {
    const fetchDealership = async () => {
      if (!client?.id) return;
      const { data } = await supabase
        .from('dealerships')
        .select('*')
        .eq('client_id', client.id);
      if (data && data.length > 0) {
        setDealership(data[0] as Dealership);
      }
    };
    fetchDealership();
  }, [client?.id]);

  // Datos de contacto: prioriza la sucursal, con fallback al contacto del cliente.
  const contactAddress = dealership?.address || client?.contact?.address;
  const contactEmail = dealership?.email || client?.contact?.email;
  const contactPhone = dealership?.phone || client?.contact?.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Primero inicializamos o actualizamos el customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        client_id: client?.id || '',
      });

      // Guardamos el email en la base de datos
      const { error: mailError } = await supabase.from('mails').insert([
        {
          customer_id: customerResponse.id, // Usamos el ID del customer
          subject: `Nuevo contacto desde ${client?.name}`,
          body: `
Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
        `,
          reason: mapReasonToType(formData.reason),
        },
      ]);

      if (mailError) throw mailError;

      // Crear la URL del mailto con los parámetros codificados
      const emailBody = `
Nuevo mensaje de contacto:

Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
    `;

      const mailtoUrl = `mailto:${
        client?.contact?.email
      }?subject=Nuevo contacto desde ${client?.name}&body=${encodeURIComponent(
        emailBody
      )}`;

      // Abrir el cliente de correo predeterminado
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Función auxiliar para mapear el motivo a los tipos permitidos
  const mapReasonToType = (reason: string): Mail['reason'] => {
    switch (reason) {
      case 'Compra de Vehículo':
        return 'buy';
      case 'Venta de Vehículo':
        return 'sell';
      default:
        return 'other';
    }
  };

  return (
    <div data-form-section="contact">
      {!embedded && title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className={titleClass} style={titleStyle}>{title}</h1>
          {subtitle && <p className={subtitleClass} style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div className={embedded ? '' : (hasBuilderStyles ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-16')}>
        {/* Contact Form */}
        <div className={embedded ? '' : cardClass} style={embedded ? undefined : cardStyle}>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label='Nombre'
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
              <Input
                type='text'
                label='Apellido'
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
            </div>

            <Input
              type='email'
              label='Email'
              value={formData.email}
              onValueChange={(value) => handleChange(value, 'email')}
              isRequired
              variant='bordered'
              classNames={inputClassNames}
            />

            <Input
              type='tel'
              label='Teléfono'
              value={formData.phone}
              onValueChange={(value) => handleChange(value, 'phone')}
              isRequired
              variant='bordered'
              classNames={inputClassNames}
            />

            <Select
              label='Motivo de Contacto'
              value={formData.reason}
              onChange={(e) => handleChange(e.target.value, 'reason')}
              isRequired
              variant='bordered'
              classNames={inputClassNames}
            >
              <SelectItem key='Compra de Vehículo' value='Compra de Vehículo'>
                Compra de Vehículo
              </SelectItem>
              <SelectItem key='Venta de Vehículo' value='Venta de Vehículo'>
                Venta de Vehículo
              </SelectItem>
              <SelectItem key='Consulta General' value='Consulta General'>
                Consulta General
              </SelectItem>
              <SelectItem key='Otro' value='Otro'>
                Otro
              </SelectItem>
            </Select>

            <Textarea
              label='Mensaje'
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              isRequired
              variant='bordered'
              classNames={inputClassNames}
            />

            <Button
              type='submit'
              color='primary'
              fullWidth
              className={embedded ? 'font-semibold !text-white hover:opacity-90' : 'font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-primary dark:text-secondary dark:hover:bg-primary/90'}
              style={buttonStyle}
              isLoading={loading}
            >
              Enviar Mensaje
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        {!embedded && !hasBuilderStyles && (
        <div className={infoCardClass} style={infoCardStyle}>
          <div className='space-y-8'>
            <h2 className={headingClass} style={headingStyle}>
              Información de Contacto
            </h2>

            {contactAddress && (
              <div>
                <h3 className={subHeadingClass} style={headingStyle}>
                  Ubicación
                </h3>
                <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                  {contactAddress}
                </p>
              </div>
            )}

            {dealership?.opening_hours && (
              <div>
                <h3 className={subHeadingClass} style={headingStyle}>
                  Horario
                </h3>
                <div className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                  <OpeningHours hours={dealership.opening_hours} />
                </div>
              </div>
            )}

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                Contacto Directo
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                Email: {contactEmail}
                <br />
                Teléfono: {contactPhone}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
