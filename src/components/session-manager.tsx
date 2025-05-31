"use client";

import { useSession } from "@/contexts/session-context";
import { useLocalization } from "@/contexts/localization-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusSquare, Trash2, Edit3 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function SessionManager() {
  const { sessions, activeSessionId, setActiveSessionId, createSession, deleteSession, updateSession } = useSession();
  const { t } = useLocalization();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  const handleNewSession = () => {
    createSession();
  };

  const handleTabChange = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const startEditing = (session: {id: string, name: string}) => {
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  const saveEdit = () => {
    if (editingSessionId && editingName.trim() !== "") {
      updateSession(editingSessionId, { name: editingName.trim() });
    }
    setEditingSessionId(null);
    setEditingName("");
  };
  
  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditingName("");
  };

  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions, createSession]);


  return (
    <div className="flex flex-col p-4 border-r border-border md:w-64 lg:w-72 shrink-0 bg-card">
      <Button onClick={handleNewSession} className="w-full mb-4" variant="outline">
        <PlusSquare size={18} className="mr-2" />
        {t("newSession")}
      </Button>
      <ScrollArea className="flex-grow">
        <Tabs
          orientation="vertical"
          value={activeSessionId || ""}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="flex flex-col items-stretch h-auto bg-transparent p-0">
            {sessions.map((session) => (
              <TabsTrigger
                key={session.id}
                value={session.id}
                className="w-full justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm hover:bg-muted/50 relative group pr-16"
              >
                {editingSessionId === session.id ? (
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    autoFocus
                    className="h-7 text-sm flex-grow mr-1"
                  />
                ) : (
                  <span className="truncate">{session.name}</span>
                )}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 data-[state=active]:opacity-100 transition-opacity">
                  {editingSessionId !== session.id && (
                     <Button asChild variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEditing(session); }}>
                       <Edit3 size={14} />
                     </Button>
                  )}
                   <Button asChild variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}>
                     <Trash2 size={14} />
                   </Button>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
