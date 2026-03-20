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