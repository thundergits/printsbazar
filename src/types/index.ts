export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  comparePrice?: number | null;
  imageUrl: string;
  images: string[];
  categoryId: string;
  category?: Category;
  isCustomizable: boolean;
  isFeatured: boolean;
  variants?: ProductVariant[];
  tags: string[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  options: VariantOption[];
  priceAdj: number;
}

export interface VariantOption {
  label: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantInfo?: string;
  /** variant id → chosen option value; the server prices variants from these */
  variantSelections?: Record<string, string>;
  customization?: string;
  uploadedImage?: string;
}

export interface Address {
  id?: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variantInfo?: string;
  customization?: string;
}
