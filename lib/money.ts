export function euro(value: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
}
export function itemTotal(item: { quantity: number; basePrice: number; options: { price: number }[] }) {
  return item.quantity * (item.basePrice + item.options.reduce((s, o) => s + o.price, 0));
}
export function orderTotal(order: { items: any[] }) {
  return order.items.reduce((sum, item) => sum + itemTotal(item), 0);
}
