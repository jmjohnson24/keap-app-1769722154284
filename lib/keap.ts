const KEAP_API_KEY = 'KeapAK-99e0c9ee9da830cb526ec442774ac95e0f1259529534921d9e';
const KEAP_BASE_URL = 'https://api.infusionsoft.com/crm/rest';

export interface KeapContact {
  id: number;
  given_name?: string;
  family_name?: string;
  email_addresses?: Array<{
    email: string;
    field: string;
  }>;
  phone_numbers?: Array<{
    number: string;
    field: string;
  }>;
  custom_fields?: Array<{
    id: number;
    content: string;
  }>;
  addresses?: Array<{
    line1?: string;
    line2?: string;
    locality?: string;
    region?: string;
    zip_code?: string;
    country_code?: string;
  }>;
}

export interface KeapContactsResponse {
  contacts: KeapContact[];
  count: number;
  next?: string;
}

class KeapAPI {
  private headers = {
    'Authorization': `Bearer ${KEAP_API_KEY}`,
    'Content-Type': 'application/json',
  };

  async getContacts(limit = 50, offset = 0): Promise<KeapContactsResponse> {
    try {
      const response = await fetch(
        `${KEAP_BASE_URL}/v1/contacts?limit=${limit}&offset=${offset}`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  async getContact(id: number): Promise<KeapContact> {
    try {
      const response = await fetch(
        `${KEAP_BASE_URL}/v1/contacts/${id}`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  }

  async searchContacts(query: string): Promise<KeapContactsResponse> {
    try {
      const response = await fetch(
        `${KEAP_BASE_URL}/v1/contacts?email=${encodeURIComponent(query)}&limit=50`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }
}

export const keapAPI = new KeapAPI();
