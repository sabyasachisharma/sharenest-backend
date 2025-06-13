import { ExtractJwt, JwtFromRequestFunction, Strategy } from "passport-jwt"
import { PassportStrategy } from "@nestjs/passport"
import { UsersService } from "../../users/users.service"
import { Injectable } from "@nestjs/common"
import * as dotenv from "dotenv"
import { Request } from "express"

dotenv.config()

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, "jwt-access-token") {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtAccessTokenStrategy.extractJwtFromRequest,
      ]),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      passReqToCallback: true,
    });
  }

  private static extractJwtFromRequest = (req: any): string | null => {
    const token = req?.cookies?.access_token || req?.cookies?.accessToken;
    if (token) return token;

    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }
    return null;
  };

  async validate(req: any, payload: any) {
    const user = await this.userService.findOne(payload.sub)
    return user
  }
}