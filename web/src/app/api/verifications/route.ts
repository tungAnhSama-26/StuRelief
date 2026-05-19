import { NextResponse } from 'next/server';
import { PrismaVerificationRepository } from '@/infrastructure/persistence/PrismaVerificationRepository';
import { SubmitVerificationUseCase } from '@/use-cases/SubmitVerificationUseCase';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';

const verificationRepository = new PrismaVerificationRepository();

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để thực hiện xác thực!' }, { status: 401 });
    }

    const payload = verifyToken(token, env.JWT_SECRET);
    if (!payload) {
      return NextResponse.json({ message: 'Phiên làm việc hết hạn!' }, { status: 401 });
    }

    const body = await request.json();
    const useCase = new SubmitVerificationUseCase(verificationRepository);
    
    await useCase.execute({
      userId: payload.id,
      studentCardFront: body.studentCardFront,
      studentCardBack: body.studentCardBack,
      emailOtp: body.emailOtp,
    });

    return NextResponse.json({ message: 'Yêu cầu xác thực đã được gửi thành công!' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Lỗi khi gửi xác thực:', error);
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi gửi yêu cầu xác thực!';
    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
