/**
 * Formats a date to DD/MM/YYYY string.
 * Handles Date objects, strings, numbers, and Firestore Timestamps.
 * 
 * @param {Date|string|number|object} date - The date to format
 * @returns {string} Formatted date string or empty string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  let d = date;
  
  // Handle Firestore Timestamp
  if (date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (date && date.seconds !== undefined) {
    // Handle raw Firestore timestamp object {seconds, nanoseconds}
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }
  
  if (isNaN(d.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-GB').format(d);
};

/**
 * Formats a date specifically for input[type="date"] (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = (date && typeof date.toDate === 'function') ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};
