import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const OWNER_NAME = 'Robbin Jerusalem';
const ORDER_CLOSE_HOUR = 11;
const ORDER_CLOSE_MINUTE = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getAmsterdamDateParts() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value || 0);

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute')
  };
}

function getCurrentWeekKey() {
  const { year, month, day } = getAmsterdamDateParts();

  const date = new Date(Date.UTC(year, month - 1, day));

  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function isOwnerName(personName: string) {
  return personName.toLowerCase().trim() === OWNER_NAME.toLowerCase().trim();
}

function isLateOrder() {
  const { year, month, day, hour, minute } = getAmsterdamDateParts();

  /*
   * We gebruiken de Amsterdamse kalenderdatum en zetten die om naar
   * een neutrale UTC-datum, alleen om de weekdag betrouwbaar te bepalen.
   *
   * getUTCDay():
   * 0 = zondag
   * 1 = maandag
   * 2 = dinsdag
   * 3 = woensdag
   * 4 = donderdag
   * 5 = vrijdag
   * 6 = zaterdag
   */
  const weekday = new Date(
    Date.UTC(year, month - 1, day)
  ).getUTCDay();

  if (weekday !== 5) {
    return false;
  }

  return (
    hour > ORDER_CLOSE_HOUR ||
    (hour === ORDER_CLOSE_HOUR && minute >= ORDER_CLOSE_MINUTE)
  );
}

function mapOrder(order: any) {
  return {
    id: order.id,
    personName: order.person_name,
    createdAt: order.created_at,
    weekKey: order.week_key,
    paid: Boolean(order.paid),
    lateOrder: Boolean(order.late_order),
    items: order.items
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const selectedWeekKey =
    searchParams.get('weekKey') || getCurrentWeekKey();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('week_key', selectedWeekKey)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json((data || []).map(mapOrder));
}

export async function POST(request: Request) {
  const body = await request.json();

  const weekKey = getCurrentWeekKey();
  const personName = String(body.personName || '').trim();
  const items = body.items || [];

  if (!personName) {
    return NextResponse.json(
      { error: 'Naam is verplicht' },
      { status: 400 }
    );
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
          paid: isOwnerName(personName),
          late_order: isLateOrder()
        }
      ],
      {
        onConflict: 'person_name,week_key'
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(mapOrder(data));
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const orderId = body.orderId ? String(body.orderId) : '';

  const weekKey = body.weekKey
    ? String(body.weekKey)
    : getCurrentWeekKey();

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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('orderId');

  const selectedWeekKey =
    searchParams.get('weekKey') || getCurrentWeekKey();

  let query = supabase.from('orders').delete();

  if (orderId) {
    query = query.eq('id', orderId);
  } else {
    query = query.eq('week_key', selectedWeekKey);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}