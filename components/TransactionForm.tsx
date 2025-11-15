
import React, { useState } from 'react';
import { TransactionType } from '../types';

interface TransactionFormProps {
  onSubmit: (amount: number, notes?: string) => void;
  onClose: () => void;
  transactionType: TransactionType;
  fabricCode: string;
  availableStock: number;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, transactionType, fabricCode, availableStock }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Check if amount is not an empty string before comparing it as a number and passing it to onSubmit.
    if(amount !== '' && amount > 0) {
        onSubmit(amount, notes);
    }
  };
  
  const isUsage = transactionType === TransactionType.USAGE;
  const maxAmount = isUsage ? availableStock : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        You are recording a <span className={`font-semibold ${isUsage ? 'text-red-500' : 'text-green-500'}`}>{transactionType}</span> for fabric <span className="font-bold text-blue-500">{fabricCode}</span>.
      </p>
      <div>
        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount (m²)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          min="0.01"
          step="0.01"
          max={maxAmount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          required
        />
        {isUsage && <p className="text-xs text-gray-500 mt-1">Available: {availableStock} m²</p>}
      </div>
      <div>
        <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes (Optional)</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="e.g., PO #12345, Order for Client X"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Record {isUsage ? 'Usage' : 'Purchase'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
