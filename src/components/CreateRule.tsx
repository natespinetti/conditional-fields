import { Button, Modal, Stack } from "@contentful/f36-components";
import React from "react";
import { DoneIcon } from '@contentful/f36-icons';
import { AffectedFieldsSelector } from "./RuleFields/AffectedFieldsSelector";
import { ComponentSelector } from "./RuleFields/ComponentSelector";
import { ConditionInput } from "./RuleFields/ConditionInput";
import { ConditionSelector } from "./RuleFields/ConditionSelector";
import { IfFieldSelector } from "./RuleFields/IfFieldSelector";
import { CreateRuleProps } from "types";

const CreateRule: React.FC<CreateRuleProps> = ({ isShown, setShown, currentRule, setCurrentRule, components, excludedComponents, fields, setSelectedComponent, handleSaveRule }) => {
      
    return (
        <>
        <Modal onClose={() => { setShown(false); setCurrentRule(undefined); }} isShown={isShown}>
        {() => (
            <>
            <Modal.Header
                title={""}
                subtitle={""}
                onClose={() => setShown(false)}
            >
                <Stack flexDirection="column" alignItems="start" style={{width: "100%", gap: ".5rem", minHeight: "48px"}}>
                    <h2 style={{fontWeight: 700, fontSize: "1rem"}}>{currentRule && currentRule.component ? "Add Rule for " + currentRule.component.slice(0,1).toUpperCase() + currentRule.component.slice(1, currentRule.component.length) : "Add Rule"}</h2>
                    <p>{currentRule ? 
                    (currentRule.ifField && "If ") + currentRule.ifField + (currentRule.isEqualTo && " is " + currentRule.isEqualTo) + (currentRule.condition && " to " + currentRule.condition) + (currentRule.condition ? ", show " : "") + currentRule.affectedFields.map((af: { field: any; }) => af.field).join(", ") + (currentRule.affectedFields.length > 0 ? " fields" : "")
                    : ""}</p>
                </Stack>
            </Modal.Header>

            <Modal.Content>
                {currentRule && (
                    <Stack style={{ display: "flex", alignItems: "start", flexDirection: "column", position: "relative", height: "60vh" }}>
                        <ComponentSelector
                            components={components}
                            excludedComponents={excludedComponents}
                            currentComponent={currentRule.component}
                            setSelectedComponent={setSelectedComponent}
                            setCurrentRule={setCurrentRule}
                        />

                        {currentRule.component && (
                            <IfFieldSelector
                                fields={fields}
                                currentIfField={currentRule.ifField}
                                setCurrentRule={setCurrentRule}
                            />
                        )}

                        {currentRule.ifField && (
                            <ConditionSelector
                                currentIsEqualTo={currentRule.isEqualTo}
                                setCurrentRule={setCurrentRule}
                            />
                        )}

                        {currentRule.isEqualTo && currentRule.isEqualTo !== 'empty' && currentRule.isEqualTo !== 'not empty' && fields && (() => (
                            <ConditionInput
                            fields={fields}
                            currentRule={currentRule}
                            setCurrentRule={setCurrentRule}
                            />
                        ))()}

                        <AffectedFieldsSelector
                            fields={fields}
                            currentRule={currentRule}
                            setCurrentRule={setCurrentRule}
                        />

                        <Button
                            style={{ marginTop: "auto" }}
                            isFullWidth
                            isDisabled={currentRule.affectedFields.length === 0}
                            variant="primary"
                            startIcon={<DoneIcon />}
                            onClick={handleSaveRule}
                        >
                        Save Rule
                        </Button>
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
