import React from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { FieldWrapper } from '@contentful/default-field-editors';
import { FieldWrapProps } from 'types';

const FieldWrap: React.FC<FieldWrapProps> = ({ fields, children }) => {
  const sdk = useSDK<FieldAppSDK>();
  const extendedField = fields.getForLocale(sdk.locales.default);
  const fieldDetails = sdk.contentType.fields.find(({ id }) => id === extendedField.id);
  const fieldEditorInterface = sdk.editor.editorInterface?.controls?.find(
    ({ fieldId }) => fieldId === extendedField.id
  );

  const fieldSdk: FieldAppSDK = {
    ...sdk,
    field: extendedField,
    locales: sdk.locales,
    parameters: {
      ...sdk.parameters,
      instance: {
        ...sdk.parameters.instance,
        ...fieldEditorInterface?.settings,
      },
    },
  } as FieldAppSDK;

  if (!sdk) return <p>Loading...</p>;
  if (!fieldDetails || !fieldEditorInterface) return null;

  return (
    <FieldWrapper sdk={fieldSdk} name={fieldDetails.name}>
      {children}
    </FieldWrapper>
  );
};

export default FieldWrap;
