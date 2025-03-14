// src/app/tabs-debug/page.tsx
'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabsDebug() {
  const [log, setLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('tab1');
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toISOString().split('T')[1].substring(0, 8)}: ${message}`]);
  };
  
  const handleTabChange = (value: string) => {
    addLog(`Tab changed to: ${value}`);
    setActiveTab(value);
  };
  
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Tabs Debugging Page</h1>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Tabs Component</h2>
        <pre className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
          {`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"`}
        </pre>
        
        <h3 className="text-lg font-medium mb-2">1. Simple Working Example</h3>
        <Tabs defaultValue="tab1" className="w-[400px] mb-8">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Tab 1 content</TabsContent>
          <TabsContent value="tab2">Tab 2 content</TabsContent>
        </Tabs>
        
        <h3 className="text-lg font-medium mb-2">2. With State Tracking</h3>
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-[400px] mb-8"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Tab 1 content with state</TabsContent>
          <TabsContent value="tab2">Tab 2 content with state</TabsContent>
          <TabsContent value="tab3">Tab 3 content with state</TabsContent>
        </Tabs>
        
        <h3 className="text-lg font-medium mb-2">3. Grid Layout</h3>
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Tab 1 content with grid</TabsContent>
          <TabsContent value="tab2">Tab 2 content with grid</TabsContent>
          <TabsContent value="tab3">Tab 3 content with grid</TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Event Log</h2>
        <div className="bg-gray-50 border p-4 rounded-md h-60 overflow-y-auto">
          {log.length === 0 ? (
            <p className="text-gray-500">No events logged yet</p>
          ) : (
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li key={i} className="font-mono text-sm">{entry}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}