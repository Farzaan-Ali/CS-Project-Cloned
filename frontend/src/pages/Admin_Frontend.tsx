import React, { useState } from "react";
// import each tab compontent
import ListGroup from "../Components/UsersTab";
//import RolesModulesTab from "./components/RolesModulesTab";
//import SQLConnectionsTab from "./components/SQLConnectionsTab";
import ChatStatsPermsTab from "../Components/ChatStatsPermsTab";
//import AutomationPermsTab from "./components/AutomationPermsTab";
//import LLMControllerTab from "./components/LLMControllerTab";

import { useNavigate } from 'react-router-dom'
import Message from "../Components/WAFFLE_Header_Message";
import "../App.css";

interface Tab {
  title: string;
  description: string;
  element?: React.ReactElement;
}

interface TabButtonsProps {
  tabs: Tab[];
  activeTab: number;
  setActiveTab: (index: number) => void;
}

interface TabContentProps {
  tabs: Tab[];
  activeTab: number;
}

const tabs: Tab[] = [
  {
    title: "Users",
    description: "This tab will allow you to manage users and their permissions. In development.",
    element: <ListGroup />,
  },
  {
    title: "Roles/Modules",
    description: "This tab will allow you to manage roles and modules. In development.",
    // element: <RolesModulesTab />,
  },
  {
    title: "SQL Connections",
    description: "This tab will allow you to manage SQL connections. In development.",
    // element: <SQLConnectionsTab />,
  },
  {
    title: "ChatStats Permissions",
    description: "This tab will allow you to manage chat statistics permissions. In development.",
    element: <ChatStatsPermsTab />,
  },
  {
    title: "Automation Permissions",
    description: "This tab will allow you to manage automation permissions. In development.",
    // element: <AutomationPermsTab />,
  },
  {
    title: "LLM Controller",
    description: "This tab will allow you to manage the LLM controller. In development.",
    // element: <LLMControllerTab />,
  },
];

function TabButtons({ tabs, activeTab, setActiveTab }: TabButtonsProps) {
  return (
    <div className="tab__header">
      {tabs.map((tabItem: Tab, index: number) => (
        <button
          className={`tab__button ${activeTab === index ? "tab__button--active" : ""}`}
          key={tabItem.title}
          onClick={() => setActiveTab(index)}
        >
          {tabItem.title}
        </button>
      ))}
    </div>
  );
}

function TabContent({ tabs, activeTab }: TabContentProps) {
  const current: Tab = tabs[activeTab];
  return (
    <div className="tab__container">
      <div className="tab__content">
        <p>{current.description}</p>
        {current.element && current.element}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const navigate = useNavigate();

  return (
    <div className="main__container">
      <Message />
      <h1>Admin - Users and Permissions</h1>
      <TabButtons tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent tabs={tabs} activeTab={activeTab} />
      <button 
        className="btn btn--danger-ghost" 
        onClick={() => navigate('/')}
      >
        Logout
      </button>
    </div>
  );
}