import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-terracotta text-cream border-2 border-terracotta hover:bg-terracotta-dark active:bg-terracotta-dark disabled:opacity-40',
  secondary:
    'bg-transparent text-cream border-2 border-cream/40 hover:border-cream active:bg-cream/10 disabled:opacity-40',
  ghost:
    'bg-transparent text-cream border-2 border-transparent hover:bg-cream/10 active:bg-cream/15 disabled:opacity-40',
  danger:
    'bg-accent-red text-cream border-2 border-accent-red hover:brightness-110 disabled:opacity-40',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'min-h-11 px-4 text-base',
  lg: 'min-h-13 px-6 text-lg',
  xl: 'min-h-16 px-8 text-xl',
}

/** Bouton tactile "gros, lisible au soleil" — voir section 3/78 du cahier
 * des charges. Toujours au moins 44px de haut. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'lg', fullWidth, className = '', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={[
          'inline-flex items-center justify-center gap-2 rounded font-semibold tracking-wide',
          'transition-colors duration-150 select-none',
          'disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
