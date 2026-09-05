import Link from 'next/link';
import { getProducts, deleteProduct, bulkDeleteProducts } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { getBrands } from '@/app/actions/brands';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';
import BulkDeleteButton from '@/components/ui/BulkDeleteButton';

import FilterForm from '@/components/ui/FilterForm';

export default async function ProductList(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const { product_id, category_id, brand_id } = searchParams;
  
  // Fetch filtered data for table
  const rawProducts = await getProducts({
    product_id: product_id as string,
    category_id: category_id as string,
    brand_id: brand_id as string
  });

  // Fetch all data for dropdowns
  const allProductsForDropdown = await getProducts();
  const categories = await getCategories();
  const brands = await getBrands();

  // Flatten the variants into individual rows so it perfectly matches the original template
  const products: any[] = [];
  for (const p of rawProducts) {
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        let totalIn = 0;
        let totalOut = 0;
        let availableQty = 0;

        if (v.inventory_movements) {
          for (const m of v.inventory_movements) {
            if (m.quantity > 0) totalIn += Number(m.quantity);
            if (m.quantity < 0) totalOut += Math.abs(Number(m.quantity));
            availableQty += Number(m.quantity);
          }
        }

        products.push({
          ...p,
          variant: v,
          displayName: [p.name, p.brand?.name, v.variant_name && v.variant_name !== 'Default' ? v.variant_name : null].filter(Boolean).join(' — '),
          totalIn,
          totalOut,
          availableQty
        });
      }
    } else {
      products.push({
        ...p,
        variant: null,
        displayName: [p.name, p.brand?.name].filter(Boolean).join(' — '),
        totalIn: 0,
        totalOut: 0,
        availableQty: 0
      });
    }
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteProduct(id);
    revalidatePath('/products');
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Product List</h4>
          <h6>Manage your products</h6>
        </div>
        <div className="page-btn">
          <Link href="/products/add" className="btn btn-added">
            <img src="/assets/img/icons/plus.svg" className="me-1" alt="img" />
            Add New Product
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          
          {/* Filter Bar */}
          <div className="table-top">
            <div className="search-set">
              <div className="search-path">
                <a className="btn btn-filter" id="filter_search">
                  <img src="/assets/img/icons/filter.svg" alt="img" />
                  <span><img src="/assets/img/icons/closes.svg" alt="img" /></span>
                </a>
              </div>
              <div className="search-input">
                <a className="btn btn-searchset"><img src="/assets/img/icons/search-white.svg" alt="img" /></a>
              </div>
            </div>
            <div className="wordset">
              <ul>
                <li>
                  <a data-bs-toggle="tooltip" data-bs-placement="top" title="pdf"><img src="/assets/img/icons/pdf.svg" alt="img" /></a>
                </li>
                <li>
                  <a data-bs-toggle="tooltip" data-bs-placement="top" title="excel"><img src="/assets/img/icons/excel.svg" alt="img" /></a>
                </li>
                <li>
                  <a data-bs-toggle="tooltip" data-bs-placement="top" title="print"><img src="/assets/img/icons/printer.svg" alt="img" /></a>
                </li>
                <BulkDeleteButton onDelete={bulkDeleteProducts} />
              </ul>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="card mb-0" id="filter_inputs">
            <div className="card-body pb-0">
              <FilterForm>
                <div className="row">
                  <div className="col-lg-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg col-sm-6 col-12">
                        <div className="form-group">
                          <select className="form-select" name="product_id" defaultValue={product_id as string || ""}>
                            <option value="">Choose Product</option>
                            {allProductsForDropdown.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg col-sm-6 col-12">
                        <div className="form-group">
                          <select className="form-select" name="category_id" defaultValue={category_id as string || ""}>
                            <option value="">Choose Category</option>
                            {categories.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg col-sm-6 col-12">
                        <div className="form-group">
                          <select className="form-select" name="brand_id" defaultValue={brand_id as string || ""}>
                            <option value="">Choose Brand</option>
                            {brands.map((b: any) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-1 col-sm-6 col-12 ms-auto">
                        <div className="form-group">
                          <button type="submit" className="btn btn-filters ms-auto w-100">
                            <img src="/assets/img/icons/search-whites.svg" alt="img" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FilterForm>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table datanew">
              <thead>
                <tr>
                  <th>
                    <label className="checkboxs">
                      <input type="checkbox" id="select-all" />
                      <span className="checkmarks"></span>
                    </label>
                  </th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Brand</th>
                  <th>Purchase Price</th>
                  <th>Sale Price</th>
                  <th>Total In</th>
                  <th>Total Out</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item: any) => (
                  <tr key={item.variant ? item.variant.id : item.id}>
                    <td>
                      <label className="checkboxs">
                        <input type="checkbox" />
                        <span className="checkmarks"></span>
                      </label>
                    </td>
                    <td className="productimgname">
                      <a href="javascript:void(0);" className="product-img">
                        <img src="/assets/img/product/product1.jpg" alt="product" />
                      </a>
                      <Link href={`/products/edit/${item.id}${item.variant ? `?variant=${item.variant.id}` : ''}`}>{item.displayName}</Link>
                    </td>
                    <td>{item.variant?.size || 'N/A'}</td>
                    <td>{item.brand?.name || 'N/D'}</td>
                    <td>{item.variant?.purchase_price || '0.00'}</td>
                    <td>{item.variant?.sale_price || '0.00'}</td>
                    <td>{item.totalIn}</td>
                    <td>{item.totalOut}</td>
                    <td>{item.availableQty}</td>
                    <td>
                      <Link className="me-3" href={`/products/edit/${item.id}${item.variant ? `?variant=${item.variant.id}` : ''}`}>
                        <img src="/assets/img/icons/edit.svg" alt="img" />
                      </Link>
                      <form action={handleDelete} className="d-inline">
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton id={item.id} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
