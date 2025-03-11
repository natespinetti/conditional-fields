import React, { useEffect, useRef, useState } from 'react';
import { EditorAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import Field from 'components/DefaultField';
import FieldWrap from 'components/FieldWrap';
import Selector from 'components/Selector';
import { Rule } from 'types';

const Entry = () => {
  const sdk = useSDK<EditorAppSDK>();
  const [fields, setFields] = useState<Record<string, any>>(() => {
    return Object.fromEntries(Object.entries(sdk.entry.fields).map(([key, value]) => [key, value]));
  });
  const [hiddenFields, setHiddenFields] = useState<Record<string, any>>({});
  const [fieldOrder, setFieldOrder] = useState<string[]>(Object.keys(sdk.entry.fields));
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    const entryFields = sdk.entry.fields;
    setFields(entryFields);
    console.log(sdk);
  }, [sdk]);

  useEffect(() => {
    if (sdk.parameters.installation.rules) {
      setRules(sdk.parameters.installation.rules);
    }
  }, [sdk]);

  const detachFunctions = useRef<(() => void)[]>([]);

  useEffect(() => {
    detachFunctions.current.forEach((detach) => detach());
    detachFunctions.current = [];
  
    const evaluateCondition = (rule: Rule, fieldValue: string): boolean => {
      switch (rule.isEqualTo) {
        case "equal":
          return fieldValue === rule.condition;
        case "not equal":
          return fieldValue !== rule.condition;
        case "contains":
          return fieldValue.includes(rule.condition);
        case "not contains":
          return !fieldValue.includes(rule.condition);
        case "empty":
          return fieldValue === "" || fieldValue === undefined || fieldValue === null;
        case "not empty":
          return fieldValue !== "" && fieldValue !== undefined && fieldValue !== null;
        default:
          // If the condition is a string, treat it like "equal"
          return fieldValue === rule.isEqualTo;
      }
    };
  
    rules.forEach((rule) => {
      const watchField = sdk.entry.fields[rule.ifField];
      if (!watchField) return;
  
      const detach = watchField.onValueChanged((value) => {
        const val = value?.toString() || "";
  
        const shouldApplyRule = evaluateCondition(rule, val);
        const shouldShow = shouldApplyRule;
        console.log(shouldShow);
  
        setFields((prevFields) => {
          let newFields = { ...prevFields };
  
          rule.affectedFields.forEach((field) => {
            if (field.action === "show") {
              if (shouldShow) {
                if (hiddenFields[field.field]) {
                  newFields[field.field] = hiddenFields[field.field];
  
                  setHiddenFields((prevHidden) => {
                    const newHidden = { ...prevHidden };
                    delete newHidden[field.field];
                    return newHidden;
                  });
  
                  setFieldOrder((prevOrder) => {
                    if (!prevOrder.includes(field.field)) {
                      const originalOrder = [...prevOrder, field.field].filter((f, i, arr) => arr.indexOf(f) === i);
                      return originalOrder;
                    }
                    return prevOrder;
                  });
                }
              } else {
                if (!hiddenFields[field.field]) {
                  setHiddenFields((prevHidden) => ({
                    ...prevHidden,
                    [field.field]: prevFields[field.field],
                  }));
                }
  
                delete newFields[field.field];
  
                setFieldOrder((prevOrder) =>
                  prevOrder.includes(field.field) ? prevOrder : [...prevOrder, field.field]
                );
              }
            }
          });
  
          return Object.fromEntries(
            fieldOrder
              .filter((f) => newFields[f])
              .map((f) => [f, newFields[f]])
          );
        });
      });
  
      detachFunctions.current.push(detach);
    });
  
    return () => {
      detachFunctions.current.forEach((detach) => detach());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, hiddenFields, fieldOrder]);

  return (
<>
    <div style={{padding: "2rem 0 4rem"}}>
      {Object.entries(fields).map(([fieldName, field]) => (
        <div key={fieldName} className={`${fieldName}`}>
          <FieldWrap fields={field}>
            {renderField(field)}
          </FieldWrap>
        </div>
      ))}
    </div>
</>
  );
};

export default Entry;

function renderField(field: any) {
  const type = field.type;

  switch (type) {
    case "Array":
      if (field.items?.type !== "Symbol") {
        return <Field fields={field} />; 
      }

      // String Array only
      return (
        <>
          <Selector fields={field} />
        </>
      );
    default:
      return (
            <Field fields={field} />
      );
  }
}
