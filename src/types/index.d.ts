export interface JwtDecoded {
  userId: string;
  role: "admin" | "superAdmin" | "user";
}
