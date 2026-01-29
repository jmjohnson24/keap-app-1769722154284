'use client';

import { useState, useEffect } from 'react';
import { keapAPI, KeapContact } from '../lib/keap';

export default function ContactViewer() {
  const [contacts, setContacts] = useState<KeapContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<KeapContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<KeapContact[]>([]);
  const [view, setView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact => {
        const fullName = `${contact.given_name || ''} ${contact.family_name || ''}`.toLowerCase();
        const email = contact.email_addresses?.[0]?.email?.toLowerCase() || '';
        const phone = contact.phone_numbers?.[0]?.number || '';
        const query = searchQuery.toLowerCase();
        
        return fullName.includes(query) || email.includes(query) || phone.includes(query);
      });
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await keapAPI.getContacts(100);
      setContacts(response.contacts || []);
    } catch (err) {
      setError('Failed to load contacts. Please check your API credentials.');
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (contact: KeapContact) => {
    try {
      setLoading(true);
      const fullContact = await keapAPI.getContact(contact.id);
      setSelectedContact(fullContact);
      setView('detail');
    } catch (err) {
      setError('Failed to load contact details.');
      console.error('Error loading contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPoolType = (contact: KeapContact): string => {
    const poolField = contact.custom_fields?.find(field => 
      field.content?.toLowerCase().includes('salt') || 
      field.content?.toLowerCase().includes('chlorine')
    );
    
    if (poolField?.content?.toLowerCase().includes('salt')) return 'Salt';
    if (poolField?.content?.toLowerCase().includes('chlorine')) return 'Chlorine';
    return 'Unknown';
  };

  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contacts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadContacts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keap Contact Viewer</h1>
          <p className="text-gray-600">View and search your Keap contacts</p>
        </header>

        {view === 'list' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Contacts ({filteredContacts.length})
                </h2>
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No contacts found' : 'No contacts available'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Your contact list is empty.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredContacts.map((contact) => {
                    const fullName = `${contact.given_name || ''} ${contact.family_name || ''}`.trim() || 'Unnamed Contact';
                    const email = contact.email_addresses?.[0]?.email || 'No email';
                    const phone = contact.phone_numbers?.[0]?.number || 'No phone';
                    const poolType = getPoolType(contact);

                    return (
                      <div
                        key={contact.id}
                        onClick={() => handleContactClick(contact)}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{fullName}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-12 text-gray-500">Email:</span>
                                <span>{email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-12 text-gray-500">Phone:</span>
                                <span>{phone !== 'No phone' ? formatPhone(phone) : phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-12 text-gray-500">Pool:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  poolType === 'Salt' ? 'bg-blue-100 text-blue-800' :
                                  poolType === 'Chlorine' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {poolType}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Contacts
              </button>
            </div>

            {selectedContact && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {`${selectedContact.given_name || ''} ${selectedContact.family_name || ''}`.trim() || 'Unnamed Contact'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Pool Type:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getPoolType(selectedContact) === 'Salt' ? 'bg-blue-100 text-blue-800' :
                      getPoolType(selectedContact) === 'Chlorine' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getPoolType(selectedContact)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses</label>
                        {selectedContact.email_addresses?.length ? (
                          <div className="space-y-1">
                            {selectedContact.email_addresses.map((email, index) => (
                              <div key={index} className="text-sm text-gray-900">
                                <a href={`mailto:${email.email}`} className="text-blue-600 hover:underline">
                                  {email.email}
                                </a>
                                {email.field && <span className="text-gray-500 ml-2">({email.field})</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No email addresses</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
                        {selectedContact.phone_numbers?.length ? (
                          <div className="space-y-1">
                            {selectedContact.phone_numbers.map((phone, index) => (
                              <div key={index} className="text-sm text-gray-900">
                                <a href={`tel:${phone.number}`} className="text-blue-600 hover:underline">
                                  {formatPhone(phone.number)}
                                </a>
                                {phone.field && <span className="text-gray-500 ml-2">({phone.field})</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No phone numbers</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    {selectedContact.addresses?.length ? (
                      <div className="space-y-2">
                        {selectedContact.addresses.map((address, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {address.line1 && <div>{address.line1}</div>}
                            {address.line2 && <div>{address.line2}</div>}
                            <div>
                              {address.locality && <span>{address.locality}</span>}
                              {address.region && <span>, {address.region}</span>}
                              {address.zip_code && <span> {address.zip_code}</span>}
                            </div>
                            {address.country_code && <div>{address.country_code}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No address information</p>
                    )}
                  </div>
                </div>

                {selectedContact.custom_fields?.length && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h3>
                    <div className="grid gap-3">
                      {selectedContact.custom_fields.map((field, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700">Field ID: {field.id}</div>
                          <div className="text-sm text-gray-900 mt-1">{field.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
