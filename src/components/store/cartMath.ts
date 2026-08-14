import { products } from "@/data/products";
import type { Product } from "@/data/types";

export interface CartItem {
  productId: string;
  qty: number;
}

export const MIN_QTY = 1;
export const MAX_QTY = 9;

export function clampQty(qty: number): number {
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.floor(qty)));
}

export function getProduct(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const product = getProduct(item.productId);
    return product ? total + product.priceGbp * item.qty : total;
  }, 0);
}

export function formatGbp(amount: number): string {
  return "£" + amount.toFixed(2);
}
