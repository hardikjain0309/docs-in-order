import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class UUIDService {
  generateUUID() {
    return randomUUID();
  }
}
