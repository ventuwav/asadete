import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-heading font-bold whitespace-nowrap transition-all outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Botón CTA principal naranja */
        cta: "bg-primary text-white rounded-card shadow-cta hover:bg-primaryDim",
        /** Botón oscuro secundario */
        secondary: "bg-onSurface text-white rounded-card hover:bg-black",
        /** Botón con borde, fondo claro */
        outline: "border border-outlineVariant bg-surface text-onSurface hover:bg-surfaceLow rounded-card",
        /** Solo texto, sin fondo */
        ghost: "text-primary bg-primaryLight/0 hover:bg-primaryLight/30 rounded-card",
        /** Acción destructiva / advertencia */
        danger: "border border-primary/30 bg-primaryLight/50 text-primary hover:bg-primaryLight rounded-inner",
      },
      size: {
        /** Botón full-width CTA: py-5 */
        lg: "w-full py-5 text-[15px] gap-2",
        /** Botón mediano */
        md: "py-4 px-6 text-sm gap-2",
        /** Botón chico, inline */
        sm: "py-2 px-4 text-xs gap-1.5",
        /** Solo ícono */
        icon: "w-9 h-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "cta",
      size: "lg",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
