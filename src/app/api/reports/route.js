import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET - List all reports for the current user
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const reports = await sql`
      SELECT 
        r.id,
        r.client_id,
        r.period,
        r.metrics_json,
        r.ai_summary,
        r.pdf_url,
        r.created_at,
        c.name as client_name,
        c.logo_url as client_logo,
        c.brand_color as client_brand_color
      FROM reports r
      JOIN clients c ON r.client_id = c.id
      WHERE c.user_id = ${userId}
      ORDER BY r.created_at DESC
    `;

    return Response.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST - Create a new report
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { client_id, period, metrics_json, ai_summary, pdf_url } = body;

    if (!client_id) {
      return Response.json({ error: "Client ID is required" }, { status: 400 });
    }

    if (!period) {
      return Response.json({ error: "Period is required" }, { status: 400 });
    }

    if (!metrics_json) {
      return Response.json(
        { error: "Metrics data is required" },
        { status: 400 },
      );
    }

    // Verify the client belongs to the current user
    const clientCheck = await sql`
      SELECT id FROM clients WHERE id = ${client_id} AND user_id = ${userId}
    `;

    if (clientCheck.length === 0) {
      return Response.json(
        { error: "Client not found or access denied" },
        { status: 404 },
      );
    }

    // Create the report
    const result = await sql`
      INSERT INTO reports (client_id, period, metrics_json, ai_summary, pdf_url)
      VALUES (
        ${client_id},
        ${period},
        ${JSON.stringify(metrics_json)},
        ${ai_summary || null},
        ${pdf_url || null}
      )
      RETURNING id, client_id, period, metrics_json, ai_summary, pdf_url, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}
