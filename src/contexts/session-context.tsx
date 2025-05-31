"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Session, OcrLanguage, AiLanguage } from "@/types";

const LOCAL_STORAGE_KEY = "linguaLens-sessions";

interface SessionContextType {
  sessions: Session[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: () => Session;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  getActiveSession: () => Session | null;
  addTextToHistory: (sessionId: string, text: string) => void;
  undoText: (sessionId: string) => void;
  redoText: (sessionId: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as Session[];
        // Ensure all sessions have the history fields
        const normalizedSessions = parsedSessions.map(s => ({
          ...s,
          textHistory: s.textHistory || [s.extractedText || ''],
          historyPointer: s.historyPointer !== undefined ? s.historyPointer : (s.textHistory?.length || 1) -1,
        }));
        setSessions(normalizedSessions);
        if (normalizedSessions.length > 0) {
          const lastActiveId = localStorage.getItem(`${LOCAL_STORAGE_KEY}-activeId`);
          setActiveSessionIdState(lastActiveId || normalizedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load sessions from local storage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
        if (activeSessionId) {
          localStorage.setItem(`${LOCAL_STORAGE_KEY}-activeId`, activeSessionId);
        } else {
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}-activeId`);
        }
      } catch (error) {
        console.error("Failed to save sessions to local storage:", error);
      }
    }
  }, [sessions, activeSessionId, isMounted]);

  const createSession = useCallback(() => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      imageUrl: null,
      selectedOcrLanguages: ["eng"],
      suggestedAiLanguages: [],
      extractedText: "",
      isLoadingOcr: false,
      ocrError: null,
      createdAt: Date.now(),
      textHistory: [''],
      historyPointer: 0,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionIdState(newSession.id);
    return newSession;
  }, [sessions.length]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    if (activeSessionId === id) {
      setActiveSessionIdState(sessions.length > 1 ? sessions.filter(s => s.id !== id)[0]?.id : null);
    }
  }, [activeSessionId, sessions]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      )
    );
  }, []);

  const getActiveSession = useCallback(() => {
    return sessions.find((session) => session.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const addTextToHistory = useCallback((sessionId: string, text: string) => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === sessionId) {
        const newHistory = session.textHistory.slice(0, session.historyPointer + 1);
        newHistory.push(text);
        // Limit history size if needed
        // const limitedHistory = newHistory.slice(-MAX_HISTORY_SIZE); 
        return {
          ...session,
          extractedText: text,
          textHistory: newHistory, // limitedHistory
          historyPointer: newHistory.length - 1, // limitedHistory.length - 1
        };
      }
      return session;
    }));
  }, []);

  const undoText = useCallback((sessionId: string) => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === sessionId && session.historyPointer > 0) {
        const newPointer = session.historyPointer - 1;
        return {
          ...session,
          extractedText: session.textHistory[newPointer],
          historyPointer: newPointer,
        };
      }
      return session;
    }));
  }, []);

  const redoText = useCallback((sessionId: string) => {
    setSessions(prevSessions => prevSessions.map(session => {
      if (session.id === sessionId && session.historyPointer < session.textHistory.length - 1) {
        const newPointer = session.historyPointer + 1;
        return {
          ...session,
          extractedText: session.textHistory[newPointer],
          historyPointer: newPointer,
        };
      }
      return session;
    }));
  }, []);
  
  const setActiveSessionId = (id: string | null) => {
    setActiveSessionIdState(id);
  };


  if (!isMounted) {
     // Avoid hydration mismatch by rendering nothing or a loader on the server/first client render
    return null;
  }

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        createSession,
        deleteSession,
        updateSession,
        getActiveSession,
        addTextToHistory,
        undoText,
        redoText,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
