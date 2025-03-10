import React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Field } from '@contentful/default-field-editors';
import { Note } from '@contentful/f36-components';
import { EditIcon } from '@contentful/f36-icons';

const DefaultField = (fields: any, isSingle: boolean = false) => {
  const sdk = useSDK<FieldAppSDK>();
  const extendedField = fields.fields.getForLocale(sdk.locales.default);
  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);
  const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  );
  const widgetNamespace = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  )?.widgetNamespace;
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
      <>
        <Field sdk={fieldSdk} />
        {widgetNamespace !== "builtin" && !isSingle && (
          <Note variant="warning" icon={<EditIcon />} style={{ marginTop: "10px" }}>
            This field can't be rendered in the conditional fields layout. Please use the Default Editor to access the custom field properly.
          </Note>
      )}
      </>
    );
};

export default DefaultField;

