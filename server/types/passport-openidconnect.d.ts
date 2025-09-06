declare module 'passport-openidconnect' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export class Strategy extends PassportStrategy {
    constructor(options: any, verify: any);
  }
}