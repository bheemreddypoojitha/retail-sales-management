import { getFilterOptionsFromDB } from "./dataLoader.js";

export const extractFilterOptions = async () => {
  return await getFilterOptionsFromDB();
};
