import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PIN = '7161';
const TIKKIE_SETTING_KEY = 'weekly_tikkie_link';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function isValidTikkieUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      (url.hostname === 'tikkie.me' ||
        url.hostname.endsWith('.tikkie.me'))
    );
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('app_settings')
      .select('value, updated_at')
      .eq('key', TIKKIE_SETTING_KEY)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tikkieUrl: data?.value || '',
      updatedAt: data?.updated_at || null
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Instellingen laden mislukt';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const adminPin = String(body.adminPin || '');
    const tikkieUrl = String(body.tikkieUrl || '').trim();

    if (adminPin !== ADMIN_PIN) {
      return NextResponse.json(
        { error: 'Onjuiste adminpincode' },
        { status: 401 }
      );
    }

    if (!isValidTikkieUrl(tikkieUrl)) {
      return NextResponse.json(
        {
          error:
            'Vul een geldige Tikkie-link in die begint met https://tikkie.me/'
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: TIKKIE_SETTING_KEY,
          value: tikkieUrl,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key'
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      tikkieUrl
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Instellingen opslaan mislukt';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}