import { useMemo, useState } from 'react';
import type { MenuOption, OrderItem } from '@/lib/types';
import { itemTotal } from '@/lib/money';

type CartLine = OrderItem;

function optionsKey(options: MenuOption[]) {
  return [...options]
    .map(option => `${option.name}:${option.price}`)
    .sort()
    .join('|');
}

function sameCartLine(a: CartLine, b: CartLine) {
  return (
    a.productId === b.productId &&
    a.productName === b.productName &&
    a.basePrice === b.basePrice &&
    optionsKey(a.options) === optionsKey(b.options)
  );
}

function addOrMergeCartLine(cart: CartLine[], newLine: CartLine) {
  const existingIndex = cart.findIndex(item => sameCartLine(item, newLine));

  if (existingIndex === -1) {
    return [...cart, newLine];
  }

  return cart.map((item, index) =>
    index === existingIndex
      ? { ...item, quantity: item.quantity + newLine.quantity }
      : item
  );
}

export function useCart() {
  const [cart, setCart] = useState<CartLine[]>([]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + itemTotal(item), 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  function addItem(newLine: CartLine) {
    setCart(prev => addOrMergeCartLine(prev, newLine));
  }

  function increaseQuantity(index: number) {
    setCart(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(index: number) {
    setCart(prev =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index));
  }

  return {
    cart,
    setCart,
    cartTotal,
    cartItemCount,
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem
  };
}