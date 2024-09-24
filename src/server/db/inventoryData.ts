export interface InventoryItem {
    id: number;
    brand: string;
    item: string;
    category: string;
    stock: number;
    variants: number;
    stockStatus: string;
    notes: string;
}

export const inventoryItems: InventoryItem[] = [
    {
        id: 1,
        brand: "Brand A",
        item: "Item A",
        category: "Category 1",
        stock: 10,
        variants: 3,
        stockStatus: "red-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 2,
        brand: "Brand B",
        item: "Item B",
        category: "Category 2",
        stock: 50,
        variants: 2,
        stockStatus: "yellow-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 3,
        brand: "Brand C",
        item: "Item C",
        category: "Category 3",
        stock: 100,
        variants: 1,
        stockStatus: "green-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 4,
        brand: "Brand D",
        item: "Item D",
        category: "Category 4",
        stock: 5,
        variants: 4,
        stockStatus: "red-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 5,
        brand: "Brand E",
        item: "Item E",
        category: "Category 5",
        stock: 25,
        variants: 2,
        stockStatus: "yellow-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 6,
        brand: "Brand F",
        item: "Item F",
        category: "Category 6",
        stock: 75,
        variants: 3,
        stockStatus: "green-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 7,
        brand: "Brand G",
        item: "Item G",
        category: "Category 7",
        stock: 20,
        variants: 1,
        stockStatus: "red-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    },
    {
        id: 8,
        brand: "Brand H",
        item: "Item H",
        category: "Category 8",
        stock: 40,
        variants: 5,
        stockStatus: "yellow-500",
        notes: "Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet Lorem Ipsum Dolor Sit Amet",
    }
];
