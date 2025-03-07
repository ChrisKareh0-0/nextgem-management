import { useState, useEffect, useRef } from 'react';
import { Client } from '@/types/client';

interface ClientFormProps {
  client?: Client;
  onSubmit: (client: Omit<Client, '_id'> | Client) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<Omit<Client, '_id'>>({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    subscriptionDate: '',
    subscriptionStatus: 'active',
    paymentDueDate: {
      day: 1,
      month: 1,
    },
    quotationFile: null,
    quotationAmount: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Use a ref to directly access the current quotation amount input value
  const quotationAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (client) {
      console.log("Setting initial client data:", client);
      console.log("Quotation amount from client:", client.quotationAmount, typeof client.quotationAmount);
      
      // When editing, include all fields from the existing client
      setFormData({
        companyName: client.companyName,
        contactName: client.contactName,
        phone: client.phone,
        email: client.email || '',
        subscriptionDate: client.subscriptionDate,
        subscriptionStatus: client.subscriptionStatus || 'active',
        subscriptionEndDate: client.subscriptionEndDate,
        paymentDueDate: client.paymentDueDate,
        quotationFile: client.quotationFile,
        quotationAmount: typeof client.quotationAmount === 'number' ? client.quotationAmount : 0,
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'day') {
      // For payment due day, we now only need to update the day
      // The month will be calculated dynamically based on the current month
      setFormData({
        ...formData,
        paymentDueDate: {
          ...formData.paymentDueDate,
          day: parseInt(value, 10),
          // Set month to current month initially, but it will be dynamic when used
          month: new Date().getMonth() + 1,
        },
      });
    } else if (name === 'quotationAmount') {
      // CRITICAL FIX: Enhanced handling of quotation amount input
      console.log(`Raw quotationAmount input value: "${value}"`);
      
      // Process the input value
      let numValue: number;
      
      if (value === '') {
        // For empty input, use 0 but log this special case
        numValue = 0;
        console.log('Empty quotation amount input - setting to 0');
      } else {
        // Use parseFloat for better decimal precision
        numValue = parseFloat(value);
        
        // Safety check for NaN
        if (isNaN(numValue)) {
          numValue = 0;
          console.log(`Failed to parse "${value}" to number, defaulting to 0`);
        } else {
          console.log(`Parsed quotationAmount: ${value} -> ${numValue} (${typeof numValue})`);
        }
      }
      
      // Update the form state with the numeric value
      setFormData({
        ...formData,
        quotationAmount: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload file');
      }
      
      return result.data.path;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedFormData = { ...formData };
    
    // If there's a new file selected, upload it
    if (selectedFile) {
      const filePath = await uploadFile(selectedFile);
      if (filePath) {
        updatedFormData.quotationFile = filePath;
      }
    }
    
    // CRITICAL FIX: Get the amount directly from the input field if available
    let amount: number;
    if (quotationAmountRef.current) {
      const inputValue = quotationAmountRef.current.value;
      console.log(`Direct quotationAmount input value at submit: "${inputValue}"`);
      
      // Important: Handle empty string case
      if (inputValue === '') {
        amount = 0;
        console.log('Empty input value detected, using 0 as fallback');
      } else {
        // Use parseFloat for better decimal precision
        amount = parseFloat(inputValue);
        console.log(`Parsed direct input value to: ${amount}`);
        
        // Safety check for NaN
        if (isNaN(amount)) {
          console.log('Parsed value is NaN, falling back to 0');
          amount = 0;
        }
      }
    } else {
      // Fallback to the state value
      amount = typeof updatedFormData.quotationAmount === 'number' ? 
        updatedFormData.quotationAmount : 0;
      console.log(`Using state value for amount: ${amount}`);
    }
    
    // Ensure it's a valid number
    const safeQuotationAmount = isNaN(amount) ? 0 : amount;
    console.log(`Final quotationAmount for submission: ${safeQuotationAmount} (${typeof safeQuotationAmount})`);
    
    // Explicitly set the amount in the form data
    updatedFormData.quotationAmount = safeQuotationAmount;
    
    console.log("Form data before submission:", updatedFormData);
    
    if (client) {
      // When updating an existing client, include the _id and ensure quotationAmount is explicitly set
      const dataToSubmit = {
        ...updatedFormData,
        _id: client._id,
        quotationAmount: safeQuotationAmount  // Explicitly include it
      };
      console.log("Submitting update with data:", dataToSubmit);
      console.log("Final quotation amount for update:", dataToSubmit.quotationAmount, typeof dataToSubmit.quotationAmount);
      
      // Extra check to confirm it's being sent as a number
      if (typeof dataToSubmit.quotationAmount !== 'number') {
        console.warn("Warning: quotationAmount is not a number type:", typeof dataToSubmit.quotationAmount);
        // Force conversion one last time
        dataToSubmit.quotationAmount = Number(dataToSubmit.quotationAmount) || 0;
        console.log("Forced conversion to number:", dataToSubmit.quotationAmount, typeof dataToSubmit.quotationAmount);
      }
      
      onSubmit(dataToSubmit);
    } else {
      // When creating a new client, don't include any _id field
      // This prevents MongoDB duplicate key errors
      const dataToSubmit = {
        ...updatedFormData,
        quotationAmount: safeQuotationAmount  // Explicitly include it
      };
      console.log('Creating new client with form data (no _id):', dataToSubmit);
      console.log("Final quotation amount for new client:", dataToSubmit.quotationAmount, typeof dataToSubmit.quotationAmount);
      
      // Extra check to confirm it's being sent as a number
      if (typeof dataToSubmit.quotationAmount !== 'number') {
        console.warn("Warning: quotationAmount is not a number type:", typeof dataToSubmit.quotationAmount);
        // Force conversion one last time
        dataToSubmit.quotationAmount = Number(dataToSubmit.quotationAmount) || 0;
        console.log("Forced conversion to number:", dataToSubmit.quotationAmount, typeof dataToSubmit.quotationAmount);
      }
      
      onSubmit(dataToSubmit);
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <h2 className="mb-6 text-xl font-semibold text-dark dark:text-white">
        {client ? 'Edit Client' : 'Add New Client'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Contact Name
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Subscription Date
            </label>
            <input
              type="date"
              name="subscriptionDate"
              value={formData.subscriptionDate}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Quotation Amount ($)
            </label>
            <input
              ref={quotationAmountRef}
              type="number"
              name="quotationAmount"
              value={formData.quotationAmount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Monthly Payment Due Day
            </label>
            <select
              name="day"
              value={formData.paymentDueDate.day}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Payment will be due on this day every month
            </p>
          </div>
          
          <div>
            <label className="mb-2.5 block font-medium text-dark dark:text-white">
              Quotation File
            </label>
            <input
              type="file"
              name="quotationFile"
              onChange={handleFileChange}
              accept=".pdf"
              className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:text-white dark:focus:border-primary"
            />
            {formData.quotationFile && !selectedFile && (
              <p className="mt-2 text-sm text-gray-500">
                Current file: {formData.quotationFile.split('/').pop()}
              </p>
            )}
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-stroke px-6 py-2 text-base font-medium text-dark hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:text-white dark:hover:border-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-md bg-primary px-6 py-2 text-base font-medium text-white hover:bg-primary/90 disabled:opacity-70"
          >
            {isUploading ? 'Uploading...' : client ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
} 