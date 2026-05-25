import { headers } from 'next/headers';

export async function getClient() {
  const headersList = await headers();
  const clientData = headersList.get('x-client-data');

  if (!clientData) {
    return null;
  }

  return JSON.parse(decodeURIComponent(clientData));
}
