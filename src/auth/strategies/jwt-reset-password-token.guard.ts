import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtResetPasswordTokenGuard extends AuthGuard("jwt-reset-password-token") {}
