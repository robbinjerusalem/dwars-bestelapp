import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const weekKey = searchParams.get('weekKey');

  if (!weekKey) {
    return NextResponse.json(
      { error: 'weekKey ontbreekt' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('order_payments')
    .select('*')
    .eq('week_key', weekKey);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();

  const weekKey = String(body.weekKey || '');
  const personName = String(body.personName || '');
  const paid = Boolean(body.paid);

  const { error } = await supabase
    .from('order_payments')
    .upsert(
      [
        {
          week_key: weekKey,
          person_name: personName,
          paid
        }
      ],
      {
        onConflict: 'week_key,person_name'
      }
    );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}