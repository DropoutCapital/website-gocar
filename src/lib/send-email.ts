import { supabase } from '@/lib/supabase';

interface EmailOptions {
  to: string[];
  subject: string;
  content: string;
  from?: string;
  template_id?: string;
  template_data?: Record<string, any>;
}

/**
 * Método de respaldo que usa fetch directo para enviar email
 * en caso que el SDK de Supabase falle
 */
async function sendEmailFallback(options: EmailOptions): Promise<void> {
  const response = await fetch(
    'https://miuiujntdjrjhhcysiba.supabase.co/functions/v1/send-email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        content: options.content,
        from: options.from,
        template_id: options.template_id,
        template_data: options.template_data,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al enviar el email');
  }
}

/**
 * Envía un email utilizando la función de Supabase
 * @param options Opciones del email a enviar
 * @returns Resultado de la operación
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    // Usar el SDK de Supabase en lugar de fetch directo
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        content: options.content,
        from: options.from,
        template_id: options.template_id,
        template_data: options.template_data,
      },
    });

    if (error) {
      console.warn('Error using Supabase SDK, trying fallback method:', error);
      // Si falla el SDK, intentar con el método de fetch directo
      await sendEmailFallback(options);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al enviar el email',
    };
  }
}

/**
 * Crea una plantilla HTML para confirmación de cita
 */
export function createAppointmentEmailTemplate({
  customerName,
  customerEmail,
  customerPhone,
  appointmentDate,
  appointmentTime,
  dealershipAddress,
  vehicleDetails,
  notes,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  dealershipAddress: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: string;
  };
  notes?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Cita</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f8f9fa;">
      <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); padding: 0 0 24px 0;">
        <!-- Header -->
        <div style="background-color: #51bde5; padding: 24px 24px 20px 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 26px;">¡Cita Agendada!</h1>
          <p style="color: white; margin: 8px 0 0 0; font-size: 15px;">Tu visita ha sido confirmada</p>
        </div>

        <!-- Bloque Cita -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Detalles de la Cita</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>📅 Fecha:</strong></td><td style="padding: 7px 0;">${appointmentDate}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>🕐 Hora:</strong></td><td style="padding: 7px 0;">${appointmentTime}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>📍 Sucursal:</strong></td><td style="padding: 7px 0;">${dealershipAddress}</td></tr>
          </table>
        </div>

        <!-- Bloque Cliente -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Información del Cliente</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Nombre:</strong></td><td style="padding: 7px 0;">${customerName}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Email:</strong></td><td style="padding: 7px 0;"><a href="mailto:${customerEmail}" style="color: #51bde5; text-decoration: none;">${customerEmail}</a></td></tr>
            <tr><td style="padding: 7px 0;"><strong>Teléfono:</strong></td><td style="padding: 7px 0;"><a href="tel:${customerPhone}" style="color: #51bde5; text-decoration: none;">${customerPhone}</a></td></tr>
          </table>
        </div>

        <!-- Bloque Vehículo -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Vehículo de Interés</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Marca:</strong></td><td style="padding: 7px 0;">${vehicleDetails.brand}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Modelo:</strong></td><td style="padding: 7px 0;">${vehicleDetails.model}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Año:</strong></td><td style="padding: 7px 0;">${vehicleDetails.year}</td></tr>
          </table>
        </div>

        ${
          notes
            ? `<div style="padding: 24px 24px 0 24px;"><h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Notas del Cliente</h2><div style="padding: 10px 0; white-space: pre-wrap; font-size: 15px;">${notes}</div></div>`
            : ''
        }

        <!-- CTA Button -->
        <div style="margin: 30px 0 0 0; text-align: center;">
          <a href="https://portal.goauto.cl/appointments"
             style="background-color: #51bde5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Ver detalles en el Portal
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; margin-top: 32px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">
            Este es un email automático generado por <a href="https://goauto.cl" style="color: #51bde5; text-decoration: none;">GoAuto</a>.
            <br>Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Crea una plantilla HTML para cancelación de cita
 */
