// Types ------------------------------------------

type Invoice = {
	id: number;
	customer: Customer;
	order: OrderItem[];
	grandTotal: number;
}

type Customer = {
	id: number;
	name: string;
	paymentTerm: number;
}

type Batch = {
	id: number;
	name: number;
	stock: number;
	conversion: Conversion[];
}

type Conversion = {
	level: number;
	price: number;
	unitName: string;
	quantity: number;
}

type Brand = {
	id: number;
	name: string;
}

type Item = {
	id: number;
	name: string;
	brand: Brand;
}

type Variant = {
  id: number;
  name: string;
  brand: Brand;
  item: Item;
	batch: Batch[];
};

type OrderItem = {
	id: number;
	variant: Variant;
	quantity: number;
	pricing: "Supplier" | "Manual";
	manualPrice?: number;
	discountType?: "None" | "Percentage" | "Fixed";
	discountValue: number;
	subtotal: number;
}

// Dummy Data -------------------------------------

// Brands
const brandA: Brand = { id: 1, name: "Brand A" };
const brandB: Brand = { id: 2, name: "Brand B" };
const brandC: Brand = { id: 3, name: "Brand C" };

// Items
const itemA: Item = { id: 1, name: "Item A", brand: brandA };
const itemB: Item = { id: 2, name: "Item B", brand: brandB };
const itemC: Item = { id: 3, name: "Item C", brand: brandC };

// Batches
const batch1: Batch = {
  id: 1,
  name: 101,
  stock: 1000,
  conversion: [
    { level: 1, price: 50, unitName: "Pack", quantity: 10 },
    { level: 2, price: 5, unitName: "Piece", quantity: 20 }
  ]
};

const batch2: Batch = {
  id: 2,
  name: 102,
  stock: 500,
  conversion: [
    { level: 1, price: 55, unitName: "Pack", quantity: 10 },
    { level: 2, price: 6, unitName: "Piece", quantity: 20 },
    { level: 3, price: 100, unitName: "Carton", quantity: 5 }
  ]
};

const batch3: Batch = {
  id: 3,
  name: 103,
  stock: 1500,
  conversion: [
    { level: 1, price: 60, unitName: "Pack", quantity: 8 },
    { level: 2, price: 7, unitName: "Piece", quantity: 15 }
  ]
};

const batch4: Batch = {
  id: 4,
  name: 104,
  stock: 800,
  conversion: [
    { level: 1, price: 45, unitName: "Pack", quantity: 12 },
    { level: 2, price: 5, unitName: "Piece", quantity: 24 },
    { level: 3, price: 110, unitName: "Carton", quantity: 6 }
  ]
};

// Variants
const variantA: Variant = {
  id: 1,
  name: "Variant A",
  brand: brandA,
  item: itemA,
  batch: [batch1, batch2]
};

const variantB: Variant = {
  id: 2,
  name: "Variant B",
  brand: brandB,
  item: itemB,
  batch: [batch3]
};

const variantC: Variant = {
  id: 3,
  name: "Variant C",
  brand: brandC,
  item: itemC,
  batch: [batch4]
};

const variantD: Variant = {
  id: 4,
  name: "Variant D",
  brand: brandA,
  item: itemA,
  batch: [batch1, batch3]
};

// Order Items
const orderItem1: OrderItem = {
  id: 1,
  variant: variantA,
  quantity: 100,
  pricing: "Supplier",
  manualPrice: undefined,
  discountType: "None",
  discountValue: 0,
  subtotal: 50 * 100
};

const orderItem2: OrderItem = {
  id: 2,
  variant: variantB,
  quantity: 50,
  pricing: "Manual",
  manualPrice: 55,
  discountType: "None",
  discountValue: 0,
  subtotal: 55 * 50
};

const orderItem3: OrderItem = {
  id: 3,
  variant: variantC,
  quantity: 75,
  pricing: "Supplier",
  manualPrice: undefined,
  discountType: "None",
  discountValue: 0,
  subtotal: 45 * 75
};

const orderItem4: OrderItem = {
  id: 4,
  variant: variantD,
  quantity: 150,
  pricing: "Manual",
  manualPrice: 45,
  discountType: "None",
  discountValue: 0,
  subtotal: 45 * 150
};

// Customer
const customerA: Customer = {
  id: 1,
  name: "Customer A",
  paymentTerm: 30
};

const customerB: Customer = {
  id: 2,
  name: "Customer B",
  paymentTerm: 45
};

const customerC: Customer = {
  id: 3,
  name: "Customer C",
  paymentTerm: 60
};

// Invoice
const invoice1: Invoice = {
  id: 1,
  customer: customerA,
  order: [orderItem1, orderItem2, orderItem3, orderItem4],
  grandTotal: 0
};

const invoice2: Invoice = {
  id: 2,
  customer: customerA,
  order: [orderItem1, orderItem2, orderItem3, orderItem4],
  grandTotal: 0,
};

const invoice3: Invoice = {
  id: 3,
  customer: customerA,
  order: [orderItem1, orderItem2, orderItem3, orderItem4],
  grandTotal: 0,
};

// Calculate Grand Total for all invoices
const invoices = [invoice1, invoice2, invoice3];

invoices.forEach(invoice => {
  invoice.grandTotal = invoice.order.reduce((total, item) => total + item.subtotal, 0);
});
