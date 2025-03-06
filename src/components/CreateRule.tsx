import { Button, Checkbox, Modal, Radio, Stack } from "@contentful/f36-components";
import React from "react";
import { DoneIcon } from '@contentful/f36-icons';

interface CreateRuleProps {
  isShown: boolean;
  setShown: (shown: boolean) => void;
  currentRule: any;
  setCurrentRule: (rule: any) => void;
  components: any[];
  excludedComponents: any[];
  fields: string[];
  setSelectedComponent: (component: string) => void;
  handleSaveRule: () => void;
}

const CreateRule: React.FC<CreateRuleProps> = ({ isShown, setShown, currentRule, setCurrentRule, components, excludedComponents, fields, setSelectedComponent, handleSaveRule }) => {

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
                (currentRule.ifField ? "If " : "") + currentRule.ifField + (currentRule.ifField ? currentRule.isEqualTo ? " is equal to " : " is not equal to ": "") + currentRule.condition + (currentRule.condition ? " then show " : "") + currentRule.affectedFields.map((af: { field: any; }) => af.field).join(", ") + (currentRule.affectedFields.length > 0 ? " fields" : "")
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
                                    isEqualTo: boolean; ifField: any; condition: any; affectedFields: any; }) => ({
                                ...prev,
                                component: e.target.value,
                                ifField: prev?.ifField || "",
                                isEqualTo: prev?.isEqualTo ?? true,
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
                                                isEqualTo: boolean; component: any; condition: any; affectedFields: any; }) => ({
                                            ...prev,
                                            component: prev?.component || "",
                                            ifField: e.target.value,
                                            isEqualTo: prev?.isEqualTo ?? true,
                                            condition: prev?.condition || "",
                                            affectedFields: prev?.affectedFields || [],
                                            }))
                                        }
                                    >
                                        <option value="">-- Select a field --</option>
                                        {fields.filter((f: string) => f !== "internalTitle").map((field: string) => (
                                            <option key={field} value={field}>
                                            {field}
                                            </option>
                                        ))}
                                    </select>
                                </Stack>
                            </>
                        )}

                        {currentRule.ifField && (
                            <>
                                <Stack flexDirection="column" alignItems="start">
                                    <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>Is equal to:</label>
                                    <Stack flexDirection="row" alignItems="start">
                                        <Radio 
                                            value="is"
                                            onChange={() => {
                                                setCurrentRule((prev: { component: any; ifField: any; condition: any; affectedFields: any; }) => ({
                                                ...prev,
                                                component: prev?.component || "",
                                                ifField: prev?.ifField || "",
                                                isEqualTo: true,
                                                condition: prev?.condition || "",
                                                affectedFields: prev?.affectedFields || [],
                                                }))
                                            }}
                                            isChecked={currentRule.isEqualTo === true}
                                        >
                                            Is equal to
                                        </Radio>
                                        <Radio 
                                            value="not"
                                            onChange={() => {
                                                setCurrentRule((prev: { component: any; ifField: any; condition: any; affectedFields: any; }) => ({
                                                ...prev,
                                                component: prev?.component || "",
                                                ifField: prev?.ifField || "",
                                                isEqualTo: false,
                                                condition: prev?.condition || "",
                                                affectedFields: prev?.affectedFields || [],
                                                }))
                                            }}
                                            isChecked={currentRule.isEqualTo === false}
                                        >
                                            Is not equal to
                                        </Radio>
                                    </Stack>  
                                </Stack>
                            </>
                        )}

                        {/* Condition Input (Third Step) */}
                        {currentRule.ifField && (
                            <>
                                <Stack flexDirection="column" alignItems="start">
                                    <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>Condition:</label>
                                    <input
                                        type="text"
                                        value={currentRule.condition}
                                        onChange={(e) =>
                                            setCurrentRule((prev: { isEqualTo: any; component: any; ifField: any; affectedFields: any; }) => ({
                                            ...prev,
                                            component: prev?.component || "",
                                            ifField: prev?.ifField || "",
                                            isEqualTo: prev?.isEqualTo ?? true,
                                            condition: e.target.value,
                                            affectedFields: prev?.affectedFields || [],
                                            }))
                                        }
                                    />
                                </Stack>
                            </>
                        )}

                        {/* Fields to Show/Hide (Fourth Step) */}
                        {currentRule.condition && (
                            <>
                            <Stack flexDirection="column" alignItems="start">
                                <label style={{paddingTop: "1rem", fontSize: "1rem", fontWeight: 700}}>Fields to show:</label>
                                <Stack flexDirection="row" alignItems="start">
                                    {fields
                                    .filter((field: string) => field !== currentRule.ifField && field !== "internalTitle")
                                    .map((field: string) => (
                                        <Checkbox
                                            key={field}
                                            value={field}
                                            id={field}
                                            isChecked={currentRule.affectedFields.some((af: { field: any; }) => af.field === field)} // ✅ Check if already selected
                                            onChange={(e) => {
                                                setCurrentRule((prev: { component: any; ifField: any; isEqualTo: any; condition: any; affectedFields: any; }) => {
                                                const updatedFields = e.target.checked
                                                    ? [...prev!.affectedFields, { field, action: "show" as "show" }] // ✅ Add selected field
                                                    : prev!.affectedFields.filter((af: { field: any; }) => af.field !== field); // ✅ Remove unselected field

                                                return {
                                                    ...prev,
                                                    component: prev?.component || "",
                                                    ifField: prev?.ifField || "",
                                                    isEqualTo: prev?.isEqualTo ?? true,
                                                    condition: prev?.condition || "",
                                                    affectedFields: updatedFields,
                                                };
                                                });
                                            }}
                                        >
                                            {field}
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
