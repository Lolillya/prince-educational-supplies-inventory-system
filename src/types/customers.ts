export interface Customer {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  Personal_Details: {
    location: Location | null;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    contact: string | null;
    email: string | null;
    notes: string | null;
  };
  customerInvoices: Invoice[];
}

export interface Location {
  location_id: number;
  address_line?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

export interface Invoice {
  invoice_number: number;
  created_at: Date;
  total_amount: number;
  invoiceClerk: {
    Personal_Details: {
      first_name: string;
      last_name: string;
      company: string;
    };
  };
}
