"use client"

import * as React from "react"
import { Select } from "@/components/atoms/select"
import { Label } from "@/components/atoms/label"
import { cn } from "@/lib/utils"

export interface SelectFieldProps extends React.ComponentProps<typeof Select> {
  label?: string
  error?: string
  helperText?: string
  id?: string
  containerClassName?: string
  children: React.ReactNode
}

export function SelectField({
  id,
  label,
  error,
  helperText,
  containerClassName,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <Label htmlFor={selectId} className={cn(error && "text-destructive")}>
          {label}
        </Label>
      )}
      <Select {...props}>
        {children}
      </Select>
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
