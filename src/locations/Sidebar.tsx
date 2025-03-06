import React from 'react';
import { Paragraph } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  
  return (
    <>
      <Paragraph><strong>Rules for {sdk.contentType.name}</strong></Paragraph>
      
      {sdk.parameters.installation.rules
        .filter((rule: { component: string }) => sdk.contentType.sys.id === rule.component) // ✅ Ensure component matches content type ID
        .map((rule: { ifField: string; condition: string; affectedFields: any[]; isEqualTo: boolean }, index: number) => (
          <div style={{ borderLeft: "2px solid black", paddingLeft: "10px", marginBottom: "10px" }} key={index}>
          <Paragraph>If <strong>{rule.ifField}</strong> <strong>{rule.isEqualTo ? "is equal to" : "is not equal to"}</strong> <strong>{rule.condition}</strong>, 
            {rule.affectedFields.map((details: any, idx: any) => (
              <span key={idx}><strong> {details.action}</strong> the <strong>{details.field}</strong> field</span>
            ))}
          </Paragraph>
          </div>
      ))}
    </>
  );
};

export default Sidebar;
