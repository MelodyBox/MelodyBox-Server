import { Response } from "express";

type SuccessResOptions<T> = {
  code?: number;
  data: T;
};

type ErrorResOptions = {
  code?: number;
  message: string;
};

export type SuccessRes<T> = {
  success: true;
  data: T;
};

export type ErrorRes = {
  success: false;
  error: string;
};

export type ApiResponse<T> = SuccessRes<T> | ErrorRes;

export function SuccessRes<T>(res: Response, options: SuccessResOptions<T>) {
  return res.status(options.code ?? 200).json({
    success: true,
    data: options.data,
  } as SuccessRes<T>);
}

export function ErrorRes(res: Response, options: ErrorResOptions) {
  return res.status(options.code ?? 400).json({
    success: false,
    error: options.message,
  } as ErrorRes);
}
