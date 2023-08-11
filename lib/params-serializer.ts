import { ParamsSerializer } from "./interfaces";

export const defaultParamsSerializer: ParamsSerializer = (params) => {
  return new URLSearchParams(params).toString();
};
