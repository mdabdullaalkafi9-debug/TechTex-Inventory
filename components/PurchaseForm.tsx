import React, { useState } from 'react';
import { PurchaseTransaction } from '@/lib/types';

interface PurchaseFormProps {
  onSubmit: (data: Omit<PurchaseTransaction, 'id' | 'type'>) => void;
  onClose: () => void;
  fabricCode: string;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSubmit, onClose, fabricCode }) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity !== '' && quantity > 0) {
      onSubmit({
        quantity,
        invoiceNumber,
        date: new Date().toISOString(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Recording a purchase for fabric <span className="font-bold text-blue-500">{fabricCode}</span>.
      </p>
      <div>
        <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Purchase Quantity (m²)</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          min="0.01"
          step="0.01"
          onChange={(e) => setQuantity(parseFloat(e.target.value) || '')}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          required
        />
      </div>
       <div>
        <label htmlFor="invoice" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Invoice / Reference # (Optional)</label>
        <input
          type="text"
          id="invoice"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="e.g., INV-2024-123"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Record Purchase
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;
