import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientModel from '@/models/Client';

// POST handler to record a payment for a client
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { paymentDate } = await request.json();
    
    console.log(`API: Recording payment for client with ID: ${id}, date: ${paymentDate}`);
    
    await dbConnect();
    
    // Use the provided payment date or default to today
    const paymentDateToUse = paymentDate || new Date().toISOString().split('T')[0];
    
    // Update the client's last payment date
    const client = await ClientModel.findByIdAndUpdate(
      id,
      { lastPaymentDate: paymentDateToUse },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      console.log(`API: Client with ID ${id} not found for recording payment`);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully recorded payment for client: ${id}`);
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('API Error recording payment:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error recording payment';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
} 