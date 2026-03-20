import User from "../models/User";
import { prisma } from "../lib/prisma";
import { TipoToken, Usuario } from "@prisma/client";
import { RegisterData } from "../schemas/authSchema";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken, hashToken } from "../utils/token";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mailService";

class UserService {
  private users: User[] = [];
  constructor() {
    this.users = [];
  }


  async findByEmail(email: Usuario["correo"]) {
    return prisma.usuario.findUnique({ where: { correo: email }, include: { establecimientos: true } });
  }

  async getAllUsers() {
    return prisma.usuario.findMany({ include: { establecimientos: true } });
  }

  async findById(id: Usuario["idUsuario"]) {
    console.log("Buscando usuario por ID:", id);
    return prisma.usuario.findUnique({ 
      where: { idUsuario: id }, 
      select: {
        idUsuario: true,
        nombre: true,
        correo: true,
        verificado: true,
        establecimientos: true
      }
    
    });
  }

  async create(userData: RegisterData) {
    const existingUser = await this.findByEmail(userData.correo);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await hashPassword(userData.contraseña);
    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)


    const result = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.usuario.create({
        data: {
          nombre: userData.nombre,
          correo: userData.correo,
          contrasena: hashedPassword

        },
        select: {
          idUsuario: true,
          nombre: true,
          correo: true,
          verificado: true,
          fechaCreacion: true
        }
      })

      const newToken = await prisma.verificarToken.create({
        data: {
          idUsuario: newUser.idUsuario,
          tipo: TipoToken.verificacion,
          tokenHash: hashedToken,
          expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira en 24 horas
        }
      })
      return newUser;
    })

    if (!result) {
      throw new Error('Error al crear el usuario');
    }

    const link = `${process.env.FRONTEND_URL}/auth/verify?token=${rawToken}`;

    await sendVerificationEmail(result.correo, link);

    return result;
  }

  async verifyEmail(token: string) {
  const hashedToken = hashToken(token);

  const response = await prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.verificarToken.findFirst({
      where: {
        tokenHash: hashedToken,
        tipo: TipoToken.verificacion
      },
      include: {
        usuario: {
          include: {
            establecimientos: true
          }
        }
      }
    });

    if (!tokenRecord) {
      throw new Error("Token de verificación inválido");
    }

    // Si ya fue usado, no rompemos (idempotencia)
    if (tokenRecord.usadoEn) {
      return tokenRecord.usuario;
    }

    if (tokenRecord.expiraEn < new Date()) {
      throw new Error("Token de verificación expirado");
    }

    //  Actualizamos usuario
    await tx.usuario.update({
      where: { idUsuario: tokenRecord.idUsuario },
      data: { verificado: true }
    });

    //  Marcamos token como usado (NO lo borramos)
    await tx.verificarToken.update({
      where: { tokenid: tokenRecord.tokenid },
      data: { usadoEn: new Date() }
    });



    return tokenRecord.usuario;
  });

  return response
}

  async resendVerificationEmail(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.verificado) {
      throw new Error('El email ya está verificado');
    }

    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)

    const result = await prisma.$transaction(async (prisma) => {
      await prisma.verificarToken.deleteMany({
        where: {
          idUsuario: user.idUsuario,
          tipo: TipoToken.verificacion,
          expiraEn: {
            gt: new Date()
          }
        }
      })

      const tokenRecord = await prisma.verificarToken.create({
        data: {
          idUsuario: user.idUsuario,
          tipo: TipoToken.verificacion,
          tokenHash: hashedToken,
          expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira en 24 horas
        }
      })

      return tokenRecord;
    })

    if (!result) {
      throw new Error('Error al generar el token de verificación');
    }

    const link = `${process.env.FRONTEND_URL}/auth/verify?token=${rawToken}`;

    await sendVerificationEmail(user.correo, link);
  }

  async authenticate(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isPasswordValid = await comparePassword(password, user.contrasena);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.verificado) {
      throw new Error('El email no ha sido verificado');
    }

    return user;

  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);

    if (!user || !user.verificado) {
      return;
    }
    const existingToken = await prisma.verificarToken.findFirst({
      where: {
        idUsuario: user.idUsuario,
        tipo: TipoToken.recuperacion,
        expiraEn: {
          gt: new Date()
        },
        usadoEn: null
      }
    })

    if (existingToken) {
      return;
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    const tokenRecord = await prisma.verificarToken.create({
      data: {
        idUsuario: user.idUsuario,
        tipo: TipoToken.recuperacion,
        tokenHash: hashedToken,
        expiraEn: new Date(Date.now() + 15 * 60 * 1000) // Expira en 15 minutos
      }
    })

    if (!tokenRecord) {
      throw new Error('Error al generar el token de recuperación');
    }

    const link = `${process.env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.correo, link);
  }

  async verifyResetPasswordToken(token: string) {
    const hashedToken = hashToken(token);

    const tokenRecord = await prisma.verificarToken.findFirst({
      where: {
        tokenHash: hashedToken,
        tipo: TipoToken.recuperacion,
        expiraEn: {
          gt: new Date()
        },
        usadoEn: null
      }
    })

    if (!tokenRecord || tokenRecord.tipo !== TipoToken.recuperacion) {
      throw new Error('Token de recuperación inválido');
    }

    if (tokenRecord.expiraEn < new Date()) {
      throw new Error('Token de recuperación expirado');
    }

    return tokenRecord;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenRecord = await this.verifyResetPasswordToken(token);
    const hashedPassword = await hashPassword(newPassword);

    if (!tokenRecord) {
      throw new Error('Token de recuperación inválido o expirado');
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.usuario.update({
        where: { idUsuario: tokenRecord.idUsuario },
        data: { contrasena: hashedPassword }
      })

      await prisma.verificarToken.delete({
        where: { tokenid: tokenRecord.tokenid }
      })
    })

    return true

  }
}

export default new UserService();
