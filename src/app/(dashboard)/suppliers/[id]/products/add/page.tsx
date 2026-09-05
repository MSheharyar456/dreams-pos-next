import Link from 'next/link';
import ProductForm from '@/components/products/ProductForm';
import { createProduct } from '@/app/actions/products';
import { getSupplierById } from '@/app/actions/suppliers';
import { getCategories } from '@/app/actions/categories';
import { getProducts } from '@/app/actions/products';
import { getBrands } from '@/app/actions/brands';
import { getUnits } from '@/app/actions/units';
import { notFound } from 'next/navigation';

export default async function AddSupplierProduct(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supplier = await getSupplierById(params.id);
  
  if (!supplier) {
    notFound();
  }

  const [categories, brands, units, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getUnits(),
    getProducts()
  ]);

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Add Product for {supplier.name}</h4>
          <h6>Select an existing product from inventory to link it to this supplier</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <ProductForm 
            categories={categories} 
            brands={brands} 
            units={units}
            supplierId={params.id}
            existingProducts={products}
            serverAction={createProduct}
          />
        </div>
      </div>
    </>
  );
}
