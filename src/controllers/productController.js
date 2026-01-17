import { prisma } from "../config/prisma.js";
/* ----------------------------------------
   GET ALL PRODUCTS
-----------------------------------------*/
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sortBy = "created_at",
      sortOrder = "desc",
      search,
      inStock,
      featured,
    } = req.query;

    const skip = (page - 1) * limit;

    const where = {
      is_active: true,
      ...(inStock === "true" && { is_in_stock: true }),
      ...(featured === "true" && { is_featured: true }),
      ...(category && {
        category: { slug: category },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        OR: [
          {
            discount_price: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) }),
            },
          },
          {
            base_price: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) }),
            },
          },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { name: true, slug: true } },
          images: {
            where: { is_primary: true },
            take: 1,
            select: { image_url: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    const data = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.discount_price ?? p.base_price,
      base_price: p.base_price,
      discount_price: p.discount_price,
      rating: Number(p.rating),
      is_featured: p.is_featured,
      in_stock: p.is_in_stock,
      image: p.images[0]?.image_url ?? null,
    }));
    // return res.json({
    //   success: true,
    //   data: products.map((p) => ({
    //     ...p,
    //     primary_image: p.images[0]?.image_url || null,
    //     images: undefined,
    //   })),
    //   pagination: {
    //     page: Number(page),
    //     limit: Number(limit),
    //     total,
    //     pages: Math.ceil(total / limit),
    //   },
    // });

    return res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/* ----------------------------------------
   GET PRODUCT BY SLUG
-----------------------------------------*/
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        slug,
        is_active: true,
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        images: {
          orderBy: { sort_order: "asc" },
          select: {
            image_url: true,
            alt_text: true,
            is_primary: true,
          },
        },
        variants: {
          where: { is_active: true },
          select: {
            id: true,
            sku: true,
            variant_name: true,
            attributes: true,
            price: true,
            stock_quantity: true,
            image_url: true,
          },
        },
        reviews: {
          where: { is_approved: true },
          select: {
            rating: true,
            comment: true,
            created_at: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      data: {
        ...product,
        display_price: product.discount_price ?? product.base_price,
      },
    });
  } catch (error) {
    console.error("getProductBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

/* ----------------------------------------
   CREATE PRODUCT
-----------------------------------------*/
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category_id,
      base_price,
      brand,
      weight,
      dimensions,
      variants,
      images,
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now();

      const sku = `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          category_id,
          base_price,
          brand,
          weight,
          dimensions,
          sku,
        },
      });

      if (variants?.length) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            product_id: product.id,
            sku:
              v.sku ||
              `VAR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            variant_name: v.variant_name,
            attributes: v.attributes,
            price: v.price || base_price,
            stock_quantity: v.stock_quantity || 0,
          })),
        });
      }

      if (images?.length) {
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            product_id: product.id,
            image_url: img.url,
            alt_text: img.alt_text || name,
            sort_order: index,
            is_primary: index === 0,
          })),
        });
      }

      return product;
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("createProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export { getAllProducts, getProductBySlug, createProduct };
