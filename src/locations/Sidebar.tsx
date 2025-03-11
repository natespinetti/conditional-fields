import React from 'react';
import { Paragraph } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { Condition } from 'types';

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  
  return (
    <>
      <Paragraph><strong>Rules for {sdk.contentType.name}</strong></Paragraph>
      
      {sdk.parameters.installation.rules
        .filter((rule: { component: string }) => sdk.contentType.sys.id === rule.component) // ✅ Ensure component matches content type ID
        .map((rule: { ifField: string; condition: string; affectedFields: any[]; isEqualTo: Condition }, index: number) => (
          <div style={{ borderLeft: "2px solid black", paddingLeft: "10px", marginBottom: "10px" }} key={index}>
          <Paragraph style={{ marginBottom:".25rem" }}>If <strong>{rule.ifField}</strong> is <strong>{rule.isEqualTo}</strong>{rule.condition && " to "}<strong>{rule.condition}</strong>, {rule.affectedFields.map((details: any, idx: any) => {
              const total = rule.affectedFields.length;
              const separator = idx === total - 2 ? " and " : idx < total - 2 ? ", " : ""; // Adds correct separator

              return (
                  <span key={idx}>
                      <strong>{details.action}</strong> the <strong>{details.field}</strong> field{separator}
                  </span>
              );
              })}
          </Paragraph>
          </div>
      ))}
    </>
  );
};

export default Sidebar;
