import React, { useState, useMemo } from 'react';
import { UsageTransaction, BagEntry, UsageStatus } from '@/lib/types';
import { PlusIcon, TrashIcon } from './icons';

interface UsageFormProps {
    onSubmit: (data: Omit<UsageTransaction, 'id' | 'type'>) => void;
    onClose: () => void;
    fabricCode: string;
    availableStock: number;
    isAdmin: boolean;
}

const UsageForm: React.FC<UsageFormProps> = ({ onSubmit, onClose, fabricCode, availableStock, isAdmin }) => {
    const [clientName, setClientName] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [shipmentDate, setShipmentDate] = useState('');
    const [orderReceivedDate, setOrderReceivedDate] = useState('');
    const [fabricConsumptionPerPiece, setFabricConsumptionPerPiece] = useState<number | ''>('');
    const [bags, setBags] = useState<BagEntry[]>([{ size: '', quantity: 0 }]);
    const [machineNameAndCapacity, setMachineNameAndCapacity] = useState('');
    const [drawingNumber, setDrawingNumber] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    const totalFabricUsed = useMemo(() => {
        if (!fabricConsumptionPerPiece) return 0;
        const totalBagQuantity = bags.reduce((sum, bag) => sum + (bag.quantity || 0), 0);
        return totalBagQuantity * fabricConsumptionPerPiece;
    }, [bags, fabricConsumptionPerPiece]);

    const handleBagChange = (index: number, field: keyof BagEntry, value: string | number) => {
        const newBags = [...bags];
        (newBags[index] as any)[field] = value;
        setBags(newBags);
    };

    const addBag = () => {
        setBags([...bags, { size: '', quantity: 0 }]);
    };

    const removeBag = (index: number) => {
        if (bags.length > 1) {
            setBags(bags.filter((_, i) => i !== index));
        }
    };
    
    const canSubmit = poNumber.trim() !== '' || isAdmin;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (totalFabricUsed > 0 && totalFabricUsed <= availableStock && clientName && shipmentDate && canSubmit && machineNameAndCapacity && drawingNumber && orderNumber && poNumber && orderReceivedDate) {
            onSubmit({
                clientName,
                poNumber,
                machineNameAndCapacity,
                drawingNumber,
                orderNumber,
                shipmentDate,
                orderReceivedDate,
                fabricConsumptionPerPiece: fabricConsumptionPerPiece || 0,
                bags,
                totalFabricUsed,
                date: new Date().toISOString(),
                status: UsageStatus.PENDING,
                submittedBy: isAdmin ? 'Admin' : 'User',
            });
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Recording usage for fabric <span className="font-bold text-blue-500">{fabricCode}</span>. Entry will be pending until Admin approval.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="client-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Client Name</label>
                    <input type="text" id="client-name" value={clientName} onChange={e => setClientName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="order-number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order Number</label>
                    <input type="text" id="order-number" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div>
                    <label htmlFor="po-number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PO Number</label>
                    <input type="text" id="po-number" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder='Use "Sample" if unavailable' required />
                </div>
                <div>
                    <label htmlFor="drawing-number" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Drawing Number</label>
                    <input type="text" id="drawing-number" value={drawingNumber} onChange={e => setDrawingNumber(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="machine" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Machine Name & Capacity</label>
                    <input type="text" id="machine" value={machineNameAndCapacity} onChange={e => setMachineNameAndCapacity(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="order-received-date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Order Received Date</label>
                    <input type="date" id="order-received-date" value={orderReceivedDate} onChange={e => setOrderReceivedDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="shipment-date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shipment Date</label>
                    <input type="date" id="shipment-date" value={shipmentDate} onChange={e => setShipmentDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="consumption" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fabric Consumption/Piece (m²)</label>
                    <input type="number" id="consumption" value={fabricConsumptionPerPiece} min="0.01" step="0.01" onChange={e => setFabricConsumptionPerPiece(parseFloat(e.target.value) || '')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                </div>
            </div>

            <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bag Sizes & Quantities</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {bags.map((bag, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" placeholder="Bag Size" value={bag.size} onChange={e => handleBagChange(index, 'size', e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white flex-grow" required />
                            <input type="number" placeholder="Quantity" value={bag.quantity || ''} min="0" onChange={e => handleBagChange(index, 'quantity', parseInt(e.target.value) || 0)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white w-24" required />
                            <button type="button" onClick={() => removeBag(index)} disabled={bags.length <= 1} className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addBag} className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <PlusIcon className="w-4 h-4"/> Add Another Size
                </button>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                 <p className="text-sm text-gray-500 dark:text-gray-400">Total Fabric Used (will be deducted after approval)</p>
                 <p className={`text-xl font-bold ${totalFabricUsed > availableStock ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{totalFabricUsed.toFixed(2)} m²</p>
                 <p className="text-xs text-gray-500 mt-1">Currently Available: {availableStock.toFixed(2)} m²</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={totalFabricUsed <= 0 || totalFabricUsed > availableStock} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed">
                    Submit for Approval
                </button>
            </div>
        </form>
    );
};

export default UsageForm;
