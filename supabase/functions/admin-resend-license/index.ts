Deno.serve(() => new Response(JSON.stringify({ ok: false, error: "disabled" }), { status: 410, headers: { "Content-Type": "application/json" } }))
