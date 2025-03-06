import React, { useEffect, useRef, useState } from 'react';
import { EditorAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import Field from './Field';
import FieldWrap from 'components/FieldWrap';
import Selector from 'components/Selector';

const Entry = () => {
  const sdk = useSDK<EditorAppSDK>();
  const [fields, setFields] = useState<Record<string, any>>(() => {
    return Object.fromEntries(Object.entries(sdk.entry.fields).map(([key, value]) => [key, value]));
  });
  const [hiddenFields, setHiddenFields] = useState<Record<string, any>>({});
  const [fieldOrder, setFieldOrder] = useState<string[]>(Object.keys(sdk.entry.fields));
  const [rules, setRules] = useState<
    { component: string; ifField: string; isEqualTo: Boolean; condition: string; affectedFields: { field: string; action: "show" | "hide" }[] }[]
  >([]);

  useEffect(() => {
    const entryFields = sdk.entry.fields;
    setFields(entryFields);

  }, [sdk]);

  useEffect(() => {
    if (sdk.parameters.installation.rules) {
      setRules(sdk.parameters.installation.rules);
    }
  }, [sdk]);

  const detachFunctions = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Clear previous listeners
    detachFunctions.current.forEach((detach) => detach());
    detachFunctions.current = [];
  
    // watch the "If" field for changes
    rules.forEach((rule) => {
      const watchField = sdk.entry.fields[rule.ifField];
  
      if (!watchField) return;
  
      const detach = watchField.onValueChanged((value) => {
        const val = value?.toString() || "";
  
        // check condition
        const shouldApplyRule = Array.isArray(rule.condition)
          ? rule.condition.includes(val)
          : rule.condition === val;
  
        // equal or not equal to
        const shouldShow = rule.isEqualTo ? shouldApplyRule : !shouldApplyRule;
    
        // apply rule and rerender fields
        setFields((prevFields) => {
          let newFields = { ...prevFields };
  
          // show/hide affected fields
          rule.affectedFields.forEach((field) => {
            if (field.action === "show") {
              if (shouldShow) {
                // Restore field when condition is met
                if (hiddenFields[field.field]) {  
                  newFields[field.field] = hiddenFields[field.field];
  
                  setHiddenFields((prevHidden) => {
                    const newHidden = { ...prevHidden };
                    delete newHidden[field.field];
                    return newHidden;
                  });
  
                  // Maintain original field order
                  setFieldOrder((prevOrder) => {
                    if (!prevOrder.includes(field.field)) {
                      const originalOrder = [...prevOrder, field.field].filter((f, i, arr) => arr.indexOf(f) === i);
                      console.log("🚀 Updated Field Order:", originalOrder);
                      return originalOrder;
                    }
                    return prevOrder;
                  });
                }
              } else {
                // Hide field when condition is NOT met  
                if (!hiddenFields[field.field]) {
                  setHiddenFields((prevHidden) => ({
                    ...prevHidden,
                    [field.field]: prevFields[field.field],
                  }));
                }
  
                delete newFields[field.field]; // Remove field from visible fields
  
                // Keep field order so it can be restored in the right place
                setFieldOrder((prevOrder) => prevOrder.includes(field.field) ? prevOrder : [...prevOrder, field.field]);
              }
            }
          });
  
          return Object.fromEntries(
            fieldOrder
              .filter((f) => newFields[f]) // Ensure only visible fields are kept in order
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
