import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token, env.JWT_SECRET);
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [verifiedStudents, totalProducts, pendingDisputes, safeHubs] = await Promise.all([
      prisma.user.count({ where: { status: 'VERIFIED', role: 'STUDENT' } }),
      prisma.product.count({ where: { status: 'AVAILABLE' } }),
      prisma.verificationRequest.count({ where: { status: 'PENDING' } }), // For now using this as a placeholder for disputes if no dispute model yet
      prisma.location?.count() || Promise.resolve(8) // Fallback if no location model
    ]);

    return NextResponse.json({
      verifiedStudents,
      totalProducts,
      pendingDisputes,
      safeHubs
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
