import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaItemRepository } from '@/infrastructure/persistence/PrismaItemRepository';
import { GetItemDetailUseCase } from '@/use-cases/items/GetItemDetailUseCase';
import { UpdateItemUseCase } from '@/use-cases/items/UpdateItemUseCase';
import { DeleteItemUseCase } from '@/use-cases/items/DeleteItemUseCase';
import { verifyToken } from '@/lib/jwt';
import { env } from '@/infrastructure/config/env';
import prisma from '@/lib/prisma';

const itemRepository = new PrismaItemRepository();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = new GetItemDetailUseCase(itemRepository);
    const item = await useCase.execute(id);

    if (item.status !== 'AVAILABLE') {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      const payload = token ? verifyToken(token, env.JWT_SECRET) : null;

      if (!payload || (payload.role !== 'ADMIN' && payload.id !== item.studentId)) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
    }

    return NextResponse.json(item);
  } catch (error: any) {
    if (error.message === 'Item not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Kiểm tra phân quyền Server-side bằng JWT Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const payload = verifyToken(token, env.JWT_SECRET);
      if (payload) {
        // Tìm sản phẩm trong DB để đối chiếu người sở hữu
        const product = await prisma.product.findUnique({
          where: { id },
        });
        if (product && product.sellerId !== payload.id && payload.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Bạn không có quyền chỉnh sửa sản phẩm của sinh viên khác!' },
            { status: 403 }
          );
        }

        body.status = payload.role === 'ADMIN' ? body.status ?? product?.status : 'DRAFT';
      }
    }

    const useCase = new UpdateItemUseCase(itemRepository);
    const updatedItem = await useCase.execute(id, body);

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating product' },
      { status: error.message?.includes('required') || error.message?.includes('Price') ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Kiểm tra phân quyền Server-side bằng JWT Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const payload = verifyToken(token, env.JWT_SECRET);
      if (payload) {
        // Tìm sản phẩm trong DB để đối chiếu người sở hữu
        const product = await prisma.product.findUnique({
          where: { id },
        });
        if (product && product.sellerId !== payload.id && payload.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Bạn không có quyền xóa sản phẩm của sinh viên khác!' },
            { status: 403 }
          );
        }
      }
    }

    const useCase = new DeleteItemUseCase(itemRepository);
    await useCase.execute(id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting product' }, { status: 500 });
  }
}
