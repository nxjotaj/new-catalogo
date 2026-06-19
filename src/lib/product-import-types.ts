export type ProductImportResult = {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
  message: string;
};

export const emptyProductImportResult: ProductImportResult = {
  success: false,
  created: 0,
  updated: 0,
  failed: 0,
  errors: [],
  message: "",
};
