import React, { createContext, useState, useContext } from "react";

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [activeTicketTitle, setActiveTicketTitle] = useState(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isFinalFileModalOpen, setIsFinalFileModalOpen] = useState(false);
  
  const [refreshKey, setRefreshKey] = useState(0);

  const openChat = (ticketId, ticketTitle = null) => {
    setActiveTicketId(ticketId);
    setActiveTicketTitle(ticketTitle);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveTicketId(null);
    setActiveTicketTitle(null);
  };
  
  const triggerChatRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <TicketContext.Provider
      value={{
        isOpen, activeTicketId, activeTicketTitle, openChat, closeChat,
        isFileModalOpen, setIsFileModalOpen,
        isFinalFileModalOpen, setIsFinalFileModalOpen,
        refreshKey, triggerChatRefresh
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);