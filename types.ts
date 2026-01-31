
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum Category {
  // Expense Categories
  FUEL = 'Fuel',
  FOOD = 'Food',
  RENT = 'Rent',
  TRANSPORT = 'Transport',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  MEDICAL = 'Medical',
  UTILITIES = 'Utilities',
  
  // Income Categories
  SALARY = 'Salary',
  BUSINESS = 'Business',
  FREELANCE = 'Freelance',
  
  // Shared
  OTHERS = 'Others'
}

export const INCOME_CATEGORIES: string[] = [
  Category.SALARY,
  Category.BUSINESS,
  Category.FREELANCE,
  Category.OTHERS
];

export const EXPENSE_CATEGORIES: string[] = [
  Category.FUEL,
  Category.FOOD,
  Category.RENT,
  Category.TRANSPORT,
  Category.SHOPPING,
  Category.ENTERTAINMENT,
  Category.MEDICAL,
  Category.UTILITIES,
  Category.OTHERS
];

export interface CustomCategory {
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: number; // timestamp
  note: string;
}

export interface UserSettings {
  customCategories: CustomCategory[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
}
