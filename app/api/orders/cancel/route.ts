import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

function getCurrentWeekKey() {
  const now = new Date();

  const date = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  );

  const dayNum = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(
    Date.UTC(date.getUTCFullYear(), 0, 1)
  );

  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export async function POST(request: Request) {
  const body = await request.json();

  const weekKey = getCurrentWeekKey();
  const personName = String(body.personName || '').trim();

  if (!personName) {
    return NextResponse.json(
      { error: 'Naam is verplicht' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('week_key', weekKey)
    .eq('person_name', personName);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
