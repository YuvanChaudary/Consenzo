import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  priceInr: number;
  quantity: number;
  image: string;
  category: string;
  // Consensus cart fields
  roomId?: string;
  lockState?: 'pending' | 'agreed' | 'rejected';
  voteCount?: number;
  totalVoters?: number;
}

interface CartState {
  items: CartItem[];
  cartType: 'individual' | 'consensus';
  roomId?: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setConsensusMode: (roomId: string) => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartType: 'individual',
      roomId: undefined,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity === 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [], cartType: 'individual', roomId: undefined }),

      setConsensusMode: (roomId) => set({ cartType: 'consensus', roomId }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0),
    }),
    { name: 'shippyfy-cart' }
  )
);
