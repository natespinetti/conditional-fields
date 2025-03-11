import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { ConfigAppSDK } from '@contentful/app-sdk';
import React from "react";
import CreateRule from "components/CreateRule";
import ExcludedComponents from "components/ExcludedComponents";
import ViewRules from "components/ViewRules";
import { AppInstallationParameters, Component, Fields, Rule } from "types";

export default function ConfigurationScreen() {
  const sdk = useSDK<ConfigAppSDK>();
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields[]>([]);
  const [excludedComponents, setExcludedComponents] = useState<string[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [currentRule, setCurrentRule] = useState<Rule | undefined>();
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
      .then((response) =>{
        setComponents(
          response.items.map((ct) => ({ id: ct.sys.id, name: ct.name }))
        )
        console.log(response.items)}
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
      .then((response) =>{
        setFields(Object.values(response.fields.map((f) => ({id: f.id, name: f.name, type: f.type}))));
      console.log(response.fields);
      }
      )
      .catch(console.error);
    }
    fetchFields();
  }, [selectedComponent, sdk]);

  const DEFAULT_SIDEBAR = [
    { widgetId: "publication-widget", widgetNamespace: "sidebar-builtin" },
    { widgetId: "content-preview-widget", widgetNamespace: "sidebar-builtin" },
    { widgetId: "incoming-links-widget", widgetNamespace: "sidebar-builtin" },
    { widgetId: "translation-widget", widgetNamespace: "sidebar-builtin" },
    { widgetId: "versions-widget", widgetNamespace: "sidebar-builtin" },
  ];
  
  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState();
    const { space, environment } = sdk.ids;
    const appId = sdk.ids.app;
  
    try {
      // Fetch all content types
      const contentTypes = await sdk.cma.contentType.getMany({
        spaceId: space,
        environmentId: environment,
      });
  
      for (const contentType of contentTypes.items) {
        const contentTypeId = contentType.sys.id;
  
        // Fetch current editor interface
        const editorInterface = await sdk.cma.editorInterface.get({
          spaceId: space,
          environmentId: environment,
          contentTypeId,
        });
  
        const sysVersion = editorInterface.sys.version; // Ensure correct version

        // **Ensure sidebar has defaults if undefined**
        const existingSidebar = editorInterface.sidebar !== undefined ? editorInterface.sidebar : DEFAULT_SIDEBAR;
  
        // **Ensure your app is added at the end**
        const updatedSidebar = [
          ...existingSidebar.filter((item) => item.widgetId !== appId), // Keep existing
          { widgetId: appId, widgetNamespace: "app" }, // Append your app last
        ];
  
        // **Explicitly update with latest `sys.version`**
        await sdk.cma.editorInterface.update(
          {
            spaceId: space,
            environmentId: environment,
            contentTypeId,
          },
          {
            sys: {
              id: editorInterface.sys.id,
              type: editorInterface.sys.type,
              space: editorInterface.sys.space,
              environment: editorInterface.sys.environment,
              contentType: editorInterface.sys.contentType,
              createdAt: editorInterface.sys.createdAt,
              updatedAt: editorInterface.sys.updatedAt,
              version: sysVersion,
            },
            // editors: updatedEditors,
            sidebar: updatedSidebar, // Now guaranteed to exist
          }
        );
      }
  
      sdk.notifier.success("Entry editor set as first and sidebar updated successfully.");
    } catch (error) {
      console.error("Error updating editor interface:", error);
      sdk.notifier.error("Failed to update entry editor and sidebar.");
    }
  
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
      isEqualTo: "",
      condition: "",
      affectedFields: [],
    });
  };
  // save rule to rules
  const handleSaveRule = () => {
    if (currentRule && currentRule.component && currentRule.ifField && currentRule.affectedFields.length > 0) {
      setRules((prev) => [...prev, currentRule]);
      setCurrentRule(undefined);
      setShown(false);
    } else {
      alert("Please complete all fields before saving.");
    }
  };
  
  return (
    <div style={{ padding: "20px" }}>
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