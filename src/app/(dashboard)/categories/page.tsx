import Link from 'next/link';
import { getCategories, deleteCategory } from '@/app/actions/categories';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';

export default async function CategoryList() {
  const categories = await getCategories();

  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await deleteCategory(id);
    revalidatePath('/categories');
  }

  return (
    <>
      <div className="page-header">
          <div className="page-title">
            <h4>Product Category list</h4>
            <h6>View/Search product Category</h6>
          </div>
          <div className="page-btn">
            <Link href="/categories/add" className="btn btn-added">
              <img src="/assets/img/icons/plus.svg" className="me-1" alt="img" />
              Add Category
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table datanew">
                <thead>
                  <tr>
                    <th>Category name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category: any) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <span className={`badges ${category.is_active ? 'bg-lightgreen' : 'bg-lightred'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link className="me-3" href={`/categories/edit/${category.id}`}>
                          <img src="/assets/img/icons/edit.svg" alt="img" />
                        </Link>
                        <form action={handleDelete} className="d-inline">
                          <input type="hidden" name="id" value={category.id} />
                          <DeleteButton id={category.id} />
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
