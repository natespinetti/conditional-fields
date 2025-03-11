import { Stack } from "@contentful/f36-components";
import React from "react";

interface IfFieldSelectorProps {
    fields: any[];
    currentIfField: string;
    setCurrentRule: (rule: any) => void;
  }
  
  export const IfFieldSelector: React.FC<IfFieldSelectorProps> = ({
    fields,
    currentIfField,
    setCurrentRule
  }) => (
    <Stack flexDirection="column" alignItems="start">
      <label style={{ paddingTop: ".5rem", fontSize: "1rem", fontWeight: 700 }}>If field:</label>
      <select
        value={currentIfField}
        style={{ borderRadius: "6px", padding: ".25rem .5rem"}}
        onChange={(e) =>
          setCurrentRule((prev: any) => ({
            ...prev,
            ifField: e.target.value,
          }))
        }
      >
        <option value="">-- Select a field --</option>
        {fields
          .filter((f: any) => f.id !== "internalTitle")
          .map((field: any) => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
      </select>
    </Stack>
  );
  