import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { ConfigAppSDK } from '@contentful/app-sdk';
import React from "react";
import CreateRule from "components/CreateRule";
import ExcludedComponents from "components/ExcludedComponents";
import ViewRules from "components/ViewRules";

export interface AppInstallationParameters {
  rules?: {
    component: string;
    isEqualTo: boolean;
    ifField: string;
    condition: string;
    affectedFields: { field: string; action: "show" }[];
  }[];
  excludedComponents?: string[];
}

export default function ConfigurationScreen() {
  const sdk = useSDK<ConfigAppSDK>();
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [excludedComponents, setExcludedComponents] = useState<string[]>([]);
  const [rules, setRules] = useState<
    { component: string; ifField: string; isEqualTo: boolean; condition: string; affectedFields: { field: string; action: "show" }[] }[]
  >([]);
  const [currentRule, setCurrentRule] = useState<
    { component: string; ifField: string; isEqualTo: boolean; condition: string; affectedFields: { field: string; action: "show" }[] }
  >();
  const [whichComponent, setWhichComponent] = useState('all');
  const [isShown, setShown] = useState(false);

  // grab previously set rules from parameters
  useEffect(() => {
    if (parameters.excludedComponents) {
      setExcludedComponents(parameters.excludedComponents);
    }
    if (parameters.rules) {
      setRules(parameters.rules);
      console.log(parameters);
    }
  }, [parameters, sdk]);

  // get current parameters of app
  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }
      sdk.app.setReady();
    })();
  }, [sdk]);

  // get the content types in the app
  useEffect(() => {
    async function fetchContentTypes() {
      sdk.cma.contentType
      .getMany({ query: { limit: 1000 } })
      .then((response) =>
        setComponents(
          response.items.map((ct) => ({ id: ct.sys.id, name: ct.name }))
        )
      )
      .catch(console.error);
    }
    fetchContentTypes();
  }, [sdk]);

  // Fetch fields when a component is selected
  useEffect(() => {
    async function fetchFields() {
      if (!selectedComponent) return;
      sdk.cma.contentType
      .get({ contentTypeId: selectedComponent })
      .then((response) =>
        setFields(Object.values(response.fields.map((f) => f.id)))
      )
      .catch(console.error);
    }
    fetchFields();
  }, [selectedComponent, sdk]);

    const onConfigure = useCallback(async () => {
      const currentState = await sdk.app.getCurrentState();
      return {
        parameters,
        targetState: currentState,
      };
    }, [parameters, sdk]);
  
    useEffect(() => {
      sdk.app.onConfigure(() => onConfigure());
    }, [sdk, onConfigure]);

    // save config on rule changes
    useEffect(() => {
      saveConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [excludedComponents, rules])

  // Handle saving configuration
  const saveConfig = async () => {
    setParameters({
      excludedComponents,
      rules,
    });
  };

  /* Function to Add New Rule */
  const addRule = () => {
    setCurrentRule({
      component: "", // Start without a selected component
      ifField: "",
      isEqualTo: true,
      condition: "",
      affectedFields: [],
    });
  };
  
  // save rule to rules
  const handleSaveRule = () => {
    if (currentRule && currentRule.component && currentRule.ifField && currentRule.condition && currentRule.affectedFields.length > 0) {
      setRules((prev) => [...prev, currentRule]);
      setCurrentRule(undefined);
      setShown(false);
    } else {
      alert("Please complete all fields before saving.");
    }
  };
  
  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ padding: "1rem 0 2rem"}}>Configure Conditional Fields</h2>

      {/* View, Filter, and Add Rules */}
      <ViewRules 
        components={components} 
        excludedComponents={excludedComponents} 
        setWhichComponent={setWhichComponent} 
        whichComponent={whichComponent} 
        rules={rules} 
        setShown={setShown} 
        addRule={addRule} 
        setRules={setRules} 
      />
      
      {/* Create Rule Modal */}
      <CreateRule 
        isShown={isShown} 
        setShown={setShown} 
        currentRule={currentRule} 
        setCurrentRule={setCurrentRule} 
        components={components} 
        excludedComponents={excludedComponents} 
        fields={fields} 
        setSelectedComponent={setSelectedComponent} 
        handleSaveRule={handleSaveRule} 
      />

      {/* Excluded Components Selector */}
      <ExcludedComponents 
        components={components} 
        excludedComponents={excludedComponents} 
        setExcludedComponents={setExcludedComponents} 
      />
      
    </div>
  );
}
