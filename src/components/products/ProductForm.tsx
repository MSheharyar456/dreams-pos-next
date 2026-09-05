"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

type ProductFormProps = {
  initialData?: any;
  categories?: any[];
  brands?: any[];
  units?: any[];
  supplierId?: string;
  existingProducts?: any[];
  serverAction?: any;
};

export default function ProductForm({ initialData, categories = [], brands = [], units = [], supplierId, existingProducts, serverAction }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState(initialData?.name || '');
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category_id || '');
  const [selectedBrand, setSelectedBrand] = useState(initialData?.brand_id || '');
  const isEditing = Boolean(initialData);
  
  // If we are adding from a supplier and selected an existing product, grab its details
  const existingProduct = existingProducts?.find(p => p.name === selectedProductName);
  
  // Use existing product's category/brand if selected, otherwise use state
  const effectiveCategoryId = existingProduct ? existingProduct.category_id : selectedCategory;
  const effectiveBrandId = existingProduct ? existingProduct.brand_id : selectedBrand;

  // Determine Category Name for Dynamic Fields
  const categoryObj = categories.find(c => c.id === effectiveCategoryId);
  const catName = categoryObj ? categoryObj.name.toLowerCase() : '';
  const brandObj = brands.find((brand: any) => brand.id === effectiveBrandId);

  // Filter brands based on the selected category
  const filteredBrands = effectiveCategoryId 
    ? brands.filter((b: any) => b.category_id === effectiveCategoryId)
    : brands;

  let baseLabel = 'Opening Stock';
  if (initialData) baseLabel = 'Add Stock';
  else if (supplierId) baseLabel = 'Quantity';
  
  let unitLabel = '(Pieces)';
  if (catName.includes('cement')) unitLabel = '(Bags)';
  else if (catName.includes('steel') || catName.includes('syria')) unitLabel = '(Kg)';
  else if (catName.includes('crush') || catName.includes('sand') || catName.includes('bajri') || catName.includes('reet')) unitLabel = '(Cubic Feet)';
  else if (catName.includes('powder')) unitLabel = '(Packets)';
  else if (catName.includes('pipe')) unitLabel = '(Lengths)';
  
  let qtyLabel = `${baseLabel} ${unitLabel}`;

  const isPipe = catName.includes('pipe');
  const isSteel = catName.includes('steel') || catName.includes('syria');
  const isBond = catName.includes('bond') || catName.includes('adhesive');
  const isCement = catName.includes('cement');
  const showSutr = isPipe || isSteel;
  const showFeet = isPipe;
  const showBrand = isPipe || isSteel || isBond || isCement;

  let sutrOptions = [1, 2, 3, 4, 5, 6, 8];
  if (isPipe) sutrOptions = [1, 2, 3, 4, 5, 6];
  if (isSteel) sutrOptions = [3, 4, 6, 8];

  // Try to parse existing product's variant name for sutr and feet if we are hiding those fields
  let defaultSutr = '';
  let defaultFeet = '';
  const variantToParse = existingProduct?.variants?.[0]?.variant_name || initialData?.variant_name;
  if (variantToParse) {
     const vName = variantToParse;
     if (vName) {
        const sutrMatch = vName.match(/(\d+)\s*Sutr/);
        if (sutrMatch) defaultSutr = sutrMatch[1];
        const feetMatch = vName.match(/([\d.]+)\s*Feet/);
        if (feetMatch) defaultFeet = feetMatch[1];
     }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await serverAction(new FormData(event.currentTarget));
    setIsSubmitting(false);
    if (result?.error) {
      Swal.fire('Update failed', result.error, 'error');
      return;
    }
    await Swal.fire({ icon: 'success', title: 'Product updated successfully', timer: 1400, showConfirmButton: false });
    router.refresh();
  };

  return (
    <form onSubmit={initialData ? handleSubmit : undefined} action={initialData ? undefined : serverAction}>
    <div className="card">
      <div className="card-body">
        <div className="row">
          
          <div className="col-lg-4 col-sm-6 col-12">
            <div className="form-group">
              <label>Product Name</label>
              {isEditing ? (
                <>
                  <input type="text" className="form-control" value={initialData.name || ''} disabled />
                  <input type="hidden" name="name" value={initialData.name || ''} />
                </>
              ) : supplierId && existingProducts ? (
                <select 
                  name="name" 
                  className="form-select" 
                  required 
                  value={selectedProductName}
                  onChange={(e) => setSelectedProductName(e.target.value)}
                >
                  <option value="">Select an existing product or enter new below...</option>
                  {existingProducts.map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" name="name" required className="form-control" defaultValue={initialData?.name || ''} />
              )}
            </div>
            {supplierId && existingProducts && (
                <div className="mt-2">
                   <small className="text-muted">Or enter a completely new product name:</small>
                   <input type="text" className="form-control mt-1" placeholder="New Product Name" onChange={(e) => setSelectedProductName(e.target.value)} />
                </div>
            )}
          </div>
          
          {/* Hide Category and Brand if we selected an existing product */}
          {isEditing ? (
            <>
              <input type="hidden" name="category_id" value={initialData.category_id || ''} />
              <input type="hidden" name="brand_id" value={initialData.brand_id || ''} />
              <div className="col-lg-3 col-sm-6 col-12"><div className="form-group"><label>Category</label><input className="form-control" value={categoryObj?.name || '-'} disabled /></div></div>
              <div className="col-lg-3 col-sm-6 col-12"><div className="form-group"><label>Brand</label><input className="form-control" value={brandObj?.name || '-'} disabled /></div></div>
              {(showSutr || showFeet) && <div className="col-lg-3 col-sm-6 col-12"><div className="form-group"><label>Size / Dimension</label><input className="form-control" value={initialData.variant_name || 'Default'} disabled /></div></div>}
            </>
          ) : !existingProduct && (
            <>
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-select" 
                    name="category_id" 
                    value={selectedCategory} 
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedBrand('');
                    }}
                  >
                    <option value="">Choose Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {showBrand && (
                <div className="col-lg-3 col-sm-6 col-12">
                  <div className="form-group">
                    <label>Brand</label>
                    <select className="form-select" name="brand_id" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                      <option value="">Choose Brand</option>
                      {filteredBrands.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {!showBrand && (
                <input type="hidden" name="brand_id" value="" />
              )}
            </>
          )}

          {/* Hidden inputs to pass data if existing product is selected */}
          {existingProduct && (
             <>
               <input type="hidden" name="category_id" value={effectiveCategoryId || ""} />
               <input type="hidden" name="brand_id" value={effectiveBrandId || ""} />
             </>
          )}

          {!isEditing && !existingProduct && showSutr && (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Sutr (Size/Thickness)</label>
                <select className="form-select" name="sutr" defaultValue={defaultSutr}>
                  <option value="">Select Size</option>
                  {sutrOptions.map(num => (
                    <option key={num} value={num}>{num} Sutr</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {!isEditing && !existingProduct && showFeet && (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Feet (Length)</label>
                <input type="number" step="0.5" name="feet" className="form-control" placeholder="e.g. 10" defaultValue={defaultFeet} />
              </div>
            </div>
          )}

          {existingProduct && (
             <>
               <input type="hidden" name="sutr" value={defaultSutr} />
               <input type="hidden" name="feet" value={defaultFeet} />
             </>
          )}
          {initialData && <input type="hidden" name="variant_name" value={initialData.variant_name || 'Default'} />}

          {/* Quantity Field: Only visible if on Supplier screen */}
          {supplierId && !initialData && (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>{qtyLabel}</label>
                <input type="number" step="0.01" name="opening_stock" className="form-control" defaultValue="0" />
              </div>
            </div>
          )}
          {supplierId && initialData && (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>{qtyLabel}</label>
                <input type="number" step="0.01" name="add_stock" className="form-control" defaultValue="0" />
              </div>
            </div>
          )}

          {/* Hidden defaults for Simple Add Product screen (Strict Inventory Control) */}
          {!supplierId && !initialData && (
            <input type="hidden" name="opening_stock" value="0" />
          )}
          {!supplierId && initialData && (
            <input type="hidden" name="add_stock" value="0" />
          )}

          {/* Purchase Price: Only visible on Supplier side */}
          {supplierId ? (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Purchase Price</label>
                <input type="number" step="0.01" name="purchase_price" className="form-control" defaultValue={existingProduct?.variants?.[0]?.purchase_price || initialData?.variants?.[0]?.purchase_price || '0'} />
              </div>
            </div>
          ) : (
            <input type="hidden" name="purchase_price" value={existingProduct?.variants?.[0]?.purchase_price || initialData?.variants?.[0]?.purchase_price || '0'} />
          )}

          {/* Sale Price: Only visible on standard Add Product side */}
          {!supplierId ? (
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="form-group">
                <label>Sale Price (Selling Price)</label>
                <input type="number" step="0.01" name="sale_price" className="form-control" defaultValue={existingProduct?.variants?.[0]?.sale_price || initialData?.variants?.[0]?.sale_price || '0'} />
              </div>
            </div>
          ) : (
            <input type="hidden" name="sale_price" value={existingProduct?.variants?.[0]?.sale_price || initialData?.variants?.[0]?.sale_price || '0'} />
          )}

          {supplierId && (
            <input type="hidden" name="supplier_id" value={supplierId} />
          )}
          {/* Ensure name is passed even if we used the extra input */}
          {supplierId && existingProducts && (
            <input type="hidden" name="name" value={selectedProductName} />
          )}

          <div className="col-lg-12 mt-3">
            <button type="submit" className="btn btn-submit me-2" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Submit'}</button>
            {supplierId ? (
              <Link href={`/suppliers/${supplierId}/products`} className="btn btn-cancel">Cancel</Link>
            ) : (
              <Link href="/products" className="btn btn-cancel">Cancel</Link>
            )}
          </div>
          
        </div>
      </div>
    </div>
    </form>
  );
}
