import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';
import prisma from '@/lib/prisma';
import { PrismaItemRepository } from '@/infrastructure/persistence/PrismaItemRepository';
import { GetItemsUseCase } from '@/use-cases/items/GetItemsUseCase';
import { recordAdminActivity } from '@/lib/adminActivityLog';
import { createUserNotification } from '@/lib/notifications';

const itemRepository = new PrismaItemRepository();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token, env.JWT_SECRET);
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '8');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || 'DRAFT';

    const useCase = new GetItemsUseCase(itemRepository);
    const { items, total } = await useCase.execute(page, limit, { search, status });

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token, env.JWT_SECRET);
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['AVAILABLE', 'HIDDEN'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    await prisma.product.update({
      where: { id },
      data: { status },
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sellerId: true,
      },
    });

    await recordAdminActivity({
      userId: payload.id,
      action: status === 'AVAILABLE' ? 'APPROVE_POST' : 'HIDE_POST',
      targetType: 'PRODUCT',
      targetId: id,
      metadata: {
        actionLabel: status === 'AVAILABLE' ? 'DUYỆT BÀI VIẾT' : 'ẨN BÀI VIẾT',
        details: `${status === 'AVAILABLE' ? 'Đã duyệt' : 'Đã ẩn'} bài đăng "${updatedProduct?.name || id}".`,
        severity: status === 'AVAILABLE' ? 'INFO' : 'WARNING',
        productName: updatedProduct?.name || null,
        status,
      },
    });

    if (updatedProduct?.sellerId) {
      await createUserNotification({
        userId: updatedProduct.sellerId,
        title: status === 'AVAILABLE' ? 'Bài đăng của bạn đã được duyệt' : 'Bài đăng của bạn chưa được duyệt',
        content: status === 'AVAILABLE'
          ? `Bài đăng "${updatedProduct.name}" của bạn đã được duyệt và sẽ hiển thị trên hệ thống.`
          : `Bài đăng "${updatedProduct.name}" của bạn chưa được duyệt hoặc đã bị ẩn. Vui lòng kiểm tra lại nội dung.`,
        type: status === 'AVAILABLE' ? 'SYSTEM' : 'ALARM',
        link: `/products/${updatedProduct.id}`,
      });
    }

    const updated = await itemRepository.findById(id);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
