import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nome || !body.cognome || !body.email || !body.messaggio) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("Contatto").insert([
      {
        nome: body.nome,
        cognome: body.cognome,
        email: body.email,
        messaggio: body.messaggio,
      },
    ]);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Errore database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Richiesta non valida" },
      { status: 400 }
    );
  }
}
