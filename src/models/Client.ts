import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  subscriptionDate: string;
  subscriptionStatus: 'active' | 'ended';
  subscriptionEndDate?: string;
  paymentDueDate: {
    day: number;
    month?: number;
  };
  lastPaymentDate?: string;
  quotationFile: string | null;
  quotationAmount: number;
}

const ClientSchema: Schema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    subscriptionDate: {
      type: String,
      required: [true, 'Subscription date is required'],
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
      required: true,
    },
    subscriptionEndDate: {
      type: String,
      required: false,
    },
    paymentDueDate: {
      day: {
        type: Number,
        required: [true, 'Payment due day is required'],
        min: 1,
        max: 31,
      },
      month: {
        type: Number,
        required: false,
        min: 1,
        max: 12,
        default: () => new Date().getMonth() + 1,
      },
    },
    lastPaymentDate: {
      type: String,
      required: false,
    },
    quotationFile: {
      type: String,
      default: null,
    },
    quotationAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      set: function(v: any) {
        // Carefully handle the incoming value
        if (v === null || v === undefined) {
          console.log('Mongoose: quotationAmount received null/undefined, defaulting to 0');
          return 0;
        }
        
        // If it's already a number, preserve it exactly
        if (typeof v === 'number') {
          // Only check for NaN
          if (isNaN(v)) {
            console.log('Mongoose: quotationAmount is NaN, defaulting to 0');
            return 0;
          }
          console.log(`Mongoose: quotationAmount preserving number value: ${v}`);
          return v;
        }
        
        // If it's a string (like from form input), parse carefully
        if (typeof v === 'string') {
          const trimmed = v.trim();
          if (trimmed === '') {
            console.log('Mongoose: quotationAmount is empty string, defaulting to 0');
            return 0;
          }
          
          // ENHANCED: Use parseFloat for better decimal precision
          const parsed = parseFloat(trimmed);
          if (isNaN(parsed)) {
            console.log(`Mongoose: quotationAmount string "${v}" parsed to NaN, defaulting to 0`);
            return 0;
          }
          
          console.log(`Mongoose: quotationAmount parsed string "${v}" to ${parsed}`);
          return parsed;
        }
        
        // For any other type, try Number() but be careful
        const numValue = Number(v);
        if (isNaN(numValue)) {
          console.log(`Mongoose: quotationAmount conversion of ${v} resulted in NaN, defaulting to 0`);
          return 0;
        }
        
        console.log(`Mongoose: quotationAmount converted ${v} to ${numValue}`);
        return numValue;
      },
      get: function(v: any) {
        // Return exactly what's in the database
        if (v === null || v === undefined) {
          console.log('Mongoose: quotationAmount getter received null/undefined, returning 0');
          return 0;
        }
        
        if (isNaN(v)) {
          console.log(`Mongoose: quotationAmount getter received NaN, returning 0`);
          return 0;
        }
        
        // Return the exact value without any conversion
        console.log(`Mongoose: quotationAmount getter returning exact value: ${v}`);
        return v;
      }
    },
  },
  {
    timestamps: true,
    // This ensures the getters are applied when the document is converted to JSON
    toJSON: { getters: true },
    // This ensures the getters are applied when the document is converted to an object
    toObject: { getters: true }
  }
);

// Add a pre-save middleware to ensure quotationAmount is always a valid number
ClientSchema.pre('save', function(next) {
  // If quotationAmount is undefined or null, set it to 0
  if (this.quotationAmount === undefined || this.quotationAmount === null) {
    console.log('Mongoose pre-save: quotationAmount is missing, setting to 0');
    this.quotationAmount = 0;
  } 
  // If it's NaN, set it to 0
  else if (isNaN(Number(this.quotationAmount))) {
    console.log('Mongoose pre-save: quotationAmount is NaN, setting to 0');
    this.quotationAmount = 0;
  }
  
  next();
});

// Check if the model exists before creating a new one
// This is important for Next.js hot reloading
export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema); 