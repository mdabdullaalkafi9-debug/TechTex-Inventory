import React, { useMemo } from 'react';
import { Fabric, UsageStatus, UsageTransaction } from '../lib/types';
import { ArrowUturnLeftIcon, TrashIcon } from './icons';

interface AdminPanelProps {
    fabrics: Fabric[];
    onApprove: (fabricId: string, transactionId: string) => void;
    onReject: (fabricId: string, transactionId: string) => void;
    onDeleteUsage: (fabricId: string, transactionId: string) => void;
    onRestore: (fabricId: string) => void;
    onRestoreUsage: (fabricId: string, transactionId: string) => void;
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
}

export type AdminTab = 'pending' | 'approved' | 'rejected' | 'recycleBin';

interface UsageTransactionWithFabric extends UsageTransaction {
    fabricCode: string;
    fabricId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ fabrics, onApprove, onReject, onDeleteUsage, onRestore, onRestoreUsage, activeTab, setActiveTab }) => {
    
    const { pending, approved, rejected, deletedFabrics, deletedTransactions } = useMemo(() => {
        const pending: UsageTransactionWithFabric[] = [];
        const approved: UsageTransactionWithFabric[] = [];
        const rejected: UsageTransactionWithFabric[] = [];
        const deletedTransactions: UsageTransactionWithFabric[] = [];
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        fabrics.forEach(fabric => {
            fabric.transactions.forEach(tx => {
                if (tx.type === 'usage') {
                    const usageWithFabric = { ...tx, fabricCode: fabric.code, fabricId: fabric.id };
                    if (tx.isDeleted && tx.deletedAt && new Date(tx.deletedAt) > thirtyDaysAgo) {
                        deletedTransactions.push(usageWithFabric);
                    } else if (!tx.isDeleted) {
                        if (tx.status === UsageStatus.PENDING) pending.push(usageWithFabric);
                        else if (tx.status === UsageStatus.CONFIRMED) approved.push(usageWithFabric);
                        else if (tx.status === UsageStatus.REJECTED) rejected.push(usageWithFabric);
                    }
                }
            });
        });
        
        const deletedFabrics = fabrics.filter(f => f.isDeleted);

        const sortByDate = (a: UsageTransaction, b: UsageTransaction) => new Date(b.date).getTime() - new Date(a.date).getTime();
        pending.sort(sortByDate);
        approved.sort(sortByDate);
        rejected.sort(sortByDate);
        deletedTransactions.sort((a,b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

        return { pending, approved, rejected, deletedFabrics, deletedTransactions };
    }, [fabrics]);
    
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleString() : 'N/A';
    
    const renderTabs = () => {
        const tabs: { key: AdminTab, label: string, count: number }[] = [
            { key: 'pending', label: 'Pending', count: pending.length },
            { key: 'approved', label: 'Approved', count: approved.length },
            { key: 'rejected', label: 'Not Approved', count: rejected.length },
            { key: 'recycleBin', label: 'Recycle Bin', count: deletedFabrics.length + deletedTransactions.length },
        ];
        
        return (
             <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${
                                activeTab === tab.key
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`
                                ${activeTab === tab.key ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-300'}
                                    hidden sm:inline-block py-0.5 px-2 rounded-full text-xs font-medium`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        )
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'pending': return renderUsageTable(pending);
            case 'approved': return renderUsageTable(approved);
            case 'rejected': return renderUsageTable(rejected);
            case 'recycleBin': return renderRecycleBin();
            default: return null;
        }
    };
    
    const renderUsageTable = (data: UsageTransactionWithFabric[]) => {
        if (data.length === 0) return <p className="text-center text-gray-500 py-8">No requests in this category.</p>;
        
        return (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Fabric Code</th>
                            <th scope="col" className="px-6 py-3">Request Details</th>
                            <th scope="col" className="px-6 py-3">Submitted</th>
                            <th scope="col" className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(tx => (
                            <tr key={tx.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{tx.fabricCode}</td>
                                <td className="px-6 py-4">
                                    <span className="font-semibold">{tx.clientName}</span> / {tx.orderNumber} <br/>
                                    <span className="text-red-600 dark:text-red-400 font-bold">-{tx.totalFabricUsed.toFixed(2)} m²</span>
                                </td>
                                <td className="px-6 py-4">
                                    {tx.submittedBy} <br/>
                                    <span className="text-xs">{formatDate(tx.date)}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        {tx.status === UsageStatus.PENDING ? (
                                            <>
                                                <button onClick={() => onApprove(tx.fabricId, tx.id)} className="font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs">Approve</button>
                                                <button onClick={() => onReject(tx.fabricId, tx.id)} className="font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs">Reject</button>
                                            </>
                                        ) : (
                                            <div className="text-xs text-center">
                                                {tx.status === UsageStatus.REJECTED ? 'Rejected by' : 'Approved by'} {tx.actionBy} <br/>
                                                <span className="w-full inline-block">{formatDate(tx.actionDate)}</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => onDeleteUsage(tx.fabricId, tx.id)} 
                                            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                            title="Delete Entry"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    
    const renderRecycleBin = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-bold">Deleted Fabrics</h3>
            {renderRecycleBinFabrics()}
            <h3 className="text-xl font-bold mt-8">Deleted Usage Entries (Last 30 Days)</h3>
            {renderRecycleBinTransactions()}
        </div>
    );
    
    const renderRecycleBinFabrics = () => {
         if (deletedFabrics.length === 0) return <p className="text-center text-gray-500 py-8">Recycle bin for fabrics is empty.</p>;
         return (
             <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                         <tr>
                             <th scope="col" className="px-6 py-3">Fabric Code</th>
                             <th scope="col" className="px-6 py-3">Fabric Name</th>
                             <th scope="col" className="px-6 py-3">Category</th>
                             <th scope="col" className="px-6 py-3 text-center">Action</th>
                         </tr>
                     </thead>
                     <tbody>
                         {deletedFabrics.map(fabric => (
                             <tr key={fabric.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                 <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{fabric.code}</td>
                                 <td className="px-6 py-4">{fabric.name}</td>
                                 <td className="px-6 py-4">{fabric.category}</td>
                                 <td className="px-6 py-4 text-center">
                                     <button onClick={() => onRestore(fabric.id)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto">
                                        <ArrowUturnLeftIcon className="w-4 h-4"/>
                                        Restore
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         );
    }
    
    const renderRecycleBinTransactions = () => {
        if (deletedTransactions.length === 0) return <p className="text-center text-gray-500 py-8">Recycle bin for entries is empty.</p>;
        return (
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Fabric / Client</th>
                            <th className="px-4 py-3">Used Qty</th>
                            <th className="px-4 py-3">Original Status</th>
                            <th className="px-4 py-3">Deletion Info</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deletedTransactions.map(tx => (
                            <tr key={tx.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-4 py-2">
                                    <span className="font-bold dark:text-white">{tx.fabricCode}</span><br/>
                                    <span className="text-xs">{tx.clientName}</span>
                                </td>
                                <td className="px-4 py-2 font-bold text-red-500">{tx.totalFabricUsed.toFixed(2)} m²</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tx.originalStatusBeforeDelete === UsageStatus.CONFIRMED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tx.originalStatusBeforeDelete}</span>
                                </td>
                                <td className="px-4 py-2 text-xs">
                                    Deleted by {tx.deletedBy} on {formatDate(tx.deletedAt)}<br/>
                                    <span className="italic">Reason: {tx.deletionReason}</span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => onRestoreUsage(tx.fabricId, tx.id)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto text-xs">
                                        <ArrowUturnLeftIcon className="w-4 h-4"/>
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            {renderTabs()}
            {renderContent()}
        </div>
    );
};

export default AdminPanel;
