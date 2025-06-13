import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UserRole } from "../enums/role.enum"
import { ROLES_KEY } from "./roles.decorator"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user: data, apiKeyAuth } = context.switchToHttp().getRequest()
  
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
  
    if (!requiredRoles || apiKeyAuth) {
      return true
    }
  
    let user = data
    let roles = data?.roles ?? (data?.role ? [data.role] : [])
  
    const isValidRole = requiredRoles.some(role => roles.includes(role))
    Logger.log(
      `RolesGuard user=${JSON.stringify(user)} requiredRoles=${requiredRoles} roles=${roles} isValidRole=${isValidRole}`
    )
  
    return isValidRole
  }
}  