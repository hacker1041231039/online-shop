import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function validate(value: unknown, min = 1): value is string {
  return typeof value === "string" && value.length >= min;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { name, email, password } = body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (!validate(name, 2)) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!validate(email) || !isValidEmail(email as string)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!validate(password, 8)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email: email as string },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password as string, 12);

    await prisma.user.create({
      data: {
        name: name as string,
        email: email as string,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
