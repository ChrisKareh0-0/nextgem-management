/**
 * This script tests the quotation amount handling
 * Run with: node -r dotenv/config src/scripts/test-quotation-amount.js
 */

// Sample test cases for quotation amount
const testCases = [
  { value: 12345.67, expectedType: 'number', description: 'Whole number with decimals' },
  { value: 500, expectedType: 'number', description: 'Whole number' },
  { value: 0.99, expectedType: 'number', description: 'Decimal less than 1' },
  { value: "1000.50", expectedType: 'number', description: 'String number with decimals' },
  { value: "2500", expectedType: 'number', description: 'String whole number' },
  { value: "", expectedType: 'number', description: 'Empty string' },
  { value: null, expectedType: 'number', description: 'Null value' },
  { value: undefined, expectedType: 'number', description: 'Undefined value' },
];

// Functions to simulate processing at different layers
function simulateFormHandling(value) {
  console.log(`\n🔍 FORM LAYER processing: ${value} (${typeof value})`);
  
  // Similar to what we have in the client form component
  if (value === undefined || value === null) {
    console.log('  Form: Value is null/undefined, using 0');
    return 0;
  } else if (value === '') {
    console.log('  Form: Value is empty string, using 0');
    return 0;
  } else if (typeof value === 'string') {
    console.log(`  Form: Value is string, parsing...`);
    // Use parseFloat for better decimal precision
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      console.log('  Form: Parsed value is NaN, using 0');
      return 0;
    }
    console.log(`  Form: Parsed to ${parsed}`);
    return parsed;
  } else if (typeof value === 'number') {
    if (isNaN(value)) {
      console.log('  Form: Value is NaN, using 0');
      return 0;
    }
    console.log(`  Form: Value is already a number: ${value}`);
    return value;
  }
  
  // Fallback
  return 0;
}

function simulateAPIHandling(value) {
  console.log(`🔄 API LAYER processing: ${value} (${typeof value})`);
  
  // Similar to what we have in the API route
  if (value === undefined || value === null) {
    console.log('  API: Value is null/undefined, using 0');
    return 0;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      console.log('  API: Value is empty string, using 0');
      return 0;
    }
    
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) {
      console.log('  API: Parsed value is NaN, using 0');
      return 0;
    }
    console.log(`  API: Parsed to ${parsed}`);
    return parsed;
  } else if (typeof value !== 'number') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      console.log('  API: Converted value is NaN, using 0');
      return 0;
    }
    console.log(`  API: Converted to ${numValue}`);
    return numValue;
  } else if (isNaN(value)) {
    console.log('  API: Value is NaN, using 0');
    return 0;
  }
  
  console.log(`  API: Value is a valid number: ${value}`);
  return value;
}

function simulateMongooseHandling(value) {
  console.log(`💾 DATABASE LAYER processing: ${value} (${typeof value})`);
  
  // Similar to what we have in the Mongoose schema
  if (value === undefined || value === null) {
    console.log('  DB: Value is null/undefined, using 0');
    return 0;
  }
  
  if (typeof value === 'number') {
    if (isNaN(value)) {
      console.log('  DB: Value is NaN, using 0');
      return 0;
    }
    console.log(`  DB: Value is already a number: ${value}`);
    return value;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      console.log('  DB: Value is empty string, using 0');
      return 0;
    }
    
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) {
      console.log('  DB: Parsed value is NaN, using 0');
      return 0;
    }
    console.log(`  DB: Parsed to ${parsed}`);
    return parsed;
  }
  
  // Fallback for other types
  const numValue = Number(value);
  if (isNaN(numValue)) {
    console.log('  DB: Converted value is NaN, using 0');
    return 0;
  }
  
  console.log(`  DB: Converted to ${numValue}`);
  return numValue;
}

// Run all the test cases
console.log('🧪 TESTING QUOTATION AMOUNT HANDLING\n');
console.log('This script simulates how quotation amounts are processed through the system\n');

testCases.forEach((testCase, index) => {
  console.log(`\n======= TEST CASE ${index + 1}: ${testCase.description} =======`);
  console.log(`Input: ${testCase.value} (${typeof testCase.value})`);
  
  // Simulate the flow through the application
  const formResult = simulateFormHandling(testCase.value);
  const apiResult = simulateAPIHandling(formResult);
  const dbResult = simulateMongooseHandling(apiResult);
  
  // Verify the final result
  console.log(`\n✅ FINAL RESULT: ${dbResult} (${typeof dbResult})`);
  
  const isTypeCorrect = typeof dbResult === testCase.expectedType;
  const isValuePreserved = 
    (testCase.value === null || testCase.value === undefined || testCase.value === '') ? 
    dbResult === 0 : 
    (typeof testCase.value === 'string' ? 
      dbResult === parseFloat(testCase.value || '0') : 
      dbResult === testCase.value);
  
  if (isTypeCorrect && isValuePreserved) {
    console.log('✓ SUCCESS: Type and value are correct');
  } else {
    console.log('⚠ WARNING:');
    if (!isTypeCorrect) {
      console.log(`  - Expected type: ${testCase.expectedType}, Got: ${typeof dbResult}`);
    }
    if (!isValuePreserved) {
      console.log(`  - Expected value: ${testCase.value === null || testCase.value === undefined || testCase.value === '' ? 
        0 : 
        (typeof testCase.value === 'string' ? parseFloat(testCase.value || '0') : testCase.value)}, Got: ${dbResult}`);
    }
  }
});

console.log('\n🎉 All tests completed!');
console.log('If you saw any warnings, review the corresponding parts of your code.');
console.log('If all tests passed successfully, the quotation amount handling should work correctly.'); 