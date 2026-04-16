import rateLimit from "express-rate-limit";

//5 requests por IP cada 10 minutos para endpoints sensibles (login, register)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5, // 5 intentos
  message: {
    error: "Demasiados intentos. Por favor, inténtalo de nuevo más tarde.",
  },
});

//20 requests por hora por usuario para endpoints de IA
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 requests por hora
  keyGenerator: (req: any) => req.user.id, // por usuario
  message: {
    error: "AI_RATE_LIMIT_EXCEEDED",
    message: "Límite de uso alcanzado, intentá más tarde",
  },
});