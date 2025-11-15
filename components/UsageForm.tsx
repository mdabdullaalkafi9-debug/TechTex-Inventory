import React, { useState, useMemo } from 'react';
import { UsageTransaction, BagEntry, UsageStatus } from '../lib/types';
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
    
    // An admin can submit without a PO if they explicitly use "Sample" or another value. Regular users always need a value.
    const canSubmit = poNumber.trim() !== '' || isAdmin;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Check all mandatory fields are filled
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
                    <label htmlFor="drawing-number" className="block mb-