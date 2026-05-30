import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getCurrentWeekKey() {
  const now = new Date();

  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function mapOrder(order: any) {
  return {
    id: order.id,
    personName: order.person_name,
    createdAt: order.created_at,
    weekKey: order.week_key,
    paid: Boolean(order.paid),
    items: order.items,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selectedWeekKey = searchParams.get('weekKey') || getCurrentWeekKey();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('week_key', selectedWeekKey)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(mapOrder));
}

export async function POST(request: Request) {
  const body = await request.json();

  const weekKey = getCurrentWeekKey();
  const personName = String(body.personName || '').trim();
  const items = body.items || [];

  if (!personName) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 });
  }

  if (!items.length) {
    return NextResponse.json(
      { error: 'Geen producten gekozen' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('orders')
    .upsert(
      [
        {
          person_name: personName,
          items,
          week_key: weekKey,
          paid: false,
        },
      ],
      { onConflict: 'person_name,week_key' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapOrder(data));
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const orderId = body.orderId ? String(body.orderId) : '';
  const weekKey = body.weekKey ? String(body.weekKey) : getCurrentWeekKey();
  const paid = Boolean(body.paid);
  const all = Boolean(body.all);

  let query = supabase.from('orders').update({ paid });

  if (all) {
    query = query.eq('week_key', weekKey);
  } else {
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is verplicht' },
        { status: 400 }
      );
    }

    query = query.eq('id', orderId);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('orderId');
  const selectedWeekKey = searchParams.get('weekKey') || getCurrentWeekKey();

  let query = supabase.from('orders').delete();

  if (orderId) {
    query = query.eq('id', orderId);
  } else {
    query = query.eq('week_key', selectedWeekKey);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}