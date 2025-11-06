import { NextResponse } from 'next/server';
import { getData } from '@/services/getData';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { analyses, avg } = await getData();
  return NextResponse.json({ analyses, avg });
}
