import type { Request } from "express"
import { User } from "../../users/entities/user.entity"
import { AuthConstants } from "../constants/auth.constants"
import { UserStatusEnum } from "../enums/user-status.enum"
import { ValidationErrorTypeEnum } from "../enums/validation-error-type.enum"


export class AuthUtils {
  static validateUserAndGetErrorMessage(user: User) {
    if (!user) {
      return AuthConstants.ERROR_INVALID_CREDENTIALS
    }
    if (user.status === 'INACTIVE') {
      return AuthConstants.ERROR_INVALID_CREDENTIALS
    }
    return null
  }

  static buildErrorDescription(errorType: ValidationErrorTypeEnum, userEmail: string, errorMessage: string) {
    return `${errorType} email=${userEmail} - ${errorMessage}`
  }
}

  
export type AuthRequest = Request & { user: User }