export function createAppointmentCancellationEmailTemplate({
  customerName,
  customerEmail,
  customerPhone,
  appointmentDate,
  appointmentTime,
  dealershipAddress,
  vehicleDetails,
  cancellationReason,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  dealershipAddress: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: string;
  };
  cancellationReason?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cita Cancelada</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f8f9fa;">
      <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); padding: 0 0 24px 0;">
        <!-- Header -->
        <div style="background-color: #ef4444; padding: 24px 24px 20px 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 26px;">Cita Cancelada</h1>
          <p style="color: white; margin: 8px 0 0 0; font-size: 15px;">La siguiente cita ha sido cancelada</p>
        </div>

        <!-- Bloque Cita -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Detalles de la Cita Cancelada</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>📅 Fecha:</strong></td><td style="padding: 7px 0;">${appointmentDate}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>🕐 Hora:</strong></td><td style="padding: 7px 0;">${appointmentTime}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>📍 Sucursal:</strong></td><td style="padding: 7px 0;">${dealershipAddress}</td></tr>
          </table>
        </div>

        <!-- Bloque Cliente -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Información del Cliente</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Nombre:</strong></td><td style="padding: 7px 0;">${customerName}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Email:</strong></td><td style="padding: 7px 0;"><a href="mailto:${customerEmail}" style="color: #51bde5; text-decoration: none;">${customerEmail}</a></td></tr>
            <tr><td style="padding: 7px 0;"><strong>Teléfono:</strong></td><td style="padding: 7px 0;"><a href="tel:${customerPhone}" style="color: #51bde5; text-decoration: none;">${customerPhone}</a></td></tr>
          </table>
        </div>

        <!-- Bloque Vehículo -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Vehículo</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Marca:</strong></td><td style="padding: 7px 0;">${vehicleDetails.brand}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Modelo:</strong></td><td style="padding: 7px 0;">${vehicleDetails.model}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Año:</strong></td><td style="padding: 7px 0;">${vehicleDetails.year}</td></tr>
          </table>
        </div>

        ${
          cancellationReason
            ? `<div style="padding: 24px 24px 0 24px;"><h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Motivo de Cancelación</h2><div style="padding: 10px 0; white-space: pre-wrap; font-size: 15px;">${cancellationReason}</div></div>`
            : ''
        }

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; margin-top: 32px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">
            Este es un email automático generado por <a href="https://goauto.cl" style="color: #51bde5; text-decoration: none;">GoAuto</a>.
            <br>Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Crea una plantilla HTML para leads de vehículos
 */
