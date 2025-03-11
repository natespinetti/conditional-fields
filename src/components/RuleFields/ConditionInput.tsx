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
        <label style={{ paddingTop: "1rem", fontSize: "1rem", fontWeight: 700 }}>
          Condition:
        </label>
  
        {selectedField.type === "Boolean" ? (
          <>
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
          </>
        ) : (
          <input
            type="text"
            value={currentRule.condition}
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
  