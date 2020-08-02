import { Request, Response } from "express";

export interface MyContext {
  req: Request;
  res: Response;
  payload?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
