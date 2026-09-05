-- 3F: Expenses + Employees

-- EXPENSE CATEGORIES
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    expense_type TEXT NOT NULL CHECK (expense_type IN ('shop', 'house', 'other')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_category_id UUID REFERENCES expense_categories(id) ON DELETE RESTRICT,
    payment_account_id UUID REFERENCES payment_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    designation TEXT,
    joining_date DATE,
    salary NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEE SALARY PAYMENTS
CREATE TABLE employee_salary_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    payment_account_id UUID REFERENCES payment_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    salary_month DATE, -- usually stored as first day of the month
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
