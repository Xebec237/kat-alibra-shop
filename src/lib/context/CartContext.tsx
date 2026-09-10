'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/supabase/types';
import { CartItem } from '@/lib/whatsapp/generateOrderMessage';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: { taille?: string; couleur?: string }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; storeSlug: string }> = ({
  children,
  storeSlug,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cartStorageKey = `kat_cart_${storeSlug}`;
  const favStorageKey = `kat_fav_${storeSlug}`;

  // Charger le panier et favoris depuis localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartStorageKey);
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedFavs = localStorage.getItem(favStorageKey);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (e) {
      console.error('Erreur lecture storage:', e);
    }
    setIsLoaded(true);
  }, [cartStorageKey, favStorageKey]);

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(items));
      localStorage.setItem(favStorageKey, JSON.stringify(favorites));
    } catch (e) {
      console.error('Erreur sauvegarde storage:', e);
    }
  }, [items, favorites, isLoaded, cartStorageKey, favStorageKey]);

  const addItem = (
    product: Product,
    quantity: number = 1,
    variant?: { taille?: string; couleur?: string }
  ) => {
    const itemKey = `${product.id}_${variant?.taille || 'def'}_${variant?.couleur || 'def'}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey
            ? { ...item, quantite: item.quantite + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          product_id: product.id,
          nom: product.nom,
          prix: product.prix,
          prix_promo: product.prix_promo,
          quantite: quantity,
          image: product.images?.[0] || undefined,
          taille: variant?.taille,
          couleur: variant?.couleur,
        },
      ];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantite: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const totalCount = items.reduce((acc, item) => acc + item.quantite, 0);

  const totalAmount = items.reduce((acc, item) => {
    const price = item.prix_promo && item.prix_promo > 0 ? item.prix_promo : item.prix;
    return acc + price * item.quantite;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé à l\'intérieur de CartProvider');
  }
  return context;
}
