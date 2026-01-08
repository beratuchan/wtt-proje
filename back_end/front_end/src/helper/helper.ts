import { toast } from "sonner";

export function isDigit(str: string) {
  // Yalnızca rakamlardan oluşan stringleri kontrol eder
  const rakamRegex = /^[0-9]*$/;
  return rakamRegex.test(str);
}

export function showErrors(error: any) {
  error.response.data.message.forEach((m: string) => {
    toast.error(m);
  });
}
