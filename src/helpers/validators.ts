/*
  Source:
    * https://github.com/vkomulai/finnish-business-ids/blob/master/src/finnish-business-ids.ts
    * https://tarkistusmerkit.teppovuori.fi/tarkmerk.htm#y-tunnus2
*/

const BUSINESS_ID_REGEX = /^[\d]{7}-[\d]$/;
const MULTIPLIERS = [7, 9, 10, 5, 8, 4, 2];

// May be needed later
// const HETU_REGEX = /^\d{6}[A+-]\d{3}[0-9A-FHJ-NPR-Y]$/;

export function isValidBusinessId(businessId: string): boolean {

  // Check business id format (seven numbers, dash and checksum: NNNNNNN-T)?
  if ( ! BUSINESS_ID_REGEX.test(businessId)) {
    return false;
  }

  // Get numbers and check sum
  const givenChecksum = parseInt(businessId.substring(8,9), 10);
  const idNumbers = businessId.substring(0, 7);

  // Calculate checksum and compare
  const calculatedChecksum = calculateChecksum(idNumbers);
  return calculatedChecksum === givenChecksum;
}

function calculateChecksum(idNumbers: string): number {
  let sum = 0;

  // Calculate emphasis
  for (let i = 0; i < idNumbers.length; i++) {
    sum += parseInt(idNumbers[i], 10) * MULTIPLIERS[i];
  }

  // Calculate remainder
  let remainder = sum % 11;

  // No business ids with remainder of 1
  if (remainder === 1) {
    return -1;
  } 
  
  // Remainder between 2..10, checksum is 11 subracted by remainder
  if (remainder > 1) {
    remainder = 11 - remainder;
  }

  // If remainder is zero, checksum is zero
  return remainder;
}
