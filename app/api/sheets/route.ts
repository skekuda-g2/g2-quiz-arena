import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, parseGoogleSheetsUrl } from '@/lib/csv';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  const csvUrl = parseGoogleSheetsUrl(url);
  if (!csvUrl) return NextResponse.json({ error: 'Invalid Google Sheets URL' }, { status: 400 });

  try {
    const res = await fetch(csvUrl);
    if (!res.ok) return NextResponse.json({ error: 'Could not fetch sheet. Make sure it is set to "Anyone with the link can view".' }, { status: 400 });
    const text = await res.text();
    const questions = parseCSV(text);
    if (questions.length === 0) return NextResponse.json({ error: 'No valid questions found. Check the format.' }, { status: 400 });
    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch sheet' }, { status: 500 });
  }
}
