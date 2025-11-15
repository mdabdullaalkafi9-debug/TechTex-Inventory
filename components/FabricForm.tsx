import React, { useState, useEffect } from 'react';
import { Fabric, FabricCategory } from '@/lib/types';

interface FabricFormProps {
  onSubmit: (fabric: Omit<Fabric, 'id' | 'transactions' | 'availableStock'> & { id?: string }) => void;
  onClose: () => void;
  initialData?: Fabric;
  isAdmin: boolean;
}

const FabricForm: React.FC<FabricFormProps> = ({ onSubmit, onClose, initialData, isAdmin }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FabricCategory>(FabricCategory.WOVEN);
  const [initialStock, setInitialStock] = useState(0);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setCategory(initialData.category);
      setInitialStock(initialData.initialStock);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(initialData && { id: initialData.id }),
      code,
      name,
      category,
      initialStock,
    });
  };

  const isEditing = !!initialData;
  const canEditInitialStock = !isEditing || (isEditing && isAdmin);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fabric-code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fabric Code</label>
        <input
          type="text"
          id="fabric-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="fabric-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fabric Name</label>
        <input
          type="text"
          id="fabric-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as FabricCategory)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          <option value={FabricCategory.WOVEN}>Woven</option>
          <option value={FabricCategory.NON_WOVEN}>Non-woven</option>
        </select>
      </div>
      <div>
        <label htmlFor="initial-stock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Initial Stock (m²)</label>
        <input
          type="number"
          id="initial-stock"
          value={initialStock}
          min="0"
          onChange={(e) => setInitialStock(parseFloat(e.target.value))}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          required
          readOnly={!canEditInitialStock}
          disabled={!canEditInitialStock}
        />
        {!canEditInitialStock && <p className="text-xs text-yellow-500 mt-1">Initial stock can only be edited by an Admin.</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          {initialData ? 'Save Changes' : 'Add Fabric'}
        </button>
      </div>
    </form>
  );
};

export default FabricForm;
