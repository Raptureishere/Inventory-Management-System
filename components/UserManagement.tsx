import React, { useState } from 'react';
import { userStorage } from '../services/storageService';
import { User } from '../types';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(() => userStorage.get());
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            setError('Username and password are required.');
            return;
        }
        if (users.some(u => u.username === newUser.username)) {
            setError('Username already exists.');
            return;
        }

        const newUserObject: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: newUser.username,
            password: newUser.password,
            role: 'subordinate',
        };
        const updatedUsers = [...users, newUserObject];
        setUsers(updatedUsers);
        userStorage.save(updatedUsers);
        
        setNewUser({ username: '', password: '' });
        setError('');
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            userStorage.save(updatedUsers);
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Add Subordinate User</h2>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label htmlFor="new-username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="new-username"
                                name="username"
                                value={newUser.username}
                                onChange={handleInputChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="new-password"
                                name="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Add User
                        </button>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">User List</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Username</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{user.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 capitalize">{user.role}</td>
                                        <td className="px-6 py-4">
                                            {user.role === 'subordinate' && (
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete User"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default UserManagement;