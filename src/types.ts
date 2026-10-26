export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary'
  | 'Allowance'
  | 'Freelance'
  | 'Scholarship'
  | 'Food'
  | 'Transport'
  | 'Books'
  | 'Entertainment'
  | 'Rent'
  | 'Shopping'
  | 'Health'
  | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO date
  description: string;
}

export interface CategoryMeta {
  name: Category;
  icon: string;
  color: string;
  type: TransactionType;
}

export const INCOME_CATEGORIES: CategoryMeta[] = [
  { name: 'Salary', icon: 'Briefcase', color: '#34d399', type: 'income' },
  { name: 'Allowance', icon: 'Wallet', color: '#38bdf8', type: 'income' },
  { name: 'Freelance', icon: 'Laptop', color: '#a78bfa', type: 'income' },
  { name: 'Scholarship', icon: 'GraduationCap', color: '#fbbf24', type: 'income' },
  { name: 'Other', icon: 'PlusCircle', color: '#94a3b8', type: 'income' },
];

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { name: 'Food', icon: 'Utensils', color: '#fb7185', type: 'expense' },
  { name: 'Transport', icon: 'Bus', color: '#fbbf24', type: 'expense' },
  { name: 'Books', icon: 'BookOpen', color: '#38bdf8', type: 'expense' },
  { name: 'Entertainment', icon: 'Clapperboard', color: '#a78bfa', type: 'expense' },
  { name: 'Rent', icon: 'Home', color: '#f472b6', type: 'expense' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#34d399', type: 'expense' },
  { name: 'Health', icon: 'HeartPulse', color: '#22d3ee', type: 'expense' },
  { name: 'Other', icon: 'Receipt', color: '#94a3b8', type: 'expense' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const CATEGORY_MAP: Record<Category, CategoryMeta> =
  ALL_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.name]: c }), {} as Record<Category, CategoryMeta>);

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

// --- Mock data ---

