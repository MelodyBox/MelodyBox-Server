import { Response } from "express";

type SuccessResOptions<T> = {
  code?: number;
  data: T;
};

type ErrorResOptions = {
  code?: number;
  message: string;
};

export function SuccessRes<T>(res: Response, options: SuccessResOptions<T>) {
  return res.status(options.code ?? 200).json({
    success: true,
    data: options.data,
  });
}

export function ErrorRes(res: Response, options: ErrorResOptions) {
  return res.status(options.code ?? 400).json({
    success: false,
    error: options.message,
  });
}
