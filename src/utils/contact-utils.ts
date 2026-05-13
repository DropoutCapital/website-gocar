type PhoneInput =
  | string
  | { phone?: string | null }
  | null
  | undefined;

/**
 * Normaliza un teléfono chileno al formato `569XXXXXXXX` (11 dígitos, sin "+").
 * Acepta string, objeto `{ phone }` o JSON-string. Devuelve `null` si el número
 * no puede normalizarse a un móvil chileno válido.
 */
export const normalizeChilePhone = (phoneInput: PhoneInput): string | null => {
  if (!phoneInput) return null;

  let raw = '';
  if (typeof phoneInput === 'string') {
    try {
      const parsed = JSON.parse(phoneInput);
      raw = parsed?.phone || phoneInput;
    } catch {
      raw = phoneInput;
    }
  } else if (typeof phoneInput === 'object' && phoneInput.phone) {
    raw = phoneInput.phone;
  }

  if (!raw) return null;

  const d = raw.replace(/\D/g, '');

  if (d.length === 11 && d.startsWith('569')) return d;
  if (d.length === 9 && d.startsWith('9')) return `56${d}`;
  if (d.length === 8) return `569${d}`;
  if (d.length === 10 && d.startsWith('56')) return `569${d.slice(2)}`;
  if (d.length === 12 && d.startsWith('0569')) return d.slice(1);
  if (d.length === 13 && d.startsWith('00569')) return d.slice(2);

  return null;
};

/**
 * Construye la URL completa de WhatsApp con número chileno normalizado y mensaje
 * pre-rellenado opcional. Devuelve `null` si el número no es válido, para que el
 * caller pueda decidir no mostrar el botón en vez de generar un link roto.
 */
export const buildWhatsAppUrl = (
  phoneInput: PhoneInput,
  message?: string
): string | null => {
  const normalized = normalizeChilePhone(phoneInput);
  if (!normalized) return null;
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${encoded}`;
};
