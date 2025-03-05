import React, { useEffect, useRef, useState } from 'react';
import { Paragraph } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';


const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const [rules, setRules] = useState<
          { component: string; ifField: string; condition: string; affectedFields: { field: string; action: "show" | "hide" }[] }[]
  >([]);
console.log(sdk);
      useEffect(() => {
        if (sdk.parameters.installation.rules) {
          setRules(sdk.parameters.installation.rules);
        }
      }, [sdk]);
  
        // const detachFunctions = useRef<(() => void)[]>([]);
      
        // useEffect(() => {
        //   // Clean up old listeners
        //   detachFunctions.current.forEach((detach) => detach());
        //   detachFunctions.current = [];
      
        //   // For each rule, watch the "ifField"
        //   rules.forEach((rule) => {
        //     const watchField = sdk.entry.fields[rule.ifField];
        //     if (!watchField) return;
      
        //     const detach = watchField.onValueChanged((value) => {
        //       const val = value?.toString() ?? '';
        //       // Check if the current field value meets the rule's condition
        //       const shouldApplyRule = Array.isArray(rule.condition)
        //         ? rule.condition.includes(val)
        //         : rule.condition === val;
      
        //       // For each affected field in the rule, do something if the condition is true or false
        //       rule.affectedFields.forEach((field) => {
        //         if (shouldApplyRule) {
        //           if (field.action === 'show') {
        //             // Instead of "un-hiding" in the DOM, show a success notification
        //             sdk.notifier.success(
        //               `Showing field "${field.field}" because "${rule.ifField}" = "${val}"`
        //             );
        //             // If you want to do something programmatic, you can do it here
        //             // e.g. sdk.entry.fields[field.field].setValue('default value');
      
        //           } else if (field.action === 'hide') {
        //             // Instead of removing from the DOM, show a warning
        //             sdk.notifier.warning(
        //               `Hiding field "${field.field}" because "${rule.ifField}" = "${val}"`
        //             );
        //             // Optionally, clear the field's value
        //             sdk.entry.fields[field.field]?.setValue(null);
        //           }
        //         } else {
        //           // Condition NOT met. Perform the "opposite" action, or show a different message
        //           if (field.action === 'show') {
        //             // If "action" was show, maybe we warn that we are skipping it now
        //             sdk.notifier.warning(
        //                `Hiding field "${field.field}" because "${rule.ifField}" = "${val}"`
        //             );
        //             // e.g. sdk.entry.fields[field.field]?.setValue(null);
        //           } else if (field.action === 'hide') {
        //             // If "action" was hide, we can "restore" or do nothing
        //             sdk.notifier.success(
        //               `Showing field "${field.field}" because "${rule.ifField}" = "${val}"`
        //             );
        //           }
        //         }
        //       });
        //     });
      
        //     detachFunctions.current.push(detach);
        //   });
      
        //   return () => {
        //     // Detach all watchers on unmount or when rules change
        //     detachFunctions.current.forEach((detach) => detach());
        //   };
        // }, [rules, sdk]);
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();

  return (
    <>
      <Paragraph><strong>Rules for {sdk.contentType.name}</strong></Paragraph>
      {sdk.parameters.installation.rules.map((rule: any, index: any) => (
        <div style={{ borderLeft: "2px solid black", paddingLeft: "10px", marginBottom: "10px" }} key={index}>
          <Paragraph>If <strong>{rule.ifField}</strong> is <strong>{rule.condition}</strong>, {rule.affectedFields.map((details: any, idx: any) => (
            <span key={idx}><strong>{details.action}</strong> the <strong>{details.field}</strong> field</span>
          ))}</Paragraph>
        </div>
      ))}
    </>
  );
};

export default Sidebar;
