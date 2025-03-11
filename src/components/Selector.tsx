import { Select } from "@contentful/f36-components";
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from "react";
import React from "react";

const Selector = (fields: any) => {
    const sdk = useSDK<FieldAppSDK>();
    const contentField = sdk.entry.fields[fields.fields.id];
    const [value, setValue] = useState(contentField.getValue() ?? ['']);

    useEffect(() => {
        if (contentField.getValue() !== value) {
            contentField.setValue([value]);
        }
    }, [value, contentField]); 
    
    return (
        <>
        <Select
          id="optionSelect-controlled"
          name="optionSelect-controlled"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {fields.fields.items.validations[0].in?.map((item: any, index: number) => <Select.Option key={index}>{item}</Select.Option>)}
        </Select>
     </>
    )
};

export default Selector;
