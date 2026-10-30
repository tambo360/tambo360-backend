import rateLimit from "express-rate-limit";

//10 requests por IP cada 10 minutos para endpoints sensibles (login, register)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10, // 10 intentos
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




// 100 requests cada 5 minutos para operaciones de escritura (POST, PUT, DELETE)
export const tamboCrudLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100,
  keyGenerator: (req: any) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { forwardedHeader: false, xForwardedForHeader: false },
  message: {
    error: "TAMBO_CRUD_LIMIT_EXCEEDED",
    message: "Demasiadas operaciones seguidas. Esperá unos minutos e intentá de nuevo.",
  },
});

// 500 requests cada 5 minutos para consultas (GET)
export const tamboGetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 500,
  keyGenerator: (req: any) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { forwardedHeader: false, xForwardedForHeader: false },
  message: {
    error: "TAMBO_GET_LIMIT_EXCEEDED",
    message: "Hubo un problema de sincronización. Por favor, reiniciá la app.",
  },
});
