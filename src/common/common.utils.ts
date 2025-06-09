import * as bcrypt from 'bcrypt'
import { UserConstants } from '../users/constants/user.constants'

export class CommonUtils {
  static async generateHash(value: string) {
    return bcrypt.hash(value, UserConstants.AUTH_BCRYPT_HASH_SALT_FACTOR)
  }
}