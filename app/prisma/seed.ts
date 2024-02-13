import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const revenue = [
    { month: 'Jan', revenue: 2000 },
    { month: 'Feb', revenue: 1800 },
    { month: 'Mar', revenue: 2200 },
    { month: 'Apr', revenue: 2500 },
    { month: 'May', revenue: 2300 },
    { month: 'Jun', revenue: 3200 },
    { month: 'Jul', revenue: 3500 },
    { month: 'Aug', revenue: 3700 },
    { month: 'Sep', revenue: 2500 },
    { month: 'Oct', revenue: 2800 },
    { month: 'Nov', revenue: 3000 },
    { month: 'Dec', revenue: 4800 },
];

const users = [
    {
        id: 1,
        name: 'User',
        email: 'user@nextmail.com',
        password: '123456',
    },
];

const customers = [
    {
        id: 1,
        name: 'Delba de Oliveira',
        email: 'delba@oliveira.com',
        image_url: '/customers/delba-de-oliveira.png',
    },
    {
        id: 2,
        name: 'Lee Robinson',
        email: 'lee@robinson.com',
        image_url: '/customers/lee-robinson.png',
    },
    {
        id: 3,
        name: 'Hector Simpson',
        email: 'hector@simpson.com',
        image_url: '/customers/hector-simpson.png',
    },
    {
        id: 4,
        name: 'Steven Tey',
        email: 'steven@tey.com',
        image_url: '/customers/steven-tey.png',
    },
    {
        id: 5,
        name: 'Steph Dietz',
        email: 'steph@dietz.com',
        image_url: '/customers/steph-dietz.png',
    },
    {
        id: 6,
        name: 'Michael Novotny',
        email: 'michael@novotny.com',
        image_url: '/customers/michael-novotny.png',
    },
    {
        id: 7,
        name: 'Evil Rabbit',
        email: 'evil@rabbit.com',
        image_url: '/customers/evil-rabbit.png',
    },
    {
        id: 8,
        name: 'Emil Kowalski',
        email: 'emil@kowalski.com',
        image_url: '/customers/emil-kowalski.png',
    },
    {
        id: 9,
        name: 'Amy Burns',
        email: 'amy@burns.com',
        image_url: '/customers/amy-burns.png',
    },
    {
        id: 10,
        name: 'Balazs Orban',
        email: 'balazs@orban.com',
        image_url: '/customers/balazs-orban.png',
    },
];

const invoices = [
    {
        customer_id: customers[0].id,
        amount: 15795,
        status: 'pending',
        date: '2022-12-06',
    },
    {
        customer_id: customers[1].id,
        amount: 20348,
        status: 'pending',
        date: '2022-11-14',
    },
    {
        customer_id: customers[4].id,
        amount: 3040,
        status: 'paid',
        date: '2022-10-29',
    },
    {
        customer_id: customers[3].id,
        amount: 44800,
        status: 'paid',
        date: '2023-09-10',
    },
    {
        customer_id: customers[5].id,
        amount: 34577,
        status: 'pending',
        date: '2023-08-05',
    },
    {
        customer_id: customers[7].id,
        amount: 54246,
        status: 'pending',
        date: '2023-07-16',
    },
    {
        customer_id: customers[6].id,
        amount: 666,
        status: 'pending',
        date: '2023-06-27',
    },
    {
        customer_id: customers[3].id,
        amount: 32545,
        status: 'paid',
        date: '2023-06-09',
    },
    {
        customer_id: customers[4].id,
        amount: 1250,
        status: 'paid',
        date: '2023-06-17',
    },
    {
        customer_id: customers[5].id,
        amount: 8546,
        status: 'paid',
        date: '2023-06-07',
    },
    {
        customer_id: customers[1].id,
        amount: 500,
        status: 'paid',
        date: '2023-08-19',
    },
    {
        customer_id: customers[5].id,
        amount: 8945,
        status: 'paid',
        date: '2023-06-03',
    },
    {
        customer_id: customers[2].id,
        amount: 8945,
        status: 'paid',
        date: '2023-06-18',
    },
    {
        customer_id: customers[0].id,
        amount: 8945,
        status: 'paid',
        date: '2023-10-04',
    },
    {
        customer_id: customers[2].id,
        amount: 1000,
        status: 'paid',
        date: '2022-06-05',
    },
];

async function main() {

    await seedRevenue();
    await seedCustomers();
    await seedInvoices();
    await seedUsers();

}

async function seedRevenue() {

    await prisma.revenue.createMany({
        data: revenue
    });
}

async function seedCustomers() {

    const populatedCustomers = customers.map(c => {
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            image_url: c.image_url
        }
    });

    await prisma.customers.createMany({
        data: populatedCustomers
    });
}

async function seedInvoices() {

    const formattedInvoices = invoices.map(invoice => ({
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: new Date(invoice.date)
    }));

    await prisma.invoices.createMany({
        data: formattedInvoices
    });
}

async function seedUsers() {

    await prisma.users.createMany({
        data: users
    });

}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });