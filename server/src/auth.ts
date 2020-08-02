import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

// todo add roles and (uuid?)
export const createAccessToken = (user: User) => {
  const fn = user.firstName ? user.firstName : "";
  const ln = user.lastName ? user.lastName : "";

  return sign(
    {
      userId: user.id,
      email: user.email,
      firstName: fn,
      lastName: ln,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m",
    }
  );
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};
