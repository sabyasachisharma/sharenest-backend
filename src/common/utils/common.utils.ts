import * as bcrypt from 'bcrypt'

export class CommonUtils {
  static async generateHash(value: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(value, saltRounds)
  }

  static async compareHash(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash)
  }

  static async generatePasswordHash(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword)
  }

  static async validatePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return this.comparePassword(candidatePassword, hashedPassword)
  }
} 