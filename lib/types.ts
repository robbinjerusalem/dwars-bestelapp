export type MenuOption = { name: string; price: number };
export type OptionGroup = { name: string; max?: number; options: MenuOption[] };
export type Product = { id: string; category: string; name: string; price: number; optionGroups?: OptionGroup[] };
export type Menu = { updatedAt: string; source: string; products: Product[] };
export type OrderItem = { productId: string; productName: string; quantity: number; basePrice: number; options: MenuOption[] };
export type Order = { id: string; personName: string; createdAt: string; items: OrderItem[] };
