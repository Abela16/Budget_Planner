export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍕', color: '#f87171' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#60a5fa' },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#a78bfa' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#fbbf24' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f472b6' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#34d399' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#fb923c' },
  { id: 'education', name: 'Education', icon: '📚', color: '#818cf8' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#22d3ee' },
  { id: 'personal', name: 'Personal', icon: '👤', color: '#e879f9' },
  { id: 'savings', name: 'Savings', icon: '💰', color: '#4ade80' },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  { id: 'mobile_money', name: 'Mobile Money', icon: '📱' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'debit_card', name: 'Debit Card', icon: '💳' },
  { id: 'other', name: 'Other', icon: '💸' },
];

export function normalizeCategory(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '_');
}

export function findCategoryByName(categories, name) {
  const normalized = normalizeCategory(name);
  return categories.find(c => normalizeCategory(c.name) === normalized);
}

export function suggestCategory(categories, title) {
  const lower = title.toLowerCase();

  const keywords = {
    food: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'grocery', 'meal', 'pizza', 'burger', 'snack'],
    transport: ['uber', 'taxi', 'bus', 'fuel', 'gas', 'petrol', 'parking', 'car', 'bike', 'transport', 'ride'],
    rent: ['rent', 'lease', 'mortgage', 'housing'],
    entertainment: ['movie', 'netflix', 'spotify', 'game', 'concert', 'music', 'stream', 'entertainment'],
    shopping: ['shop', 'cloth', 'shoe', 'amazon', 'mall', 'store', 'buy'],
    utilities: ['electric', 'water', 'internet', 'phone', 'bill', 'utility', 'wifi'],
    health: ['doctor', 'hospital', 'medicine', 'pharmacy', 'gym', 'health', 'dental'],
    education: ['book', 'course', 'school', 'tuition', 'training', 'learn', 'education'],
    travel: ['flight', 'hotel', 'travel', 'trip', 'vacation', 'airbnb', 'booking'],
    personal: ['haircut', 'salon', 'grooming', 'personal'],
    savings: ['saving', 'invest', 'deposit'],
  };

  for (const [categoryId, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      return categories.find(c => c.id === categoryId) || null;
    }
  }
  return null;
}
