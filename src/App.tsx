import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Fabric, FabricCategory, PurchaseTransaction, UsageTransaction, Transaction, TransactionType, UsageStatus, Notification, NotificationType } from './types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, TechTexLogo, ShieldCheckIcon, BellIcon } from './components/icons';
import Modal from './components/Modal';
import FabricForm from './components/FabricForm';
import PurchaseForm from './components/PurchaseForm';
import UsageForm from './components/UsageForm';
import FabricDetailModal from './components/FabricDetailModal';
import AdminPanel, { AdminTab } from './components/AdminPanel';
import NotificationBell from './components/NotificationBell';


const initialFabrics: Fabric[] = [];
const LOW_STOCK_THRESHOLD = 20;
const ADMIN_EMAIL = 'techtexbangladesh@gmail.com';


const App: React.FC = () => {
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeCategory, setActiveCategory] = useState<FabricCategory>(FabricCategory.WOVEN);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'dashboard' | 'adminPanel'>('dashboard');
    const [adminTab, setAdminTab] = useState<AdminTab>('pending');
    
    // Modal States
    const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
    const [editingFabric, setEditingFabric] = useState<Fabric | undefined>(undefined);

    const [modalTargetFabric, setModalTargetFabric] = useState<Fabric | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const storedFabrics = localStorage.getItem('techtex-fabrics');
        if (storedFabrics) {
            setFabrics(JSON.parse(storedFabrics));
        } else {
            setFabrics(initialFabrics);
        }
        const storedNotifications = localStorage.getItem('techtex-notifications');
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('techtex-fabrics', JSON.stringify(fabrics));
    }, [fabrics]);

    useEffect(() => {
        localStorage.setItem('techtex-notifications', JSON.stringify(notifications));
    }, [notifications]);
    
    useEffect(() => {
        if (!isAdmin) {
            setView('dashboard');
        }
    }, [isAdmin]);

    const calculateAvailableStock = useCallback((fabric: Fabric) => {
        const totalPurchased = fabric.transactions
            .filter((t): t is PurchaseTransaction => t.type === TransactionType.PURCHASE)
            .reduce((sum, t) => sum + t.quantity, 0);

        const totalUsed = fabric.transactions
            .filter((t): t is UsageTransaction => t.type === TransactionType.USAGE && t.status === UsageStatus.CONFIRMED && !t.isDeleted)
            .reduce((sum, t) => sum + t.totalFabricUsed, 0);

        return fabric.initialStock + totalPurchased - totalUsed;
    }, []);

    // Notification Generation Effect
    useEffect(() => {
        if (!isAdmin) return;

        const newNotifications: Notification[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);

        fabrics.forEach(fabric => {
            if (fabric.isDeleted) return;

            // Low Stock
            const stock = calculateAvailableStock(fabric);
            if (stock < LOW_STOCK_THRESHOLD) {
                newNotifications.push({
                    id: `low-stock-${fabric.id}`,
                    type: NotificationType.LOW_STOCK,
                    message: `Stock for ${fabric.code} is low (${stock.toFixed(2)} m²).`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    relatedFabricId: fabric.id,
                });
            }

            // Pending Approvals & Shipment Reminders
            fabric.transactions
                .filter((t): t is UsageTransaction => t.type === TransactionType.USAGE && !t.isDeleted)
                .forEach(tx => {
                    // Pending
                    if (tx.status === UsageStatus.PENDING) {
                        newNotifications.push({
                            id: `pending-${tx.id}`,
                            type: NotificationType.PENDING_APPROVAL,
                            message: `New usage request for ${fabric.code} from ${tx.clientName}.`,
                            isRead: false,
                            createdAt: tx.date,
                            relatedFabricId: fabric.id,
                            relatedTransactionId: tx.id
                        });
                    }
                    // Shipment
                    const shipmentDate = new Date(tx.shipmentDate);
                    if (shipmentDate >= today && shipmentDate <= fiveDaysFromNow) {
                         newNotifications.push({
                            id: `shipment-${tx.id}`,
                            type: NotificationType.SHIPMENT_REMINDER,
                            message: `Shipment for order ${tx.orderNumber} (${fabric.code}) is due on ${shipmentDate.toLocaleDateString()}.`,
                            isRead: false,
                            createdAt: new Date().toISOString(),
                            relatedFabricId: fabric.id,
                            relatedTransactionId: tx.id
                        });
                    }
                });
        });

        setNotifications(prev => {
            const updated = [...prev];
            newNotifications.forEach(n => {
                const existingIndex = updated.findIndex(un => un.id === n.id);
                if (existingIndex === -1) {
                    updated.push(n); // Add new notification
                    // Simulate Email
                    sendEmailNotification(n, fabrics.find(f => f.id === n.relatedFabricId));
                }
            });
             // Clean up old, irrelevant notifications
            const validIds = new Set(newNotifications.map(n => n.id));
            return updated.filter(n => validIds.has(n.id));
        });

    }, [fabrics, isAdmin, calculateAvailableStock]);

    const sendEmailNotification = (notification: Notification, fabric?: Fabric) => {
        let subject = '';
        let body = '';

        switch (notification.type) {
            case NotificationType.LOW_STOCK:
                subject = `Low Stock Alert – Fabric Code: ${fabric?.code}`;
                body = `Dear Sir,\n\nThis is to inform you that the stock for fabric code ${fabric?.code} has fallen below the minimum threshold.\n\nCurrent Stock: Less than ${LOW_STOCK_THRESHOLD} m²\n\nKindly take necessary action to replenish the stock at the earliest to avoid any disruption in production.\n\nThank you for your prompt attention.`;
                break;
            case NotificationType.PENDING_APPROVAL:
                const tx = fabric?.transactions.find(t => t.id === notification.relatedTransactionId) as UsageTransaction | undefined;
                subject = `Pending Approval for Fabric Usage: ${fabric?.code}`;
                body = `Dear Sir,\n\nA new fabric usage entry requires your approval.\n\nFabric Code: ${fabric?.code}\nEntry Details:\n - Machine: ${tx?.machineNameAndCapacity}\n - Drawing: ${tx?.drawingNumber}\n - Order: ${tx?.orderNumber}\n - PO: ${tx?.poNumber}\n - Quantity: ${tx?.totalFabricUsed.toFixed(2)} m²\n\nPlease review and take action in the Admin Panel.\n\nThank you.`;
                break;
            case NotificationType.SHIPMENT_REMINDER:
                 const txShip = fabric?.transactions.find(t => t.id === notification.relatedTransactionId) as UsageTransaction | undefined;
                subject = `Shipment Reminder – Fabric Code: ${fabric?.code}`;
                body = `Dear Sir,\n\nThis is a reminder for an upcoming shipment.\n\nFabric Code: ${fabric?.code}\nShipment Date: ${txShip ? new Date(txShip.shipmentDate).toLocaleDateString() : 'N/A'}\n\nThank you.`;
                break;
        }

        console.log(`--- SIMULATING EMAIL to ${ADMIN_EMAIL} ---`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${body}`);
        console.log(`------------------------------------------`);
    };
    
    const handleNotificationClick = (notification: Notification) => {
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        
        const targetFabric = fabrics.find(f => f.id === notification.relatedFabricId);
        if (!targetFabric) return;

        if (notification.type === NotificationType.PENDING_APPROVAL) {
            setView('adminPanel');
            setAdminTab('pending');
        } else {
            openDetailModal(targetFabric);
        }
    };
    
    const markAllNotificationsAsRead = () => {
        setNotifications(notifications.map(n => ({...n, isRead: true})));
    };


    const handleAddOrEditFabric = (fabricData: Omit<Fabric, 'transactions'> & { id?: string }) => {
        if (fabricData.id) { // Editing
            setFabrics(fabrics.map(f => f.id === fabricData.id ? { ...f, ...fabricData } : f));
        } else { // Adding
            const newFabric: Fabric = {
                ...fabricData,
                id: `${fabricData.category}-${Date.now()}`,
                transactions: [],
                isDeleted: false,
            };
            setFabrics([...fabrics, newFabric]);
        }
        setIsFabricModalOpen(false);
        setEditingFabric(undefined);
    };
    
    const handleRestoreFabric = (fabricId: string) => {
        setFabrics(fabrics.map(f => f.id === fabricId ? { ...f, isDeleted: false } : f));
    };

    const addTransaction = (fabricId: string, transaction: Transaction) => {
        setFabrics(fabrics.map(f => 
            f.id === fabricId ? { ...f, transactions: [...f.transactions, transaction] } : f
        ));
    };
    
    const handleAddPurchase = (data: Omit<PurchaseTransaction, 'id' | 'type'>) => {
        if (!modalTargetFabric) return;
        const newPurchase: PurchaseTransaction = { ...data, id: `t-p-${Date.now()}`, type: TransactionType.PURCHASE };
        addTransaction(modalTargetFabric.id, newPurchase);
        closeTransactionModals();
    };

    const handleAddUsage = (data: Omit<UsageTransaction, 'id' | 'type'>) => {
        if (!modalTargetFabric) return;
        const newUsage: UsageTransaction = { ...data, id: `t-u-${Date.now()}`, type: TransactionType.USAGE };
        addTransaction(modalTargetFabric.id, newUsage);
        closeTransactionModals();
    };

    const updateUsageStatus = (fabricId: string, transactionId: string, status: UsageStatus.CONFIRMED | UsageStatus.REJECTED) => {
        setFabrics(fabrics.map(f => {
            if (f.id === fabricId) {
                const updatedTransactions = f.transactions.map(t => {
                    if (t.id === transactionId && t.type === TransactionType.USAGE) {
                        return {
                            ...t,
                            status: status,
                            actionBy: 'Admin',
                            actionDate: new Date().toISOString(),
                        };
                    }
                    return t;
                }) as Transaction[];
                return { ...f, transactions: updatedTransactions };
            }
            return f;
        }));
    };
    
    const handleApproveUsage = (fabricId: string, transactionId: string) => {
        updateUsageStatus(fabricId, transactionId, UsageStatus.CONFIRMED);
    };

    const handleRejectUsage = (fabricId: string, transactionId: string) => {
        updateUsageStatus(fabricId, transactionId, UsageStatus.REJECTED);
    };

    const handleDeleteUsage = (fabricId: string, transactionId: string) => {
        setFabrics(prevFabrics =>
            prevFabrics.map(f => {
                if (f.id === fabricId) {
                    const updatedTransactions = f.transactions.map(t => {
                        if (t.id === transactionId && t.type === TransactionType.USAGE) {
                            return {
                                ...t,
                                isDeleted: true,
                                deletedBy: 'Admin',
                                deletedAt: new Date().toISOString(),
                                originalStatusBeforeDelete: t.status,
                                deletionReason: 'Deleted directly without prompt',
                            };
                        }
                        return t;
                    }) as Transaction[];
                    return { ...f, transactions: updatedTransactions };
                }
                return f;
            })
        );
    };

    const handleRestoreUsage = (fabricId: string, transactionId: string) => {
        setFabrics(fabrics.map(f => {
            if (f.id === fabricId) {
                const updatedTransactions = f.transactions.map(t => {
                    if (t.id === transactionId && t.type === TransactionType.USAGE) {
                        const { isDeleted, deletedBy, deletedAt, originalStatusBeforeDelete, deletionReason, ...rest } = t;
                        return rest; // Return the object without deletion properties
                    }
                    return t;
                }) as Transaction[];
                return { ...f, transactions: updatedTransactions };
            }
            return f;
        }));
    };

    const openAddFabricModal = () => {
        setEditingFabric(undefined);
        setIsFabricModalOpen(true);
    };

    const openEditFabricModal = (fabric: Fabric) => {
        setEditingFabric(fabric);
        setIsFabricModalOpen(true);
    };

    const openPurchaseModal = (fabric: Fabric) => {
        setModalTargetFabric(fabric);
        setIsPurchaseModalOpen(true);
    };

    const openUsageModal = (fabric: Fabric) => {
        setModalTargetFabric(fabric);
        setIsUsageModalOpen(true);
    };

    const openDetailModal = (fabric: Fabric) => {
        setModalTargetFabric(fabric);
        setIsDetailModalOpen(true);
    }
    
    const closeTransactionModals = () => {
        setModalTargetFabric(null);
        setIsPurchaseModalOpen(false);
        setIsUsageModalOpen(false);
    };
    
    const filteredFabrics = useMemo(() => {
        return fabrics
            .filter(f => !f.isDeleted)
            .filter(f => f.category === activeCategory)
            .filter(f => f.code.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [fabrics, activeCategory, searchTerm]);

    const FabricCard: React.FC<{ fabric: Fabric }> = ({ fabric }) => {
        const availableStock = calculateAvailableStock(fabric);
        const isLowStock = availableStock < LOW_STOCK_THRESHOLD;

        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col justify-between overflow-hidden transition-shadow duration-300 hover:shadow-lg ${isLowStock ? 'border-2 border-red-500' : ''}`}>
                <div className="p-5 cursor-pointer" onClick={() => openDetailModal(fabric)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{fabric.code}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{fabric.name}</p>
                        </div>
                        {isAdmin && (
                             <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => openEditFabricModal(fabric)} className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"><EditIcon /></button>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Stock</p>
                        <p className={`text-3xl font-extrabold ${isLowStock ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>{availableStock.toFixed(2)} <span className="text-lg font-normal">m²</span></p>
                    </div>
                </div>
                 <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700/50 mt-auto">
                    <button onClick={() => openPurchaseModal(fabric)} className="w-full text-center py-3 px-4 text-sm font-medium text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-gray-700 transition-colors">
                        Record Purchase
                    </button>
                    <button onClick={() => openUsageModal(fabric)} className="w-full text-center py-3 px-4 text-sm font-medium text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 border-l border-gray-200 dark:border-gray-600 transition-colors">
                        Record Usage
                    </button>
                </div>
            </div>
        )
    };
    
    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center space-x-4">
                    <TechTexLogo className="h-10" />
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Inventory Management</h1>
                </div>
                <div className="flex items-center space-x-4">
                     {isAdmin && (
                        <>
                            <NotificationBell 
                                notifications={notifications}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllRead={markAllNotificationsAsRead}
                            />
                            <button 
                                onClick={() => setView(v => v === 'dashboard' ? 'adminPanel' : 'dashboard')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'adminPanel' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                <ShieldCheckIcon className="w-5 h-5" />
                                <span>{view === 'adminPanel' ? 'Dashboard' : 'Admin Panel'}</span>
                            </button>
                        </>
                     )}
                    <span className="text-sm">{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
                    <label htmlFor="admin-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="admin-toggle" className="sr-only" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isAdmin ? 'transform translate-x-6 bg-blue-500' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </header>

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                {view === 'dashboard' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="w-full md:w-auto">
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                {(Object.values(FabricCategory)).map(cat => (
                                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex-grow max-w-sm">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by Fabric Code..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {filteredFabrics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFabrics.map(fabric => (
                                <FabricCard key={fabric.id} fabric={fabric} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-500">No fabrics found for "{activeCategory}" category.</p>
                            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or add a new fabric.</p>
                        </div>
                    )}
                </>
                ) : (
                    <AdminPanel 
                        fabrics={fabrics} 
                        onApprove={handleApproveUsage} 
                        onReject={handleRejectUsage}
                        onDeleteUsage={handleDeleteUsage}
                        onRestore={handleRestoreFabric}
                        onRestoreUsage={handleRestoreUsage}
                        activeTab={adminTab}
                        setActiveTab={setAdminTab}
                    />
                )}
            </main>

            {view === 'dashboard' && (
                <button
                onClick={openAddFabricModal}
                className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Add new fabric"
                >
                <PlusIcon className="w-8 h-8"/>
                </button>
            )}

            {/* Modals */}
            <Modal isOpen={isFabricModalOpen} onClose={() => setIsFabricModalOpen(false)} title={editingFabric ? 'Edit Fabric' : 'Add New Fabric'}>
                <FabricForm
                    onSubmit={handleAddOrEditFabric}
                    onClose={() => { setIsFabricModalOpen(false); setEditingFabric(undefined); }}
                    initialData={editingFabric}
                    isAdmin={isAdmin}
                />
            </Modal>
            
            {modalTargetFabric && (
                <>
                    <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Traceability for ${modalTargetFabric.code}`} size="3xl">
                        <FabricDetailModal 
                            fabric={modalTargetFabric}
                        />
                    </Modal>
                    <Modal isOpen={isPurchaseModalOpen} onClose={closeTransactionModals} title={`Record Purchase: ${modalTargetFabric.code}`}>
                        <PurchaseForm 
                            onSubmit={handleAddPurchase}
                            onClose={closeTransactionModals}
                            fabricCode={modalTargetFabric.code}
                        />
                    </Modal>
                    <Modal isOpen={isUsageModalOpen} onClose={closeTransactionModals} title={`Record Usage: ${modalTargetFabric.code}`}>
                        <UsageForm
                            onSubmit={handleAddUsage}
                            onClose={closeTransactionModals}
                            fabricCode={modalTargetFabric.code}
                            availableStock={calculateAvailableStock(modalTargetFabric)}
                            isAdmin={isAdmin}
                        />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default App;
