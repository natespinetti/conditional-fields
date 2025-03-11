import { Button, Paragraph, Radio, Stack } from "@contentful/f36-components";
import React from "react";
import { CloseIcon, PlusIcon } from '@contentful/f36-icons';
import { ViewRulesProps } from "types";

const ViewRules: React.FC<ViewRulesProps> = ({ components, excludedComponents, setWhichComponent, whichComponent, rules, setShown, addRule, setRules }) => {
    
    return (
        <>
        <Stack flexDirection="column" alignItems="start" style={{ borderRadius: "12px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", padding: "20px", border: "1px solid #ddd", marginBottom: "20px" }}>
            <Stack style={{display: "grid", gridTemplateColumns: "auto auto", gap: "2rem", justifyContent: "space-between", width: "100%", alignItems: "start"}}>
                <Stack flexDirection="row" style={{ flexWrap: "wrap"}}>
                    <label>View rules for:</label>      
                    <Radio 
                    value="all"
                    onChange={() => {
                        setWhichComponent("all");
                    }}
                    isChecked={whichComponent === 'all'}
                    >
                    All rules
                    </Radio>
                    {components
                    .filter((comp) => !excludedComponents.includes(comp.id))
                    .map((comp, idx) => (
                        <Radio
                            key={idx} 
                            value={comp.id}
                            onChange={() => {
                            setWhichComponent(comp.id);
                            }}
                            isChecked={whichComponent === comp.id}
                        >
                            {comp.name}
                        </Radio>
                    ))}
                </Stack>
                <Button variant="primary" startIcon={<PlusIcon />} onClick={() => {setShown(true); addRule()}}>Add Rule</Button>
            </Stack>

            {rules
                .filter((rule) => {
                // Return all rules if "all" is selected
                if (whichComponent === "all") return true;

                // Find the matching component
                const matchingComponent = components.find((comp) => comp.id === rule.component);
                
                // Ensure it matches whichComponent and is not excluded
                return matchingComponent && matchingComponent.id === whichComponent && !excludedComponents.includes(matchingComponent.id);
                })
                .map((rule, index) => (
                <Stack key={index} flexDirection="column" alignItems="start" style={{ borderTop: "1px solid #ddd", paddingTop: "1rem", marginBottom: "10px", width: "100%" }}>
                    <Stack flexDirection="row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ borderLeft: "2px solid black", paddingLeft: "1rem" }} key={index}>
                        <div style={{ fontWeight: 700, fontSize: "16px", paddingBottom: ".5rem"}}>Rule for {rule.component} component</div>
                        <Paragraph style={{ marginBottom:".25rem" }}>If <strong>{rule.ifField}</strong> is <strong>{rule.isEqualTo}</strong>{rule.condition && " to "}<strong>{rule.condition}</strong>, {rule.affectedFields.map((details: any, idx: any) => {
                            const total = rule.affectedFields.length;
                            const separator = idx === total - 2 ? " and " : idx < total - 2 ? ", " : ""; // Adds correct separator

                            return (
                                <span key={idx}>
                                    <strong>{details.action}</strong> the <strong>{details.field}</strong> field{separator}
                                </span>
                            );
                            })}
                        </Paragraph>
                        </div>
                        
                        <Button variant="secondary" startIcon={<CloseIcon />} onClick={() => setRules((prev) => prev.filter((_: any, i: number) => i !== index))}>
                        Remove Rule
                        </Button>
                    </Stack>
                </Stack>
            ))}
        </Stack>
     </>
    )
};

export default ViewRules;
