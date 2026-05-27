import { NextResponse } from 'next/server';
import { readOrders, writeOrders } from '@/lib/store';
import { randomUUID } from 'node:crypto';

export async function GET() {
  return NextResponse.json(await readOrders());
}

export async function POST(request: Request) {
  const body = await request.json();
  const orders = await readOrders();
  const order = {
    id: randomUUID(),
    personName: String(body.personName || '').trim(),
    createdAt: new Date().toISOString(),
    items: body.items || []
  };
  if (!order.personName) return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
  if (!order.items.length) return NextResponse.json({ error: 'Geen producten gekozen' }, { status: 400 });
  orders.push(order);
  await writeOrders(orders);
  return NextResponse.json(order);
}

export async function DELETE() {
  await writeOrders([]);
  return NextResponse.json({ ok: true });
}
