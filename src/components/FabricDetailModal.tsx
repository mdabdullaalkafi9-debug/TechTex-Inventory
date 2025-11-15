import React from 'react';
import { Fabric, TransactionType, PurchaseTransaction, UsageTransaction, UsageStatus } from '../types';

interface FabricDetailModalProps {
  fabric: Fabric;
}

const FabricDetailModal: React.FC<FabricDetailModalProps> = ({ fabric }) => {
    
    const purchases = fabric.transactions.filter(
        (t): t is PurchaseTransaction => t.type === TransactionType.PURCHASE
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const usages = fabric.transactions.filter(
        (t): t is UsageTransaction => t.type === TransactionType.USAGE
    ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    const formatDateTime = (dateString?: string) => dateString ? new Date(dateString).toLocaleString() : 'N/A';

    const StatusBadge = ({status}: {status: UsageStatus}) => {
        const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
        if (status === UsageStatus.CONFIRMED) {
            return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Confirmed</span>;
        }
        if (status === UsageStatus.REJECTED) {
             return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Rejected</span>;
        }
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Pending</span>;
    }

    return (
        <div className="text-sm text-gray-800 dark:text-gray-200 space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <div>
                <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">{fabric.code}</h4>
                <p className="text-gray-600 dark:text-gray-300">{fabric.name}</p>
            </div>
            
            <div>
                <h5 className="text-md font-semibold mb-2 border-b pb-1 border-gray-200 dark:border-gray-700">Purchase History</h5>
                {purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Quantity (m²)</th>
                                    <th className="px-4 py-2">Invoice #</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map(p => (
                                    <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-2">{formatDate(p.date)}</td>
                                        <td className="px-4 py-2 font-medium text-green-600 dark:text-green-400">+{p.quantity.toFixed(2)}</td>
                                        <td className="px-4 py-2">{p.invoiceNumber || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-gray-500 text-xs italic">No purchase history.</p>}
            </div>

            <div>
                <h5 className="text-md font-semibold mb-2 border-b pb-1 border-gray-200 dark:border-gray-700">Usage History</h5>
                {usages.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-2">Dates</th>
                                    <th className="px-4 py-2">Client / Order</th>
                                    <th className="px-4 py-2">Total Used (m²)</th>
                                    <th className="px-4 py-2">Details</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usages.map(u => (
                                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-2 align-top text-xs">
                                            <span className="font-semibold">Shipment:</span> {formatDate(u.shipmentDate)}<br/>
                                            <span className="font-semibold">Received:</span> {formatDate(u.orderReceivedDate)}
                                        </td>
                                        <td className="px-4 py-2 align-top text-xs">
                                            <span className="font-semibold">{u.clientName}</span><br/>
                                            <span className="text-gray-500">Order: {u.orderNumber}</span><br/>
                                            <span className="text-gray-500">PO: {u.poNumber}</span><br/>
                                            <span className="text-gray-500 italic mt-1 block">By: {u.submittedBy}</span>
                                        </td>
                                        <td className="px-4 py-2 align-top font-medium text-red-600 dark:text-red-400">-{u.totalFabricUsed.toFixed(2)}</td>
                                        <td className="px-4 py-2 align-top text-xs text-gray-500 dark:text-gray-400">
                                            {u.bags.map(b => `${b.quantity}x ${b.size}`).join(', ')}
                                            <br/>
                                            <span className="italic">({u.fabricConsumptionPerPiece} m²/pc)</span><br/>
                                            <span className="font-semibold mt-1 block">Machine:</span> {u.machineNameAndCapacity}<br/>
                                            <span className="font-semibold">Drawing:</span> {u.drawingNumber}
                                        </td>
                                        <td className="px-4 py-2 align-top text-center">
                                            <StatusBadge status={u.status} />
                                            {u.status !== UsageStatus.PENDING && u.actionBy && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    by {u.actionBy}<br/>
                                                    on {formatDateTime(u.actionDate)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-gray-500 text-xs italic">No usage history.</p>}
            </div>
        </div>
    );
};

export default FabricDetailModal;
