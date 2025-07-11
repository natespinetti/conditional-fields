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
  const [rules, setRules] = useState<Rule[]>([])
  const [visibleFields, setVisibleFields] = useState<string[]>(Object.keys(sdk.entry.fields));

  // Use refs to store the latest values without triggering re-renders
  const detachFunctions = useRef<(() => void)[]>([])

  const evaluateCondition = useCallback((rule: Rule, fieldValue: any): boolean => {
    // Normalize fieldValue for comparison
    let value = fieldValue;
    if (Array.isArray(fieldValue) && fieldValue.length === 1) {
      value = fieldValue[0];
    }
    if (value === undefined || value === null) value = "";

    switch (rule.isEqualTo) {
      case "equal":
        return value === rule.condition;
      case "not equal":
        return value !== rule.condition;
      case "contains":
        return Array.isArray(fieldValue)
          ? fieldValue.includes(rule.condition)
          : (value + "").includes(rule.condition);
      case "not contains":
        return Array.isArray(fieldValue)
          ? !fieldValue.includes(rule.condition)
          : !(value + "").includes(rule.condition);
      case "empty":
        return value === "" || value === undefined || value === null;
      case "not empty":
        return value !== "" && value !== undefined && value !== null;
      default:
        return value === rule.isEqualTo;
    }
  }, []);

  // Aggregate rule evaluation for field visibility
  const evaluateAllRules = useCallback(() => {
    const fieldsToShow = new Set<string>();

    // For each rule, check if its condition is met
    rules.forEach((rule) => {
      const fieldValue = sdk.entry.fields[rule.ifField]?.getValue();
      const conditionMet = evaluateCondition(rule, fieldValue);
      console.log(
        `Rule for field ${rule.ifField}: value=${JSON.stringify(fieldValue)}, condition=${rule.isEqualTo} ${rule.condition}, met=${conditionMet}`
      );
      rule.affectedFields.forEach((af) => {
        if (conditionMet && af.action === "show") {
          fieldsToShow.add(af.field);
        }
      });
    });

    // Always show fields not affected by any rule
    Object.keys(sdk.entry.fields).forEach((fieldName) => {
      const isAffected = rules.some((rule) =>
        rule.affectedFields.some((af) => af.field === fieldName)
      );
      if (!isAffected) {
        fieldsToShow.add(fieldName);
      }
    });

    setVisibleFields(Array.from(fieldsToShow));
  }, [rules, sdk.entry.fields, evaluateCondition]);

  useEffect(() => {
    // Detach previous listeners
    detachFunctions.current.forEach((detach) => detach());
    detachFunctions.current = [];

    // Listen to all fields that are used in any rule
    const fieldsToWatch = Array.from(
      new Set(rules.map((rule) => rule.ifField))
    );

    fieldsToWatch.forEach((fieldId) => {
      const field = sdk.entry.fields[fieldId];
      if (!field) return;
      const detach = field.onValueChanged(() => {
        evaluateAllRules();
      });
      detachFunctions.current.push(detach);
    });

    // Initial evaluation
    evaluateAllRules();

    return () => {
      detachFunctions.current.forEach((detach) => detach());
    };
  }, [rules, sdk.entry.fields, evaluateAllRules]);

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

  return (
    <>
      <div style={{ padding: "2rem 0 4rem" }}>
        {Object.entries(fields)
          .filter(([fieldName]) => visibleFields.includes(fieldName))
          .map(([fieldName, field]) => (
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
