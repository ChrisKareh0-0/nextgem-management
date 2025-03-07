import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientModel from '@/models/Client';

// POST handler to end a client's subscription
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log(`API: Ending subscription for client with ID: ${id}`);
    
    await dbConnect();
    
    // Get the current date in YYYY-MM-DD format
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    
    // Update the client's subscription status
    const client = await ClientModel.findByIdAndUpdate(
      id,
      { 
        subscriptionStatus: 'ended',
        subscriptionEndDate: endDate
      },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      console.log(`API: Client with ID ${id} not found for ending subscription`);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully ended subscription for client: ${id}`);
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('API Error ending subscription:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error ending subscription';
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