const today = new Date();
const iso = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};
const monthsAgo = (m: number, day = 15) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - m);
  d.setDate(day);
  return iso(d);
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // This month
  { id: 't1', amount: 1200, type: 'income', category: 'Allowance', date: daysAgo(2), description: 'Monthly allowance from parents' },
  { id: 't2', amount: 350, type: 'income', category: 'Freelance', date: daysAgo(5), description: 'Web design gig for local cafe' },
  { id: 't3', amount: 42.5, type: 'expense', category: 'Food', date: daysAgo(1), description: 'Grocery run at Trader Joe\'s' },
  { id: 't4', amount: 28, type: 'expense', category: 'Transport', date: daysAgo(1), description: 'Uber to campus' },
  { id: 't5', amount: 89.99, type: 'expense', category: 'Books', date: daysAgo(3), description: 'Calculus textbook, 4th edition' },
  { id: 't6', amount: 15.99, type: 'expense', category: 'Entertainment', date: daysAgo(4), description: 'Netflix subscription' },
  { id: 't7', amount: 650, type: 'expense', category: 'Rent', date: daysAgo(6), description: 'Apartment rent — shared with roommate' },
  { id: 't8', amount: 12.75, type: 'expense', category: 'Food', date: daysAgo(0), description: 'Lunch at campus cafeteria' },
  { id: 't9', amount: 500, type: 'income', category: 'Scholarship', date: daysAgo(7), description: 'Merit scholarship disbursement' },
  { id: 't10', amount: 54.2, type: 'expense', category: 'Shopping', date: daysAgo(8), description: 'New hoodie from the bookstore' },
  { id: 't11', amount: 32, type: 'expense', category: 'Health', date: daysAgo(9), description: 'Pharmacy — vitamins & supplies' },
  { id: 't12', amount: 9.99, type: 'expense', category: 'Entertainment', date: daysAgo(10), description: 'Spotify Premium student plan' },
  { id: 't13', amount: 22, type: 'expense', category: 'Transport', date: daysAgo(11), description: 'Gas station fill-up' },
  { id: 't14', amount: 18.5, type: 'expense', category: 'Food', date: daysAgo(12), description: 'Coffee & bagel study break' },

  // Last month
  { id: 't15', amount: 1200, type: 'income', category: 'Allowance', date: monthsAgo(1, 3), description: 'Monthly allowance from parents' },
  { id: 't16', amount: 650, type: 'expense', category: 'Rent', date: monthsAgo(1, 5), description: 'Apartment rent' },
  { id: 't17', amount: 200, type: 'income', category: 'Freelance', date: monthsAgo(1, 8), description: 'Logo design project' },
  { id: 't18', amount: 145, type: 'expense', category: 'Food', date: monthsAgo(1, 10), description: 'Weekly groceries' },
  { id: 't19', amount: 78, type: 'expense', category: 'Books', date: monthsAgo(1, 12), description: 'Chemistry lab manual' },
  { id: 't20', amount: 45, type: 'expense', category: 'Transport', date: monthsAgo(1, 15), description: 'Monthly transit pass' },
  { id: 't21', amount: 60, type: 'expense', category: 'Entertainment', date: monthsAgo(1, 18), description: 'Concert tickets' },
  { id: 't22', amount: 35, type: 'expense', category: 'Shopping', date: monthsAgo(1, 22), description: 'Phone case & accessories' },

  // 2 months ago
  { id: 't23', amount: 1200, type: 'income', category: 'Allowance', date: monthsAgo(2, 3), description: 'Monthly allowance from parents' },
  { id: 't24', amount: 650, type: 'expense', category: 'Rent', date: monthsAgo(2, 5), description: 'Apartment rent' },
  { id: 't25', amount: 300, type: 'income', category: 'Freelance', date: monthsAgo(2, 9), description: 'Tutoring — 6 sessions' },
  { id: 't26', amount: 160, type: 'expense', category: 'Food', date: monthsAgo(2, 12), description: 'Groceries & dining out' },
  { id: 't27', amount: 52, type: 'expense', category: 'Transport', date: monthsAgo(2, 16), description: 'Gas & parking' },
  { id: 't28', amount: 95, type: 'expense', category: 'Books', date: monthsAgo(2, 20), description: 'Physics textbook' },
  { id: 't29', amount: 40, type: 'expense', category: 'Entertainment', date: monthsAgo(2, 24), description: 'Movie night with friends' },

  // 3 months ago
  { id: 't30', amount: 1200, type: 'income', category: 'Allowance', date: monthsAgo(3, 3), description: 'Monthly allowance from parents' },
  { id: 't31', amount: 650, type: 'expense', category: 'Rent', date: monthsAgo(3, 5), description: 'Apartment rent' },
  { id: 't32', amount: 150, type: 'expense', category: 'Food', date: monthsAgo(3, 10), description: 'Groceries' },
  { id: 't33', amount: 48, type: 'expense', category: 'Transport', date: monthsAgo(3, 14), description: 'Transit pass' },
  { id: 't34', amount: 120, type: 'expense', category: 'Shopping', date: monthsAgo(3, 18), description: 'Winter jacket' },
  { id: 't35', amount: 500, type: 'income', category: 'Scholarship', date: monthsAgo(3, 22), description: 'Dean\'s list scholarship' },

  // 4 months ago
  { id: 't36', amount: 1200, type: 'income', category: 'Allowance', date: monthsAgo(4, 3), description: 'Monthly allowance from parents' },
  { id: 't37', amount: 650, type: 'expense', category: 'Rent', date: monthsAgo(4, 5), description: 'Apartment rent' },
  { id: 't38', amount: 130, type: 'expense', category: 'Food', date: monthsAgo(4, 12), description: 'Groceries' },
  { id: 't39', amount: 45, type: 'expense', category: 'Transport', date: monthsAgo(4, 16), description: 'Gas' },
  { id: 't40', amount: 75, type: 'expense', category: 'Entertainment', date: monthsAgo(4, 20), description: 'Gaming subscription' },

  // 5 months ago
  { id: 't41', amount: 1200, type: 'income', category: 'Allowance', date: monthsAgo(5, 3), description: 'Monthly allowance from parents' },
  { id: 't42', amount: 650, type: 'expense', category: 'Rent', date: monthsAgo(5, 5), description: 'Apartment rent' },
  { id: 't43', amount: 140, type: 'expense', category: 'Food', date: monthsAgo(5, 12), description: 'Groceries' },
  { id: 't44', amount: 38, type: 'expense', category: 'Transport', date: monthsAgo(5, 16), description: 'Transit pass' },
  { id: 't45', amount: 85, type: 'expense', category: 'Books', date: monthsAgo(5, 20), description: 'Notebooks & supplies' },
];

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
