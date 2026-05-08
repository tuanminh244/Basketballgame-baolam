import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/services/firebase/admin';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json({ error: 'Vui lòng nhập mã PIN' }, { status: 400 });
    }

    const usersSnap = await adminDb.ref('users').once('value');
    const users = usersSnap.val() || {};

    let matchedUid = null;
    let matchedData = null;

    for (const [uid, data] of Object.entries<any>(users)) {
      if (data.pass_pin === pin) {
        matchedUid = uid;
        matchedData = data;
        break;
      }
    }

    if (!matchedUid) {
      return NextResponse.json({ error: 'Mã PIN không đúng' }, { status: 401 });
    }

    const customToken = await adminAuth.createCustomToken(matchedUid, {
      role: matchedData.role
    });

    return NextResponse.json({
      token: customToken,
      user: {
        id: matchedUid,
        name: matchedData.name,
        role: matchedData.role
      }
    });

  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
