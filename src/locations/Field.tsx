import React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Field } from '@contentful/default-field-editors';

const Fields = (fields: any) => {
  const sdk = useSDK<FieldAppSDK>();
  console.log(sdk);
  console.log(fields.fields.getForLocale(sdk.locales.default));
  const extendedField = fields.fields.getForLocale(sdk.locales.default);
  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);
  const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  );
  const widgetId = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  )?.widgetId;
  const locales = sdk.locales;
  
  const fieldSdk: FieldAppSDK = {
    ...sdk,
    field: extendedField,
    locales,
    parameters: {
      ...sdk.parameters,
      instance: {
        ...sdk.parameters.instance,
        ...fieldEditorInterface?.settings,
      },
    },
  } as any;

  if (!sdk) {
    return <p>Loading...</p>;
  }
  if (!fieldDetails || !fieldEditorInterface) {
    return null;
  }

    return (
        <Field sdk={fieldSdk} widgetId={widgetId} />
    );
};

export default Fields;

