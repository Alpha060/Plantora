// Order number generator: PLT-YYYYMMDD-XXXXX
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PLT-${dateStr}-${random}`;
}

// Return number generator: RET-YYYYMMDD-XXXXX
export function generateReturnNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RET-${dateStr}-${random}`;
}

// Settlement number generator: STL-YYYYMMDD-XXXXX
export function generateSettlementNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `STL-${dateStr}-${random}`;
}

// Service booking number: SRV-YYYYMMDD-XXXXX
export function generateBookingNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SRV-${dateStr}-${random}`;
}
