import { NextRequest, NextResponse } from "next/server";

// India pincode zone mapping (first 2 digits → region)
// Source: India Post pincode zones
const ZONE_MAP: Record<string, { region: string; minDays: number; maxDays: number }> = {
  // North India
  "11": { region: "Delhi / NCR", minDays: 3, maxDays: 5 },
  "12": { region: "Haryana", minDays: 3, maxDays: 5 },
  "13": { region: "Haryana / Punjab", minDays: 3, maxDays: 5 },
  "14": { region: "Punjab", minDays: 3, maxDays: 5 },
  "15": { region: "Punjab / Rajasthan", minDays: 4, maxDays: 6 },
  "16": { region: "Punjab / HP", minDays: 4, maxDays: 6 },
  "17": { region: "Himachal Pradesh", minDays: 4, maxDays: 7 },
  "18": { region: "J&K / Ladakh", minDays: 6, maxDays: 10 },
  "19": { region: "J&K", minDays: 6, maxDays: 10 },
  "20": { region: "Uttar Pradesh", minDays: 3, maxDays: 6 },
  "21": { region: "Uttar Pradesh", minDays: 3, maxDays: 6 },
  "22": { region: "Uttar Pradesh", minDays: 3, maxDays: 6 },
  "23": { region: "Uttar Pradesh", minDays: 4, maxDays: 6 },
  "24": { region: "Uttar Pradesh", minDays: 4, maxDays: 6 },
  "25": { region: "Uttar Pradesh", minDays: 4, maxDays: 6 },
  "26": { region: "Uttarakhand", minDays: 4, maxDays: 7 },
  "27": { region: "Uttarakhand / UP", minDays: 4, maxDays: 7 },
  "28": { region: "Rajasthan", minDays: 3, maxDays: 6 },
  "29": { region: "Rajasthan", minDays: 4, maxDays: 6 },
  "30": { region: "Rajasthan", minDays: 4, maxDays: 6 },
  "31": { region: "Rajasthan", minDays: 4, maxDays: 6 },
  "32": { region: "Rajasthan", minDays: 4, maxDays: 6 },
  "33": { region: "Rajasthan", minDays: 4, maxDays: 6 },
  "34": { region: "Rajasthan", minDays: 5, maxDays: 7 },
  // West India
  "35": { region: "Gujarat", minDays: 3, maxDays: 5 },
  "36": { region: "Gujarat", minDays: 3, maxDays: 5 },
  "37": { region: "Gujarat", minDays: 3, maxDays: 5 },
  "38": { region: "Gujarat", minDays: 4, maxDays: 6 },
  "39": { region: "Gujarat", minDays: 4, maxDays: 6 },
  "40": { region: "Mumbai / Thane", minDays: 3, maxDays: 5 },
  "41": { region: "Maharashtra (Konkan)", minDays: 4, maxDays: 6 },
  "42": { region: "Maharashtra (Nashik)", minDays: 3, maxDays: 5 },
  "43": { region: "Maharashtra (Pune)", minDays: 3, maxDays: 5 },
  "44": { region: "Maharashtra (Nagpur)", minDays: 4, maxDays: 6 },
  "45": { region: "Madhya Pradesh", minDays: 4, maxDays: 6 },
  "46": { region: "Madhya Pradesh", minDays: 4, maxDays: 6 },
  "47": { region: "Madhya Pradesh", minDays: 4, maxDays: 7 },
  "48": { region: "Madhya Pradesh / CG", minDays: 5, maxDays: 7 },
  "49": { region: "Chhattisgarh", minDays: 5, maxDays: 7 },
  // South India
  "50": { region: "Telangana / Hyderabad", minDays: 4, maxDays: 6 },
  "51": { region: "Andhra Pradesh", minDays: 4, maxDays: 6 },
  "52": { region: "Andhra Pradesh", minDays: 4, maxDays: 6 },
  "53": { region: "Andhra Pradesh", minDays: 5, maxDays: 7 },
  "56": { region: "Karnataka / Bengaluru", minDays: 3, maxDays: 5 },
  "57": { region: "Karnataka", minDays: 4, maxDays: 6 },
  "58": { region: "Karnataka", minDays: 4, maxDays: 6 },
  "60": { region: "Tamil Nadu / Chennai", minDays: 4, maxDays: 6 },
  "61": { region: "Tamil Nadu", minDays: 4, maxDays: 6 },
  "62": { region: "Tamil Nadu", minDays: 4, maxDays: 6 },
  "63": { region: "Tamil Nadu", minDays: 4, maxDays: 7 },
  "64": { region: "Tamil Nadu", minDays: 4, maxDays: 7 },
  "67": { region: "Kerala", minDays: 5, maxDays: 7 },
  "68": { region: "Kerala", minDays: 5, maxDays: 7 },
  "69": { region: "Kerala", minDays: 5, maxDays: 7 },
  // East India
  "70": { region: "West Bengal / Kolkata", minDays: 4, maxDays: 6 },
  "71": { region: "West Bengal", minDays: 4, maxDays: 7 },
  "72": { region: "West Bengal", minDays: 5, maxDays: 7 },
  "73": { region: "West Bengal", minDays: 5, maxDays: 8 },
  "74": { region: "West Bengal / Jharkhand", minDays: 5, maxDays: 8 },
  "75": { region: "Odisha", minDays: 5, maxDays: 7 },
  "76": { region: "Odisha", minDays: 5, maxDays: 8 },
  "77": { region: "Odisha", minDays: 5, maxDays: 8 },
  "78": { region: "Assam / Northeast", minDays: 6, maxDays: 9 },
  "79": { region: "Northeast India", minDays: 7, maxDays: 10 },
  "80": { region: "Bihar / Jharkhand", minDays: 5, maxDays: 7 },
  "81": { region: "Bihar", minDays: 5, maxDays: 7 },
  "82": { region: "Bihar / Jharkhand", minDays: 5, maxDays: 8 },
  "83": { region: "Bihar / Jharkhand", minDays: 5, maxDays: 8 },
  "84": { region: "Bihar", minDays: 5, maxDays: 8 },
  "85": { region: "Bihar", minDays: 5, maxDays: 8 },
};

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++; // skip Sunday (0) and Saturday (6)
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get("pincode") || "";

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Invalid pincode. Please enter a 6-digit pincode." },
      { status: 400 }
    );
  }

  const prefix = pincode.slice(0, 2);
  const zone = ZONE_MAP[prefix];

  // Default fallback for unknown zones
  const { region, minDays, maxDays } = zone ?? {
    region: "Your Location",
    minDays: 5,
    maxDays: 7,
  };

  // Add 1 business day for processing
  const processingDays = 1;
  const today = new Date();

  const earliest = addBusinessDays(today, processingDays + minDays);
  const latest = addBusinessDays(today, processingDays + maxDays);

  return NextResponse.json({
    pincode,
    region,
    minDays,
    maxDays,
    earliestDate: earliest.toISOString(),
    latestDate: latest.toISOString(),
    earliestFormatted: formatDate(earliest),
    latestFormatted: formatDate(latest),
    serviceable: true,
    message: `Delivery to ${region} in ${minDays}–${maxDays} business days`,
  });
}
