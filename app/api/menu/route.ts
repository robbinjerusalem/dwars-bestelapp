import { NextResponse } from 'next/server';
import { readMenu } from '@/lib/store';

export async function GET() {
  return NextResponse.json(await readMenu());
}
