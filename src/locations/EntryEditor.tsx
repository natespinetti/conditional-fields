import { useEffect, useRef, useState, useCallback } from "react"
import type { EditorAppSDK } from "@contentful/app-sdk"
import { useSDK } from "@contentful/react-apps-toolkit"
import Field from "components/DefaultField"
import FieldWrap from "components/FieldWrap"
import Selector from "components/Selector"
import type { Rule } from "types"
import React from "react"

const Entry = () => {
  const sdk = useSDK<EditorAppSDK>()
  const [fields, setFields] = useState<Record<string, any>>(() => {
    return Object.fromEntries(Object.entries(sdk.entry.fields).map(([key, value]) => [key, value]))
  })
  const [hiddenFields, setHiddenFields] = useState<Record<string, any>>({})
  const [fieldOrder, setFieldOrder] = useState<string[]>(Object.keys(sdk.entry.fields))
  const [rules, setRules] = useState<Rule[]>([])

  // Use refs to store the latest values without triggering re-renders
  const hiddenFieldsRef = useRef(hiddenFields)
  const fieldOrderRef = useRef(fieldOrder)
  const fieldsRef = useRef(fields)

  // Update refs when state changes
  useEffect(() => {
    hiddenFieldsRef.current = hiddenFields
  }, [hiddenFields])

  useEffect(() => {
    fieldOrderRef.current = fieldOrder
  }, [fieldOrder])

  useEffect(() => {
    fieldsRef.current = fields
  }, [fields])

  useEffect(() => {
    const entryFields = sdk.entry.fields
    setFields(entryFields)
    console.log(sdk)
  }, [sdk])

  useEffect(() => {
    if (sdk.parameters.installation.rules) {
      setRules(sdk.parameters.installation.rules)
    }
  }, [sdk])

  const detachFunctions = useRef<(() => void)[]>([])

  const evaluateCondition = useCallback((rule: Rule, fieldValue: string): boolean => {
    switch (rule.isEqualTo) {
      case "equal":
        return fieldValue === rule.condition
      case "not equal":
        return fieldValue !== rule.condition
      case "contains":
        return fieldValue.includes(rule.condition)
      case "not contains":
        return !fieldValue.includes(rule.condition)
      case "empty":
        return fieldValue === "" || fieldValue === undefined || fieldValue === null
      case "not empty":
        return fieldValue !== "" && fieldValue !== undefined && fieldValue !== null
      default:
        // If the condition is a string, treat it like "equal"
        return fieldValue === rule.isEqualTo
    }
  }, [])

  useEffect(() => {
    // Clean up previous listeners
    detachFunctions.current.forEach((detach) => detach())
    detachFunctions.current = []

    rules.forEach((rule) => {
      const watchField = sdk.entry.fields[rule.ifField]
      if (!watchField) return

      const detach = watchField.onValueChanged((value) => {
        const val = value?.toString() || ""
        const shouldApplyRule = evaluateCondition(rule, val)
        const shouldShow = shouldApplyRule

        console.log(`Rule evaluation for ${rule.ifField}:`, shouldShow)

        // Use functional updates to avoid stale closures
        setFields((prevFields) => {
          const currentHiddenFields = hiddenFieldsRef.current
          const currentFieldOrder = fieldOrderRef.current
          const newFields = { ...prevFields }
          const newHiddenFields = { ...currentHiddenFields }
          const newFieldOrder = [...currentFieldOrder]

          rule.affectedFields.forEach((field) => {
            if (field.action === "show") {
              if (shouldShow) {
                // Show the field
                if (newHiddenFields[field.field]) {
                  newFields[field.field] = newHiddenFields[field.field]
                  delete newHiddenFields[field.field]

                  if (!newFieldOrder.includes(field.field)) {
                    newFieldOrder.push(field.field)
                  }
                }
              } else {
                // Hide the field
                if (!newHiddenFields[field.field] && newFields[field.field]) {
                  newHiddenFields[field.field] = newFields[field.field]
                  delete newFields[field.field]
                }
              }
            }
          })

          // Update hidden fields and field order if they changed
          if (JSON.stringify(newHiddenFields) !== JSON.stringify(currentHiddenFields)) {
            setHiddenFields(newHiddenFields)
          }

          if (JSON.stringify(newFieldOrder) !== JSON.stringify(currentFieldOrder)) {
            setFieldOrder(newFieldOrder)
          }

          // Filter fields based on current field order
          return Object.fromEntries(newFieldOrder.filter((f) => newFields[f]).map((f) => [f, newFields[f]]))
        })
      })

      detachFunctions.current.push(detach)
    })

    return () => {
      detachFunctions.current.forEach((detach) => detach())
    }
  }, [rules, evaluateCondition, sdk.entry.fields]) // Removed hiddenFields and fieldOrder from dependencies

  return (
    <>
      <div style={{ padding: "2rem 0 4rem" }}>
        {Object.entries(fields).map(([fieldName, field]) => (
          <div key={fieldName} className={`${fieldName}`}>
            <FieldWrap fields={field}>{renderField(field)}</FieldWrap>
          </div>
        ))}
      </div>
    </>
  )
}

export default Entry

function renderField(field: any) {
  const type = field.type

  switch (type) {
    case "Array":
      if (field.items?.type !== "Symbol") {
        return <Field fields={field} />
      }

      // Check if the field has predefined options (validations with 'in' property)
      const hasPredefinedOptions = field.items?.validations?.[0]?.in && 
                                  Array.isArray(field.items.validations[0].in) && 
                                  field.items.validations[0].in.length > 0

      if (hasPredefinedOptions) {
        // Use Selector for fields with predefined options
        return (
          <>
            <Selector fields={field} />
          </>
        )
      } else {
        // Use default Contentful List feature for custom item entry
        return <Field fields={field} />
      }
    default:
      return <Field fields={field} />
  }
}
