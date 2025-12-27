
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, User, Order, Category } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { getAIRecommendations, getSmartSearchResults } from './services/geminiService';

// Components
const Navbar: React.FC<{
  user: User | null;
  cartCount: number;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
}> = ({ user, cartCount, onNavigate, onLogout, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3">
              <i className="fas fa-cubes text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">NovaSphere</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="AI-powered search..."
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <i className="fas fa-search"></i>
              </div>
            </div>
          </form>

          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('cart')} className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fas fa-shopping-cart text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <div 
                  onClick={() => onNavigate(user.role === 'ADMIN' ? 'admin' : 'orders')}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{user.username}</span>
                </div>
                <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-600">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')} 
                className="text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-full px-5 py-1.5 hover:bg-indigo-50 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}> = ({ product, onAddToCart, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
    <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
      <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-indigo-600 shadow-sm">
        {product.category}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button 
          onClick={() => onAddToCart(product)}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<{
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
}> = ({ products, orders, onAddProduct, onDeleteProduct }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, category: 'Electronics', stock: 10, image: 'https://picsum.photos/400/400' });

  const totalSales = orders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <h2 className="text-3xl font-bold text-gray-900">${totalSales.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <h2 className="text-3xl font-bold text-gray-900">{orders.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Products Active</p>
          <h2 className="text-3xl font-bold text-gray-900">{products.length}</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Product Inventory</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Name" 
              className="p-2 rounded border" 
              value={newProduct.name} 
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input 
              placeholder="Price" 
              type="number" 
              className="p-2 rounded border" 
              value={newProduct.price} 
              onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
            />
            <textarea 
              placeholder="Description" 
              className="p-2 rounded border md:col-span-2" 
              value={newProduct.description} 
              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
            />
            <button 
              onClick={() => {
                onAddProduct(newProduct);
                setShowAddForm(false);
              }}
              className="bg-indigo-600 text-white p-2 rounded col-span-2"
            >
              Save Product
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm uppercase tracking-wider">
                <th className="pb-4">Name</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Price</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium">{p.name}</td>
                  <td className="py-4 text-gray-500">{p.category}</td>
                  <td className="py-4 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                  <td className="py-4">{p.stock}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => onDeleteProduct(p.id)} className="text-red-600 hover:text-red-800 ml-4"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchIds, setSearchIds] = useState<string[] | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // AI recommendations when cart changes
  useEffect(() => {
    const fetchRecs = async () => {
      if (cart.length > 0) {
        setAiLoading(true);
        const recIds = await getAIRecommendations(cart, products);
        const recProducts = products.filter(p => recIds.includes(p.id));
        setRecommendations(recProducts);
        setAiLoading(false);
      } else {
        setRecommendations([]);
      }
    };
    fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchIds(null);
      return;
    }
    setAiLoading(true);
    const ids = await getSmartSearchResults(query, products);
    setSearchIds(ids);
    setAiLoading(false);
    setCurrentPage('home');
  };

  const handleLogin = (role: 'USER' | 'ADMIN') => {
    const newUser: User = { id: 'u1', username: role === 'ADMIN' ? 'admin_boss' : 'jane_doe', email: 'user@example.com', role };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (!user) {
      setCurrentPage('login');
      return;
    }
    const total = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      total,
      status: 'PENDING',
      date: new Date().toLocaleDateString()
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCurrentPage('orders');
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }
    if (searchIds) {
      result = result.filter(p => searchIds.includes(p.id));
    }
    return result;
  }, [products, filterCategory, searchIds]);

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={user} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentPage === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            {!searchIds && (
              <div className="bg-indigo-600 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Future-Proof Your Lifestyle</h1>
                  <p className="text-indigo-100 text-lg">Experience the next generation of curated technology and apparel, powered by artificial intelligence.</p>
                  <button onClick={() => setFilterCategory('Electronics')} className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors">Shop Now</button>
                </div>
                <div className="flex-1">
                  <img src="https://picsum.photos/seed/tech/600/400" className="rounded-xl shadow-2xl" alt="hero" />
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Electronics', 'Apparel', 'Home', 'Accessories'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilterCategory(cat); setSearchIds(null); }}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    filterCategory === cat && !searchIds 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {searchIds && (
                <button 
                  onClick={() => setSearchIds(null)} 
                  className="px-6 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700"
                >
                  Clear Search Results <i className="fas fa-times ml-2"></i>
                </button>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={addToCart} 
                  onViewDetails={prod => { setSelectedProduct(prod); setCurrentPage('details'); }} 
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="text-gray-300 text-6xl mb-4"><i className="fas fa-search"></i></div>
                  <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg"><i className="fas fa-brain"></i></div>
                  <h2 className="text-2xl font-bold">AI Recommended for You</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onAddToCart={addToCart} 
                      onViewDetails={prod => { setSelectedProduct(prod); setCurrentPage('details'); }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'cart' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <i className="fas fa-shopping-basket text-6xl text-gray-200 mb-4"></i>
                <p className="text-gray-500 text-lg">Your cart is empty.</p>
                <button onClick={() => setCurrentPage('home')} className="mt-4 text-indigo-600 font-bold">Browse Products &rarr;</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <img src={item.image} className="w-24 h-24 object-cover rounded-lg" alt={item.name} />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{item.category}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="font-bold text-indigo-600">${item.price.toFixed(2)}</span>
                          <span className="text-gray-400 text-sm">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-600 p-2">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit space-y-4">
                  <h3 className="text-xl font-bold">Order Summary</h3>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-4"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'orders' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Order History</h1>
            <div className="space-y-6">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-20">You haven't placed any orders yet.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono text-sm font-bold text-indigo-600">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total Paid</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentPage === 'admin' && user?.role === 'ADMIN' && (
          <AdminDashboard 
            products={products} 
            orders={orders} 
            onDeleteProduct={id => setProducts(prev => prev.filter(p => p.id !== id))}
            onAddProduct={p => setProducts(prev => [...prev, { ...p, id: `p-${Date.now()}` }])}
          />
        )}

        {currentPage === 'login' && (
          <div className="max-w-md mx-auto py-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                <i className="fas fa-lock"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-gray-500 text-sm">Sign in to access your orders and account.</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => handleLogin('USER')}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Login as Customer
                </button>
                <button 
                  onClick={() => handleLogin('ADMIN')}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Login as Admin
                </button>
              </div>
              <p className="text-xs text-gray-400">Simulation mode: Just click to enter.</p>
            </div>
          </div>
        )}

        {currentPage === 'details' && selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg h-96 md:h-auto">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6 py-4">
              <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase">{selectedProduct.category}</span>
              <h1 className="text-4xl font-extrabold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center space-x-2 text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
                <span className="text-gray-400 text-sm font-medium ml-2">(4.8 / 5 based on 128 reviews)</span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">{selectedProduct.description}</p>
              <div className="text-3xl font-bold text-gray-900">${selectedProduct.price.toFixed(2)}</div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-cart-plus"></i>
                  <span>Add to Cart</span>
                </button>
                <button className="w-16 h-16 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
                  <i className="far fa-heart text-xl"></i>
                </button>
              </div>
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <i className="fas fa-truck text-indigo-600 w-5"></i>
                  <span>Free shipping worldwide</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <i className="fas fa-undo text-indigo-600 w-5"></i>
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-cubes"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">NovaSphere</span>
          </div>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
            An advanced enterprise-level e-commerce application demonstrating the power of React, Spring Boot (Simulated), and Gemini AI integration.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400 mb-8">
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-facebook-f text-xl"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-twitter text-xl"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-instagram text-xl"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-linkedin-in text-xl"></i></a>
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">© 2024 NovaSphere Inc. Educational Project.</p>
        </div>
      </footer>

      {/* Loading Overlay for AI */}
      {aiLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-indigo-600 animate-pulse"></i>
              </div>
            </div>
            <p className="text-indigo-700 font-semibold animate-pulse">Gemini AI is thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
