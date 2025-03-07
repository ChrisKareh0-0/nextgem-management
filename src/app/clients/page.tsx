'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ClientsTable } from "@/components/Tables/clients-table";
import { ClientForm } from "@/components/Forms/client-form";
import useClients from "@/hooks/useClients";
import { Client } from '@/types/client';
import { requestNotificationPermission, checkForOverduePayments } from '@/utils/notification';

export default function ClientsPage() {
  const { clients, loading, error, addClient, updateClient, deleteClient, endSubscription, recordPayment } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Request notification permission when the page loads
    const requestPermission = async () => {
      await requestNotificationPermission();
    };
    
    requestPermission();
  }, []);

  useEffect(() => {
    // Check for overdue payments whenever clients change
    if (clients.length > 0) {
      // Only check active clients for overdue payments
      const activeClients = clients.filter(client => client.subscriptionStatus === 'active');
      checkForOverduePayments(activeClients);
    }
  }, [clients]);

  const handleAddClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    console.log("Editing client with ID:", client._id);
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSubmit = async (client: Omit<Client, '_id'> | Client) => {
    try {
      console.log("Form submitted with client data:", client);
      
      if ('_id' in client) {
        console.log("Updating existing client with ID:", client._id);
        await updateClient(client as Client);
      } else {
        console.log("Adding new client");
        await addClient(client);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting client form:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId);
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleEndSubscription = async (clientId: string) => {
    if (window.confirm('Are you sure you want to end this client\'s subscription? This will stop payment notifications.')) {
      try {
        await endSubscription(clientId);
      } catch (error) {
        console.error('Error ending subscription:', error);
        alert('Failed to end subscription. Please try again.');
      }
    }
  };

  const handleRecordPayment = (clientId: string) => {
    setSelectedClientId(clientId);
    setPaymentDate(new Date().toISOString().split('T')[0]); // Reset to today
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedClientId) return;
    
    try {
      await recordPayment(selectedClientId, paymentDate);
      setShowPaymentModal(false);
      setSelectedClientId(null);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Clients" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Clients" />
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Clients" />
      
      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Clients
          </h2>
          <button
            onClick={handleAddClient}
            className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-7"
          >
            Add Client
          </button>
        </div>

        <ClientsTable 
          clients={clients} 
          onDelete={handleDeleteClient} 
          onEdit={handleEditClient} 
          onEndSubscription={handleEndSubscription}
          onRecordPayment={handleRecordPayment}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h3>
            <ClientForm 
              client={editingClient} 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
            />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Record Payment
            </h3>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 