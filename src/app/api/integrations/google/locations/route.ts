import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GoogleCredential from "@/lib/models/GoogleCredential";
import { listGoogleLocations } from "@/lib/integrations/google";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "tenant_1";

    console.log("LOCATIONS API HIT FOR TENANT:", tenantId);
    const credential = await GoogleCredential.findOne({ tenantId });
    if (!credential) {
      console.log("CREDENTIAL NOT FOUND FOR:", tenantId);
      return NextResponse.json({ locations: [] });
    }
    console.log("CREDENTIAL FOUND. FETCHING FROM GOOGLE...");

    try {
      const locations = await listGoogleLocations(credential.tokens);
      
      // Update Cache
      credential.locationsCache = locations;
      await credential.save();

      return NextResponse.json({ 
        locations,
        selectedLocationId: credential.locationId 
      });
    } catch (apiError: any) {
      console.warn("Google API Call Failed. Serving from cache if available.", apiError.message);
      
      if (credential.locationsCache && credential.locationsCache.length > 0) {
        return NextResponse.json({ 
          locations: credential.locationsCache,
          selectedLocationId: credential.locationId,
          isCached: true
        });
      }
      throw apiError; // If no cache, throw to original catch block
    }

  } catch (error: any) {
    console.error("Fetch Locations Error Details:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      return NextResponse.json({ 
        error: error.response.data?.error?.message || "Google API Error",
        details: error.response.data
      }, { status: error.response.status });
    }
    
    console.error("Message:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { tenantId, locationId, accountId } = await req.json();

    if (!tenantId || !locationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await GoogleCredential.findOneAndUpdate(
      { tenantId },
      { locationId, accountId },
      { new: true }
    );

    return NextResponse.json({ success: true, message: "Business location updated" });

  } catch (error: any) {
    console.error("Select Location Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
