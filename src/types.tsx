export interface AppInstallationParameters {
    rules?: Rule[];
    excludedComponents?: string[];
}

export type Condition  = 
    "equal" | 
    "not equal" | 
    "contains" | 
    "not contains" |
    "empty" |
    "not empty" | 
    string;

export type Rule = {
  component: string;
  ifField: string;
  isEqualTo: Condition;
  condition: string;
  affectedFields: { field: string; action: "show" | "hide" }[];
};

export interface CreateRuleProps {
    isShown: boolean;
    setShown: (shown: boolean) => void;
    currentRule: Rule | undefined;
    setCurrentRule: (rule: any) => void;
    components: any[];
    excludedComponents: any[];
    fields: any[];
    setSelectedComponent: (component: string) => void;
    handleSaveRule: () => void;
}

export interface ExcludedComponentsProps {
    components: any[];
    excludedComponents: string[];
    setExcludedComponents: (arg0: (prev: any) => any) => void;
}

export type FieldWrapProps = {
    fields: any;
    children?: React.ReactNode;
};

export interface ViewRulesProps {
    components: any[];
    excludedComponents: string[];
    setWhichComponent: (component: string) => void;
    whichComponent: string;
    rules: any[];
    setShown: (shown: boolean) => void;
    addRule: () => void;
    setRules: (arg0: (prev: any) => any) => void;
}

export type Component = {
    id: string;
    name: string;
}

export type Fields = {
    id: string;
    name: string;
    type: string;
}