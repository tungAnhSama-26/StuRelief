import { Item, CreateItemDTO as PostItemDTO, UpdateItemDTO } from '@shared/domain/Item';
import { IItemRepository } from '@shared/domain/IItemRepository';
import { FilterItemSpecification, ItemSpecification } from '@/domain/repositories/ItemSpecification';
import prisma, { runWithDatabase } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ProductStatus } from '@shared';

type ItemFilters = {
  search?: string;
  category?: string;
  studentId?: string;
  status?: string;
};

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    media: true;
    category: true;
  };
}>;

export class PrismaItemRepository implements IItemRepository {
  private mapProduct(product: ProductWithRelations): Item {
    return {
      id: product.id,
      name: product.name,
      price: product.currentPrice,
      category: product.category ? product.category.name : 'Chưa phân loại',
      images: product.media.filter((media) => media.type === 'IMAGE').map((media) => media.url),
      studentId: product.sellerId,
      isQuickSell: false,
      status: product.status as ProductStatus,
      description: product.description,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async findAll(
    page: number,
    limit: number,
    specification?: ItemSpecification | ItemFilters
  ): Promise<{ items: Item[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const where = !specification
        ? {}
        : 'toPrismaWhere' in specification
          ? specification.toPrismaWhere()
          : new FilterItemSpecification(specification).toPrismaWhere();

      const { products, total } = await runWithDatabase(
        async () => {
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

          return { products, total };
        },
        () => ({ products: [], total: 0 }),
        'PrismaItemRepository.findAll'
      );

      return {
        items: products.map((p) => this.mapProduct(p)),
        total,
      };
    } catch (error) {
      console.error('PrismaItemRepository.findAll fallback:', error);
      return { items: [], total: 0 };
    }
  }

  async findById(id: string): Promise<Item | null> {
    try {
      const product = await runWithDatabase(
        () =>
          prisma.product.findUnique({
            where: { id },
            include: {
              media: true,
              category: true,
            },
          }),
        null,
        'PrismaItemRepository.findById'
      );

      if (!product) return null;

      return this.mapProduct(product);
    } catch (error) {
      console.error('PrismaItemRepository.findById fallback:', error);
      return null;
    }
  }

  async save(data: PostItemDTO): Promise<Item> {
    const newProduct = await runWithDatabase(
      async () => {
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

        return prisma.product.create({
          data: {
            name: data.name,
            currentPrice: data.price,
            description: data.description || '',
            sellerId: data.studentId || 'default-seller-id',
            categoryId: category ? category.id : 'default-category-id',
            condition: 'USED_GOOD',
            status: 'DRAFT',
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
      },
      () => {
        throw new Error('Database unavailable')
      },
      'PrismaItemRepository.save'
    );

    return this.mapProduct(newProduct);
  }

  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    const { updated, finalProduct } = await runWithDatabase(
      async () => {
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
            categoryId,
            status: data.status,
          },
          include: {
            media: true,
            category: true,
          },
        });

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

        return { updated, finalProduct };
      },
      () => {
        throw new Error('Database unavailable')
      },
      'PrismaItemRepository.update'
    );

    if (!finalProduct) {
      throw new Error('Could not fetch updated product');
    }
    return this.mapProduct(finalProduct);
  }

  async delete(id: string): Promise<void> {
    await runWithDatabase(
      async () => {
        await prisma.productMedia.deleteMany({
          where: { productId: id },
        });
        await prisma.product.delete({
          where: { id },
        });
      },
      () => {
        throw new Error('Database unavailable')
      },
      'PrismaItemRepository.delete'
    );
  }
}
