import Link from 'next/link';
import { createProduct } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { getBrands } from '@/app/actions/brands';
import { getUnits } from '@/app/actions/units';
import { redirect } from 'next/navigation';
import ProductForm from '@/components/products/ProductForm';

export default async function AddProduct() {
  const [categories, brands, units] = await Promise.all([
    getCategories(),
    getBrands(),
    getUnits()
  ]);



  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Product Add</h4>
            <h6>Create new product</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <ProductForm 
              categories={categories} 
              brands={brands} 
              units={units} 
              serverAction={createProduct}
            />
          </div>
        </div>
    </>
  );
}
