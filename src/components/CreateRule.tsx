import { Button, Checkbox, Modal, Radio, Stack } from "@contentful/f36-components";
import React from "react";
import { DoneIcon } from '@contentful/f36-icons';
import { condition } from "locations/ConfigScreen";

interface CreateRuleProps {
  isShown: boolean;
  setShown: (shown: boolean) => void;
  currentRule: any;
  setCurrentRule: (rule: any) => void;
  components: any[];
  excludedComponents: any[];
  fields: any[];
  setSelectedComponent: (component: string) => void;
  handleSaveRule: () => void;
}

const conditionOptions = [
    "equal",
    "not equal",
    "contains",
    "not contains",
    "empty",
    "not empty"
  ] as const;

const CreateRule: React.FC<CreateRuleProps> = ({ isShown, setShown, currentRule, setCurrentRule, components, excludedComponents, fields, setSelectedComponent, handleSaveRule }) => {
    console.log(currentRule);
      
    return (
        <>
        <Modal onClose={() => {setShown(false); setCurrentRule(undefined)}} isShown={isShown}>
        {() => (
          <>
            <Modal.Header
              title={""}
              subtitle={""}
              onClose={() => setShown(false)}
            >
              <Stack flexDirection="column" alignItems="start" style={{width: "100%", gap: ".5rem"}}>
                <h2 style={{fontWeight: 700, fontSize: "1rem"}}>{currentRule && currentRule.component ? "Add Rule for " + currentRule.component.slice(0,1).toUpperCase() + currentRule.component.slice(1, currentRule.component.length) : "Add Rule"}</h2>
                <p>{currentRule ? 
                (currentRule.ifField && "If ") + currentRule.ifField + (currentRule.isEqualTo && " is " + currentRule.isEqualTo) + (currentRule.condition && " to " + currentRule.condition) + (currentRule.condition ? ", show " : "") + currentRule.affectedFields.map((af: { field: any; }) => af.field).join(", ") + (currentRule.affectedFields.length > 0 ? " fields" : "")
                : ""}</p>
              </Stack>
            </Modal.Header>
            <Modal.Content>
                {/* Display Rules - Users Fill Out Fields Sequentially */}
                {currentRule && (
                <Stack style={{ display:"flex", alignItems: "start", flexDirection: "column", position: "relative", height: "60vh" }}>
                    
                    {/* Component Selection (First Step) */}
                    <Stack flexDirection="column" alignItems="start">
                        <label style={{fontSize: "1rem", fontWeight: 700}}>Component:</label>
                        <select
                            value={currentRule.component || ""}
                            onChange={(e) => {
                                setSelectedComponent(e.target.value);
                                setCurrentRule((prev: {
                                    isEqualTo: condition; ifField: any; condition: any; affectedFields: any; }) => ({
                                ...prev,
                                component: e.target.value,
                                ifField: prev?.ifField || "",
                                isEqualTo: prev?.isEqualTo ?? "equal",
                                condition: prev?.condition || "",
                                affectedFields: prev?.affectedFields || [],
                                }))
                            }
                            }
                        >
                            <option value="">-- Select a component --</option>
                            {components.filter((comp: { id: any; }) => !excludedComponents.includes(comp.id))
                                .map((comp: { id: React.Key | readonly string[] | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }) => (
                                <option key={String(comp.id)} value={String(comp.id)}>
                                {comp.name}
                                </option>
                            ))}
                        </select>
                    </Stack>

                        {/* If Field Dropdown (Second Step) */}
                        {currentRule.component && (
                            <>
                                <Stack flexDirection="column" alignItems="start">
                                    <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>If field:</label>
                                    <select
                                        value={currentRule.ifField}
                                        onChange={(e) =>
                                            setCurrentRule((prev: {
                                                isEqualTo: condition; component: any; condition: any; affectedFields: any; }) => ({
                                            ...prev,
                                            component: prev?.component || "",
                                            ifField: e.target.value,
                                            isEqualTo: prev?.isEqualTo ?? "equal",
                                            condition: prev?.condition || "",
                                            affectedFields: prev?.affectedFields || [],
                                            }))
                                        }
                                    >
                                        <option value="">-- Select a field --</option>
                                        {fields.filter((f: any) => f.id !== "internalTitle").map((field: any) => (
                                            <option key={field.id} value={field.id}>
                                            {field.name}
                                            </option>
                                        ))}
                                    </select>
                                </Stack>
                            </>
                        )}

                        {currentRule.ifField && fields && (
                            <>
                                <Stack flexDirection="column" alignItems="start">
                                    <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>Condition:</label>
                                    <Stack flexDirection="row" alignItems="start">
                                    <select
                                        value={currentRule.isEqualTo}
                                        onChange={(e) => {
                                            setCurrentRule((prev: { component: any; ifField: any; condition: any; affectedFields: any; }) => ({
                                            ...prev,
                                            component: prev?.component || "",
                                            ifField: prev?.ifField || "",
                                            isEqualTo: e.target.value,
                                            condition: prev?.condition || "",
                                            affectedFields: prev?.affectedFields || [],
                                            }))
                                        }}
                                    >
                                        <option value="">-- Select a field --</option>
                                        {conditionOptions.map((field: any) => (
                                            <option key={field} value={field}>
                                            {field}
                                            </option>
                                        ))}
                                    </select>
                                    </Stack>  
                                </Stack>
                            </>
                        )}

                        {/* Condition Input (Third Step) */}
                        {currentRule.isEqualTo && currentRule.isEqualTo !== 'empty' && currentRule.isEqualTo !== 'not empty' && fields && (() => {
                        const selectedField = fields.find(
                            (field: any) => field.id === currentRule.ifField
                        );

                        console.log("Selected Field", selectedField);

                        return (
                            <Stack flexDirection="column" alignItems="start">
                            <label style={{ paddingTop: "1rem", fontSize: "1rem", fontWeight: 700 }}>
                                Condition:
                            </label>

                            {selectedField as Object && selectedField?.type === "Boolean" ? (
                                <>
                                <Radio
                                    value="true"
                                    onChange={() => {
                                        setCurrentRule((prev: { component: any; isEqualTo: any; ifField: any; condition: any; affectedFields: any; }) => ({
                                        ...prev,
                                        component: prev?.component || "",
                                        ifField: prev?.ifField || "",
                                        isEqualTo: prev?.isEqualTo ?? "equal",
                                        condition: "true",
                                        affectedFields: prev?.affectedFields || [],
                                        }))
                                    }}
                                    isChecked={currentRule.condition === "true"}
                                >
                                    True
                                </Radio>

                                <Radio
                                    value="false"
                                    onChange={() => {
                                        setCurrentRule((prev: { component: any; isEqualTo: any; ifField: any; condition: any; affectedFields: any; }) => ({
                                        ...prev,
                                        component: prev?.component || "",
                                        ifField: prev?.ifField || "",
                                        isEqualTo: prev?.isEqualTo ?? "equal",
                                        condition: "false",
                                        affectedFields: prev?.affectedFields || [],
                                        }))
                                    }}
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
                        })()}

                
                        {/* Fields to Show/Hide (Fourth Step) */}
                        {((currentRule.condition && fields && currentRule.isEqualTo) || ((!currentRule.condition && currentRule.isEqualTo === "empty") || (!currentRule.condition && currentRule.isEqualTo === "not empty"))) && (
                            <>
                            <Stack flexDirection="column" alignItems="start">
                                <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>Fields to show:</label>
                                <Stack flexDirection="row" alignItems="start">
                                    {fields
                                    .filter((f: any) => f.id !== currentRule.ifField && f.id !== "internalTitle")
                                    .map((field: any) => (
                                        <Checkbox
                                            key={field.id}
                                            value={field.id}
                                            id={field.id}
                                            isChecked={currentRule.affectedFields.some((af: { field: any; }) => af.field === field.id)} // ✅ Check if already selected
                                            onChange={(e) => {
                                                setCurrentRule((prev: { component: any; ifField: any; isEqualTo: any; condition: any; affectedFields: any; }) => {
                                                const updatedFields = e.target.checked
                                                    ? [...prev!.affectedFields, { field: field.id, action: "show" as "show" }] // ✅ Add selected field
                                                    : prev!.affectedFields.filter((af: { field: any; }) => af.field !== field.id); // ✅ Remove unselected field

                                                return {
                                                    ...prev,
                                                    component: prev?.component || "",
                                                    ifField: prev?.ifField || "",
                                                    isEqualTo: prev?.isEqualTo ?? "equal",
                                                    condition: prev?.condition || "",
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
                            </>
                        )}
                    <>
                        <Button style={{marginTop: "auto"}} isFullWidth isDisabled={currentRule.affectedFields.length === 0} variant="primary" startIcon={<DoneIcon />} onClick={handleSaveRule}>Save Rule</Button>
                    </>
                </Stack>
            )}
            </Modal.Content>
          </>
        )}
      </Modal>
     </>
    )
};

export default CreateRule;
