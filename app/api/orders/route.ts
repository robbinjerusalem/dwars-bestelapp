import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const mapped = (data || []).map((order) => ({
    id: order.id,
    personName: order.person_name,
    createdAt: order.created_at,
    items: order.items
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();

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
    .insert([
      {
        person_name: personName,
        items
      }
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    personName: data.person_name,
    createdAt: data.created_at,
    items: data.items
  });
}

export async function DELETE() {
  const { error } = await supabase
    .from('orders')
    .delete()
    .neq('id', '');

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}