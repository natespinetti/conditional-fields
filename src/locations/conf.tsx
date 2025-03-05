import { useCallback, useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { client } from "../contentfulClient";
import { ConfigAppSDK } from '@contentful/app-sdk';

export interface AppInstallationParameters {}

export default function ConfigurationScreen() {
  const sdk = useSDK<ConfigAppSDK>();
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [excludedComponents, setExcludedComponents] = useState<string[]>([]);
  const [rules, setRules] = useState<
    { component: string; ifField: string; condition: string; affectedFields: { field: string; action: "show" | "hide" }[] }[]
  >([]);

  useEffect(() => {
    async function fetchContentTypes() {
      client.getContentTypes()
      .then((response) => setComponents(response.items.map((ct) => ({ id: ct.sys.id, name: ct.name }))))
      .catch(console.error);
    }
    fetchContentTypes();
  }, [sdk]);

  // Fetch fields when a component is selected
  useEffect(() => {
    async function fetchFields() {
      if (!selectedComponent) return;
      client.getContentType(selectedComponent)
      .then((response) => setFields(Object.keys(response.fields)))
      .catch(console.error);
    }
    fetchFields();
  }, [selectedComponent, sdk]);

    const onConfigure = useCallback(async () => {
      // This method will be called when a user clicks on "Install"
      // or "Save" in the configuration screen.
      // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook
  
      // Get current the state of EditorInterface and other entities
      // related to this app installation
      const currentState = await sdk.app.getCurrentState();
  
      return {
        // Parameters to be persisted as the app configuration.
        parameters,
        // In case you don't want to submit any update to app
        // locations, you can just pass the currentState as is
        targetState: currentState,
      };
    }, [parameters, sdk]);
  
    useEffect(() => {
      // `onConfigure` allows to configure a callback to be
      // invoked when a user attempts to install the app or update
      // its configuration.
      sdk.app.onConfigure(() => onConfigure());
    }, [sdk, onConfigure]);

  useEffect(() => {
      (async () => {
        // Get current parameters of the app.
        // If the app is not installed yet, `parameters` will be `null`.
        const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters();
  
        if (currentParameters) {
          setParameters(currentParameters);
        }
  
        // Once preparation has finished, call `setReady` to hide
        // the loading screen and present the app to a user.
        sdk.app.setReady();
      })();
    }, [sdk]);

  // Handle saving configuration
  const saveConfig = async () => {
    setParameters({
      excludedComponents,
      rules,
    });
    sdk.notifier.success("Configuration saved!");
  };

  // Add a new rule
  const addRule = () => {
    if (!selectedComponent) return;
    setRules([
      ...rules,
      { component: selectedComponent, ifField: "", condition: "", affectedFields: [] },
    ]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2>Configure Component Field Visibility</h2>

      {/* Omit Components Selector */}
      <label>Select components to exclude:</label>
      <select multiple onChange={(e) => setExcludedComponents(Array.from(e.target.selectedOptions).map((o) => o.value))}>
        {components.map((comp) => (
          <option key={comp.id} value={comp.id}>
            {comp.name}
          </option>
        ))}
      </select>

      {/* Select Component */}
      <label>Select a component:</label>
      <select onChange={(e) => setSelectedComponent(e.target.value)} value={selectedComponent || ""}>
        <option value="">-- Select a component --</option>
        {components
          .filter((comp) => !excludedComponents.includes(comp.id))
          .map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
      </select>

      {/* Condition Builder */}
      {selectedComponent && (
        <>
          <h3>Define Rules for {selectedComponent}</h3>
          {rules
            .filter((rule) => rule.component === selectedComponent)
            .map((rule, index) => (
              <div key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                <label>If field:</label>
                <select
                  value={rule.ifField}
                  onChange={(e) =>
                    setRules((prev) => {
                      const updated = [...prev];
                      updated[index].ifField = e.target.value;
                      return updated;
                    })
                  }
                >
                  <option value="">-- Select a field --</option>
                  {fields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>

                <label>Condition:</label>
                <input
                  type="text"
                  value={rule.condition}
                  onChange={(e) =>
                    setRules((prev) => {
                      const updated = [...prev];
                      updated[index].condition = e.target.value;
                      return updated;
                    })
                  }
                />

                <label>Fields to show/hide:</label>
                <select
                  multiple
                  onChange={(e) => {
                    const selectedFields = Array.from(e.target.selectedOptions).map((o) => ({
                      field: o.value,
                      action: "show" as "show" | "hide",
                    }));
                    setRules((prev) => {
                      const updated = [...prev];
                      updated[index].affectedFields = selectedFields;
                      return updated;
                    });
                  }}
                >
                  {fields
                    .filter((field) => field !== rule.ifField)
                    .map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                </select>

                <label>Action:</label>
                {rule.affectedFields.map((af, i) => (
                  <div key={i}>
                    <span>{af.field}</span>
                    <select
                      value={af.action}
                      onChange={(e) =>
                        setRules((prev) => {
                          const updated = [...prev];
                          updated[index].affectedFields[i].action = e.target.value as "show" | "hide";
                          return updated;
                        })
                      }
                    >
                      <option value="show">Show</option>
                      <option value="hide">Hide</option>
                    </select>
                  </div>
                ))}
              </div>
            ))}

          <button onClick={addRule}>Add Rule</button>
        </>
      )}

      <button onClick={saveConfig}>Save Configuration</button>
    </div>
  );
}
