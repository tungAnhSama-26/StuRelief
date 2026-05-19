import { Item, CreateItemDTO as PostItemDTO, UpdateItemDTO } from '@shared/domain/Item';
import { IItemRepository } from '@shared/domain/IItemRepository';
import { ItemSpecification } from '@/domain/repositories/ItemSpecification';
import prisma from '@/lib/prisma';

export class PrismaItemRepository implements IItemRepository {
  async findAll(
    page: number,
    limit: number,
    specification?: ItemSpecification
  ): Promise<{ items: Item[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = specification ? specification.toPrismaWhere() : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          media: true,
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.currentPrice,
        category: p.category ? p.category.name : 'Chưa phân loại',
        images: p.media.filter((m) => m.type === 'IMAGE').map((m) => m.url),
        studentId: p.sellerId,
        isQuickSell: false,
        description: p.description,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })) as Item[],
      total,
    };
  }

  async findById(id: string): Promise<Item | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        media: true,
        category: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: product.currentPrice,
      category: product.category ? product.category.name : 'Chưa phân loại',
      images: product.media.filter((m) => m.type === 'IMAGE').map((m) => m.url),
      studentId: product.sellerId,
      isQuickSell: false,
      description: product.description,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async save(data: PostItemDTO): Promise<Item> {
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: data.category, mode: 'insensitive' } },
          { slug: { equals: data.category, mode: 'insensitive' } },
        ],
      },
    });

    if (!category) {
      category = await prisma.category.findFirst();
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        currentPrice: data.price,
        description: data.description || '',
        sellerId: data.studentId || 'default-seller-id',
        categoryId: category ? category.id : 'default-category-id',
        condition: 'USED_GOOD',
        status: 'AVAILABLE',
        media: {
          create: data.images.map((url) => ({
            url,
            type: 'IMAGE',
          })),
        },
      },
      include: {
        media: true,
        category: true,
      },
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      price: newProduct.currentPrice,
      category: newProduct.category ? newProduct.category.name : 'Chưa phân loại',
      images: newProduct.media.map((m) => m.url),
      studentId: newProduct.sellerId,
      isQuickSell: false,
      description: newProduct.description,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    };
  }

  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    let categoryId: string | undefined;

    if (data.category) {
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: data.category, mode: 'insensitive' } },
            { slug: { equals: data.category, mode: 'insensitive' } },
          ],
        },
      });
      if (category) {
        categoryId = category.id;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        currentPrice: data.price,
        description: data.description,
        sellerId: data.studentId,
        categoryId: categoryId,
      },
      include: {
        media: true,
        category: true,
      },
    });

    // If images are updated, handle media replacement
    if (data.images && data.images.length > 0) {
      await prisma.productMedia.deleteMany({
        where: { productId: id },
      });
      await prisma.productMedia.createMany({
        data: data.images.map((url) => ({
          productId: id,
          url,
          type: 'IMAGE',
        })),
      });
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        media: true,
        category: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      price: updated.currentPrice,
      category: finalProduct?.category ? finalProduct.category.name : 'Chưa phân loại',
      images: finalProduct?.media.filter((m) => m.type === 'IMAGE').map((m) => m.url) || [],
      studentId: updated.sellerId,
      isQuickSell: false,
      description: updated.description,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.productMedia.deleteMany({
      where: { productId: id },
    });
    await prisma.product.delete({
      where: { id },
    });
  }
}

