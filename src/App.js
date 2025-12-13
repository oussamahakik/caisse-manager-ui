import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    ChefHat, 
    FileText, 
    Salad, 
    BarChart3,
    LogOut,
    Menu as MenuIcon,
    X,
    Users,
    Search,
    ShieldCheck,
    Tag,
    Printer,
    User
} from 'lucide-react';
import { useProducts, useIngredients, useCreateOrder } from './hooks/useProducts';
import { setSnackId } from './services/api';
import { ProductCardSkeleton, Spinner } from './components/LoadingSkeleton';
import TicketPrinter from './components/TicketPrinter';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';

// Lazy load des composants
const ProductList = lazy(() => import('./components/ProductList'));
const OrderTicket = lazy(() => import('./components/OrderTicket'));
const Login = lazy(() => import('./components/Login'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const MenuAdmin = lazy(() => import('./components/MenuAdmin'));
const IngredientsAdmin = lazy(() => import('./components/IngredientsAdmin'));
const KitchenDisplay = lazy(() => import('./components/KitchenDisplay'));
const RapportDashboard = lazy(() => import('./components/RapportDashboard'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));
const PromotionsManager = lazy(() => import('./components/PromotionsManager'));
const PrintersManager = lazy(() => import('./components/PrintersManager'));

function App() {
    // --- ÉTATS D'AUTHENTIFICATION ---
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken && storedToken.trim() !== '' ? storedToken : null;
    });
    const [snackId, setSnackIdState] = useState(() => localStorage.getItem('snackId'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [cart, setCart] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('caisse');
    const [lastOrder, setLastOrder] = useState(null);
    const [showTicket, setShowTicket] = useState(false);
    const [restaurantName, setRestaurantName] = useState('Mon Snack');
    const [showSearch, setShowSearch] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Détecter la taille de l'écran
    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Configuration API avec snackId
    useEffect(() => {
        if (snackId) {
            setSnackId(snackId);
            localStorage.setItem('snackId', snackId);
        }
    }, [snackId]);

    // Vérifier le token au démarrage
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken || storedToken.trim() === '') {
                localStorage.removeItem('token');
                localStorage.removeItem('snackId');
                localStorage.removeItem('role');
                setToken(null);
                setSnackIdState(null);
                setRole(null);
                setCurrentTab('caisse');
                return;
            }

            try {
                const apiModule = await import('./config/api');
                const API_BASE_URL = apiModule.API_BASE_URL || 'http://localhost:8081';
                const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('snackId');
                    localStorage.removeItem('role');
                    setToken(null);
                    setSnackIdState(null);
                    setRole(null);
                    setCurrentTab('caisse');
                }
            } catch (error) {
                // Erreur réseau, on garde la session
            }
        };

        validateToken();
    }, []);

    useEffect(() => {
        if (role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN') {
            setRestaurantName('Administration SaaS');
        } else {
            setRestaurantName('Mon Snack');
        }
    }, [role]);

    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN';
    const shouldFetchData = token && !isSuperAdmin;

    const { data: products = [], isLoading: productsLoading } = useProducts(shouldFetchData ? token : null, snackId);
    const { data: ingredients = [] } = useIngredients(shouldFetchData ? token : null, snackId);
    const createOrderMutation = useCreateOrder(token, snackId);
    
    // Charger les promotions actives
    const [promotions, setPromotions] = useState([]);
    useEffect(() => {
        const loadPromotions = async () => {
            if (shouldFetchData && token && snackId) {
                try {
                    const apiModule = await import('./services/api');
                    const response = await apiModule.default.get('/api/promotions/actives', {
                        headers: { 'X-Snack-ID': snackId.toString() }
                    });
                    const promotionsData = response.data || [];
                    setPromotions(promotionsData);
                } catch (error) {
                    console.error('Erreur lors du chargement des promotions:', error);
                    setPromotions([]);
                }
            } else {
                setPromotions([]);
            }
        };

        loadPromotions();
    }, [shouldFetchData, token, snackId]);

    const handleLogin = useCallback((receivedToken, receivedSnackId, receivedRole) => {
        if (!receivedToken || receivedToken.trim() === '') {
            return;
        }
        
        setToken(receivedToken);
        setSnackIdState(receivedSnackId);
        setRole(receivedRole);
        
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('snackId', receivedSnackId);
        localStorage.setItem('role', receivedRole);
        
        if (receivedRole === 'SUPER_ADMIN' || receivedRole === 'ROLE_SUPER_ADMIN') {
            setCurrentTab('dashboard');
        } else {
            setCurrentTab('caisse');
        }
    }, []);

    const handleLogout = useCallback(() => {
        setToken(null);
        setSnackIdState(null);
        setRole(null);
        setCart([]);
        setCurrentTab('caisse');
        localStorage.removeItem('token');
        localStorage.removeItem('snackId');
        localStorage.removeItem('role');
    }, []);

    const handleTabChange = useCallback((tabId) => {
        setCurrentTab(tabId);
        if (!isDesktop) {
            setSidebarOpen(false);
        }
    }, [isDesktop]);

    const addToCart = useCallback((product) => {
        setCart(prevCart => {
            if (product.details) {
                const uniqueItem = { ...product, quantity: 1, uniqueId: product.uniqueId || Date.now() };
                return [...prevCart, uniqueItem];
            }

            const existingIndex = prevCart.findIndex(item => item.id === product.id && !item.details);
            
            if (existingIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + 1
                };
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    }, []);

    const updateQuantity = useCallback((itemId, change) => {
        setCart(prev => prev.map(item => 
            item.id === itemId ? { ...item, quantity: item.quantity + change } : item
        ).filter(i => i.quantity > 0));
    }, []);

    const removeFromCart = useCallback((indexToRemove) => {
        setCart(prevCart => prevCart.filter((_, index) => index !== indexToRemove));
    }, []);

    const clearCart = useCallback(() => {
        if (window.confirm("Voulez-vous vraiment vider tout le panier ?")) {
            setCart([]);
        }
    }, []);

    const finalizeOrder = useCallback(async (paymentType, cashReceived = null, remise = 0, cartWithPromos = null) => {
        if (cart.length === 0) return;

        // Utiliser cartWithPromos si fourni (avec prix réduits), sinon utiliser cart
        const itemsToSend = cartWithPromos || cart.map(item => ({
            ...item,
            prixFinal: item.prix || 0
        }));

        const subTotal = itemsToSend.reduce((sum, item) => sum + ((item.prixFinal || item.prix || 0) * item.quantity), 0);
        const total = subTotal - remise;

        const orderData = {
            typePaiement: paymentType,
            articles: itemsToSend.map(item => ({
                produitId: item.id,
                quantite: item.quantity,
                details: item.details || "",
                prixFinal: item.prixFinal || item.prix || 0 // Prix réduit avec promotion
            })),
            remise: remise || 0
        };

        try {
            const response = await createOrderMutation.mutateAsync(orderData);
            const orderForTicket = {
                id: response?.id || Date.now(),
                date: new Date().toISOString(),
                typePaiement: paymentType,
                lignes: itemsToSend.map(item => ({
                    nomProduit: item.nom,
                    quantite: item.quantity,
                    prixFinal: item.prixFinal || item.prix || 0,
                    details: item.details || ""
                })),
                total: total,
                remise: remise,
                montantRecu: cashReceived
            };
            setLastOrder(orderForTicket);
            setCart([]);
            setShowTicket(true);
        } catch (error) {
            // Erreur gérée par l'intercepteur
        }
    }, [cart, createOrderMutation]);

    const isManager = role === 'MANAGER' || role === 'ROLE_MANAGER';

    const navItems = useMemo(() => {
        if (isSuperAdmin) {
            return [
                { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck, visible: true }
            ];
        }

        return [
            { id: 'caisse', label: 'Caisse', icon: ShoppingCart, visible: true },
            { id: 'menu', label: 'Menu', icon: FileText, visible: isManager },
            { id: 'ingredients', label: 'Ingrédients', icon: Salad, visible: isManager },
            { id: 'cuisine', label: 'Cuisine', icon: ChefHat, visible: isManager },
            { id: 'rapports', label: 'Rapports', icon: BarChart3, visible: isManager },
            { id: 'utilisateurs', label: 'Utilisateurs', icon: Users, visible: isManager },
            { id: 'promotions', label: 'Promotions', icon: Tag, visible: isManager },
            { id: 'imprimantes', label: 'Imprimantes', icon: Printer, visible: isManager },
        ].filter(item => item.visible);
    }, [isManager, isSuperAdmin]);

    useHotkeys('ctrl+p', (e) => {
        e.preventDefault();
        if (cart.length > 0 && currentTab === 'caisse') {
            finalizeOrder('CARTE', null, 0);
        }
    }, { enabled: currentTab === 'caisse' && cart.length > 0 }, [cart, currentTab, finalizeOrder]);

    useHotkeys('escape', (e) => {
        if (showTicket) {
            setShowTicket(false);
        }
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [showTicket, sidebarOpen]);

    // LOGIN
    if (!token) {
        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner size="lg" /></div>}>
                <Login onLogin={handleLogin} />
            </Suspense>
        );
    }

    // LAYOUT GLOBAL - Design Enterprise SaaS Responsive
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <Toaster position="top-right" richColors />
            
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Responsive Design */}
            <motion.aside
                initial={false}
                animate={{
                    x: sidebarOpen || isDesktop ? 0 : -260,
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-lg lg:shadow-sm"
            >
                {/* Logo & Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg">CaisseManager</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]" title={restaurantName}>
                                {restaurantName}
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            aria-label="Fermer le menu"
                        >
                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{role || 'Utilisateur'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{restaurantName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm">Déconnexion</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-slate-900">
                {/* Top Bar */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            aria-label="Menu"
                        >
                            <MenuIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {navItems.find(item => item.id === currentTab)?.label || 'CaisseManager'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {!isSuperAdmin && (
                            <button
                                onClick={() => setShowSearch(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Recherche</span>
                            </button>
                        )}
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isSuperAdmin && currentTab === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>}>
                                    <SuperAdminDashboard token={token} onLogout={handleLogout} />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'caisse' && (
                            <motion.div
                                key="caisse"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6"
                            >
                                <div className="flex-1 lg:flex-[2] overflow-y-auto min-h-0">
                                    {productsLoading ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {[...Array(8)].map((_, i) => (
                                                <ProductCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        <Suspense fallback={<Spinner size="lg" />}>
                                            <ProductList 
                                                products={products} 
                                                addToCart={addToCart} 
                                                ingredientsList={ingredients}
                                                promotions={promotions}
                                            />
                                        </Suspense>
                                    )}
                                </div>
                                <div className="lg:w-96 lg:flex-shrink-0 overflow-y-auto min-h-0">
                                    <Suspense fallback={<Spinner size="lg" />}>
                                        <OrderTicket 
                                            cart={cart} 
                                            updateQuantity={updateQuantity} 
                                            finalizeOrder={finalizeOrder}
                                            removeFromCart={removeFromCart}
                                            clearCart={clearCart}
                                            promotions={promotions}
                                        />
                                    </Suspense>
                                </div>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'menu' && (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <MenuAdmin 
                                        products={products} 
                                        token={token} 
                                        snackId={snackId} 
                                        onRefresh={() => window.location.reload()} 
                                    />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'ingredients' && (
                            <motion.div
                                key="ingredients"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <IngredientsAdmin 
                                        ingredients={ingredients} 
                                        token={token} 
                                        snackId={snackId} 
                                        onRefresh={() => window.location.reload()} 
                                    />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'cuisine' && (
                            <motion.div
                                key="cuisine"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto"
                            >
                                <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>}>
                                    <KitchenDisplay token={token} snackId={snackId} />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'rapports' && isManager && (
                            <motion.div
                                key="rapports"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <RapportDashboard token={token} snackId={snackId} />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'utilisateurs' && isManager && (
                            <motion.div
                                key="utilisateurs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <UserManagement token={token} snackId={snackId} />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'promotions' && isManager && (
                            <motion.div
                                key="promotions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <PromotionsManager token={token} snackId={snackId} />
                                </Suspense>
                            </motion.div>
                        )}

                        {!isSuperAdmin && currentTab === 'imprimantes' && isManager && (
                            <motion.div
                                key="imprimantes"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
                            >
                                <Suspense fallback={<Spinner size="lg" />}>
                                    <PrintersManager token={token} snackId={snackId} />
                                </Suspense>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Modal Ticket */}
            {showTicket && lastOrder && (
                <TicketPrinter 
                    order={lastOrder} 
                    restaurantName={restaurantName}
                    onClose={() => setShowTicket(false)}
                />
            )}

            {/* Global Search */}
            {showSearch && !isSuperAdmin && (
                <Suspense fallback={null}>
                    <GlobalSearch
                        products={products}
                        orders={[]}
                        onProductSelect={(product) => {
                            if (currentTab === 'caisse') {
                                addToCart(product);
                            }
                        }}
                        onOrderSelect={() => {}}
                        isOpen={showSearch}
                        onClose={() => setShowSearch(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}

export default App;
