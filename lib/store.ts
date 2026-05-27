import fs from 'node:fs/promises';
import path from 'node:path';
import { Menu, Order } from './types';

const dataDir = path.join(process.cwd(), 'data');
const menuPath = path.join(dataDir, 'menu.json');
const ordersPath = path.join(dataDir, 'orders.json');

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function readMenu(): Promise<Menu> {
  await ensureDataDir();
  const raw = await fs.readFile(menuPath, 'utf8');
  return JSON.parse(raw);
}

export async function writeMenu(menu: Menu) {
  await ensureDataDir();
  await fs.writeFile(menuPath, JSON.stringify(menu, null, 2), 'utf8');
}

export async function readOrders(): Promise<Order[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ordersPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function writeOrders(orders: Order[]) {
  await ensureDataDir();
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
}
