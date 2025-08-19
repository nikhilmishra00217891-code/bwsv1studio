
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  setIsEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export const useEditMode = () => useContext(EditModeContext);
