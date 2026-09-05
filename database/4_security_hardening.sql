-- Supabase API security hardening. Run this once in the Supabase SQL Editor.
-- Existing active staff keep access. New Auth users are created inactive and
-- must be approved by an owner/admin before they can access business data.

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), 'Pending approval'),
    'employee',
    'inactive'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
  table_name text;
  policy_name text;
  protected_tables text[] := ARRAY[
    'categories', 'brands', 'units', 'products', 'product_variants',
    'customers', 'suppliers', 'sales', 'sale_items', 'purchases',
    'purchase_items', 'sales_returns', 'sales_return_items',
    'purchase_returns', 'purchase_return_items', 'inventory_movements',
    'customer_ledger', 'supplier_ledger', 'payment_accounts', 'payments',
    'expense_categories', 'expenses', 'employees', 'employee_salary_payments',
    'loaders', 'loader_bills'
  ];
BEGIN
  -- Replace permissive policies left by earlier migration files.
  FOREACH table_name IN ARRAY protected_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    FOR policy_name IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_name, table_name);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY active_staff_only ON public.%I FOR ALL TO authenticated USING (public.is_active_staff()) WITH CHECK (public.is_active_staff())',
      table_name
    );
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE policy_name text;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', policy_name);
  END LOOP;
END $$;

-- A user may only read their own profile. Profile/role/status changes require
-- the Supabase dashboard or a future, explicitly-authorized admin-only API.
CREATE POLICY profile_self_read ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

