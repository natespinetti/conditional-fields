import { Checkbox, Stack } from "@contentful/f36-components";
import React from "react";

interface ExcludedComponentsProps {
    components: any[];
    excludedComponents: string[];
    setExcludedComponents: (arg0: (prev: any) => any) => void;
  }
  
  const ExcludedComponents: React.FC<ExcludedComponentsProps> = ({ components, excludedComponents, setExcludedComponents }) => {
    
    return (
        <>
        <Stack style={{ borderRadius: "12px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", padding: "20px", border: "1px solid #ddd", marginBottom: "20px" }}>
            <label>Select components to exclude:</label>
            {components.map((comp: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                <Checkbox
                    key={comp.id}
                    value={String(comp.id)}
                    id={String(comp.id)}
                    isChecked={excludedComponents.includes(String(comp.id))} // ✅ Control checked state
                    onChange={(e) => {
                        setExcludedComponents((prev: any[]) =>
                        e.target.checked
                            ? [...prev, comp.id] // ✅ Add if checked
                            : prev.filter((id: any) => id !== comp.id) // ✅ Remove if unchecked
                        );
                    }}
                >
                    {comp.name}
                </Checkbox>
            ))}
        </Stack>
     </>
    )
};

export default ExcludedComponents;
