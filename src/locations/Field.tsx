import React, { useEffect, useState } from 'react';
import { EntryFieldAPI, FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import DefaultField from 'components/DefaultField';
import { Note } from '@contentful/f36-components';
import { EditIcon } from '@contentful/f36-icons';
import { condition } from './ConfigScreen';
import { Rule } from './EntryEditor';

const Fields = () => {
  const sdk = useSDK<FieldAppSDK>();

  const [rules, setRules] = useState<
    {
      component: string;
      ifField: string;
      isEqualTo: condition;
      condition: string;
      affectedFields: { field: string; action: 'show' | 'hide' }[];
    }[]
  >([]);

  const [showIframe, setShowIframe] = useState(true);
  const [currentField, setCurrentField] = useState<EntryFieldAPI>();

  useEffect(() => {
      const entryFields = sdk.entry.fields;
      console.log(Object.values(entryFields).find((field) => field.id === sdk.field.id));
      setCurrentField(Object.values(entryFields).find((field) => field.id === sdk.field.id));
      console.log(sdk);
    }, [sdk]);

  useEffect(() => {
    if (sdk.parameters.installation.rules) {
      setRules(sdk.parameters.installation.rules);
    }
  }, [sdk]);
  
  useEffect(() => {
    const matchingRule = rules.find(rule =>
      rule.affectedFields.some(f => f.field === sdk.field.id)
    );
  
    console.log("Matching Rule:", matchingRule);
  
    if (!matchingRule) {
      // No rules target this field → show it.
      setShowIframe(true);
      return;
    }
  
    const watchField = sdk.entry.fields[matchingRule.ifField];
    console.log("Watch Field:", watchField);
  
    if (!watchField) return;
  
    // Move the condition evaluator into here
    const evaluateCondition = (rule: Rule, fieldValue: string): boolean => {
      switch (rule.isEqualTo) {
        case "equal":
          return fieldValue === rule.condition;
        case "not equal":
          return fieldValue !== rule.condition;
        case "contains":
          return fieldValue.includes(rule.condition);
        case "not contains":
          return !fieldValue.includes(rule.condition);
        case "empty":
          return fieldValue === "" || fieldValue === undefined || fieldValue === null;
        case "not empty":
          return fieldValue !== "" && fieldValue !== undefined && fieldValue !== null;
        default:
          // Fallback for custom string match
          return fieldValue === rule.isEqualTo;
      }
    };
  
    // Setup listener
    const detach = watchField.onValueChanged(value => {
      const val = value?.toString() || '';
  
      const shouldApplyRule = evaluateCondition(matchingRule, val);
      const shouldShow = shouldApplyRule;
  
      console.log("Should Show:", shouldShow);
  
      const affectedField = matchingRule.affectedFields.find(f => f.field === sdk.field.id);
  
      if (affectedField) {
        if (affectedField.action === 'show') {
          setShowIframe(shouldShow);
        } else if (affectedField.action === 'hide') {
          setShowIframe(!shouldShow);
  
          // Optional: If you need to physically hide the iframe element
          const iframe = window.parent.document.querySelector('iframe');
          if (iframe) {
            iframe.style.display = !shouldShow ? "none" : "block";
          }
        }
      }
    });
  
    // Cleanup listener on unmount or dependency change
    return () => {
      detach();
    };
  
  }, [rules, sdk]);
  

  return (
    <>
      {showIframe && currentField ? (
        <DefaultField fields={currentField} isSingle={true} />
      ) : (
        <Note variant="warning" icon={<EditIcon />} style={{ marginTop: "10px" }}>
            This field is being hidden by a conditional rule.
        </Note>
      )}
    </>
  );
};

export default Fields;
