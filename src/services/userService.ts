import User from "../models/User";
import { prisma } from "../lib/prisma";
import { TipoToken, Usuario } from "@prisma/client";
import { RegisterData } from "../schemas/authSchema";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken, hashToken } from "../utils/token";
import { sendAccountExistsEmail, sendPasswordResetEmail, sendVerificationEmail } from "./mailService";
import { AppError } from "../utils/AppError";

class UserService {
  private users: User[] = [];
  constructor() {
    this.users = [];
  }


  async findByEmail(email: Usuario["correo"]) {
    return prisma.usuario.findUnique({
      where: { correo: email }, include: {
        organizaciones: {
          select: {
            rol: true,
            organizacion: {
              select: {
                nombre: true,
                idOrganizacion: true,
                establecimientos: {
                  select: {
                    idEstablecimiento: true,
                    nombre: true,
                    cuestionarioCompletado: true
                  }
                }
              }
            },
          }
        }
      }
    });
  }

  async getAllUsers() {
    return prisma.usuario.findMany({ include: { organizaciones: true } });
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
        organizaciones: {
          include: {
            establecimientoOrganizacionUsuarios: true
          }
        }
      }

    });
  }

  async create(userData: RegisterData) {
    const existingUser = await this.findByEmail(userData.correo);

    if (existingUser) {
      if (!existingUser.verificado) {
        await this.resendVerificationEmail(existingUser.correo);
      } else {
        const loginLink = `${process.env.FRONTEND_URL}/iniciar-sesion`;
        const recoverLink = `${process.env.FRONTEND_URL}/recuperar-contrasena`;
        await sendAccountExistsEmail(existingUser.correo, loginLink, recoverLink);
      }
      return null;
    }

    const hashedPassword = await hashPassword(userData.contraseña);
    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

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
      });

      await prisma.verificarToken.create({
        data: {
          idUsuario: newUser.idUsuario,
          tipo: TipoToken.verificacion,
          tokenHash: hashedToken,
          expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return newUser;
    });

    const link = `${process.env.FRONTEND_URL}/verificar?token=${rawToken}`;
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
              organizaciones: {
                include: {
                  establecimientoOrganizacionUsuarios: true
                }
              }
            }
          }
        }
      });

      if (!tokenRecord) {
        throw new AppError("Token de verificación inválido", 400);
      }

      // Si ya fue usado, no rompemos (idempotencia)
      if (tokenRecord.usadoEn) {
        return tokenRecord.usuario;
      }

      if (tokenRecord.expiraEn < new Date()) {
        throw new AppError("Token de verificación expirado", 400);
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

    if (!user || user.verificado) {
      return;
    }

    const rawToken = generateToken();
    const hashedToken = hashToken(rawToken);

    await prisma.$transaction(async (prisma) => {
      await prisma.verificarToken.deleteMany({
        where: {
          idUsuario: user.idUsuario,
          tipo: TipoToken.verificacion
        }
      });

      await prisma.verificarToken.create({
        data: {
          idUsuario: user.idUsuario,
          tipo: TipoToken.verificacion,
          tokenHash: hashedToken,
          expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
    });

    const link = `${process.env.FRONTEND_URL}/verificar?token=${rawToken}`;
    await sendVerificationEmail(user.correo, link);
  }

  async authenticate(email: string, password: string) {
    const user = await this.findByEmail(email);

    const isPasswordValid = user
      ? await comparePassword(password, user.contrasena)
      : false;

    if (!user || !isPasswordValid) {
      throw new AppError('Correo o contraseña incorrectos', 401);
    }

    if (!user.verificado) {
      throw new AppError('El email no ha sido verificado', 403);
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
      throw new AppError('Error al generar el token de recuperación', 500);
    }

    const link = `${process.env.FRONTEND_URL}/recuperar-contrasena?token=${rawToken}`;

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
      throw new AppError('Token de recuperación inválido', 400);
    }

    if (tokenRecord.expiraEn < new Date()) {
      throw new AppError('Token de recuperación expirado', 400);
    }

    return tokenRecord;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenRecord = await this.verifyResetPasswordToken(token);
    const hashedPassword = await hashPassword(newPassword);

    if (!tokenRecord) {
      throw new AppError('Token de recuperación inválido o expirado', 400);
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
