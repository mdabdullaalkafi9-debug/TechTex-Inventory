import React, { useState, useEffect, useRef } from 'react';
import { Notification, NotificationType } from '../types';
import { BellIcon } from './icons';

interface NotificationBellProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onNotificationClick, onMarkAllRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getIconForType = (type: NotificationType) => {
        switch(type) {
            case NotificationType.LOW_STOCK: return <span className="text-red-500">⚠️</span>;
            case NotificationType.PENDING_APPROVAL: return <span className="text-yellow-500">📥</span>;
            case NotificationType.SHIPMENT_REMINDER: return <span className="text-blue-500">🚚</span>;
            default: return '🔔';
        }
    }
    
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border dark:border-gray-700">
                    <div className="py-2 px-4 flex justify-between items-center border-b dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h4>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                       {sortedNotifications.length > 0 ? (
                            <ul>
                                {sortedNotifications.map(n => (
                                    <li key={n.id} onClick={() => { onNotificationClick(n); setIsOpen(false); }} className={`p-3 border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            <div className="pt-1">{getIconForType(n.type)}</div>
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                       ) : (
                           <p className="p-4 text-center text-sm text-gray-500">No notifications yet.</p>
                       )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
