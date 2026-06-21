'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { Brand, Model, LeadTypes } from '@/utils/types';
import {
  sendEmail,
  createVehicleLeadEmailTemplate,
  createDynamicLeadEmailTemplate,
} from '@/lib/send-email';
import SuccessModal from '@/components/ui/SuccessModal';
import { useTranslation } from '@/i18n/hooks/useTranslation';

// Campo configurable desde el builder (mismo shape en goautos-admin)
export interface DynamicFormField {
  label?: string;
  // 'text' | 'number' | 'email' | 'tel' | 'name' | 'lastname' | 'rut'
  // | 'select' | 'textarea' | 'brand' | 'model' | 'heading'
  fieldType?: string;
  options?: string; // opciones separadas por coma (solo para fieldType 'select')
  required?: boolean;
}

interface FormStyleProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  embedded?: boolean;
  formFields?: DynamicFormField[];
}

const LegacyWeSearchForm = ({ title, subtitle, bgColor, textColor, accentColor, embedded = false }: FormStyleProps = {}) => {
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    brand_id: '',
    model_id: '',
    year_from: '',
    year_to: '',
    max_mileage: '',
    max_owners: '',
    budget: '',
    message: '',
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      const { data: brandsData } = await supabase.from('brands').select('*');
      if (brandsData) setBrands(brandsData);
    };

    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      const fetchModels = async () => {
        const { data } = await supabase
          .from('models')
          .select('*')
          .eq('brand_id', selectedBrandId);

        if (data) setModels(data);
      };

      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que el client esté disponible
    if (!client?.id) {
      alert(
        '❌ Error: No se pudo identificar la automotora. Por favor, recarga la página.'
      );
      return;
    }

    // Validar campos requeridos
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone
    ) {
      alert(
        '❌ Por favor, completa todos los campos obligatorios (Nombre, Apellido, Email, Teléfono).'
      );
      return;
    }

    if (!formData.brand_id || !formData.model_id) {
      alert('❌ Por favor, selecciona una marca y modelo de vehículo.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create/initialize customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        client_id: client?.id || '',
      });

      // 2. Create lead with search parameters
      const leadData = {
        client_id: client?.id,
        customer_id: customerResponse.id,
        brand_id: formData.brand_id,
        model_id: parseInt(formData.model_id),
        type: LeadTypes.SEARCH_REQUEST,
        status: 'pending',
        notes: formData.message,
        search_params: {
          year: {
            min: formData.year_from ? parseInt(formData.year_from) : null,
            max: formData.year_to ? parseInt(formData.year_to) : null,
          },
          price: {
            min: null,
            max: formData.budget
              ? parseInt(formData.budget.replace(/\D/g, ''))
              : null,
          },
          mileage: {
            min: null,
            max: formData.max_mileage ? parseInt(formData.max_mileage) : null,
          },
          max_owners: formData.max_owners
            ? parseInt(formData.max_owners)
            : null,
        },
      };

      const { data: leadResult, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (leadError) {
        throw leadError;
      }

      // 3. Send email notification
      const selectedBrand =
        brands.find((b) => b.id === formData.brand_id)?.name || '';
      const selectedModel =
        models.find((m) => m.id === parseInt(formData.model_id))?.name || '';

      // Format budget with thousands separators
      const formattedBudget = formData.budget
        ? parseInt(formData.budget.replace(/\D/g, '')).toLocaleString('es-CL')
        : '';

      // Usar la función de email
      const emailContent = createVehicleLeadEmailTemplate({
        leadType: LeadTypes.SEARCH_REQUEST,
        customerName: `${formData.first_name} ${formData.last_name}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        vehicleDetails: {
          brand: selectedBrand,
          model: selectedModel,
          year:
            formData.year_from && formData.year_to
              ? `${formData.year_from} - ${formData.year_to}`
              : formData.year_from || formData.year_to || 'No especificado',
          mileage: formData.max_mileage
            ? `Máximo ${formData.max_mileage}`
            : 'No especificado',
          price: formattedBudget
            ? `Máximo $${formattedBudget}`
            : 'No especificado',
        },
        additionalMessage: formData.message,
      });

      // Determinar emails de destino para búsquedas
      const searchEmails =
        client?.contact?.search_emails &&
        client.contact.search_emails.length > 0
          ? client.contact.search_emails
          : [client?.contact?.email || ''];

      const emailResult = await sendEmail({
        to: searchEmails,
        subject: `Solicitud de Búsqueda: ${selectedBrand} ${selectedModel}`,
        content: emailContent,
      });

      if (!emailResult.success) {
        // Continuar con el flujo aunque el email falle
        // La solicitud ya se guardó en la base de datos
      }

      // Clear form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        brand_id: '',
        model_id: '',
        year_from: '',
        year_to: '',
        max_mileage: '',
        max_owners: '',
        budget: '',
        message: '',
      });

      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage =
        'Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.';

      if (error.code === '23505') {
        errorMessage =
          'Ya existe una solicitud con estos datos. Por favor, verifica la información.';
      } else if (error.message?.includes('email')) {
        errorMessage =
          'Error con el email. Por favor, verifica que el email sea válido.';
      } else if (error.message?.includes('customer')) {
        errorMessage =
          'Error al crear el cliente. Por favor, verifica los datos personales.';
      } else if (error.message?.includes('lead')) {
        errorMessage =
          'Error al crear la solicitud. Por favor, verifica los datos del vehículo.';
      }

      alert(`❌ ${errorMessage}\n\nDetalles técnicos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    if (id === 'budget') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Format with thousand separators
      const formattedValue =
        numericValue === '' ? '' : Number(numericValue).toLocaleString('es-CL');

      setFormData((prev) => ({
        ...prev,
        [id]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    // Update selected brand when brand changes
    if (id === 'brand_id') {
      setSelectedBrandId(value);
      // Reset model when brand changes
      setFormData((prev) => ({ ...prev, model_id: '' }));
    }
  };

  return (
    <div data-form-section="we-search-for-you">
      {!embedded && title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className={titleClass} style={titleStyle}>{title}</h1>
          {subtitle && <p className={subtitleClass} style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div className={embedded ? '' : (hasBuilderStyles ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-16')}>
        {/* Search Request Form */}
        <div className={embedded ? '' : cardClass} style={embedded ? undefined : cardStyle}>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label={t('weSearchForYou.form.firstName')}
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
              <Input
                type='text'
                label={t('weSearchForYou.form.lastName')}
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
            </div>

            <div className={embedded ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
              <Input
                type='email'
                label={t('weSearchForYou.form.email')}
                value={formData.email}
                onValueChange={(value) => handleChange(value, 'email')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
              <Input
                type='tel'
                label={t('weSearchForYou.form.phone')}
                value={formData.phone}
                onValueChange={(value) => handleChange(value, 'phone')}
                isRequired
                variant='bordered'
                classNames={inputClassNames}
              />
            </div>

            {/* Vehicle Search Criteria */}
            {!embedded && (
              <div className='border-t pt-6'>
                <h3 className={`${subHeadingClass} font-semibold mb-4`} style={headingStyle}>
                  {t('weSearchForYou.form.criteriaTitle')}
                </h3>
              </div>
            )}

            <Autocomplete
              label={t('weSearchForYou.form.brand')}
              placeholder={t('weSearchForYou.form.brandPlaceholder')}
              selectedKey={formData.brand_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'brand_id')
              }
              isRequired
              variant='bordered'
              inputProps={{ classNames: inputClassNames }}
            >
              {brands.map((brand) => (
                <AutocompleteItem key={brand.id}>
                  {brand.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <Autocomplete
              label={t('weSearchForYou.form.model')}
              placeholder={t('weSearchForYou.form.modelPlaceholder')}
              selectedKey={formData.model_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'model_id')
              }
              isRequired
              isDisabled={!selectedBrandId}
              variant='bordered'
              inputProps={{ classNames: inputClassNames }}
            >
              {models.map((model) => (
                <AutocompleteItem key={model.id.toString()}>
                  {model.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='number'
                label={t('weSearchForYou.form.yearFrom')}
                value={formData.year_from}
                onValueChange={(value) => handleChange(value, 'year_from')}
                placeholder={t('weSearchForYou.form.yearFromPlaceholder')}
                variant='bordered'
                classNames={inputClassNames}
              />
              <Input
                type='number'
                label={t('weSearchForYou.form.yearTo')}
                value={formData.year_to}
                onValueChange={(value) => handleChange(value, 'year_to')}
                placeholder={t('weSearchForYou.form.yearToPlaceholder')}
                variant='bordered'
                classNames={inputClassNames}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='number'
                label={t('weSearchForYou.form.maxMileage')}
                value={formData.max_mileage}
                onValueChange={(value) => handleChange(value, 'max_mileage')}
                placeholder={t('weSearchForYou.form.maxMileagePlaceholder')}
                variant='bordered'
                classNames={inputClassNames}
              />
              <Input
                type='number'
                label={t('weSearchForYou.form.maxOwners')}
                value={formData.max_owners}
                onValueChange={(value) => handleChange(value, 'max_owners')}
                placeholder={t('weSearchForYou.form.maxOwnersPlaceholder')}
                variant='bordered'
                classNames={inputClassNames}
              />
            </div>

            <Input
              type='text'
              label={t('weSearchForYou.form.budget')}
              value={formData.budget}
              onValueChange={(value) => handleChange(value, 'budget')}
              startContent='$'
              placeholder={t('weSearchForYou.form.budgetPlaceholder')}
              variant='bordered'
              classNames={inputClassNames}
            />

            <Textarea
              label={t('weSearchForYou.form.message')}
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              placeholder={t('weSearchForYou.form.messagePlaceholder')}
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
              {t('weSearchForYou.form.submit')}
            </Button>
          </form>
        </div>

        {/* Information Section */}
        {!embedded && !hasBuilderStyles && (
        <div className={infoCardClass} style={infoCardStyle}>
          <div className='space-y-8'>
            <h2 className={headingClass} style={headingStyle}>
              {t('weSearchForYou.info.howItWorksTitle')}
            </h2>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('weSearchForYou.info.processTitle')}
              </h3>
              <ol className={`mt-2 space-y-2 list-decimal pl-5 ${bodyClass}`} style={bodyStyle}>
                <li>{t('weSearchForYou.info.processList.step1')}</li>
                <li>{t('weSearchForYou.info.processList.step2')}</li>
                <li>{t('weSearchForYou.info.processList.step3')}</li>
                <li>{t('weSearchForYou.info.processList.step4')}</li>
                <li>{t('weSearchForYou.info.processList.step5')}</li>
                <li>{t('weSearchForYou.info.processList.step6')}</li>
              </ol>
            </div>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('weSearchForYou.info.advantagesTitle')}
              </h3>
              <ul className={`mt-2 space-y-2 list-disc pl-5 ${bodyClass}`} style={bodyStyle}>
                <li>{t('weSearchForYou.info.advantagesList.item1')}</li>
                <li>{t('weSearchForYou.info.advantagesList.item2')}</li>
                <li>{t('weSearchForYou.info.advantagesList.item3')}</li>
                <li>{t('weSearchForYou.info.advantagesList.item4')}</li>
                <li>{t('weSearchForYou.info.advantagesList.item5')}</li>
                <li>{t('weSearchForYou.info.advantagesList.item6')}</li>
              </ul>
            </div>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('weSearchForYou.info.directContactTitle')}
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                {t('weSearchForYou.info.emailLabel')}: {client?.contact?.email}
                <br />
                {t('weSearchForYou.info.phoneLabel')}: {client?.contact?.phone}
              </p>
            </div>

            <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 dark:text-blue-100'>
                💡 {t('weSearchForYou.info.tipTitle')}
              </h4>
              <p className='text-sm text-blue-800 dark:text-blue-200 mt-1'>
                {t('weSearchForYou.info.tipText')}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        leadType={LeadTypes.SEARCH_REQUEST}
        customMessage={t('weSearchForYou.successMessage')}
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Formulario DINÁMICO: se arma desde `formFields` configurados en el builder.
// Solo se usa cuando el nodo trae formFields; si no, se usa el Legacy de arriba.
// ──────────────────────────────────────────────────────────────────────────

const FIELD_KEY = (i: number) => `f_${i}`;

const DynamicWeSearchForm = ({
  title,
  subtitle,
  bgColor,
  textColor,
  accentColor,
  embedded = false,
  formFields = [],
}: FormStyleProps) => {
  const hasBuilderStyles = !!bgColor;
  const isDarkBg =
    bgColor && (bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2'));
  const cardStyle = hasBuilderStyles
    ? { backgroundColor: bgColor, borderColor: textColor ? `${textColor}15` : undefined }
    : undefined;
  const cardClass = hasBuilderStyles
    ? 'rounded-xl shadow-lg p-8 border'
    : 'bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border';
  const titleStyle = hasBuilderStyles ? { color: textColor } : undefined;
  const titleClass = hasBuilderStyles
    ? 'text-3xl sm:text-4xl font-extrabold'
    : 'text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white';
  const subtitleStyle = hasBuilderStyles ? { color: textColor, opacity: 0.6 } : undefined;
  const subtitleClass = hasBuilderStyles
    ? 'mt-4 text-lg'
    : 'mt-4 text-lg text-gray-500 dark:text-gray-400';
  const headingStyle = hasBuilderStyles ? { color: textColor } : undefined;

  const inputClassNames =
    hasBuilderStyles || embedded
      ? {
          label: isDarkBg ? '!text-white/60' : '!text-black/50',
          input: isDarkBg ? '!text-white !placeholder-white/40' : '!text-gray-900',
          inputWrapper: isDarkBg
            ? '!bg-[#262626] !border-[#3a3a3a] hover:!border-[#4a4a4a] !rounded-lg'
            : '!bg-white !border-[#d1d5db] hover:!border-gray-400 !rounded-lg',
        }
      : undefined;
  const buttonStyle =
    (hasBuilderStyles || embedded) && accentColor ? { backgroundColor: accentColor } : undefined;

  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');

  const hasBrandField = formFields.some((f) => f.fieldType === 'brand');

  useEffect(() => {
    if (!hasBrandField) return;
    const fetchBrands = async () => {
      const { data } = await supabase.from('brands').select('*');
      if (data) setBrands(data);
    };
    fetchBrands();
  }, [hasBrandField]);

  useEffect(() => {
    if (selectedBrandId) {
      const fetchModels = async () => {
        const { data } = await supabase
          .from('models')
          .select('*')
          .eq('brand_id', selectedBrandId);
        if (data) setModels(data);
      };
      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

  const setVal = (i: number, v: string) =>
    setValues((prev) => ({ ...prev, [FIELD_KEY(i)]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client?.id) {
      alert('❌ Error: No se pudo identificar la automotora. Por favor, recarga la página.');
      return;
    }

    // Validar campos requeridos por configuración
    for (let i = 0; i < formFields.length; i++) {
      const f = formFields[i];
      if (f.fieldType === 'heading') continue;
      if (f.required && !(values[FIELD_KEY(i)] || '').trim()) {
        alert(`❌ Por favor completa el campo obligatorio: ${f.label || ''}`);
        return;
      }
    }

    try {
      setLoading(true);

      let email = '';
      let phone = '';
      let firstName = '';
      let lastName = '';
      let rut = '';
      let brandId = '';
      let modelId = '';
      const recordFields: { label: string; value?: string; isHeading?: boolean }[] = [];

      formFields.forEach((f, i) => {
        const raw = (values[FIELD_KEY(i)] || '').trim();
        if (f.fieldType === 'heading') {
          recordFields.push({ label: f.label || '', isHeading: true });
          return;
        }
        let display = raw;
        switch (f.fieldType) {
          case 'email':
            email = raw;
            break;
          case 'tel':
            phone = raw;
            break;
          case 'name':
            firstName = raw;
            break;
          case 'lastname':
            lastName = raw;
            break;
          case 'rut':
            rut = raw;
            break;
          case 'brand':
            brandId = raw;
            display = brands.find((b) => b.id === raw)?.name || raw;
            break;
          case 'model':
            modelId = raw;
            display = models.find((m) => m.id.toString() === raw)?.name || raw;
            break;
        }
        recordFields.push({ label: f.label || '', value: display });
      });

      // 1. Customer. Con email usamos initializeCustomer (dedup por email). Si no hay email
      //    pero hay algún dato de contacto, igual creamos el customer para que el lead aparezca
      //    en el CRM (la lista de leads oculta los que tienen customer_id null).
      let customerId: string | undefined;
      if (email) {
        try {
          const customer = await initializeCustomer({
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            email,
            phone: phone || undefined,
            rut: rut || undefined,
            client_id: client.id,
          });
          customerId = customer?.id;
        } catch (err) {
          // Si falla, intentamos el insert directo abajo
        }
      }
      if (!customerId && (firstName || lastName || phone || rut || email)) {
        try {
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert([
              {
                first_name: firstName || null,
                last_name: lastName || null,
                email: email || null,
                phone: phone || null,
                rut: rut || null,
                client_id: client.id,
              },
            ])
            .select('id')
            .single();
          customerId = newCustomer?.id;
        } catch (err) {
          // Continuamos: el lead y el email igual se registran/envían
        }
      }

      // 2. Lead — guardamos las respuestas en search_params.custom_fields (forma nueva,
      //    aditiva: no pisa la forma fija que lee el CRM para otros tipos de lead)
      const leadData: any = {
        client_id: client.id,
        customer_id: customerId ?? null,
        brand_id: brandId || null,
        model_id: modelId ? parseInt(modelId) : null,
        type: LeadTypes.SEARCH_REQUEST,
        status: 'pending',
        search_params: {
          custom: true,
          custom_fields: recordFields
            .filter((f) => !f.isHeading)
            .map((f) => ({ label: f.label, value: f.value || '' })),
        },
      };

      const { error: leadError } = await supabase.from('leads').insert([leadData]);
      if (leadError) throw leadError;

      // 3. Email a los destinatarios configurados (mismos que el form legacy)
      const brandName = brandId ? brands.find((b) => b.id === brandId)?.name || '' : '';
      const modelName = modelId ? models.find((m) => m.id.toString() === modelId)?.name || '' : '';
      const subject =
        brandName || modelName
          ? `Solicitud de Búsqueda: ${`${brandName} ${modelName}`.trim()}`
          : `Nueva solicitud: ${title || 'Buscamos por ti'}`;

      const content = createDynamicLeadEmailTemplate({
        leadTypeName: title || 'Nueva solicitud de búsqueda',
        fields: recordFields,
      });

      const searchEmails =
        client?.contact?.search_emails && client.contact.search_emails.length > 0
          ? client.contact.search_emails
          : [client?.contact?.email || ''];

      await sendEmail({ to: searchEmails, subject, content });

      setValues({});
      setSelectedBrandId('');
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(
        `❌ Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.\n\n${
          error?.message || ''
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicField = (f: DynamicFormField, i: number) => {
    const key = FIELD_KEY(i);
    const value = values[key] || '';
    const label = f.label || '';
    const required = !!f.required;

    switch (f.fieldType) {
      case 'heading':
        return (
          <div key={key} className="border-t pt-6 mt-2">
            <h3 className="text-lg font-semibold" style={headingStyle}>
              {label}
            </h3>
          </div>
        );
      case 'brand':
        return (
          <Autocomplete
            key={key}
            label={label}
            selectedKey={value}
            onSelectionChange={(k) => {
              const v = (k as string) || '';
              setVal(i, v);
              setSelectedBrandId(v);
              const modelIdx = formFields.findIndex((ff) => ff.fieldType === 'model');
              if (modelIdx >= 0) setVal(modelIdx, '');
            }}
            isRequired={required}
            variant="bordered"
            inputProps={{ classNames: inputClassNames }}
          >
            {brands.map((brand) => (
              <AutocompleteItem key={brand.id}>
                {brand.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        );
      case 'model':
        return (
          <Autocomplete
            key={key}
            label={label}
            selectedKey={value}
            onSelectionChange={(k) => setVal(i, (k as string) || '')}
            isRequired={required}
            isDisabled={!selectedBrandId}
            variant="bordered"
            inputProps={{ classNames: inputClassNames }}
          >
            {models.map((model) => (
              <AutocompleteItem key={model.id.toString()}>
                {model.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        );
      case 'select': {
        const opts = (f.options || '')
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean);
        return (
          <Select
            key={key}
            label={label}
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys) => setVal(i, (Array.from(keys)[0] as string) || '')}
            isRequired={required}
            variant="bordered"
            classNames={inputClassNames}
          >
            {opts.map((o) => (
              <SelectItem key={o}>
                {o}
              </SelectItem>
            ))}
          </Select>
        );
      }
      case 'textarea':
        return (
          <Textarea
            key={key}
            label={label}
            value={value}
            onValueChange={(v) => setVal(i, v)}
            isRequired={required}
            minRows={4}
            variant="bordered"
            classNames={inputClassNames}
          />
        );
      default: {
        const inputType =
          f.fieldType === 'number'
            ? 'number'
            : f.fieldType === 'email'
            ? 'email'
            : f.fieldType === 'tel'
            ? 'tel'
            : 'text';
        return (
          <Input
            key={key}
            type={inputType}
            label={label}
            value={value}
            onValueChange={(v) => setVal(i, v)}
            isRequired={required}
            variant="bordered"
            classNames={inputClassNames}
          />
        );
      }
    }
  };

  return (
    <div data-form-section="we-search-for-you">
      {!embedded && title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className={titleClass} style={titleStyle}>
            {title}
          </h1>
          {subtitle && (
            <p className={subtitleClass} style={subtitleStyle}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={embedded ? '' : 'max-w-2xl mx-auto'}>
        <div className={embedded ? '' : cardClass} style={embedded ? undefined : cardStyle}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {formFields.map((f, i) => renderDynamicField(f, i))}
            <Button
              type="submit"
              color="primary"
              fullWidth
              className={
                embedded
                  ? 'font-semibold !text-white hover:opacity-90'
                  : 'font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-primary dark:text-secondary dark:hover:bg-primary/90'
              }
              style={buttonStyle}
              isLoading={loading}
            >
              {t('weSearchForYou.form.submit')}
            </Button>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        leadType={LeadTypes.SEARCH_REQUEST}
        customMessage={t('weSearchForYou.successMessage')}
      />
    </div>
  );
};

const WeSearchForm = (props: FormStyleProps = {}) => {
  if (props.formFields && props.formFields.length > 0) {
    return <DynamicWeSearchForm {...props} />;
  }
  return <LegacyWeSearchForm {...props} />;
};

export default WeSearchForm;
