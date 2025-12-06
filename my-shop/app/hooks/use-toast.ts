import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export const useToast = () => {
  const toast = ({ title, description, variant, duration }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        duration,
      })
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      })
    }
  }

  return { toast }
}
