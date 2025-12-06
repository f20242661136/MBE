import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPKR = (amount: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(amount)

export const getImageUrl = (imageUrls: string[] | undefined, fallback: string = '/placeholder-product.svg'): string => {
  if (!imageUrls || imageUrls.length === 0) return fallback
  return imageUrls[0] && imageUrls[0].startsWith('http') ? imageUrls[0] : fallback
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement
  target.src = '/placeholder-product.svg'
}

export const MAX_PRICE_RANGE = 500000
