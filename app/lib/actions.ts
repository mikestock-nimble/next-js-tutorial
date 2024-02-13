'use server';

import { z } from 'zod';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.number(),
    customerId: z.coerce.number(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await prisma.invoices.create({
            data: {
                customer_id: customerId,
                amount: amountInCents,
                status,
                date: new Date(date),
            },
        });
    }

    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create invoice.');
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoiceById(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        date: formData.get('date'),
    });

    const amountInCents = amount * 100;

    try {
        await prisma.invoices.update({
            where: { id: parseInt(id) },
            data: {
                customer_id: customerId,
                amount: amountInCents,
                status,
            },
        });
    }

    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update invoice.');
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoiceById(id: string) {
    try {
        await prisma.invoices.delete({
            where: { id: parseInt(id) },
        });
    }

    catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete invoice.');
    }

    revalidatePath('/dashboard/invoices');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}