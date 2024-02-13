import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
  LatestInvoice,
} from './definitions';
import { formatCurrency } from './utils';
import prisma from './prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {

  try {
    noStore();

    const data = await prisma.revenue.findMany();

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {

    noStore();

    const data = await prisma.invoices.findMany({
      select: {
        id: true,
        amount: true,
        customer: {
          select: {
            name: true,
            image_url: true,
            email: true
          }
        }
      },
      take: 5,
      orderBy: {
        date: 'desc'
      }
    });

    const latestInvoices = data.map((invoice) => {
      const mappedInvoice: LatestInvoice = {
        id: invoice.id.toString(),
        amount: formatCurrency(invoice.amount),
        email: invoice.customer.email,
        image_url: invoice.customer.image_url,
        name: invoice.customer.name
      };

      return mappedInvoice;
    });

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {

    noStore();

    const invoiceCountPromise = prisma.invoices.count();
    const customerCountPromise = prisma.customers.count();
    const invoiceStatusPromise = prisma.$queryRaw`SELECT
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    FROM invoices`

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = data[0];
    const numberOfCustomers = data[1];

    const invoicePaidData: any = data[2];

    const totalPaidInvoices = formatCurrency(invoicePaidData[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(invoicePaidData[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    noStore();

    const invoices: Array<InvoicesTable> = await prisma.$queryRaw`
    SELECT
      invoices.id,
      invoices.amount,
      invoices.date,
      invoices.status,
      customers.name,
      customers.email,
      customers.image_url
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name LIKE ${`%${query}%`} OR
      customers.email LIKE ${`%${query}%`} OR
      invoices.amount LIKE ${`%${query}%`} OR
      invoices.date LIKE ${`%${query}%`} OR
      invoices.status LIKE ${`%${query}%`}
    ORDER BY invoices.date DESC
    OFFSET ${offset} ROWS
	  FETCH NEXT ${ITEMS_PER_PAGE} ROWS ONLY
  `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {

    noStore();

    const rows: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name LIKE ${`%${query}%`} OR
      customers.email LIKE ${`%${query}%`} OR
      invoices.amount LIKE ${`%${query}%`} OR
      invoices.date LIKE ${`%${query}%`} OR
      invoices.status LIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {

    noStore();

    let data = await prisma.invoices.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        customer_id: true,
        amount: true,
        status: true
      }
    });

    if (data == null) {
      throw new Error('Invoice not found.');
    }

    const invoice: InvoiceForm = {
      id: data.id.toString(),
      customer_id: data.customer_id.toString(),
      amount: data.amount / 100,
      status: data.status as 'pending' | 'paid',
    };

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {

    noStore();

    const customers = prisma.customers.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {

    noStore();

    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {

    noStore();

    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
