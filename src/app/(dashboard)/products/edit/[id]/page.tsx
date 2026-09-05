import Link from 'next/link';
import { getProductById, updateProduct } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { getBrands } from '@/app/actions/brands';
import { getVariantsByProductId } from '@/app/actions/variants';
import { redirect } from 'next/navigation';
import ProductPriceUpdateForm from '@/components/products/ProductPriceUpdateForm';

export default async function EditProduct(props: { params: Promise<{ id: string }>; searchParams: Promise<{ variant?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const product = await getProductById(params.id);
  
  if (!product) {
    redirect('/products');
  }

  const [categories, brands, variants] = await Promise.all([
    getCategories(),
    getBrands(),
    getVariantsByProductId(params.id)
  ]);

  const defaultVariant = variants.find((variant: any) => variant.id === searchParams.variant) || variants[0] || null;



  const categoryName = categories.find((category: any) => category.id === product.category_id)?.name || '';
  const brandName = brands.find((brand: any) => brand.id === product.brand_id)?.name || '';

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Product Edit</h4>
          <h6>Update product name and current purchase / selling prices</h6>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <ProductPriceUpdateForm product={product} variant={defaultVariant} categoryName={categoryName} brandName={brandName} serverAction={updateProduct.bind(null, params.id)} />
          </div>
        </div>
    </>
  );
}
