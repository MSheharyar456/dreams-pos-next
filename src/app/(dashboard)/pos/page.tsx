'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getProducts } from '@/app/actions/products';
import { getCustomers } from '@/app/actions/customers';
import { createSale, getSaleById, updateSale } from '@/app/actions/sales';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryName?: string;
}

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [showDropdown, setShowDropdown] = useState(false);
  // Checkout Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editSaleId, setEditSaleId] = useState<string | null>(null);
  const [isLoan, setIsLoan] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [shippingPrice, setShippingPrice] = useState('0');
  const [loaderPrice, setLoaderPrice] = useState('0');
  const [unloadingPrice, setUnloadingPrice] = useState('0');
  const [unallocatedCharges, setUnallocatedCharges] = useState(0);
  const [savedCustomers, setSavedCustomers] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      const customers = await getCustomers();
      setSavedCustomers(customers.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone || ''
      })));
    }
    loadCustomers();
  }, []);

  const unitForProduct = (product: Product | null | undefined) => {
    const categoryOrName = `${product?.categoryName || ''} ${product?.name || ''}`.toLowerCase();
    if (categoryOrName.includes('sand') || categoryOrName.includes('crush') || categoryOrName.includes('bajri') || categoryOrName.includes('reet')) return 'Cubic Feet';
    if (categoryOrName.includes('cement')) return 'Bags';
    if (categoryOrName.includes('steel') || categoryOrName.includes('saria') || categoryOrName.includes('syria')) return 'Kg';
    if (categoryOrName.includes('pipe')) return 'Lengths';
    if (categoryOrName.includes('powder')) return 'Packets';
    return 'Pieces';
  };

  // Fetch products from database
  useEffect(() => {
    async function loadProducts() {
      const rawProducts = await getProducts();
      const flatProducts: Product[] = [];
      
      for (const p of rawProducts) {
        if (p.variants && p.variants.length > 0) {
          for (const v of p.variants) {
            let availableQty = 0;
            if (v.inventory_movements) {
              for (const m of v.inventory_movements) {
                availableQty += Number(m.quantity);
              }
            }
            
            const displayName = [
              p.name,
              p.brand?.name,
              v.variant_name && v.variant_name !== 'Default' ? v.variant_name : null,
            ].filter(Boolean).join(' — ');

            flatProducts.push({
              id: v.id, // Using variant ID for cart
              name: displayName,
              price: v.sale_price || 0,
              stock: availableQty,
              categoryName: p.category?.name || ''
            });
          }
        }
      }
      setProducts(flatProducts);
    }
    loadProducts();
  }, []);

  // Check for edit mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      setEditSaleId(editId);
      loadSaleForEdit(editId);
    }
  }, []);

  const loadSaleForEdit = async (id: string) => {
    const saleData = await getSaleById(id);
    if (saleData) {
      setCustomerName(saleData.customerName);
      setPhone(saleData.phone);
      setIsLoan(saleData.isLoan);
      setPaidAmount(saleData.paidAmount.toString());
      const shipping = Number(saleData.sale.shipping_price || 0);
      const loader = Number(saleData.sale.loader_price || 0);
      const unloading = Number(saleData.sale.unloading_price || 0);
      const storedCharges = shipping + loader + unloading;
      const legacyCharges = Number(saleData.sale.loader_charges || 0);
      setShippingPrice(String(shipping));
      setLoaderPrice(String(loader));
      setUnloadingPrice(String(unloading));
      setUnallocatedCharges(Math.max(0, legacyCharges - storedCharges));
      
      // Load cart items (we assume products are loaded, but we just need id, name, price, quantity)
      // Actually, we can fetch name and stock from the `products` state, but `products` might not be loaded yet.
      // We will just map it simply.
      const loadedCart: CartItem[] = saleData.sale.sale_items.map((item: any) => ({
        id: item.product_variant_id,
        cartId: Math.random().toString(),
        name: 'Product (Edit)', // Simplification
        price: item.unit_price,
        stock: 999, // Bypass stock check for existing items temporarily
        quantity: item.quantity
      }));
      setCart(loadedCart);
    }
  };

  // Helper to calculate effective stock (remaining stock after subtracting cart items)
  const getEffectiveStock = (productId: string, initialStock: number) => {
    const cartItem = cart.find(item => item.id === productId);
    return initialStock - (cartItem ? cartItem.quantity : 0);
  };

  // Filter products based on search query and effective stock
  const filteredProducts = products
    .map(p => ({ ...p, effectiveStock: getEffectiveStock(p.id, p.stock) }))
    .filter(p => p.effectiveStock > 0 && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const cartUnits = Array.from(new Set(cart.map((item) => unitForProduct(item))));
  const cartQuantityHeading = cartUnits.length === 1 ? `QTY (${cartUnits[0]})` : 'QTY';
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const extraCharges = Math.max(0, Number(shippingPrice) || 0)
    + Math.max(0, Number(loaderPrice) || 0)
    + Math.max(0, Number(unloadingPrice) || 0)
    + unallocatedCharges;
  const saleTotal = cartSubtotal + extraCharges;

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert("Please select a product first");
      return;
    }
    
    if (quantityInput <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (quantityInput > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} items remaining in stock!`);
      return;
    }

    // Check if product is already in cart, if so just update quantity
    const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantityInput;
      
      if (newQuantity > selectedProduct.stock) {
        alert(`Cannot add. Only ${selectedProduct.stock} items remaining in stock!`);
        return;
      }
      
      updatedCart[existingItemIndex].quantity = newQuantity;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...selectedProduct,
          cartId: Math.random().toString(36).substr(2, 9),
          quantity: quantityInput
        }
      ]);
    }

    // Reset inputs
    setSelectedProduct(null);
    setSearchQuery('');
    setQuantityInput(1);
  };

  const updateCartQuantity = (cartId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const item = cart.find(i => i.cartId === cartId);
    if (item && newQuantity > item.stock) {
      alert(`Only ${item.stock} items remaining in stock!`);
      return;
    }

    setCart(cart.map(item => 
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const subtotal = cartSubtotal;
    const result = editSaleId
      ? await updateSale(
          editSaleId,
          customerName,
          cart,
          subtotal,
          isLoan,
          Number(paidAmount) || 0,
          phone,
          note,
          Number(shippingPrice) || 0,
          Number(loaderPrice) || 0,
          Number(unloadingPrice) || 0,
          unallocatedCharges
        )
      : await createSale(
          customerName,
          cart,
          subtotal,
          isLoan,
          Number(paidAmount) || 0,
          phone,
          note,
          selectedCustomerId,
          Number(shippingPrice) || 0,
          Number(loaderPrice) || 0,
          Number(unloadingPrice) || 0
        );
    
    setIsProcessing(false);
    if (result.success) {
      setShowCheckoutModal(false);
      setCart([]);
      setCustomerName('');
        setIsLoan(false);
        setPaidAmount('');
        setPhone('');
        setNote('');
        setShippingPrice('0');
        setLoaderPrice('0');
        setUnloadingPrice('0');
        setUnallocatedCharges(0);
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Order completed successfully'
      });
      if (editSaleId) {
        router.push('/dashboard');
      } else if ('saleId' in result && result.saleId) {
        router.push(`/pos/receipt/${result.saleId}`);
      } else {
        alert('Server did not return a saleId. Please restart your dev server.');
      }
    } else {
      Swal.fire('Error', result.error || 'Failed to complete sale', 'error');
    }
  };

  const removeCartItem = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#fff', margin: 0, padding: 0 }}>
      <div className="content" style={{ padding: '20px 30px' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '28px', color: '#111', margin: 0, fontFamily: 'serif' }}>Sales Counter</h2>
            <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '13px' }}>
              Served by: Sheryar (Admin) · {currentDate}, {currentTime}
            </p>
          </div>
        </div>

        {/* Search & Add Section */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>Select a Product</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedProduct(null); // Clear selection if typing
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search product..."
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              
              {/* Dropdown Results */}
              {showDropdown && searchQuery && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {filteredProducts.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {filteredProducts.map(product => (
                        <li 
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          style={{
                            padding: '10px 15px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          <span style={{ fontWeight: 500 }}>{product.name}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: product.effectiveStock > 0 ? '#28a745' : '#dc3545',
                            backgroundColor: product.effectiveStock > 0 ? '#e8f5e9' : '#ffebee',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {product.effectiveStock} {unitForProduct(product)} remaining
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ padding: '15px', color: '#888', textAlign: 'center' }}>No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ width: '80px' }}>
            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block' }}>Qty ({unitForProduct(selectedProduct)})</label>
            <input
              type="number"
              min="1"
              value={quantityInput}
              onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                textAlign: 'center',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <button
              onClick={handleAddToCart}
              style={{
                backgroundColor: '#ff9f43',
                color: '#fff',
                border: 'none',
                padding: '10px 25px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px'
              }}
            >
              <i className="fa fa-plus"></i> Add Product
            </button>
          </div>
        </div>

        {/* Cart Table */}
        <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: 600 }}>#</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: 600 }}>ITEM NAME</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#666', fontSize: '12px', fontWeight: 600 }}>PRICE</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '12px', fontWeight: 600 }}>{cartQuantityHeading}</th>
                <th style={{ padding: '15px', textAlign: 'right', color: '#666', fontSize: '12px', fontWeight: 600 }}>TOTAL</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '12px', fontWeight: 600 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: '#fafafa', color: '#aaa' }}>
                      <i className="fa fa-shopping-bag" style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }}></i>
                      <p style={{ margin: 0, fontSize: '14px' }}>Cart is empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cart.map((item, index) => (
                  <tr key={item.cartId} style={{ borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                    <td style={{ padding: '15px', color: '#444' }}>{index + 1}</td>
                    <td style={{ padding: '15px', color: '#444', fontWeight: 500 }}>
                      {item.name}
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Stock: {item.stock} {unitForProduct(item)} remaining</div>
                    </td>
                    <td style={{ padding: '15px', color: '#444' }}>Rs. {item.price.toFixed(2)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <button 
                          onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                          style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer' }}
                        >-</button>
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.cartId, parseInt(e.target.value) || 1)}
                          style={{ width: '50px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', padding: '4px' }}
                        />
                        <button 
                          onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                          style={{ border: '1px solid #ddd', background: '#fff', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer' }}
                        >+</button>
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 600, color: '#444' }}>
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button 
                        onClick={() => removeCartItem(item.cartId)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '5px' }}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Cart Totals Bottom Bar */}
          {cart.length > 0 && (
            <div style={{ backgroundColor: '#fff', padding: '20px', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '380px', maxWidth: '100%' }}>
                <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Shipping price', value: shippingPrice, setValue: setShippingPrice },
                    { label: 'Loader price', value: loaderPrice, setValue: setLoaderPrice },
                    { label: 'Unloading price', value: unloadingPrice, setValue: setUnloadingPrice },
                  ].map((charge) => (
                    <div key={charge.label} style={{ flex: '1 1 0', minWidth: 0 }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', lineHeight: 1.2, color: '#555', whiteSpace: 'nowrap' }}>{charge.label}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={charge.value}
                        onChange={(event) => {
                          charge.setValue(event.target.value);
                          setUnallocatedCharges(0);
                        }}
                        style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '7px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>Rs. {cartSubtotal.toFixed(2)}</span>
                </div>
                {extraCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px', color: '#555' }}>
                    <span>Charges:</span>
                    <span style={{ fontWeight: 600 }}>Rs. {extraCharges.toFixed(2)}</span>
                  </div>
                )}
                {unallocatedCharges > 0 && (
                  <div style={{ marginTop: '-6px', marginBottom: '10px', fontSize: '11px', color: '#777', textAlign: 'right' }}>
                    Existing combined charges (not split by type): Rs. {unallocatedCharges.toFixed(2)}. Enter the three charges to replace this amount.
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '17px', color: '#333' }}>
                  <span>Total:</span>
                  <span style={{ fontWeight: 700 }}>Rs. {saleTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(true)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#ff9f43', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>
                  Complete Sale
                </button>
              </div>
            </div>
          )}
        </div>
        {showCheckoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', width: '400px', maxWidth: '90%' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>Complete Sale</h3>
              
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Customer Name (Optional)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerName(value);

                    if (!value.trim()) {
                      setSelectedCustomerId(null);
                      return;
                    }

                    const matchedCustomer = savedCustomers.find(
                      customer => customer.name.toLowerCase() === value.trim().toLowerCase()
                    );

                    if (matchedCustomer) {
                      setSelectedCustomerId(matchedCustomer.id);
                      setPhone(matchedCustomer.phone || '');
                    } else {
                      setSelectedCustomerId(null);
                    }
                  }}
                  placeholder="Walk-in Customer"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none' }}
                />

                {customerName.trim() && savedCustomers.filter(customer =>
                  customer.name.toLowerCase().includes(customerName.trim().toLowerCase())
                ).length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginTop: '4px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 1100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}>
                    {savedCustomers
                      .filter(customer => customer.name.toLowerCase().includes(customerName.trim().toLowerCase()))
                      .map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setCustomerName(customer.name);
                            setPhone(customer.phone || '');
                            setSelectedCustomerId(customer.id);
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{customer.name}</div>
                          {customer.phone ? <div style={{ fontSize: '12px', color: '#666' }}>{customer.phone}</div> : null}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Total Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#ff9f43' }}>
                  Rs. {saleTotal.toFixed(2)}
                </span>
              </div>

                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="isLoan" checked={isLoan} onChange={(e) => setIsLoan(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="isLoan" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>Loan Khata (Partial/Unpaid)</label>
                </div>
                
                {isLoan && (
                  <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#fdfdfd' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>Paid Amount</label>
                      <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>Phone Number</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300-1234567" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555' }}>Note / Remarks</label>
                      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Loan remarks..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }} />
                    </div>
                  </div>
                )}


              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={isProcessing}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#f1f1f1', color: '#444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompleteSale}
                  disabled={isProcessing}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#ff9f43', color: '#fff', border: 'none', borderRadius: '6px', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isProcessing ? 0.7 : 1 }}
                >
                  {isProcessing ? 'Processing...' : editSaleId ? 'Update Order' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Force reload: 1786775956411// Force reload UI: 08/22/2026 14:44:04
