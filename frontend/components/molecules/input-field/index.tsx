import * as React from "react"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { cn } from "@/lib/utils"

export interface InputFieldProps extends React.ComponentProps<typeof Input> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ id, label, error, helperText, className, containerClassName, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={className}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs text-destructive font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

InputField.displayName = "InputField"
