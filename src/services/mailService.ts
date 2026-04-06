// mailer.ts en Render Free
// ---------------------------------------------
// Este archivo solo hace fetch a la función en Vercel
// ---------------------------------------------

// Función auxiliar que llama a la serverless function en Vercel
async function sendMailViaVercel(to: string, subject: string, text: string, html: string) {
  try {
    const res = await fetch("https://api-email-lzrp.vercel.app/api/sendMail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text, html }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("❌ Error desde Vercel:", errorData);
    } else {
      console.log("✅ Mail enviado vía Vercel a:", to);
    }
  } catch (err) {
    console.error("❌ Error haciendo fetch a Vercel:", err);
  }
}

// ---------------------------------------------
// Función: enviar correo de verificación
// ---------------------------------------------
export async function sendVerificationEmail(to: string, link: string) {
  const subject = "Verificá tu cuenta en Tambo360";
  const text =`
Hola,

Recibimos tu solicitud para crear una cuenta en Tambo360.

Para activar tu acceso necesitás verificar tu dirección de correo electrónico.

Copiá y pegá este enlace en tu navegador:

${link}

Este enlace estará disponible por 24 horas.

Si no solicitaste esta cuenta, podés ignorar este mensaje.

Equipo Tambo360
`;

const html = `
<div style="background-color:#f4f6f8; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="
      max-width:600px;
      margin:0 auto;
      background-color:#ffffff;
      padding:40px;
      border-radius:10px;
      border:1px solid #e5e7eb;
      box-shadow:0 4px 12px rgba(0,0,0,0.05);
      text-align:left;
  ">
    <h2 style="margin-top:0; color:#1f2937; text-align:center;">
      Verificá tu cuenta en Tambo360
    </h2>
    <p>Hola,</p>
    <p>
      Recibimos tu solicitud para crear una cuenta en <strong>Tambo360</strong>.
    </p>
    <p>
      Para activar tu acceso necesitás verificar tu dirección de correo electrónico.
    </p>
    <div style="text-align:center; margin:35px 0;">
      <a href="${link}" style="
          background-color:#2563eb;
          color:#ffffff;
          padding:14px 24px;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
          display:inline-block;
      ">
        Verificar cuenta
      </a>
    </div>
    <p style="font-size:12px; word-break:break-all;">${link}</p>
    <hr style="margin:30px 0;" />
    <p style="font-size:12px; text-align:center;">Equipo Tambo360</p>
  </div>
</div>
`

  await sendMailViaVercel(to, subject, text, html);
}

// ---------------------------------------------
// Función: enviar correo de recuperación de contraseña
// ---------------------------------------------
export async function sendPasswordResetEmail(to: string, link: string) {
  const subject = "Recuperá tu contraseña en Tambo360";
  const text = `
Hola,

Recibimos una solicitud para restablecer tu contraseña.

Copiá y pegá este enlace en tu navegador:

${link}

Este enlace estará disponible por 1 hora.

Si no solicitaste este cambio, podés ignorar este mensaje.

Equipo Tambo360
`;

const html = `
<div style="background-color:#f4f6f8; padding:40px 0; font-family: Arial, sans-serif;">
  <div style="
      max-width:600px;
      margin:0 auto;
      background-color:#ffffff;
      padding:40px;
      border-radius:10px;
      border:1px solid #e5e7eb;
      box-shadow:0 4px 12px rgba(0,0,0,0.05);
      text-align:left;
  ">
    <h2 style="text-align:center;">Recuperación de contraseña</h2>
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <div style="text-align:center; margin:35px 0;">
      <a href="${link}" style="
          background-color:#dc2626;
          color:#ffffff;
          padding:14px 24px;
          text-decoration:none;
          border-radius:6px;
          font-weight:bold;
          display:inline-block;
      ">
        Restablecer contraseña
      </a>
    </div>
    <p style="font-size:12px; word-break:break-all;">${link}</p>
    <hr style="margin:30px 0;" />
    <p style="font-size:12px; text-align:center;">Equipo Tambo360</p>
  </div>
</div>
`

  await sendMailViaVercel(to, subject, text, html);
}


// ---------------------------------------------
// Función: enviar correo de contacto (landing)
// ---------------------------------------------
export async function sendContactEmail(
  name: string,
  email: string,
  phone: string,
  message: string
) {
  // Sanitización básica (evita HTML injection en el mail)
  const escape = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escape(name);
  const safeEmail = escape(email);
  const safePhone = escape(phone || "-");
  const safeMessage = escape(message);

  const subject = `Nuevo contacto - ${safeName}`;

  const text = `
Nuevo mensaje de contacto

Nombre: ${safeName}
Email: ${safeEmail}
Teléfono: ${safePhone}
Mensaje:
${safeMessage}
`;

  const html = `
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nuevo contacto</title>
  </head>
  <body style="background-color:#f4f4f0; font-family: Georgia, serif; color:#1a1a1a; padding:40px 16px;">
    <div style="max-width:560px; margin:0 auto;">

      <!-- Header -->
      <div style="background-color:#1a1a1a; border-radius:16px 16px 0 0; padding:36px 40px 28px;">
        <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#888; font-family:'Courier New', monospace;">
          Nuevo mensaje de contacto
        </div>
        <div style="font-size:20px; color:#ffffff; font-weight:700; margin-top:2px;">
          Tambo360 — Formulario web
        </div>
      </div>

      <!-- Body -->
      <div style="background:#ffffff; padding:36px 40px; border-left:1px solid #e8e8e4; border-right:1px solid #e8e8e4;">

        <p style="font-size:13px; color:#666; margin-bottom:28px; font-family:'Courier New', monospace;">
          Se recibió una consulta a través del sitio web
        </p>

        <div style="margin-bottom:22px;">
          <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#3a7d1e; font-weight:700;">
            Nombre
          </div>
          <div style="font-size:16px;">${safeName}</div>
        </div>

        <hr style="border:none; border-top:1px solid #ebebeb; margin:8px 0 24px;" />

        <div style="margin-bottom:22px;">
          <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#3a7d1e; font-weight:700;">
            Email
          </div>
          <div style="font-size:16px;">
            <a href="mailto:${safeEmail}" style="color:#3a7d1e; text-decoration:none;">
              ${safeEmail}
            </a>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid #ebebeb; margin:8px 0 24px;" />

        <div style="margin-bottom:22px;">
          <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#3a7d1e; font-weight:700;">
            Teléfono
          </div>
          <div style="font-size:16px;">${safePhone}</div>
        </div>

        <hr style="border:none; border-top:1px solid #ebebeb; margin:8px 0 24px;" />

        <div style="margin-bottom:22px;">
          <div style="font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:#3a7d1e; font-weight:700;">
            Mensaje
          </div>
          <div style="background:#f8f8f5; border-left:3px solid #3a7d1e; border-radius:0 8px 8px 0; padding:16px 20px; font-size:15px; line-height:1.65; white-space:pre-wrap;">
            ${safeMessage}
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color:#1a1a1a; border-radius:0 0 16px 16px; padding:22px 40px; font-size:11px; color:#555; font-family:'Courier New', monospace;">
        Equipo Tambo360
      </div>

    </div>
  </body>
</html>
`;

  await sendMailViaVercel(
    "t360.arg@gmail.com",
    subject,
    text,
    html
  );
}