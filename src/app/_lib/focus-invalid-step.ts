import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFormSetFocus,
} from "react-hook-form"

export function focusInvalidStep<T extends FieldValues>(
  errors: FieldErrors<T>,
  steps: { fields: FieldPath<T>[] }[],
  goTo: (step: number) => void,
  focus: UseFormSetFocus<T>
) {
  const step = steps.findIndex((item) =>
    item.fields.some((field) => errors[field])
  )
  if (step < 0) return
  goTo(step)
  const field = steps[step].fields.find((key) => errors[key])
  if (field) requestAnimationFrame(() => focus(field))
}
