import React, { useEffect, useRef, useState } from 'react';
import { EditorAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import Field from './Field';
import FieldWrap from 'components/FieldWrap';
import Selector from 'components/Selector';


const Entry = () => {
  const sdk = useSDK<EditorAppSDK>();
  const [fields, setFields] = useState<Record<string, any>>(() => {
    // ✅ Initialize all fields as visible at first
    return Object.fromEntries(Object.entries(sdk.entry.fields).map(([key, value]) => [key, value]));
  });

  const [hiddenFields, setHiddenFields] = useState<Record<string, any>>({});
  const [fieldOrder, setFieldOrder] = useState<string[]>(Object.keys(sdk.entry.fields)); // ✅ Store field order

    useEffect(() => {
      const entryFields = sdk.entry.fields;
      setFields(entryFields);
      console.log(entryFields);

    }, [sdk]);

    useEffect(() => {
      console.log(fields);

    }, [fields]);

    useEffect(() => {
      console.log(hiddenFields);

    }, [hiddenFields]);


    const [rules, setRules] = useState<
        { component: string; ifField: string; condition: string; affectedFields: { field: string; action: "show" | "hide" }[] }[]
    >([]);
  
    useEffect(() => {
      if (sdk.parameters.installation.rules) {
        setRules(sdk.parameters.installation.rules);
      }
    }, [sdk]);

    const detachFunctions = useRef<(() => void)[]>([]);

    useEffect(() => {
  
      // ✅ Clear previous listeners
      detachFunctions.current.forEach((detach) => detach());
      detachFunctions.current = [];
  
      rules.forEach((rule) => {
        const watchField = sdk.entry.fields[rule.ifField];
  
        if (!watchField) return;
  
        const detach = watchField.onValueChanged((value) => {
          console.log("🔄 Field Updated:", value);
          const val = value?.toString() || "";
  
          const shouldApplyRule = Array.isArray(rule.condition)
            ? rule.condition.includes(val)
            : rule.condition === val;
  
          console.log(`🔍 Should Apply Rule: ${shouldApplyRule}`);
  
          rule.affectedFields.forEach((field) => {
            setFields((prevFields) => {
              let newFields = { ...prevFields };
  
              if (shouldApplyRule) {
                if (field.action === "show") {
                  console.log(`✅ Restoring: ${field.field}`);
  
                  if (!hiddenFields[field.field]) {
                    console.warn(`❌ Field "${field.field}" not found in hiddenFields`);
                    return prevFields; // Prevent restoring twice
                  }
  
                  newFields = {
                    ...prevFields,
                    [field.field]: hiddenFields[field.field], // Restore from hiddenFields
                  };
  
                  setHiddenFields((prevHidden) => {
                    const newHidden = { ...prevHidden };
                    delete newHidden[field.field]; // Remove from hidden state
                    return newHidden;
                  });
  
                  // ✅ Restore field to its original position
                  setFieldOrder((prevOrder) => {
                    const newOrder = [...prevOrder, field.field].filter((f, i, arr) => arr.indexOf(f) === i);
                    console.log("🚀 Updated Field Order:", newOrder);
                    return newOrder;
                  });
  
                } else if (field.action === "hide") {
                  console.log(`🚫 Hiding: ${field.field}`);
  
                  if (hiddenFields[field.field]) return prevFields; // Prevent hiding twice
                  sdk.entry.fields[field.field].setValue(null);
                  setHiddenFields((prevHidden) => ({
                    ...prevHidden,
                    [field.field]: prevFields[field.field], // Store original object
                  }));
  
                  delete newFields[field.field]; // Remove field from state
  
                  setFieldOrder((prevOrder) =>
                    prevOrder.includes(field.field) ? prevOrder : [...prevOrder, field.field]
                  );
                }
              } else {
                // Opposite behavior: Hide if "show", Show if "hide"
                if (field.action === "show") {
                  console.log(`🚫 Hiding (Opposite): ${field.field}`);
  
                  if (hiddenFields[field.field]) return prevFields;
  
                  setHiddenFields((prevHidden) => ({
                    ...prevHidden,
                    [field.field]: prevFields[field.field],
                  }));
  
                  delete newFields[field.field];
  
                  setFieldOrder((prevOrder) =>
                    prevOrder.includes(field.field) ? prevOrder : [...prevOrder, field.field]
                  );
  
                } else if (field.action === "hide") {
                  console.log(`✅ Restoring (Opposite): ${field.field}`);
                  if (!hiddenFields[field.field]) {
                    console.warn(`❌ Field "${field.field}" not found in hiddenFields for restore`);
                    return prevFields;
                  }
  
                  newFields = {
                    ...prevFields,
                    [field.field]: hiddenFields[field.field], // Restore hidden field
                  };
  
                  sdk.entry.fields[field.field].setValue(null);
                  setHiddenFields((prevHidden) => {
                    const newHidden = { ...prevHidden };
                    delete newHidden[field.field];
                    return newHidden;
                  });
  
                  // ✅ Restore field to its original position
                  setFieldOrder((prevOrder) => {
                    const newOrder = [...prevOrder, field.field].filter((f, i, arr) => arr.indexOf(f) === i);
                    console.log("🚀 Updated Field Order:", newOrder);
                    return newOrder;
                  });
                }
              }
  
              console.log("📌 New Fields:", newFields);
              return Object.fromEntries(
                fieldOrder
                  .filter((f) => newFields[f]) // Only include existing fields
                  .map((f) => [f, newFields[f]])
              );
            });
          });
        });
  
        detachFunctions.current.push(detach);
      });
  
      return () => {
        detachFunctions.current.forEach((detach) => detach());
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rules, hiddenFields]);
    

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
    // case "Symbol": // Short text
    // case "Text": // Long text
    //   return (
    //     <>
    //   <Text fields={field} />
    //   </>);
    // case "RichText": // Long text
    //   return (
    //     <>
    //   <RichText fields={field} />
    //   </>);
    // case "Integer":
    // case "Number":
    //   return <Text fields={field} type='number' />;
    // case "Boolean":
    //   return (
    //     <RadioBtn fields={field} />
    //   );
    // // case "Date":
    // //   return <input type="date" value={value || ""} onChange={(e) => field.setValue(e.target.value)} />;
    // case "Location":
    //   return <p>Use the default editor</p>;
    // // case "Object":
    // //   return <pre>{JSON.stringify(value, null, 2)}</pre>;
    case "Array":
      // ✅ Ensure it's an array of strings (Symbols) and not references (Entries, Assets)
      if (field.items?.type !== "Symbol") {
        return <Field fields={field} />; // Prevents rendering invalid types
      }

      return (
        <>
          <Selector fields={field} />
        </>
      );
    case "Link":
      return <Field fields={field} />;
    // case "Object":
    //     return <p>Use the default editor</p>;
    default:
      return (
            <Field fields={field} />
      );
  }
}
