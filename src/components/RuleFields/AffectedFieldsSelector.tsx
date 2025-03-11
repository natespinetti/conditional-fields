import { Stack, Checkbox } from "@contentful/f36-components";
import React from "react";

interface AffectedFieldsSelectorProps {
    fields: any[];
    currentRule: any;
    setCurrentRule: (rule: any) => void;
  }
  
  export const AffectedFieldsSelector: React.FC<AffectedFieldsSelectorProps> = ({
    fields,
    currentRule,
    setCurrentRule
  }) => {
    const shouldShow =
      (currentRule.condition && currentRule.isEqualTo) ||
      ((!currentRule.condition && currentRule.isEqualTo === "empty") ||
        (!currentRule.condition && currentRule.isEqualTo === "not empty"));
  
    if (!shouldShow) return null;
  
    return (
      <Stack flexDirection="column" alignItems="start">
        <label style={{ paddingTop: "1rem", fontSize: "1rem", fontWeight: 700 }}>Fields to show:</label>
        <Stack flexDirection="row" alignItems="start">
          {fields
            .filter((f: any) => f.id !== currentRule.ifField && f.id !== "internalTitle")
            .map((field: any) => (
              <Checkbox
                key={field.id}
                value={field.id}
                id={field.id}
                isChecked={currentRule.affectedFields.some((af: any) => af.field === field.id)}
                onChange={(e) => {
                  setCurrentRule((prev: any) => {
                    const updatedFields = e.target.checked
                      ? [...prev.affectedFields, { field: field.id, action: "show" }]
                      : prev.affectedFields.filter((af: any) => af.field !== field.id);
  
                    return {
                      ...prev,
                      affectedFields: updatedFields,
                    };
                  });
                }}
              >
                {field.name}
              </Checkbox>
            ))}
        </Stack>
      </Stack>
    );
  };
  