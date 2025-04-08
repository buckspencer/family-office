import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Field {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "number"
  options?: { label: string; value: string }[]
  required?: boolean
}

interface ResourceFormProps {
  fields: Field[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => void
  submitLabel?: string
}

export function ResourceForm({
  fields,
  initialData = {},
  onSubmit,
  submitLabel = "Save",
}: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    name: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          ) : field.type === "select" ? (
            <Select
              value={formData[field.name] || ""}
              onValueChange={(value) => handleChange(field.name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) =>
                handleChange(
                  field.name,
                  field.type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value
                )
              }
              required={field.required}
            />
          )}
        </div>
      ))}
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
} 