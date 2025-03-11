import { Stack } from "@contentful/f36-components";
import React from "react";

interface ConditionSelectorProps {
    currentIsEqualTo: string;
    setCurrentRule: (rule: any) => void;
  }

  const conditionOptions = [
    "equal",
    "not equal",
    "contains",
    "not contains",
    "empty",
    "not empty"
  ] as const;
  
  export const ConditionSelector: React.FC<ConditionSelectorProps> = ({
    currentIsEqualTo,
    setCurrentRule
  }) => (
    <Stack flexDirection="column" alignItems="start">
      <label style={{ paddingTop: ".5rem", fontSize: "1rem", fontWeight: 700 }}>Condition:</label>
      <select
        value={currentIsEqualTo}
        style={{ borderRadius: "6px", padding: ".25rem .5rem"}}
        onChange={(e) =>
          setCurrentRule((prev: any) => ({
            ...prev,
            isEqualTo: e.target.value,
          }))
        }
      >
        <option value="">-- Select a condition --</option>
        {conditionOptions.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>
    </Stack>
  );
  