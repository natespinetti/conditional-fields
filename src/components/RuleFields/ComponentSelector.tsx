import { Stack } from "@contentful/f36-components";
import React from "react";

interface ComponentSelectorProps {
    components: any[];
    excludedComponents: any[];
    currentComponent: string;
    setSelectedComponent: (component: string) => void;
    setCurrentRule: (rule: any) => void;
  }
  
  export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
    components,
    excludedComponents,
    currentComponent,
    setSelectedComponent,
    setCurrentRule
  }) => (
    <Stack flexDirection="column" alignItems="start">
      <label style={{ fontSize: "1rem", fontWeight: 700 }}>Component:</label>
      <select
        value={currentComponent || ""}
        style={{ borderRadius: "6px", padding: ".25rem .5rem"}}
        onChange={(e) => {
          setSelectedComponent(e.target.value);
          setCurrentRule((prev: any) => ({
            ...prev,
            component: e.target.value,
          }));
        }}
      >
        <option value="">-- Select a component --</option>
        {components
          .filter((comp: any) => !excludedComponents.includes(comp.id))
          .map((comp: any) => (
            <option key={String(comp.id)} value={String(comp.id)}>
              {comp.name}
            </option>
          ))}
      </select>
    </Stack>
  );
  