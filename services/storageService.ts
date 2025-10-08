import { Item, Requisition, IssuedItemRecord, User } from '../types';
import { MOCK_ITEMS, MOCK_REQUISITIONS, MOCK_ISSUED_RECORDS, MOCK_USERS } from '../constants';

/**
 * A generic factory function to create a storage utility for a specific data type.
 * It uses localStorage for persistence and falls back to mock data for initialization.
 * @param key The localStorage key.
 * @param mockData The initial data to use if nothing is in storage.
 */
const createStorage = <T>(key: string, mockData: T[]) => {
    // Getter function
    const get = (): T[] => {
        try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (e) {
            console.error(`Failed to parse data for key ${key} from localStorage.`, e);
        }
        // If nothing is in storage or parsing fails, initialize with mock data and return it
        localStorage.setItem(key, JSON.stringify(mockData));
        return mockData;
    };

    // Setter function
    const save = (data: T[]) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Failed to save data for key ${key} to localStorage.`, e);
        }
    };

    return { get, save };
};

// Create specific storage handlers for each data type
export const itemStorage = createStorage<Item>('hims_items', MOCK_ITEMS);
export const requisitionStorage = createStorage<Requisition>('hims_requisitions', MOCK_REQUISITIONS);
export const issuedRecordStorage = createStorage<IssuedItemRecord>('hims_issued_records', MOCK_ISSUED_RECORDS);
export const userStorage = createStorage<User>('hims_users', MOCK_USERS);