export function createVehicleLeadEmailTemplate({
  leadType,
  customerName,
  customerEmail,
  customerPhone,
  vehicleDetails,
  additionalMessage,
}: {
  leadType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: string;
    mileage?: string;
    condition?: string;
    price?: string;
    license_plate?: string;
  };
  additionalMessage?: string;
}): string {
  const leadTypeMap: Record<string, string> = {
    'buy-direct': 'Venta de Vehículo',
    'buy-consignment': 'Consignación',
    'search-request': 'Búsqueda de Vehículo',
    'sell-vehicle': 'Compra de Vehículo',
  };

  const leadTypeName = leadTypeMap[leadType] || leadType;

  // (Para formularios configurables desde el builder, ver createDynamicLeadEmailTemplate al final.)

  // Formatear los valores del vehículo para mejor visualización
  const formattedVehicleDetails = {
    brand: vehicleDetails.brand || 'No especificado',
    model: vehicleDetails.model || 'No especificado',
    year: vehicleDetails.year || 'No especificado',
    mileage: vehicleDetails.mileage
      ? vehicleDetails.mileage.includes('km')
        ? vehicleDetails.mileage
        : vehicleDetails.mileage.includes('Máximo')
        ? `${vehicleDetails.mileage} km`
        : `${vehicleDetails.mileage} km`
      : 'No especificado',
    condition: vehicleDetails.condition || 'No especificado',
    price: vehicleDetails.price
      ? `$${vehicleDetails.price}`
      : 'No especificado',
    license_plate: vehicleDetails.license_plate || 'No especificado',
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Lead de ${leadTypeName}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f8f9fa;">
      <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); padding: 0 0 24px 0;">
        <!-- Header -->
        <div style="background-color: #51bde5; padding: 24px 24px 20px 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 26px;">Nuevo Lead: ${leadTypeName}</h1>
        </div>
        <!-- Bloque Cliente -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Información del Cliente</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Nombre:</strong></td><td style="padding: 7px 0;">${customerName}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Email:</strong></td><td style="padding: 7px 0;"><a href="mailto:${customerEmail}" style="color: #51bde5; text-decoration: none;">${customerEmail}</a></td></tr>
            <tr><td style="padding: 7px 0;"><strong>Teléfono:</strong></td><td style="padding: 7px 0;"><a href="tel:${customerPhone}" style="color: #51bde5; text-decoration: none;">${customerPhone}</a></td></tr>
          </table>
        </div>
        <!-- Bloque Vehículo -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Detalles del Vehículo</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Marca:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.brand
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Modelo:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.model
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Año:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.year
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Kilometraje:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.mileage
            }</td></tr>
            ${
              leadType !== 'search-request'
                ? `<tr><td style="padding: 7px 0;"><strong>Condición:</strong></td><td style="padding: 7px 0;">${formattedVehicleDetails.condition}</td></tr>`
                : ''
            }
            ${
              leadType === 'buy-consignment'
                ? ''
                : `<tr><td style="padding: 7px 0;"><strong>Precio:</strong></td><td style="padding: 7px 0;">${formattedVehicleDetails.price}</td></tr>`
            }
          </table>
        </div>
        <!-- Mensaje del cliente -->
        ${
          additionalMessage
            ? `<div style=\"padding: 24px 24px 0 24px;\"><h2 style=\"color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;\">Mensaje del cliente</h2><div style=\"padding: 10px 0; white-space: pre-wrap; font-size: 15px;\">${additionalMessage}</div></div>`
            : ''
        }
        <!-- CTA Button -->
        <div style="margin: 30px 0 0 0; text-align: center;">
          <a href="https://portal.goauto.cl/leads" 
             style="background-color: #51bde5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Ver detalles en el Portal
          </a>
        </div>
        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; margin-top: 32px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">
            Este es un email automático generado por <a href="https://goauto.cl" style="color: #51bde5; text-decoration: none;">GoAuto</a>.
            <br>Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Escapa HTML para evitar inyección al volcar valores arbitrarios del usuario en el email.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Plantilla HTML genérica para formularios configurables desde el builder.
 * Recibe una lista de campos { label, value } y los renderiza como tabla.
 * Los campos con isHeading se muestran como subtítulo de sección.
 * Todos los valores se escapan (anti-XSS).
 */
export function createDynamicLeadEmailTemplate({
  leadTypeName = 'Nueva solicitud',
  fields,
}: {
  leadTypeName?: string;
  fields: { label: string; value?: string; isHeading?: boolean }[];
}): string {
  const rows = (fields || [])
    .map((f) => {
      if (f.isHeading) {
        return `<tr><td colspan="2" style="padding: 20px 0 8px 0;"><h2 style="color: #222; font-size: 16px; margin: 0; letter-spacing: 1px;">${escapeHtml(
          f.label
        )}</h2></td></tr>`;
      }
      const rawValue = (f.value ?? '').toString().trim();
      const value = rawValue ? escapeHtml(rawValue).replace(/\n/g, '<br>') : 'No especificado';
      return `<tr><td style="padding: 7px 0; width: 200px; vertical-align: top;"><strong>${escapeHtml(
        f.label
      )}:</strong></td><td style="padding: 7px 0;">${value}</td></tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(leadTypeName)}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f8f9fa;">
      <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); padding: 0 0 24px 0;">
        <div style="background-color: #51bde5; padding: 24px 24px 20px 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 26px;">${escapeHtml(leadTypeName)}</h1>
        </div>
        <div style="padding: 24px 24px 0 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            ${rows}
          </table>
        </div>
        <div style="margin: 30px 0 0 0; text-align: center;">
          <a href="https://portal.goauto.cl/leads"
             style="background-color: #51bde5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Ver detalles en el Portal
          </a>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; margin-top: 32px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">
            Este es un email automático generado por <a href="https://goauto.cl" style="color: #51bde5; text-decoration: none;">GoAuto</a>.
            <br>Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
