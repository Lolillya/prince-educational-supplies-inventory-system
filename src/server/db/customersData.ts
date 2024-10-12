export interface Customer {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  location: string;
  notes: string;
}

export const customers: Customer[] = [
  {
    id: 1,
    name: "Rich Adrian Huang",
    company: "The Huang Company",
    phone: "09123456789",
    email: "rich.huang@gmail.com",
    location: " , Davao City",
    notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    name: "John Doe",
    company: "Doe Enterprises",
    phone: "09223334444",
    email: "johndoe@gmail.com",
    location: "123 Main St, Somewhere City",
    notes:
      "Vivamus convallis turpis at nunc scelerisque, sit amet feugiat velit.",
  },
  {
    id: 3,
    name: "Jane Smith",
    company: "Smith Tech Solutions",
    phone: "09112223333",
    email: "jane.smith@smithtech.com",
    location: "456 Oak Avenue, Metro City",
    notes: "Curabitur eu eros vitae eros sollicitudin ullamcorper.",
  },
  {
    id: 4,
    name: "Michael Johnson",
    company: "Johnson Innovations",
    phone: "09334445555",
    email: "m.johnson@johnsoninnovations.com",
    location: "789 Pine St, Innovation Park",
    notes: "Pellentesque habitant morbi tristique senectus et netus.",
  },
  {
    id: 5,
    name: "Emily Davis",
    company: "Davis Design Studio",
    phone: "09446667777",
    email: "emily.davis@davisdesign.com",
    location: "101 Cedar Lane, Art District",
    notes: "Ut consectetur leo ac nulla posuere, nec dapibus sapien auctor.",
  },
  {
    id: 6,
    name: "Carlos Rivera",
    company: "Rivera Construction",
    phone: "09558889999",
    email: "carlos.rivera@riveraconstruction.com",
    location: "202 Birch Blvd, Builder's Zone",
    notes:
      "Suspendisse potenti. Phasellus ut risus vitae lorem consequat gravida.",
  },
  {
    id: 7,
    name: "Sophia Martinez",
    company: "Martinez Marketing",
    phone: "09667778888",
    email: "sophia.martinez@martinezmarketing.com",
    location: "303 Maple Road, Business District",
    notes: "Fusce at lacus interdum, sodales lectus in, suscipit risus.",
  },
];
