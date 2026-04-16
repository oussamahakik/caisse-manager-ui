import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Edit, Trash2, Key, Loader2, 
    UserPlus, Lock, Unlock, Search 
} from 'lucide-react';
import { toast } from 'sonner';
import api, { setSnackId } from '../services/api';
import { TableRowSkeleton } from './LoadingSkeleton';
import Modal from './common/Modal/Modal';

const UserManagement = ({ token, snackId }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'ROLE_CAISSIER'
    });

    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
        }
    }, [snackId]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/utilisateurs', {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            setUsers(response.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des utilisateurs.');
        } finally {
            setIsLoading(false);
        }
    }, [snackId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const resetForm = useCallback(() => {
        setFormData({ username: '', password: '', role: 'ROLE_CAISSIER' });
        setIsEditMode(false);
        setSelectedUser(null);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode && selectedUser) {
                // Modification (sans changer le mot de passe si vide)
                const updateData = { username: formData.username, role: formData.role };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/api/utilisateurs/${selectedUser.id}`, updateData, {
                    headers: { 'X-Snack-ID': snackId.toString() }
                });
                toast.success('Utilisateur modifié avec succès !');
            } else {
                // Création
                await api.post('/api/utilisateurs', formData, {
                    headers: { 'X-Snack-ID': snackId.toString() }
                });
                toast.success('Utilisateur créé avec succès !');
            }
            setIsModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Erreur lors de l\'enregistrement de l\'utilisateur.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isEditMode, selectedUser, snackId, fetchUsers, resetForm]);

    const handleEdit = useCallback((user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username || '',
            password: '',
            role: user.role || 'ROLE_CAISSIER'
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (userId, username) => {
        if (!window.confirm(`Supprimer définitivement l'utilisateur "${username}" ?`)) return;
        try {
            await api.delete(`/api/utilisateurs/${userId}`, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Utilisateur supprimé avec succès !');
            fetchUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Erreur lors de la suppression de l\'utilisateur.';
            toast.error(errorMessage);
        }
    }, [snackId, fetchUsers]);

    const resetPassword = useCallback(async (userId, username) => {
        if (!window.confirm(`Réinitialiser le mot de passe de "${username}" ?`)) return;
        setIsSubmitting(true);
        try {
            const response = await api.post(`/api/utilisateurs/${userId}/reset-password`, null, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            const newPassword = response.data;
            toast.success('Mot de passe réinitialisé !', {
                description: `Nouveau mot de passe: ${newPassword}`,
                duration: 10000
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Erreur lors de la réinitialisation du mot de passe.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [snackId]);

    const toggleUserStatus = useCallback(async (userId, currentStatus) => {
        try {
            await api.put(`/api/utilisateurs/${userId}/status`, null, {
                headers: { 'X-Snack-ID': snackId.toString() }
            });
            toast.success('Statut de l\'utilisateur mis à jour.');
            fetchUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.response?.data || 'Erreur lors de la modification du statut.';
            toast.error(errorMessage);
        }
    }, [snackId, fetchUsers]);

    const openCreateModal = useCallback(() => {
        resetForm();
        setIsModalOpen(true);
    }, [resetForm]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h2>
                            <p className="text-sm text-slate-500">Gérer les caissiers et managers</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                        <UserPlus className="w-5 h-5" />
                        Nouvel Utilisateur
                    </motion.button>
                </div>

                {/* Barre de recherche */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </motion.div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    <TableRowSkeleton cols={4} />
                                    <TableRowSkeleton cols={4} />
                                    <TableRowSkeleton cols={4} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Aucun utilisateur trouvé.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                className="bg-white divide-y divide-slate-200"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{user.username}</div>
                                                <div className="text-sm text-slate-500">ID: {user.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    user.role === 'ROLE_MANAGER' || user.role === 'MANAGER'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.role === 'ROLE_MANAGER' || user.role === 'MANAGER' ? 'Manager' : 'Caissier'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.button
                                                    onClick={() => toggleUserStatus(user.id, user.actif)}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                        user.actif !== false
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                    }`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {user.actif !== false ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                                    {user.actif !== false ? 'Actif' : 'Désactivé'}
                                                </motion.button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <motion.button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                        title="Modifier"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => resetPassword(user.id, user.username)}
                                                        className="text-purple-600 hover:text-purple-900 p-2 rounded-full hover:bg-purple-50 transition-colors"
                                                        title="Réinitialiser MDP"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Key className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDelete(user.id, user.username)}
                                                        className="text-rose-600 hover:text-rose-900 p-2 rounded-full hover:bg-rose-50 transition-colors"
                                                        title="Supprimer"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </motion.tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={
                    <span className="flex items-center gap-2">
                        {isEditMode ? <Edit className="w-6 h-6 text-blue-600" /> : <UserPlus className="w-6 h-6 text-emerald-600" />}
                        {isEditMode ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
                    </span>
                }
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="username" className="form-label">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            id="username"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="form-input"
                            placeholder="Ex: caissier01"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label">
                            Mot de passe {isEditMode && '(laisser vide pour ne pas changer)'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            required={!isEditMode}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="form-input"
                            placeholder="******"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="form-label">
                            Rôle
                        </label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="form-select"
                        >
                            <option value="ROLE_CAISSIER">Caissier</option>
                            <option value="ROLE_MANAGER">Manager</option>
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="btn-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
                            {isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
