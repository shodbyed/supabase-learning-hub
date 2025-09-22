export const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format as XXX-XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

export const capitalizeWords = (text: string) => {
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export const formatFinalPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};