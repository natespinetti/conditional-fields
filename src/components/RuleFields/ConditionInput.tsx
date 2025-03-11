import { Radio, Stack } from "@contentful/f36-components";
import React from "react";

interface ConditionInputProps {
    fields: any[];
    currentRule: any;
    setCurrentRule: (rule: any) => void;
  }
  
  export const ConditionInput: React.FC<ConditionInputProps> = ({
    fields,
    currentRule,
    setCurrentRule
  }) => {
    const selectedField = fields.find((field: any) => field.id === currentRule.ifField);
  
    if (!selectedField || currentRule.isEqualTo === "empty" || currentRule.isEqualTo === "not empty") {
      return null;
    }
  
    return (
      <Stack flexDirection="column" alignItems="start">
        <label style={{ paddingTop: ".5rem", fontSize: "1rem", fontWeight: 700 }}>
          Value:
        </label>
  
        {selectedField.type === "Boolean" ? (
          <>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Radio
                value="true"
                onChange={() =>
                    setCurrentRule((prev: any) => ({
                    ...prev,
                    condition: "true",
                    }))
                }
                isChecked={currentRule.condition === "true"}
                >
                True
                </Radio>
                <Radio
                value="false"
                onChange={() =>
                    setCurrentRule((prev: any) => ({
                    ...prev,
                    condition: "false",
                    }))
                }
                isChecked={currentRule.condition === "false"}
                >
                False
                </Radio>
            </div>
          </>
        ) : (
          <input
            type="text"
            value={currentRule.condition}
            style={{ borderRadius: "6px", padding: ".25rem .5rem"}}
            onChange={(e) =>
              setCurrentRule((prev: any) => ({
                ...prev,
                condition: e.target.value,
              }))
            }
          />
        )}
      </Stack>
    );
  };
  