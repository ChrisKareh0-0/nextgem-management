import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientModel from '@/models/Client';

// GET handler to retrieve a specific client
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log(`API: Fetching client with ID: ${id}`);
    
    await dbConnect();
    const client = await ClientModel.findById(id);
    
    if (!client) {
      console.log(`API: Client with ID ${id} not found`);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully retrieved client: ${id}`);
    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('API Error fetching client:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error fetching client';
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

// PUT handler to update a client
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    let updateData = await request.json();
    
    console.log(`API: Updating client with ID: ${id}`);
    console.log('API: Original update data:', JSON.stringify(updateData, null, 2));
    
    // CRITICAL FIX: Always ensure quotationAmount field exists
    if (updateData.quotationAmount === undefined || updateData.quotationAmount === null) {
      console.log('API: quotationAmount is missing in update data, adding it with default value 0');
      updateData.quotationAmount = 0;
    }
    
    console.log('API: Quotation amount:', updateData.quotationAmount, typeof updateData.quotationAmount);
    
    // ENHANCED FIX: Process the quotationAmount to ensure it's a valid number
    if (typeof updateData.quotationAmount === 'string') {
      // Handle string values (often from form inputs) carefully
      const trimmedValue = updateData.quotationAmount.trim();
      if (trimmedValue === '') {
        updateData.quotationAmount = 0;
        console.log('API: quotationAmount was empty string, defaulted to 0');
      } else {
        // Use parseFloat to preserve decimal precision
        const parsedValue = parseFloat(trimmedValue);
        if (isNaN(parsedValue)) {
          updateData.quotationAmount = 0;
          console.log('API: quotationAmount string value was NaN, defaulted to 0');
        } else {
          updateData.quotationAmount = parsedValue;
          console.log(`API: Parsed quotationAmount string "${trimmedValue}" to number:`, parsedValue);
        }
      }
    } else if (typeof updateData.quotationAmount !== 'number') {
      // Handle other non-number types
      const numValue = Number(updateData.quotationAmount);
      updateData.quotationAmount = isNaN(numValue) ? 0 : numValue;
      console.log(`API: Converted non-number quotationAmount to:`, updateData.quotationAmount);
    } else {
      // It's already a number, preserve it exactly
      console.log(`API: quotationAmount is already a number:`, updateData.quotationAmount);
      
      // Additional check to ensure it's not NaN
      if (isNaN(updateData.quotationAmount)) {
        updateData.quotationAmount = 0;
        console.log('API: quotationAmount was NaN, defaulted to 0');
      }
    }
    
    await dbConnect();
    
    // CRITICAL: Force inclusion of the quotationAmount field in update
    const finalUpdateData = {
      ...updateData,
      quotationAmount: updateData.quotationAmount 
    };
    
    console.log('API: Final update data:', {
      ...finalUpdateData,
      quotationFile: finalUpdateData.quotationFile ? '[File]' : null
    });
    console.log('API: Final quotation amount:', finalUpdateData.quotationAmount, typeof finalUpdateData.quotationAmount);
    
    // Explicitly use $set to ensure fields are updated, even if the values are the same
    const client = await ClientModel.findByIdAndUpdate(
      id,
      { $set: finalUpdateData },
      { new: true, runValidators: true }
    );
    
    if (!client) {
      console.log(`API: Client with ID ${id} not found for update`);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully updated client: ${id}`);
    console.log('API: Updated client data:', client);
    console.log('API: Updated quotation amount in MongoDB:', client.quotationAmount, typeof client.quotationAmount);
    
    // Verify the value was saved correctly by doing a fresh fetch from the database
    const verifiedClient = await ClientModel.findById(id);
    console.log('API: Verified quotation amount from fresh fetch:', 
      verifiedClient?.quotationAmount, 
      typeof verifiedClient?.quotationAmount);
    
    // If verification shows an issue, log a warning
    if (verifiedClient && verifiedClient.quotationAmount !== finalUpdateData.quotationAmount) {
      console.warn('API WARNING: Saved quotationAmount does not match the value we tried to save!');
      console.warn(`Expected: ${finalUpdateData.quotationAmount}, Got: ${verifiedClient.quotationAmount}`);
    }
    
    // Make sure the returned client has the exact quotation amount before sending back
    const responseData = client.toObject ? {
      ...client.toObject(), // Convert Mongoose document to plain object
      quotationAmount: client.quotationAmount 
    } : client;
    
    console.log('API: Final response quotation amount:', responseData.quotationAmount, typeof responseData.quotationAmount);
    
    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('API Error updating client:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error updating client';
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

// DELETE handler to delete a client
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    console.log(`API: Deleting client with ID: ${id}`);
    await dbConnect();
    const client = await ClientModel.findByIdAndDelete(id);
    
    if (!client) {
      console.log(`API: Client with ID ${id} not found for deletion`);
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`API: Successfully deleted client: ${id}`);
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('API Error deleting client:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Error deleting client';
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