// Utility to generate mock bounding boxes for testing
// Replace this with real Azure Doc Intelligence bbox data

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

// Mock bounding boxes for common CTOS fields
// Based on typical CTOS report layout
export const mockBoundingBoxes: Record<string, BoundingBox> = {
  companyName: {
    x: 15,
    y: 12,
    width: 35,
    height: 3,
    page: 1,
  },
  regNo: {
    x: 15,
    y: 16,
    width: 30,
    height: 2.5,
    page: 1,
  },
  incDate: {
    x: 15,
    y: 20,
    width: 20,
    height: 2.5,
    page: 1,
  },
  address: {
    x: 15,
    y: 24,
    width: 50,
    height: 5,
    page: 1,
  },
  natureOfBusiness: {
    x: 15,
    y: 31,
    width: 45,
    height: 3,
    page: 1,
  },
  paidUpCapital: {
    x: 15,
    y: 40,
    width: 25,
    height: 2.5,
    page: 1,
  },
  netWorth: {
    x: 15,
    y: 44,
    width: 25,
    height: 2.5,
    page: 1,
  },
  litigation: {
    x: 15,
    y: 55,
    width: 15,
    height: 2.5,
    page: 1,
  },
};

// Convert Azure Doc Intelligence polygon to bounding box
export function polygonToBoundingBox(
  polygon: number[],
  pageWidth: number,
  pageHeight: number,
  page: number = 1
): BoundingBox {
  // Azure returns [x1,y1, x2,y2, x3,y3, x4,y4]
  const xs = [polygon[0], polygon[2], polygon[4], polygon[6]];
  const ys = [polygon[1], polygon[3], polygon[5], polygon[7]];

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Convert to percentage
  return {
    x: (minX / pageWidth) * 100,
    y: (minY / pageHeight) * 100,
    width: ((maxX - minX) / pageWidth) * 100,
    height: ((maxY - minY) / pageHeight) * 100,
    page,
  };
}

// Add mock bounding boxes to fields for demo
export function addMockBoundingBoxes(fields: Record<string, any>): Record<string, any> {
  const enrichedFields: Record<string, any> = {};

  for (const [key, value] of Object.entries(fields)) {
    enrichedFields[key] = {
      ...value,
      boundingBox: mockBoundingBoxes[key] || null,
    };
  }

  return enrichedFields;
}
