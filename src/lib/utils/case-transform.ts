export function capitalToLower(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => capitalToLower(item));
  }

  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = key.charAt(0).toLowerCase() + key.slice(1);
    
    if (value !== null && typeof value === 'object') {
      transformed[newKey] = capitalToLower(value);
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}

export function lowerToCapital(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => lowerToCapital(item));
  }

  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = key.charAt(0).toUpperCase() + key.slice(1);
    
    if (value !== null && typeof value === 'object') {
      transformed[newKey] = lowerToCapital(value);
    } else {
      transformed[newKey] = value;
    }
  }

  return transformed;
}